import Client from '@liquality/client'

import BitcoinSwapProvider from '@liquality/bitcoin-swap-provider'
import BitcoinJsWalletProvider from '@liquality/bitcoin-js-wallet-provider'
import BitcoinEsploraApiProvider from '@liquality/bitcoin-esplora-api-provider'
import BitcoinEsploraSwapFindProvider from '@liquality/bitcoin-esplora-swap-find-provider'

import EthereumRpcProvider from '@liquality/ethereum-rpc-provider'
import EthereumJsWalletProvider from '@liquality/ethereum-js-wallet-provider'
import EthereumSwapProvider from '@liquality/ethereum-swap-provider'
import EthereumScraperSwapFindProvider from '@liquality/ethereum-scraper-swap-find-provider'

import { isTestnet } from '@/utils/network'
import { networks } from '@/utils/networks'
import { rpc } from '@/utils/rpc'

const RpcProviders = {
  btc: BitcoinEsploraApiProvider,
  eth: EthereumRpcProvider
}

const JsWalletProviders = {
  btc: BitcoinJsWalletProvider,
  eth: EthereumJsWalletProvider
}

const SwapProviders = {
  btc: BitcoinSwapProvider,
  eth: EthereumSwapProvider
}

const NetworkArgs = {
  btc: isTestnet ? 'bitcoin_testnet' : 'bitcoin',
  eth: isTestnet ? 'rinkeby' : 'mainnet'
}

const SwapArgs = {
  btc: [{ network: networks.btc[NetworkArgs.btc] }, 'p2wsh'],
  eth: []
}

const AdditionalSwapProviders = {
  btc: BitcoinEsploraSwapFindProvider,
  eth: EthereumScraperSwapFindProvider
}

const AdditionalSwapArgs = {
  btc: rpc.btc[NetworkArgs.btc],
  eth: [isTestnet ? 'https://liquality.io/eth-rinkeby-api' : 'https://liquality.io/eth-mainnet-api']
}

export const getClient = (chain, mnemonic) => {
  chain = chain.toLowerCase()

  const client = new Client()

  client.addProvider(new RpcProviders[chain](
    ...rpc[chain][NetworkArgs[chain]]
  ))
  client.addProvider(new JsWalletProviders[chain](
    networks[chain][NetworkArgs[chain]],
    mnemonic
  ))
  client.addProvider(new SwapProviders[chain](
    ...SwapArgs[chain]
  ))
  client.addProvider(new AdditionalSwapProviders[chain](
    ...AdditionalSwapArgs[chain]
  ))

  return client
}
