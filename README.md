# Point Counter App

A React Native mobile application for tracking points in games with multiple players.

## Features

### User Management

- ✅ Add new users with custom names and colors
- ✅ Edit existing user information
- ✅ Delete users from the system
- ✅ Persistent storage using AsyncStorage

### Game Management

- ✅ Create new games with selected players
- ✅ Real-time point tracking with +/- buttons
- ✅ Live leaderboard with rankings
- ✅ Save game results
- ✅ Reset scores functionality

### UI/UX Features

- 🎨 Beautiful purple and black color palette
- 📱 Modern, intuitive interface
- 🎯 Easy-to-use controls
- 📊 Clear visual feedback
- 🔄 Smooth navigation between screens

## Screens

1. **Home Screen**: Overview and quick access to main features
2. **User Management**: Add, edit, and delete players
3. **Add User**: Create new players with color selection
4. **Edit User**: Modify existing player information
5. **Game Screen**: Track points and manage active games

## Installation

1. Install dependencies:

```bash
npm install
```

2. For Android:

```bash
npx react-native run-android
```

3. For iOS:

```bash
npx react-native run-ios
```

## Dependencies

- React Native
- React Navigation
- AsyncStorage
- React Native Safe Area Context
- React Native Screens
- React Native Gesture Handler

## Usage

1. **Getting Started**: Launch the app and you'll see the home screen
2. **Add Users**: Tap "Manage Users" to add players with names and colors
3. **Start Game**: Select "Start New Game" and choose 2+ players
4. **Track Points**: Use +/- buttons to adjust scores in real-time
5. **Save Game**: Enter a game name and save your results

## Color Palette

- Primary Purple: `#8b5cf6`
- Background: `#1a1a1a`
- Card Background: `#2a2a2a`
- Text Primary: `#ffffff`
- Text Secondary: `#a0a0a0`
- Accent Colors: Various colors for player identification

## Data Storage

All user data and game results are stored locally using AsyncStorage, ensuring your data persists between app sessions.

## Future Enhancements

- Game history and statistics
- Multiple game types
- Export/import functionality
- Team-based scoring
- Custom scoring rules
