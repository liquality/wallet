import Client from '@liquality/client'

import BitcoinSwapProvider from '@liquality/bitcoin-swap-provider'
import BitcoinJsWalletProvider from '@liquality/bitcoin-js-wallet-provider'
import BitcoinEsploraApiProvider from '@liquality/bitcoin-esplora-api-provider'
import BitcoinEsploraSwapFindProvider from '@liquality/bitcoin-esplora-swap-find-provider'

import EthereumRpcProvider from '@liquality/ethereum-rpc-provider'
import EthereumJsWalletProvider from '@liquality/ethereum-js-wallet-provider'
import EthereumSwapProvider from '@liquality/ethereum-swap-provider'
import EthereumScraperSwapFindProvider from '@liquality/ethereum-scraper-swap-find-provider'

import EthereumErc20Provider from '@liquality/ethereum-erc20-provider'
import EthereumErc20SwapProvider from '@liquality/ethereum-erc20-swap-provider'
import EthereumErc20ScraperSwapFindProvider from '@liquality/ethereum-erc20-scraper-swap-find-provider'

import { networks } from '@/utils/networks'
import { rpc } from '@/utils/rpc'

const RpcProviders = {
  btc: BitcoinEsploraApiProvider,
  eth: EthereumRpcProvider,
  dai: EthereumRpcProvider,
  usdc: EthereumRpcProvider
}

const JsWalletProviders = {
  btc: BitcoinJsWalletProvider,
  eth: EthereumJsWalletProvider,
  dai: EthereumJsWalletProvider,
  usdc: EthereumJsWalletProvider
}

const SwapProviders = {
  btc: BitcoinSwapProvider,
  eth: EthereumSwapProvider,
  dai: EthereumErc20SwapProvider,
  usdc: EthereumErc20SwapProvider
}

const AdditionalSwapProviders = {
  btc: BitcoinEsploraSwapFindProvider,
  eth: EthereumScraperSwapFindProvider,
  dai: EthereumErc20ScraperSwapFindProvider,
  usdc: EthereumErc20ScraperSwapFindProvider
}

const ERC20 = {
  dai: '0x6b175474e89094c44da98b954eedeac495271d0f',
  usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
}

export const createClient = (chain, mnemonic, isTestnet) => {
  if (isTestnet !== true && isTestnet !== false) throw new Error('isTestnet argument is mandatory')

  const NetworkArgs = {
    btc: isTestnet ? 'bitcoin_testnet' : 'bitcoin',
    eth: isTestnet ? 'rinkeby' : 'mainnet',
    dai: isTestnet ? 'rinkeby' : 'mainnet',
    usdc: isTestnet ? 'rinkeby' : 'mainnet'
  }

  const SwapArgs = {
    btc: [{ network: networks.btc[NetworkArgs.btc] }, 'p2wsh'],
    eth: [],
    dai: [],
    usdc: []
  }

  const AdditionalSwapArgs = {
    btc: rpc.btc[NetworkArgs.btc],
    eth: [isTestnet ? 'https://liquality.io/eth-rinkeby-api' : 'https://liquality.io/eth-mainnet-api'],
    dai: [isTestnet ? 'https://liquality.io/eth-rinkeby-api' : 'https://liquality.io/eth-mainnet-api'],
    usdc: [isTestnet ? 'https://liquality.io/eth-rinkeby-api' : 'https://liquality.io/eth-mainnet-api']
  }

  chain = chain.toLowerCase()

  const client = new Client()

  client.addProvider(new RpcProviders[chain](
    ...rpc[chain][NetworkArgs[chain]]
  ))

  client.addProvider(new JsWalletProviders[chain](
    networks[chain][NetworkArgs[chain]],
    mnemonic
  ))

  if (ERC20[chain]) {
    client.addProvider(new EthereumErc20Provider(ERC20[chain]))
  }

  client.addProvider(new SwapProviders[chain](
    ...SwapArgs[chain]
  ))

  client.addProvider(new AdditionalSwapProviders[chain](
    ...AdditionalSwapArgs[chain]
  ))

  return client
}
