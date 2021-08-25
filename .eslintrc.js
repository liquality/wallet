module.exports = {
  root: true,

  env: {
    node: true,
    webextensions: true,
    mocha: true
  },

  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],

  parserOptions: {
    parser: 'babel-eslint'
  },

  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  },

  overrides: [
    {
      files: [
        '**/tests/**/*.[jt]s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
}
