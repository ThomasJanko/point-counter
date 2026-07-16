module.exports = {
  preset: 'react-native',
  // @react-navigation and a few RN native modules ship ESM in
  // node_modules; without this they fail to parse under Jest's default
  // CommonJS transform (pre-existing gap in the react-native preset).
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-.*|@react-native-community|@react-native-async-storage)/)',
  ],
  setupFiles: ['./jest/jest.setup.js'],
};
