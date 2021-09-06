module.exports = {
  testEnvironment: 'jest-environment-jsdom-fifteen',
  moduleFileExtensions: ['js', 'vue'],
  preset: '@vue/cli-plugin-unit-jest',
  transformIgnorePatterns: [
    '/node_modules/(?!lodash-es)'
  ],
  moduleNameMapper: {
    '^@/(.*svg)(\\?inline)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testMatch: [
    '**/?(*.)+(spec|test).js?(x)',
    '(**/tests/**/.*|(\\.|/)(test|spec))\\.[jt]s?(x)$'
  ]
}
