const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const GameEngine = require('./shared/gameLogic.js');

const PORT = process.env.PORT || 3000;
const gameEngine = new GameEngine();

// Serve static files
app.use(express.static('client'));

// Serve Three.js from CDN route
app.get('/three.min.js', (req, res) => {
  res.redirect('https://cdn.jsdelivr.net/npm/three@0.150.0/build/three.min.js');
});

app.get('/OrbitControls.js', (req, res) => {
  res.redirect('https://cdn.jsdelivr.net/npm/three@0.150.0/examples/js/controls/OrbitControls.js');
});

// Game rooms storage
const rooms = new Map();

// Generate room code
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Socket connection handling
io.on('connection', (socket) => {
  console.log('New connection:', socket.id);
  
  // Add a simple test listener to verify socket works
  socket.on('ping', (data) => {
    console.log(`PING received from ${socket.id}:`, data);
    socket.emit('pong', { message: 'Server received ping', originalData: data });
  });

  // Create a new room
  socket.on('create-room', (playerName, callback) => {
    const roomCode = generateRoomCode();
    const room = {
      code: roomCode,
      players: [{
        id: socket.id,
        name: playerName,
        host: true,
        ready: false
      }],
      gameState: null,
      started: false
    };
    
    rooms.set(roomCode, room);
    socket.join(roomCode);
    socket.roomCode = roomCode;
    
    callback({ success: true, roomCode, playerId: socket.id });
    console.log(`Room ${roomCode} created by ${playerName}`);
  });

  // Join existing room
  socket.on('join-room', (data, callback) => {
    const { roomCode, playerName } = data;
    const room = rooms.get(roomCode);
    
    if (!room) {
      callback({ success: false, error: 'Room not found' });
      return;
    }
    
    if (room.started) {
      callback({ success: false, error: 'Game already started' });
      return;
    }
    
    if (room.players.length >= 6) {
      callback({ success: false, error: 'Room is full' });
      return;
    }
    
    const player = {
      id: socket.id,
      name: playerName,
      host: false,
      ready: false
    };
    
    room.players.push(player);
    socket.join(roomCode);
    socket.roomCode = roomCode;
    
    // Notify all players in room
    io.to(roomCode).emit('player-joined', {
      players: room.players,
      newPlayer: player
    });
    
    callback({ success: true, roomCode, playerId: socket.id, players: room.players });
    console.log(`${playerName} joined room ${roomCode}`);
  });

  // Player ready status
  socket.on('player-ready', (ready) => {
    if (!socket.roomCode) return;
    
    const room = rooms.get(socket.roomCode);
    if (!room) return;
    
    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.ready = ready;
      io.to(socket.roomCode).emit('player-ready-changed', room.players);
    }
  });

  // Update breed selection
  socket.on('update-breed', (breed) => {
    if (!socket.roomCode) return;
    
    const room = rooms.get(socket.roomCode);
    if (!room) return;
    
    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.breed = breed || null;
      io.to(socket.roomCode).emit('player-breed-changed', room.players);
    }
  });

  // Handle rejoining game after page navigation
  socket.on('rejoin-game', (data) => {
    const { roomCode, playerName, oldPlayerId } = data;
    console.log(`\n=== REJOIN REQUEST ===`);
    console.log(`Player: ${playerName}`);
    console.log(`Room: ${roomCode}`);
    console.log(`Old ID: ${oldPlayerId}`);
    console.log(`New ID: ${socket.id}`);
    console.log(`Available rooms: ${Array.from(rooms.keys()).join(', ') || 'none'}`);
    
    const room = rooms.get(roomCode);
    if (!room) {
      console.log('ERROR: Room not found for rejoin');
      socket.emit('error', 'Room not found - it may have been closed');
      return;
    }
    
    // Update the player's socket ID in the room
    const player = room.players.find(p => p.name === playerName);
    if (player) {
      player.id = socket.id;
      player.disconnected = false;  // Mark as reconnected
      player.disconnectTime = null;
      socket.join(roomCode);
      socket.roomCode = roomCode;
      
      // If game has started, update game state too
      if (room.gameState) {
        const gamePlayer = room.gameState.players.find(p => p.name === playerName);
        if (gamePlayer) {
          gamePlayer.id = socket.id;
        }
        
        // Send current game state to rejoining player
        const playerView = createPlayerView(room.gameState, socket.id);
        socket.emit('rejoin-success', playerView);
      }
      
      console.log(`Player ${playerName} rejoined room ${roomCode} with new ID ${socket.id}`);
    } else {
      console.log('Player not found in room for rejoin');
      socket.emit('error', 'Player not found in room');
    }
  });
  
  // Start game (host only)
  socket.on('start-game', (gameSettings) => {
    if (!socket.roomCode) return;
    
    const room = rooms.get(socket.roomCode);
    if (!room) return;
    
    const player = room.players.find(p => p.id === socket.id);
    if (!player || !player.host) return;
    
    // Check all players ready
    const allReady = room.players.every(p => p.ready);
    if (!allReady) {
      socket.emit('error', 'Not all players are ready');
      return;
    }
    
    room.started = true;
    room.gameState = initializeGameState(room.players, gameSettings);
    
    // Send game start with individual player data
    room.players.forEach(player => {
      const playerView = createPlayerView(room.gameState, player.id);
      io.to(player.id).emit('game-started', playerView);
    });
    
    console.log(`Game started in room ${socket.roomCode}`);
  });

  // Handle player bid
  socket.on('place-bid', (bidData) => {
    if (!socket.roomCode) return;
    
    const room = rooms.get(socket.roomCode);
    if (!room || !room.gameState) return;
    
    // Validate and process bid
    const success = processBid(room.gameState, socket.id, bidData);
    
    if (success) {
      // Broadcast bid animation to other players
      socket.to(socket.roomCode).emit('opponent-bid', {
        playerId: socket.id,
        projectIndex: bidData.projectIndex,
        // Don't reveal the actual card
        animation: 'card-fly'
      });
      
      // Update all players
      room.players.forEach(player => {
        const playerView = createPlayerView(room.gameState, player.id);
        io.to(player.id).emit('game-updated', playerView);
      });
    } else {
      // Send error back to player
      const player = room.gameState.players.find(p => p.id === socket.id);
      const maxCards = player && player.breed === 'Labrador' ? 2 : 1;
      socket.emit('bid-failed', {
        message: `You've already played your ${maxCards === 1 ? 'card' : `${maxCards} cards`} this round`
      });
    }
  });

  // Handle instant distraction play
  socket.on('play-instant-distraction', (data) => {
    console.log(`\n=== INSTANT DISTRACTION PLAY ===`);
    console.log(`Player: ${socket.id}, Card: ${data.cardId}, Target: ${data.target}`);
    
    const room = rooms.get(data.roomCode);
    if (!room || !room.gameState) {
      socket.emit('error', 'Game not found');
      return;
    }
    
    const gameState = room.gameState;
    const player = gameState.players.find(p => p.id === socket.id);
    
    if (!player) {
      socket.emit('error', 'Player not found');
      return;
    }
    
    // Find the distraction card
    const cardIndex = player.handDistraction.findIndex(c => c.id === data.cardId);
    if (cardIndex === -1) {
      socket.emit('error', 'Card not found');
      return;
    }
    
    const card = player.handDistraction[cardIndex];
    
    // Verify it's an instant card and we're in bidding phase
    if (card.type !== 'instant' || gameState.phase !== 'bidding') {
      socket.emit('error', 'Cannot play this card now');
      return;
    }
    
    // Apply the distraction effect
    let effectMessage = `${player.name} played ${card.name}`;
    
    if (data.target && card.targetRequired) {
      const targetPlayer = gameState.players.find(p => p.id === data.target);
      if (targetPlayer) {
        effectMessage += ` on ${targetPlayer.name}`;
        
        // Apply specific card effects
        if (card.name === "Squirrel!") {
          // Target must discard 1 action card from hand
          if (targetPlayer.handAction && targetPlayer.handAction.length > 0) {
            const randomIndex = Math.floor(Math.random() * targetPlayer.handAction.length);
            const discardedCard = targetPlayer.handAction.splice(randomIndex, 1)[0];
            effectMessage += ` - ${targetPlayer.name} discarded ${discardedCard.name}!`;
          } else {
            effectMessage += ` - ${targetPlayer.name} had no cards to discard!`;
          }
        } else if (card.name === "Doorbell") {
          // Target cannot play cards next round
          targetPlayer.skipNextRound = true;
          effectMessage += ` - ${targetPlayer.name} can't play cards next round!`;
        } else if (card.name === "Coffee spill") {
          // Target loses 1 energy next bid
          targetPlayer.energyPenalty = 1;
          effectMessage += ` - ${targetPlayer.name} loses 1 energy on next bid!`;
        }
      }
    } else if (!card.targetRequired) {
      // Non-targeted effects
      if (card.name === "Pack mentality") {
        // Will be handled in cleanup phase
        gameState.pendingPackMentality = true;
        effectMessage += ` - Cards will be passed at end of turn!`;
      }
    }
    
    // Remove card from hand
    player.handDistraction.splice(cardIndex, 1);
    player.distractionsPlayed++;
    
    // Playing an instant distraction counts as your action for the round
    // Mark player as having acted if it's their turn
    if (gameState.players[gameState.currentPlayer].id === socket.id) {
      gameState.playersActedThisRound = gameState.playersActedThisRound || [];
      gameState.playersActedThisRound[gameState.currentPlayer] = true;
      
      // Move to next player
      gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
    }
    
    // Notify all players
    io.to(data.roomCode).emit('distraction-played', {
      player: player.name,
      card: card,
      effect: effectMessage
    });
    
    // Send updated game state to all players
    const updatedGameData = getGameStateForAllPlayers(room);
    io.to(data.roomCode).emit('game-updated', updatedGameData);
  });

  // Add test event listener
  socket.on('test-draw', (data) => {
    console.log(`\n=== TEST DRAW EVENT RECEIVED ===`);
    console.log(`Socket ID: ${socket.id}, Data:`, data);
    socket.emit('test-draw-response', { received: true });
  });

  // Handle draw card action (instead of playing a card)
  socket.on('draw-card', (data) => {
    console.log(`\n=== DRAW CARD SERVER DEBUG ===`);
    console.log(`Player ${socket.id} wants to draw a card`);
    console.log(`Data received:`, data);
    
    const room = rooms.get(data.roomCode);
    if (!room || !room.gameState) {
      console.log(`ERROR: Game not found for room ${data.roomCode}`);
      socket.emit('error', 'Game not found');
      return;
    }
    
    const gameState = room.gameState;
    const player = gameState.players.find(p => p.id === socket.id);
    
    if (!player) {
      console.log(`ERROR: Player not found with ID ${socket.id}`);
      socket.emit('error', 'Player not found');
      return;
    }
    
    console.log(`Player found: ${player.name}`);
    console.log(`Current phase: ${gameState.phase}`);
    console.log(`Current player index: ${gameState.currentPlayer}`);
    console.log(`Current player ID: ${gameState.players[gameState.currentPlayer].id}`);
    console.log(`Requesting player ID: ${socket.id}`);
    console.log(`Is requesting player's turn: ${gameState.players[gameState.currentPlayer].id === socket.id}`);
    
    // Verify it's their turn and bidding phase
    if (gameState.phase !== 'bidding' || gameState.players[gameState.currentPlayer].id !== socket.id) {
      console.log(`ERROR: Can only draw during your bidding turn`);
      socket.emit('error', 'Can only draw during your bidding turn');
      return;
    }
    
    // Check if they already acted this round (same tracking as bid system)
    if (!gameState.cardsPlayedThisRound) gameState.cardsPlayedThisRound = {};
    const playerIndex = gameState.players.indexOf(player);
    const cardsPlayed = gameState.cardsPlayedThisRound[playerIndex] || 0;
    
    console.log(`Player index: ${playerIndex}`);
    console.log(`Cards played this round: ${cardsPlayed}`);
    console.log(`cardsPlayedThisRound object:`, gameState.cardsPlayedThisRound);
    
    if (cardsPlayed > 0) {
      console.log(`ERROR: Already acted this round`);
      socket.emit('error', 'Already acted this round - you can either play OR draw, not both');
      return;
    }
    
    // Draw a card if deck has cards
    console.log(`Action deck size: ${gameState.actionDeck ? gameState.actionDeck.length : 'undefined'}`);
    if (gameState.actionDeck && gameState.actionDeck.length > 0) {
      const drawnCard = gameState.actionDeck.shift();
      console.log(`BEFORE: Player hand size: ${player.handAction.length}`);
      player.handAction.push(drawnCard);
      console.log(`AFTER: Player hand size: ${player.handAction.length}`);
      console.log(`Player ${player.name} drew: ${drawnCard.name}`);
      
      // Mark as having acted (same tracking as bid system)
      gameState.cardsPlayedThisRound[playerIndex] = 1;
      console.log(`Marked player ${playerIndex} as having acted`);
      
      // Notify all players
      console.log(`Notifying all players about card draw`);
      io.to(data.roomCode).emit('player-drew-card', {
        playerId: socket.id,
        playerName: player.name
      });
      
      // Move to next player in round
      console.log(`BEFORE: Current player index: ${gameState.currentPlayer} (${gameState.players[gameState.currentPlayer].name})`);
      gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
      console.log(`AFTER: Current player index: ${gameState.currentPlayer} (${gameState.players[gameState.currentPlayer].name})`);
      
      // Update all players with new game state
      console.log(`Sending game-updated to all players`);
      room.players.forEach(player => {
        const playerView = createPlayerView(gameState, player.id);
        io.to(player.id).emit('game-updated', playerView);
      });
      console.log(`=== DRAW CARD SERVER COMPLETE ===\n`);
    } else {
      console.log(`ERROR: No cards left in deck`);
      socket.emit('error', 'No cards left in deck');
    }
  });

  // Handle end turn (moves to next player in current round)
  socket.on('end-turn', () => {
    console.log(`\n=== END TURN REQUEST ===`);
    console.log(`From: ${socket.id}`);
    
    if (!socket.roomCode) {
      socket.emit('error', 'Not in a room');
      return;
    }
    
    const room = rooms.get(socket.roomCode);
    if (!room || !room.gameState) {
      socket.emit('error', 'Game not started');
      return;
    }
    
    // Verify it's the current player's turn
    const currentPlayerId = room.gameState.players[room.gameState.currentPlayer].id;
    if (currentPlayerId !== socket.id) {
      socket.emit('error', 'Not your turn');
      return;
    }
    
    // Move to next player
    const oldPlayer = room.gameState.currentPlayer;
    room.gameState.currentPlayer = (room.gameState.currentPlayer + 1) % room.gameState.players.length;
    
    // Check if we completed a round (all players have gone)
    if (room.gameState.currentPlayer === room.gameState.firstPlayer || room.gameState.currentPlayer === 0) {
      // Check if we need to advance to next round or phase
      if (room.gameState.round >= 3) {
        // After 3 rounds, resolve bids
        console.log('Resolving bids after 3 rounds');
        resolveBids(room.gameState);
        room.gameState.phase = 'distraction';
        room.gameState.round = 1; // Reset for next turn
        room.gameState.cardsPlayedThisRound = {};
      } else {
        // Move to next round
        room.gameState.round++;
        room.gameState.cardsPlayedThisRound = {};
        console.log(`Moving to round ${room.gameState.round}`);
      }
    }
    
    // Update all players
    room.players.forEach(player => {
      const playerView = createPlayerView(room.gameState, player.id);
      io.to(player.id).emit('game-updated', playerView);
    });
    
    console.log(`=== END TURN COMPLETE ===\n`);
  });
  
  // Add new handler for ending distraction phase
  socket.on('end-distraction', () => {
    if (!socket.roomCode) return;
    
    const room = rooms.get(socket.roomCode);
    if (!room || !room.gameState) return;
    
    if (room.gameState.phase === 'distraction') {
      // Move to cleanup phase
      room.gameState.phase = 'cleanup';
      performCleanup(room.gameState);
      
      // Move to next turn
      room.gameState.turn++;
      room.gameState.round = 1;
      room.gameState.phase = 'bidding';
      room.gameState.currentPlayer = room.gameState.turn % room.gameState.players.length;
      room.gameState.cardsPlayedThisRound = {};
      
      // Deal new projects
      dealNewProjects(room.gameState);
      
      // Update all players
      room.players.forEach(player => {
        const playerView = createPlayerView(room.gameState, player.id);
        io.to(player.id).emit('game-updated', playerView);
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.roomCode) {
      const room = rooms.get(socket.roomCode);
      if (room) {
        // Mark player as disconnected but don't remove immediately
        const player = room.players.find(p => p.id === socket.id);
        if (player) {
          player.disconnected = true;
          player.disconnectTime = Date.now();
        }
        
        // Check if all players are disconnected
        const allDisconnected = room.players.every(p => p.disconnected);
        
        if (allDisconnected) {
          // Give players 10 seconds to reconnect before deleting the room
          setTimeout(() => {
            const currentRoom = rooms.get(socket.roomCode);
            if (currentRoom && currentRoom.players.every(p => p.disconnected)) {
              rooms.delete(socket.roomCode);
              console.log(`Room ${socket.roomCode} deleted after timeout (all players disconnected)`);
            }
          }, 10000);
        } else {
          // Notify other connected players
          io.to(socket.roomCode).emit('player-left', room.players.filter(p => !p.disconnected));
        }
      }
    }
    console.log('Disconnected:', socket.id);
  });
});

// Initialize game state
function initializeGameState(players, settings) {
  // Add breeds to players if not selected
  const playersWithBreeds = players.map(p => ({
    ...p,
    breed: p.breed || gameEngine.getRandomBreed()
  }));
  
  const gameState = gameEngine.createInitialGameState(playersWithBreeds);
  
  // Add round tracking
  gameState.round = 1;
  gameState.maxRounds = 3;
  gameState.phase = 'bidding'; // bidding, distraction, cleanup
  gameState.cardsPlayedThisRound = {}; // track cards played per player this round
  gameState.turnOrder = players.map((p, idx) => idx); // turn order for this turn
  gameState.firstPlayer = 0; // tracks who started this turn
  
  return gameState;
}

// Create player-specific view
function createPlayerView(gameState, playerId) {
  const myPlayer = gameState.players.find(p => p.id === playerId);
  const myIndex = gameState.players.findIndex(p => p.id === playerId);
  
  // Get cards played count for this player this round
  const playerIndex = gameState.players.indexOf(myPlayer);
  const cardsPlayedThisRound = gameState.cardsPlayedThisRound ? 
    (gameState.cardsPlayedThisRound[playerIndex] || 0) : 0;
  
  return {
    myData: myPlayer,
    myIndex: myIndex,
    cardsPlayedThisRound: cardsPlayedThisRound,
    maxCardsPerRound: myPlayer.breed === 'Labrador' ? 2 : 1,
    opponents: gameState.players.filter(p => p.id !== playerId).map(p => ({
      id: p.id,
      name: p.name,
      breed: p.breed,
      position: p.position,
      completedProjects: p.completedProjects.length,
      handActionSize: p.handAction.length,
      handDistractionSize: p.handDistraction.length,
      distractionsPlayed: p.distractionsPlayed,
      // For bids, only send which projects have bids, not the bid details
      bids: p.bids ? p.bids.map(projectBids => projectBids ? projectBids.length > 0 : false) : [false, false, false],
      // Don't send: agenda, actual cards, bid values, etc.
    })),
    projects: gameState.projects,
    currentPlayer: gameState.currentPlayer,
    currentPlayerName: gameState.players[gameState.currentPlayer].name,
    phase: gameState.phase,
    round: gameState.round,
    turn: gameState.turn,
    isMyTurn: gameState.players[gameState.currentPlayer].id === playerId
  };
}

// Process a bid
function processBid(gameState, playerId, bidData) {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) return false;
  
  // Check if it's player's turn
  if (gameState.players[gameState.currentPlayer].id !== playerId) {
    console.log('Not player turn for bid');
    return false;
  }
  
  // Check if player already played a card this round
  if (!gameState.cardsPlayedThisRound) {
    gameState.cardsPlayedThisRound = {};
  }
  
  const playerIndex = gameState.players.indexOf(player);
  const cardsPlayed = gameState.cardsPlayedThisRound[playerIndex] || 0;
  
  // Labrador can play 2 cards per round, others can play 1
  const maxCards = player.breed === 'Labrador' ? 2 : 1;
  
  console.log(`Player ${player.name} (${player.breed}) - Cards played: ${cardsPlayed}, Max allowed: ${maxCards}`);
  
  if (cardsPlayed >= maxCards) {
    console.log(`BLOCKED: Player already played ${cardsPlayed} cards this round (max: ${maxCards} for ${player.breed})`);
    return false;
  }
  
  const { projectIndex, cardIndex, cardType } = bidData;
  
  // Validate project index
  if (projectIndex < 0 || projectIndex >= gameState.projects.length) {
    console.log('Invalid project index');
    return false;
  }
  
  // Get the card from player's hand
  let card;
  if (cardType === 'action' && player.handAction[cardIndex]) {
    card = player.handAction[cardIndex];
    // DON'T remove card from hand - cards persist!
    // Mark card as "used" this turn instead
    if (!player.usedCards) player.usedCards = [];
    if (!player.usedCards.includes(card.id)) {
      player.usedCards.push(card.id);
    } else {
      console.log('Card already used this turn');
      return false;
    }
  } else {
    console.log('Card not found in hand');
    return false;
  }
  
  // Add bid to player's bids array
  if (!player.bids) player.bids = [[], [], []];
  if (!player.bids[projectIndex]) player.bids[projectIndex] = [];
  
  // Find the dominant energy type
  const energyType = Object.keys(card.energy || {}).find(k => card.energy[k] > 0) || 'comm';
  const energyValue = card.energy ? Math.max(...Object.values(card.energy)) : 0;
  
  player.bids[projectIndex].push({
    type: energyType,
    value: energyValue,
    card: card
  });
  
  // Track that this player played a card this round
  gameState.cardsPlayedThisRound[playerIndex] = (gameState.cardsPlayedThisRound[playerIndex] || 0) + 1;
  
  console.log(`Player ${player.name} bid on project ${projectIndex} (Round ${gameState.round})`);
  return true;
}

// Resolve bids and determine project winners
function resolveBids(gameState) {
  if (!gameState.projects) return;
  
  const winnerAnnouncements = [];
  
  gameState.projects.forEach((project, projectIndex) => {
    const bidsByPlayer = [];
    
    // Calculate total energy for each player's bid on this project
    gameState.players.forEach((player, playerIndex) => {
      if (player.bids && player.bids[projectIndex] && player.bids[projectIndex].length > 0) {
        let totalEnergy = { comm: 0, focus: 0, social: 0, phys: 0 };
        
        player.bids[projectIndex].forEach(bid => {
          if (bid.card && bid.card.energy) {
            Object.keys(bid.card.energy).forEach(type => {
              totalEnergy[type] += bid.card.energy[type];
            });
          }
        });
        
        bidsByPlayer.push({
          playerIndex,
          player,
          totalEnergy,
          meetsRequirements: checkProjectRequirements(project, totalEnergy),
          totalValue: Object.values(totalEnergy).reduce((a, b) => a + b, 0)
        });
      }
    });
    
    // Find winner (highest bid that meets requirements)
    const validBids = bidsByPlayer.filter(b => b.meetsRequirements);
    if (validBids.length > 0) {
      validBids.sort((a, b) => b.totalValue - a.totalValue);
      const winner = validBids[0];
      
      // Award project to winner
      winner.player.completedProjects = winner.player.completedProjects || [];
      winner.player.completedProjects.push(project);
      winner.player.position += project.reward || 2;
      
      // Create announcement for this win
      winnerAnnouncements.push({
        playerName: winner.player.name,
        projectName: project.name,
        energyUsed: winner.totalEnergy,
        reward: project.reward || 2
      });
      
      console.log(`${winner.player.name} won project ${project.name}`);
    }
    
    // Clear bids for this project
    gameState.players.forEach(player => {
      if (player.bids && player.bids[projectIndex]) {
        player.bids[projectIndex] = [];
      }
    });
  });
  
  // Store announcements in game state for clients to display
  gameState.projectWinners = winnerAnnouncements;
  return winnerAnnouncements;
}

// Check if energy meets project requirements
function checkProjectRequirements(project, energy) {
  if (!project.cost) return true;
  
  for (const [type, required] of Object.entries(project.cost)) {
    if ((energy[type] || 0) < required) {
      return false;
    }
  }
  return true;
}

// Cleanup phase - draw cards, check win conditions
function performCleanup(gameState) {
  gameState.players.forEach(player => {
    // Clear used cards tracking for next turn
    player.usedCards = [];
    
    // Draw back to minimum hand size (5, or 6 for Border Collie)
    const minCards = player.breed === 'Border Collie' ? 6 : 5;
    while (player.handAction.length < minCards && gameState.actionDeck && gameState.actionDeck.length > 0) {
      player.handAction.push(gameState.actionDeck.shift());
    }
    
    // Give everyone 1 free "Wild Energy" bonus per turn for flexibility
    if (!player.bonusEnergy) player.bonusEnergy = {};
    player.bonusEnergy = { comm: 1, focus: 0, social: 0, phys: 0 };
    
    // Check win conditions
    if (player.position >= 50) {
      gameState.winner = player;
      console.log(`${player.name} reached CEO and wins!`);
    }
  });
  
  // Check turn limit
  if (gameState.turn >= 12) {
    gameState.gameEnded = true;
    console.log('Game ended after 12 turns');
  }
}

// Deal new projects
function dealNewProjects(gameState) {
  if (!gameState.projectDeck) {
    gameState.projectDeck = gameEngine.generateProjectDeck();
  }
  
  gameState.projects = [];
  for (let i = 0; i < 3; i++) {
    if (gameState.projectDeck.length > 0) {
      gameState.projects.push(gameState.projectDeck.shift());
    }
  }
}

http.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});