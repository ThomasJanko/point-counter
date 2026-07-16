module.exports = {
  preset: 'react-native',
  // @react-navigation and a few RN native modules ship ESM in
  // node_modules; without this they fail to parse under Jest's default
  // CommonJS transform (pre-existing gap in the react-native preset).
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-.*|@react-native-community|@react-native-async-storage)/)',
  ],
  setupFiles: ['./__tests__/jestSetup.js'],
  // jestSetup.js lives inside __tests__ (this sandbox couldn't create a
  // separate top-level folder for it) so it must be excluded from the
  // default __tests__/**/*.js test match, or Jest tries to run it as a
  // test suite with no tests in it.
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/__tests__/jestSetup.js',
    '<rootDir>/__tests__/jestSetupProbe.js',
  ],
};
