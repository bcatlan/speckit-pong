module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['jest-canvas-mock'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'index.html',
    '!**/node_modules/**',
    '!**/tests/**'
  ]
};
