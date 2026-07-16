// Native modules that don't have a JS-only implementation need explicit
// mocks under Jest, since there's no native binary to back them in the test
// environment.
import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
