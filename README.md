# Liquality Wallet <img align="right" src="https://raw.githubusercontent.com/liquality/chainabstractionlayer/master/liquality-logo.png" height="80px" />

## Getting started
- Install [NVM](https://github.com/nvm-sh/nvm#installing-and-updating)
- Go to this folder repo and run `nvm use` to takes the right version for node (install if you need it)

## Project setup
```
npm ci
```

### Compiles and hot-reloads for development
```
npm run dev
```

and load `/dist` directory as unpacked extension on Google Chrome.

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

> **NOTE:** You can run `npm run lint-no-fix` to perform linting without auto-fix

### Develop via browser (and use Vue devtools)

For developer convenience, you can run the built package within your browser and connect to Vue devtools.

You can leave `npm run dev` running as you develop with this procedure.

**(1)**

Install the extension:

* Open a browser to `chrome://extensions`

* Install the built `dist` package as a Chrome extension (using the "Load unpacked" option). You must have "Developer Mode" enabled.

**(2)**

Run the Vue devtools stand-alone app by executing the following command from the root of the repo:

`./node_modules/.bin/vue-devtools`

> This will automatically load devtools as an Electron app (included as a dev dependency)

**(3)**

* Copy the "ID" from the loaded extension and open a browser to: `chrome-extension://<extension_id>/index.html`

> Where <extension_id> is the "ID" from the loaded Chrome extension

* Open Chrome Developer Tools

### Run Integration __tests__

[Wallet](https://liquality.io/wallet.html) Integration __tests__ have been written using [puppeteer](https://developers.google.com/web/tools/puppeteer)

#### testNet __tests__
```
$ export SEED_WORDS={testNet import wallet 12 words}

Ex: export SEED_WORDS=test1 test2 test3 test4 test5 test6 test7 test8 test9 test10 test11 test12

$ npm run test:testNetNetwork
```

### Releases

Release to Chrome Store dev*

Update the tag in [manifest.json](src/manifest.json) & [package.json](package.json)

```shell
git tag <TAG NAME>
```

```shell
git push origin <TAG NAME>
```

### Linear.app integration
branch name format: username/liq-xx-title
eg: b0b/liq-21-integrate-github-with-linear


## License

[MIT](./LICENSE.md)
