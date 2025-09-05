// Dogs with Jobs - Complete Game Data

const GAME_DATA = {
  // Hidden Agenda Cards
  agendas: [
    { name: "Teacher's Pet", text: "Win if you complete 3 projects while the player to your left completes 0" },
    { name: "Chaos Agent", text: "Win if 6+ Distraction Cards are played by you" },
    { name: "Middle Management Forever", text: "Win if you're in exactly 3rd place when someone reaches CEO" },
    { name: "Overachiever", text: "Reach CEO with 2+ extra ladder spaces beyond requirement" },
    { name: "Saboteur", text: "Win if no one reaches CEO (space 50) by Turn 12" },
    { name: "Attention Whore", text: "Win if you're targeted by 4+ Distraction Cards" },
    { name: "Workaholic", text: "Complete 8 projects of any difficulty level" },
    { name: "Imposter Syndrome", text: "Win if whoever reaches CEO has fewer completed projects than you" },
    { name: "Lucky Bastard", text: "Complete 2 Executive-level projects (6+ spaces from Executive projects only)" },
    { name: "Enabler", text: "Win if every other player completes at least 2 projects when game ends" },
    { name: "Comeback Kid", text: "Reach space 40+ from space 10 or below in a single turn" },
    { name: "Perfectionist", text: "Complete projects worth exactly 15 ladder spaces total" }
  ],

  // Breed Powers
  breeds: {
    'Golden Retriever': { 
      power: "Good Boy Syndrome", 
      description: "At the start of each turn, before bidding, gain +1❤️ energy that can be added to any bid this turn" 
    },
    'German Shepherd': { 
      power: "Cop Energy", 
      description: "+1⚡ when bidding on Management projects" 
    },
    'Border Collie': { 
      power: "Smartest Dog in Room", 
      description: "Draw up to 6 cards minimum (instead of 5) at end of turn" 
    },
    'Chihuahua': { 
      power: "Napoleon Complex", 
      description: "+1💬 when bidding on Executive projects" 
    },
    'Labrador': { 
      power: "ADHD Energy", 
      description: "Can play up to 2 Dog Action cards per round (instead of 1) during bidding" 
    },
    'Beagle': { 
      power: "Nosy Neighbor", 
      description: "Once per turn, you may peek at 1 face-down bid card from any player. Draw 2 Distraction Cards and keep 1" 
    },
    'Husky': { 
      power: "Drama Queen", 
      description: "Immune to 'Pack Mentality' Distraction Cards" 
    },
    'Pug': { 
      power: "Breathing Problems", 
      description: "Once per game, steal a completed project from another player" 
    },
    'Dalmatian': { 
      power: "Firefighter PTSD", 
      description: "+2💪 energy when completing any project" 
    },
    'Bloodhound': { 
      power: "Stalker Instincts", 
      description: "Can look at any player's Hidden Agenda once per game" 
    },
    'Great Dane': { 
      power: "Big Dog Privilege", 
      description: "Other players need +1 energy to target you with Distractions" 
    },
    'Jack Russell': { 
      power: "Cocaine Energy", 
      description: "Once per turn, discard 2 cards to draw 3 new ones" 
    },
    'Australian Cattle Dog': { 
      power: "Chaos Coordinator", 
      description: "Can play up to 2 Instant Distraction Cards per turn, but must discard 1 extra card when doing so" 
    }
  },

  // Action Cards with counts
  actionCards: {
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
  },

  // Project Cards
  projects: {
    entry: [
      { name: "File paperwork", cost: { focus: 2 }, tier: 'Entry', spaces: 1 },
      { name: "Answer phones", cost: { comm: 2 }, tier: 'Entry', spaces: 1 },
      { name: "Greet visitors", cost: { social: 1, comm: 1 }, tier: 'Entry', spaces: 1 },
      { name: "Data entry", cost: { focus: 3 }, tier: 'Entry', spaces: 1 },
      { name: "Coffee run", cost: { phys: 2 }, tier: 'Entry', spaces: 1 },
      { name: "Sort mail", cost: { phys: 1, focus: 1 }, tier: 'Entry', spaces: 1 },
      { name: "Water plants", cost: { phys: 1 }, tier: 'Entry', spaces: 1 },
      { name: "Organize supplies", cost: { phys: 2 }, tier: 'Entry', spaces: 1 },
      { name: "Update database without paw prints on keyboard", cost: { focus: 2, phys: 1 }, tier: 'Entry', spaces: 1 },
      { name: "Professional email (no 'woof' in signature)", cost: { comm: 2, focus: 1 }, tier: 'Entry', spaces: 1 },
      { name: "Schedule meetings during optimal nap hours", cost: { comm: 1, focus: 2 }, tier: 'Entry', spaces: 1 },
      { name: "Inventory without hiding treats", cost: { focus: 2, phys: 1 }, tier: 'Entry', spaces: 1 },
      { name: "Client small talk without sniffing", cost: { comm: 1, social: 1 }, tier: 'Entry', spaces: 1 },
      { name: "Photocopy without eating paper", cost: { phys: 1, focus: 1 }, tier: 'Entry', spaces: 1 },
      { name: "Reception desk: no leg humping", cost: { social: 2 }, tier: 'Entry', spaces: 1 }
    ],
    management: [
      { name: "Lead team meeting", cost: { comm: 2, social: 1 }, tier: 'Management', spaces: 2 },
      { name: "Budget review", cost: { focus: 3 }, tier: 'Management', spaces: 2 },
      { name: "Performance evaluations", cost: { social: 2, focus: 1 }, tier: 'Management', spaces: 2 },
      { name: "Strategic planning", cost: { focus: 3, comm: 1 }, tier: 'Management', spaces: 2 },
      { name: "Client presentation", cost: { comm: 3 }, tier: 'Management', spaces: 2 },
      { name: "Contract negotiation", cost: { comm: 2, phys: 1 }, tier: 'Management', spaces: 2 },
      { name: "Crisis management", cost: { phys: 2, comm: 1 }, tier: 'Management', spaces: 2 },
      { name: "Staff training", cost: { social: 2, comm: 1 }, tier: 'Management', spaces: 2 },
      { name: "Market research", cost: { focus: 2, phys: 1 }, tier: 'Management', spaces: 2 },
      { name: "Quality control", cost: { focus: 2, phys: 1 }, tier: 'Management', spaces: 2 },
      { name: "Vendor relations", cost: { comm: 2, social: 1 }, tier: 'Management', spaces: 2 },
      { name: "Process improvement", cost: { focus: 2, phys: 1 }, tier: 'Management', spaces: 2 },
      { name: "Team building without inappropriate mounting", cost: { social: 3, comm: 1 }, tier: 'Management', spaces: 2 },
      { name: "Disciplinary meeting (no growling)", cost: { comm: 2, focus: 2 }, tier: 'Management', spaces: 2 },
      { name: "Quarterly projections beyond 'treats = good'", cost: { focus: 4 }, tier: 'Management', spaces: 2 }
    ],
    executive: [
      { name: "Board presentation without humping anyone's leg", cost: { comm: 4, focus: 1 }, tier: 'Executive', spaces: 3 },
      { name: "Merger negotiation (no territorial marking)", cost: { comm: 3, social: 2 }, tier: 'Executive', spaces: 3 },
      { name: "Company restructure that isn't just pack hierarchy", cost: { focus: 3, phys: 2 }, tier: 'Executive', spaces: 3 },
      { name: "Annual strategy beyond 'acquire all treats'", cost: { focus: 4, social: 1 }, tier: 'Executive', spaces: 3 },
      { name: "IPO preparation (Initial Puppy Offering)", cost: { comm: 3, focus: 2 }, tier: 'Executive', spaces: 3 },
      { name: "Hostile takeover via aggressive tail wagging", cost: { comm: 2, phys: 2, social: 1 }, tier: 'Executive', spaces: 3 }
    ]
  },

  // Distraction Cards
  distractions: {
    instant: [
      { name: "Squirrel!", effect: "Target must immediately reveal and discard 1 face-down bid card", count: 4, type: 'instant' },
      { name: "Doorbell", effect: "Target cannot play any cards in the next bidding round", count: 3, type: 'instant' },
      { name: "Sudden play fight", effect: "Swap hands with target player immediately", count: 2, type: 'instant' },
      { name: "Zoomies attack", effect: "Target must shuffle all their face-down bid cards back into hand, cannot bid on any projects this turn", count: 2, type: 'instant' },
      { name: "Treat emergency", effect: "Target must discard 1 card from hand before their next bidding round", count: 2, type: 'instant' },
      { name: "Mailman spotted at 3 o'clock", effect: "All Communication energy gets +1 bonus for remainder of this bidding phase", count: 1, type: 'instant' },
      { name: "Existential crisis", effect: "Target must explain their final bid in character as a dog during reveal", count: 1, type: 'instant' }
    ],
    endOfTurn: [
      { name: "Pack mentality activated", effect: "Everyone passes 1 card clockwise", count: 3, type: 'end' },
      { name: "Management restructure", effect: "Shuffle current projects away, draw new ones", count: 2, type: 'end' },
      { name: "Office gossip network", effect: "Look at target player's Hidden Agenda card", count: 2, type: 'end' },
      { name: "Mandatory team lunch", effect: "Everyone draws 2 cards, discards 1", count: 2, type: 'end' },
      { name: "IT disaster recovery", effect: "Everyone discards entire hand, draws back to minimum", count: 1, type: 'end' },
      { name: "Coffee machine breakdown", effect: "Target player cannot play Instant Distractions next turn", count: 2, type: 'end' },
      { name: "Participation trophy distribution", effect: "All players who didn't win a project this turn draw 1 extra card", count: 2, type: 'end' },
      { name: "Fire drill chaos", effect: "Next turn, all bid cards must be played face-up instead of face-down", count: 1, type: 'end' }
    ],
    beneficial: [
      { name: "Coffee delivery", effect: "You and target player both draw 1 card immediately", count: 2, type: 'instant', beneficial: true },
      { name: "Motivational speech", effect: "All players get +1 energy to their next bid this turn", count: 1, type: 'instant', beneficial: true },
      { name: "Lucky break", effect: "Look at the top 3 Project Cards, choose which ones to reveal", count: 1, type: 'instant', beneficial: true },
      { name: "Team bonding exercise", effect: "All players draw 1 extra card, you draw 2 extra", count: 2, type: 'end', beneficial: true },
      { name: "Performance bonus", effect: "If you completed a project this turn, move up 1 additional space", count: 1, type: 'end', beneficial: true },
      { name: "Mentorship program", effect: "Choose another player; both of you gain +1 energy to all bids next turn", count: 1, type: 'end', beneficial: true }
    ]
  }
};