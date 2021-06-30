module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  transformIgnorePatterns: [
    '/node_modules/(?!lodash-es)'
  ],
  moduleNameMapper: {
    '^@/(.*svg)(\\?inline)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)']
}
