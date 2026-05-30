module.exports = {
  testEnvironment: 'node',
  clearMocks: true,
  restoreMocks: true,
  moduleDirectories: ['node_modules', 'src'],
  setupFiles: ['<rootDir>/tests/setup.js'], // Optional setup file
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/config/**',
    '!src/middleware/rateLimiter.js',
    '!src/layers/integration/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html', 'lcov'],
};
