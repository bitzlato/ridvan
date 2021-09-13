module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
  testMatch: ['<rootDir>/src/tests/**/*.test.ts'],
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
