# Dogs With Jobs - Multiplayer Setup

## Quick Start (Local Testing)

1. **Install Node.js** if you don't have it: https://nodejs.org/

2. **Install dependencies**:
```bash
npm install
```

3. **Start the server**:
```bash
npm start
```

4. **Open multiple browser windows**:
- Go to `http://localhost:3000` in each window
- One player creates a room (becomes host)
- Other players join with the room code
- Everyone clicks "Ready"
- Host starts the game

## How It Works

### For Players
- Each player only sees THEIR hand and agenda
- Other players' cards are hidden
- When someone bids, you see an animation but not the card
- Everything is synchronized in real-time

### Architecture
```
Your Phone/Browser ←→ Game Server ←→ Other Players
```

### Key Features
- **Room codes**: 6-character codes like "ABC123"
- **Player views**: Each player gets their own perspective
- **Hidden information**: Server ensures players can't cheat
- **Real-time sync**: Using WebSockets for instant updates

## Deployment Options

### Free Hosting Options:

1. **Render.com** (Recommended)
   - Free tier available
   - Easy deployment from GitHub
   - WebSocket support

2. **Railway.app**
   - Simple deployment
   - Good free tier
   - Great for testing

3. **Glitch.com**
   - Instant deployment
   - Free forever
   - Can edit code online

### To Deploy:

1. Push code to GitHub
2. Connect to hosting service
3. Deploy with one click
4. Share URL with friends!

## Mobile Support

The game is designed to work on phones:
- Responsive layout
- Touch-friendly controls
- Portrait mode optimized
- No app download needed!

## Next Steps

1. **Test locally** with multiple browser tabs
2. **Integrate game logic** from local version
3. **Add visual feedback** for opponent actions
4. **Deploy to hosting** service
5. **Test with friends**!

## Current Status

✅ Server infrastructure
✅ Room creation/joining
✅ Player ready system
✅ Basic socket communication
⏳ Game logic integration
⏳ Visual bid animations
⏳ Mobile optimization
⏳ Deployment

## Development Tips

- Server runs on port 3000 by default
- Use `npm run dev` for auto-restart during development
- Check browser console for debug info
- Server logs all connections/actions