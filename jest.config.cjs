/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  // Stop running tests after `n` failures
  bail: 1,

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Allow tests to run in .ts files
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },

  testEnvironment: 'node',

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: ['/node_modules/'],

  /* A path to a module which exports an async function that is
      triggered once before all test suites */
  // globalSetup: undefined,

  // An array of file extensions your modules use
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],

  /* An array of regexp pattern strings, matched against all module paths
      before considered 'visible' to the module loader */
  // modulePathIgnorePatterns: [],

  /* The paths to modules that run some code to configure or
      set up the testing environment before each test */
  // setupFiles: ['./src/setupTests.ts'],

  /* A list of paths to modules that run some code to
    configure or set up the testing framework before each test */
  // setupFilesAfterEnv: ['test/unit/setupTests.ts'],

  // The glob patterns Jest uses to detect test files
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],

  /* An array of regexp pattern strings that are matched against all test paths,
       matched tests are skipped */
  testPathIgnorePatterns: ['\\\\node_modules\\\\', '\\\\dist\\\\'],
};
