// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // react-hooks v7's React Compiler-oriented rules don't yet recognize
    // react-native-reanimated's shared values: mutating `sharedValue.value`
    // (the library's core, documented API) gets flagged as an immutable
    // write, and reading it outside a worklet gets flagged as a ref-during-
    // render violation. This app uses Reanimated throughout for animation,
    // so both rules are disabled rather than sprinkled with disables.
    rules: {
      'react-hooks/immutability': 'off',
      'react-hooks/refs': 'off',
    },
  },
]);
