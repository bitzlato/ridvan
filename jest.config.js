module.exports = {
  testTimeout: 300000,
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.ts'],
  testMatch: ['<rootDir>/src/tests/**/*.test.ts'],
  testEnvironment: 'node',
  testSequencer: `<rootDir>/testSequencer.cjs`,
  forceExit: true,
  verbose: true,
  maxConcurrency: 1,
  transform: {
    '.ts$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  setupFilesAfterEnv: ['jest-extended'],
};
