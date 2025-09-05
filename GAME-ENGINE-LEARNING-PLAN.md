# Dogs With Jobs - Game Engine Port Learning Plan

## Phase 1: Foundation (Love2D Recommended)
Start with Love2D - it's simpler and you'll see results faster!

### Week 1: Love2D Basics
- [ ] Install Love2D
- [ ] Create window and draw shapes
- [ ] Handle mouse/keyboard input
- [ ] Load and display images
- **Mini Project**: Click on cards to flip them

### Week 2: Game State Management
- [ ] Create menu screens
- [ ] Switch between game states
- [ ] Store player data
- **Mini Project**: Main menu → Game → Win screen flow

### Week 3: Card System
- [ ] Create card objects
- [ ] Drag and drop cards
- [ ] Card hands and decks
- **Mini Project**: Draw cards from deck to hand

### Week 4: Game Rules
- [ ] Port your energy system
- [ ] Implement turn logic
- [ ] Add win conditions
- **Mini Project**: Single player version

### Week 5: Networking Basics
- [ ] Understand client-server model
- [ ] Send messages between instances
- [ ] Sync game state
- **Mini Project**: Two players see same cards

### Week 6: Full Multiplayer
- [ ] Room/lobby system
- [ ] Handle disconnections
- [ ] Polish and test
- **Final Project**: Complete multiplayer game

## Learning Method Rules

### 1. Try First, Ask Second
Before asking for help:
- Attempt the problem for 15 minutes
- Write down what you tried
- Note specific error messages

### 2. Understand, Don't Copy
When you get help:
- Explain back what the code does
- Modify it to do something slightly different
- Break it on purpose to understand how it works

### 3. Build Incrementally
- Start with the smallest working version
- Add ONE feature at a time
- Test after each addition

### 4. Document Your Learning
Keep a learning journal with:
- What you learned today
- What confused you
- What clicked suddenly

## Modular Architecture Plan

```
dogs-with-jobs/
├── main.lua                 # Entry point
├── conf.lua                 # Love2D config
├── states/
│   ├── menu.lua            # Main menu
│   ├── game.lua            # Game state
│   └── lobby.lua           # Multiplayer lobby
├── systems/
│   ├── cards.lua           # Card logic
│   ├── energy.lua         # Energy system
│   ├── players.lua        # Player management
│   └── rules.lua          # Game rules
├── network/
│   ├── client.lua         # Client networking
│   └── server.lua         # Server logic
└── assets/
    ├── images/
    └── sounds/
```

## Your Existing Code as Reference

You already have:
1. **Game rules** in `gameLogic.js`
2. **Card data** in `dogs-with-jobs-game-data.js`
3. **Multiplayer logic** in `server.js`

These will be your blueprints - not to copy, but to understand and recreate.

## First Challenge

**Challenge 1**: Install Love2D and create a window that:
1. Shows "Dogs With Jobs" as the title
2. Has a background color matching your game (#FAF0E6)
3. Displays one card image in the center

Try this first! When you get stuck, tell me:
- What you tried
- What error you got
- What you think might be wrong

Then I'll guide you with questions rather than answers!

## Next Steps

1. Choose Love2D or Godot (I recommend Love2D)
2. Install it
3. Try Challenge 1
4. We'll work through it together, learning-style!

Remember: The goal isn't to finish fast, it's to understand deeply.