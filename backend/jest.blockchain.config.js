module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/tests/blockchain'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/services/hedera/**/*.ts',
    'src/routes/blockchain/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage/blockchain',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/blockchain/setup.ts'],
  testTimeout: 60000,
  verbose: true,
  detectOpenHandles: true,
  forceExit: true
};
