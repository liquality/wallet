# Liquality Wallet <img align="right" src="https://raw.githubusercontent.com/liquality/chainabstractionlayer/master/liquality-logo.png" height="80px" />

## Getting started
- Install NVM [https://github.com/nvm-sh/nvm#installing-and-updating]()
- Go to this folder repo and run `nvm use` to takes the right version for node (install if you need it)

## Project setup
```
npm ci
```

### Compiles and hot-reloads for development
- Create a .env.local file with this content:
```
  VUE_APP_LEDGER_BRIDGE_URL=https://liquality.github.io/ledger-web-bridge/dist
  VUE_APP_AGENT_TESTNET_URL=https://liquality.io/swap-testnet-dev/agent
  VUE_APP_AGENT_MAINNET_URL=https://liquality.io/swap/agent
```
- Run the local build
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

## License

[MIT](./LICENSE.md)
