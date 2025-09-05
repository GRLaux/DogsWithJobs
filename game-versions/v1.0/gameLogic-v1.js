// Shared game logic for Dogs with Jobs
class GameEngine {
  constructor() {
    this.AGENDA_DATA = [
      { name: "Teacher's Pet", text: "Win if you complete 3 projects while the player to your left completes 0" },
      { name: "Chaos Agent", text: "Win if 6+ Distraction Cards are played by you" },
      { name: "Middle Management Forever", text: "Win if you're in exactly 3rd place when someone reaches CEO" },
      { name: "Overachiever", text: "Reach CEO with 2+ extra ladder spaces beyond requirement" },
      { name: "Saboteur", text: "Win if no one reaches CEO (space 50) by Turn 12" },
      { name: "Attention Whore", text: "Win if you're targeted by 4+ Distraction Cards" },
      { name: "Workaholic", text: "Complete 8 projects of any difficulty level" },
      { name: "Imposter Syndrome", text: "Win if whoever reaches CEO has fewer completed projects than you" },
      { name: "Lucky Bastard", text: "Complete 2 Executive-level projects" },
      { name: "Enabler", text: "Win if every other player completes at least 2 projects when game ends" },
      { name: "Comeback Kid", text: "Reach space 40+ from space 10 or below in a single turn" },
      { name: "Perfectionist", text: "Complete projects worth exactly 15 ladder spaces total" }
    ];

    this.BREED_POWERS = {
      'Golden Retriever': { 
        name: 'Good Boy Syndrome',
        desc: 'At start of each turn, gain +1❤️ energy for any bid this turn'
      },
      'German Shepherd': { 
        name: 'Cop Energy',
        desc: '+1⚡ when bidding on Management projects'
      },
      'Border Collie': { 
        name: 'Smartest Dog in Room',
        desc: 'Draw up to 6 cards minimum (instead of 5) at end of turn'
      },
      'Chihuahua': { 
        name: 'Napoleon Complex',
        desc: '+1💬 when bidding on Executive projects'
      },
      'Labrador': { 
        name: 'ADHD Energy',
        desc: 'Can play up to 2 Action cards per round (instead of 1) during bidding'
      },
      'Beagle': { 
        name: 'Nosy Neighbor',
        desc: 'Once per turn, peek at 1 face-down bid. Draw 2 Distraction Cards, keep 1'
      },
      'Husky': { 
        name: 'Drama Queen',
        desc: 'Immune to "Pack Mentality" Distraction Cards'
      },
      'Pug': { 
        name: 'Breathing Problems',
        desc: 'Once per game, steal a completed project from another player'
      },
      'Dalmatian': { 
        name: 'Firefighter PTSD',
        desc: '+2💪 energy when completing any project'
      },
      'Bloodhound': { 
        name: 'Stalker Instincts',
        desc: 'Can look at any player\'s Hidden Agenda once per game'
      },
      'Great Dane': { 
        name: 'Big Dog Privilege',
        desc: 'Other players need +1 energy to target you with Distractions'
      },
      'Jack Russell': { 
        name: 'Cocaine Energy',
        desc: 'Once per turn, discard 2 cards to draw 3 new ones'
      },
      'Australian Cattle Dog': { 
        name: 'Chaos Coordinator',
        desc: 'Can play up to 2 Instant Distraction Cards per turn, but must discard 1 extra'
      }
    };
  }

  createInitialGameState(players) {
    const actionDeck = this.generateActionDeck();
    const distractionDeck = this.generateDistractionDeck();
    const projectDeck = this.generateProjectDeck();
    
    // Shuffle decks
    this.shuffle(actionDeck);
    this.shuffle(distractionDeck);
    this.shuffle(projectDeck);

    // Setup players with initial cards
    const gamePlayers = players.map((p, idx) => ({
      id: p.id,
      name: p.name,
      breed: p.breed || this.getRandomBreed(),
      position: 1,
      handAction: [],
      handDistraction: [],
      bids: [[], [], []],  // 3 projects, multiple bid rounds
      agenda: this.AGENDA_DATA[Math.floor(Math.random() * this.AGENDA_DATA.length)],
      completedProjects: [],
      distractionsPlayed: 0,
      distractionsReceived: 0,
      lastTurnPosition: 1,
      usedBreedPower: false,
      bonusEnergy: { comm: 0, focus: 0, social: 0, phys: 0 }
    }));

    // Deal initial cards
    gamePlayers.forEach(player => {
      const cardCount = player.breed === 'Border Collie' ? 6 : 5;
      for (let i = 0; i < cardCount && actionDeck.length > 0; i++) {
        player.handAction.push(actionDeck.shift());
      }
      if (distractionDeck.length > 0) {
        player.handDistraction.push(distractionDeck.shift());
      }
    });

    // Setup initial projects
    const projects = [];
    for (let i = 0; i < 3 && projectDeck.length > 0; i++) {
      projects.push(projectDeck.shift());
    }

    return {
      players: gamePlayers,
      currentPlayer: 0,
      firstPlayer: 0,
      turn: 1,
      phase: 'bidding',  // bidding, distraction, cleanup
      round: 1,  // 1-3 bidding rounds
      projects: projects,
      actionDeck: actionDeck,
      distractionDeck: distractionDeck,
      projectDeck: projectDeck,
      winner: null,
      cardsPlayedThisRound: 0,
      bidsThisTurn: []
    };
  }

  generateActionDeck() {
    const actions = {
      communication: [
        { name: "Bark", energy: { comm: 2 }, count: 3 },
        { name: "Howl at moon", energy: { comm: 2, focus: 1 }, count: 2 },
        { name: "Whimper", energy: { comm: 1 }, count: 2 },
        { name: "Growl at Jeff from Accounting", energy: { comm: 2, phys: 1 }, count: 1 },
        { name: "Excited yipping", energy: { comm: 1, social: 1 }, count: 2 },
        { name: "Aggressive throat singing", energy: { comm: 3 }, count: 1 },
        { name: "Woof of confusion", energy: { comm: 1 }, count: 2 },
        { name: "Bark at absolutely nothing for 20 minutes", energy: { comm: 3 }, count: 1 },
        { name: "Howl about your divorce", energy: { comm: 2, focus: 1 }, count: 1 },
        { name: "Whine about office temperature", energy: { comm: 1, social: 1 }, count: 1 },
        { name: "Death metal growl", energy: { comm: 2, phys: 1 }, count: 1 },
        { name: "Existential howling", energy: { comm: 2, focus: 2 }, count: 1 },
        { name: "Complain to HR via interpretive barking", energy: { comm: 3, social: 1 }, count: 1 },
        { name: "Whisper menacingly", energy: { comm: 1, focus: 1 }, count: 1 }
      ],
      focus: [
        { name: "Sit", energy: { focus: 1 }, count: 3 },
        { name: "Stay", energy: { focus: 2 }, count: 2 },
        { name: "Stare at wall", energy: { focus: 2 }, count: 2 },
        { name: "Scratch ear", energy: { focus: 1 }, count: 2 },
        { name: "Tilt head", energy: { focus: 1 }, count: 2 },
        { name: "Zone out completely", energy: { focus: 3 }, count: 1 },
        { name: "Enter dissociative state", energy: { focus: 3 }, count: 1 },
        { name: "Contemplate mortality", energy: { focus: 2, comm: 1 }, count: 1 },
        { name: "Meditate on the futility of corporate life", energy: { focus: 4 }, count: 1 },
        { name: "See ghosts", energy: { focus: 2, social: 1 }, count: 1 },
        { name: "Calculate exact distance to treat drawer", energy: { focus: 2, phys: 1 }, count: 1 },
        { name: "Judge everyone silently", energy: { focus: 2 }, count: 1 },
        { name: "Achieve enlightenment briefly", energy: { focus: 3, social: 1 }, count: 1 },
        { name: "Laser focus on dust mote", energy: { focus: 1, phys: 1 }, count: 1 }
      ],
      social: [
        { name: "Wag tail", energy: { social: 1 }, count: 3 },
        { name: "Roll over", energy: { social: 1 }, count: 2 },
        { name: "Play bow", energy: { social: 2 }, count: 2 },
        { name: "Puppy eyes", energy: { social: 1, comm: 1 }, count: 2 },
        { name: "Happy dance", energy: { social: 1, phys: 1 }, count: 2 },
        { name: "Aggressive snuggling", energy: { social: 2, phys: 1 }, count: 1 },
        { name: "Weaponized cuteness", energy: { social: 3 }, count: 1 },
        { name: "Manipulative head tilt", energy: { social: 2, focus: 1 }, count: 1 },
        { name: "Emotional support presence", energy: { social: 2 }, count: 1 },
        { name: "Unconditional love bombing", energy: { social: 3, comm: 1 }, count: 1 },
        { name: "Codependent behavior", energy: { social: 2, comm: 1 }, count: 1 },
        { name: "People pleasing to unhealthy degree", energy: { social: 2, focus: 2 }, count: 1 },
        { name: "Guilt trip via eye contact", energy: { social: 1, comm: 2 }, count: 1 }
      ],
      physical: [
        { name: "Run", energy: { phys: 2 }, count: 3 },
        { name: "Dig", energy: { phys: 2 }, count: 2 },
        { name: "Fetch", energy: { phys: 1, social: 1 }, count: 2 },
        { name: "Shake", energy: { phys: 1 }, count: 2 },
        { name: "Paw at air", energy: { phys: 1 }, count: 2 },
        { name: "Zoomies", energy: { phys: 3 }, count: 1 },
        { name: "Violent full-body shake", energy: { phys: 2, comm: 1 }, count: 1 },
        { name: "Excavate to Australia", energy: { phys: 3 }, count: 1 },
        { name: "Parkour through cubicles", energy: { phys: 2, focus: 1 }, count: 1 },
        { name: "Stress digging in conference room", energy: { phys: 2, comm: 1 }, count: 1 },
        { name: "Fetch nothing with passion", energy: { phys: 2, social: 1 }, count: 1 },
        { name: "Territorial leg lifting", energy: { phys: 2, comm: 2 }, count: 1 },
        { name: "Interpretive dance about quarterly reports", energy: { phys: 1, social: 2 }, count: 1 }
      ]
    };

    const deck = [];
    let cardId = 0;
    for (const [category, cards] of Object.entries(actions)) {
      for (const card of cards) {
        for (let i = 0; i < card.count; i++) {
          deck.push({
            id: `action_${cardId++}`,
            name: card.name,
            energy: { comm: 0, focus: 0, social: 0, phys: 0, ...card.energy },
            category: category
          });
        }
      }
    }
    return deck;
  }

  generateProjectDeck() {
    const projects = {
      entry: [
        { name: "File paperwork", cost: { focus: 2 }, tier: 'Entry', spaces: 1 },
        { name: "Answer phones", cost: { comm: 2 }, tier: 'Entry', spaces: 1 },
        { name: "Greet visitors", cost: { social: 1, comm: 1 }, tier: 'Entry', spaces: 1 },
        { name: "Data entry", cost: { focus: 3 }, tier: 'Entry', spaces: 1 },
        { name: "Coffee run", cost: { phys: 2 }, tier: 'Entry', spaces: 1 }
      ],
      management: [
        { name: "Lead team meeting", cost: { comm: 2, social: 1 }, tier: 'Management', spaces: 2 },
        { name: "Budget review", cost: { focus: 3 }, tier: 'Management', spaces: 2 },
        { name: "Performance evaluations", cost: { social: 2, focus: 1 }, tier: 'Management', spaces: 2 },
        { name: "Strategic planning", cost: { focus: 3, comm: 1 }, tier: 'Management', spaces: 2 },
        { name: "Client presentation", cost: { comm: 3 }, tier: 'Management', spaces: 2 }
      ],
      executive: [
        { name: "Board presentation without humping anyone's leg", cost: { comm: 4, focus: 1 }, tier: 'Executive', spaces: 3 },
        { name: "Merger negotiation (no territorial marking)", cost: { comm: 3, social: 2 }, tier: 'Executive', spaces: 3 },
        { name: "IPO preparation (Initial Puppy Offering)", cost: { comm: 3, focus: 2 }, tier: 'Executive', spaces: 3 }
      ]
    };

    const deck = [];
    let projectId = 0;
    for (const [tier, cards] of Object.entries(projects)) {
      for (const card of cards) {
        // Add multiple copies of each project
        for (let i = 0; i < 3; i++) {
          deck.push({
            id: `project_${projectId++}`,
            name: card.name,
            tier: card.tier,
            cost: { comm: 0, focus: 0, social: 0, phys: 0, ...card.cost },
            reward: card.spaces
          });
        }
      }
    }
    return deck;
  }

  generateDistractionDeck() {
    const distractions = [
      { name: "Squirrel!", effect: "Target must discard 1 bid card", type: 'instant', targetRequired: true },
      { name: "Doorbell", effect: "Target cannot play cards next round", type: 'instant', targetRequired: true },
      { name: "Pack mentality", effect: "Everyone passes 1 card clockwise", type: 'end', targetRequired: false },
      { name: "Coffee spill", effect: "Target loses 1 energy next bid", type: 'instant', targetRequired: true }
    ];

    const deck = [];
    let distractionId = 0;
    distractions.forEach(card => {
      for (let i = 0; i < 5; i++) {
        deck.push({
          ...card,
          id: `distraction_${distractionId++}`
        });
      }
    });
    return deck;
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  getRandomBreed() {
    const breeds = Object.keys(this.BREED_POWERS);
    return breeds[Math.floor(Math.random() * breeds.length)];
  }
}

// Export for Node.js or use in browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameEngine;
}