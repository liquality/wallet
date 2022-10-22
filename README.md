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

### Developing with wallet-core

If you are simultaneously making changes in the [wallet-core](https://github.com/liquality/wallet-core) lib and you would like to test the wallet with your changes, do the following: 

on wallet-core:
```sh
yarn
yarn build # or yarn watch
```

on the wallet:
```sh
yarn link /path/to/wallet-core/repo
```

This will link wallet-core in the wallet with your local version. 

If you see dependency errors when you link, try to update any common dependencies to the same version as in `wallet-core`.

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Run Integration __tests__

[Wallet](https://liquality.io/wallet.html) Integration __tests__ have been written using [puppeteer](https://developers.google.com/web/tools/puppeteer)

#### testNet __tests__
```
$ export SEED_WORDS={testNet import wallet 12 words}

Ex: export SEED_WORDS="test1 test2 test3 test4 test5 test6 test7 test8 test9 test10 test11 test12"

$ npm run test:mainnet:prodagent:release
```

Run single test locally, update the [.mocharc.yml](.mocharc.yml) values ``parallel: false jobs: 1`` and add ``.only`` to the test you want to run.

### Releases

Release to Chrome Store

```angular2html
yarn sync-versions
```
it will update the tag in [manifest.json](src/manifest.json)

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
