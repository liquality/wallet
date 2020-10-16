import Client from '@liquality/client'

import BitcoinSwapProvider from '@liquality/bitcoin-swap-provider'
import BitcoinJsWalletProvider from '@liquality/bitcoin-js-wallet-provider'
import BitcoinEsploraBatchApiProvider from '@liquality/bitcoin-esplora-batch-api-provider'
import BitcoinEsploraSwapFindProvider from '@liquality/bitcoin-esplora-swap-find-provider'
import BitcoinEarnFeeProvider from '@liquality/bitcoin-earn-fee-provider'
import BitcoinRpcFeeProvider from '@liquality/bitcoin-rpc-fee-provider'

import EthereumRpcProvider from '@liquality/ethereum-rpc-provider'
import EthereumJsWalletProvider from '@liquality/ethereum-js-wallet-provider'
import EthereumSwapProvider from '@liquality/ethereum-swap-provider'
import EthereumScraperSwapFindProvider from '@liquality/ethereum-scraper-swap-find-provider'
import EthereumGasStationFeeProvider from '@liquality/ethereum-gas-station-fee-provider'
import EthereumRpcFeeProvider from '@liquality/ethereum-rpc-fee-provider'

import EthereumErc20Provider from '@liquality/ethereum-erc20-provider'
import EthereumErc20SwapProvider from '@liquality/ethereum-erc20-swap-provider'
import EthereumErc20ScraperSwapFindProvider from '@liquality/ethereum-erc20-scraper-swap-find-provider'

import BitcoinNetworks from '@liquality/bitcoin-networks'
import EthereumNetworks from '@liquality/ethereum-networks'

import { isERC20 } from '../../utils/asset'

const ERC20_CONTRACT_ADDRESSES = {
  DAI: {
    mainnet: '0x6b175474e89094c44da98b954eedeac495271d0f',
    rinkeby: '0xcE2748BE67fB4346654B4500c4BB0642536365FC'
  },
  USDC: {
    mainnet: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  },
  USDT: {
    mainnet: '0xdac17f958d2ee523a2206206994597c13d831ec7'
  },
  WBTC: {
    mainnet: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
  },
  UNI: {
    mainnet: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'
  }
}

export const NetworkAssets = {
  mainnet: ['BTC', 'ETH', 'DAI', 'USDC', 'USDT', 'WBTC', 'UNI'],
  testnet: ['BTC', 'ETH', 'DAI']
}

function createBtcClient (network, mnemonic) {
  const isTestnet = network === 'testnet'
  const bitcoinNetwork = isTestnet ? BitcoinNetworks.bitcoin_testnet : BitcoinNetworks.bitcoin
  const esploraApi = isTestnet ? 'https://liquality.io/testnet/electrs' : 'https://liquality.io/electrs'
  const batchEsploraApi = isTestnet ? 'https://liquality.io/electrs-testnet-batch' : 'https://liquality.io/electrs-batch'

  const btcClient = new Client()
  btcClient.addProvider(new BitcoinEsploraBatchApiProvider(batchEsploraApi, esploraApi, network, 2))
  btcClient.addProvider(new BitcoinJsWalletProvider(bitcoinNetwork, mnemonic))
  btcClient.addProvider(new BitcoinSwapProvider(bitcoinNetwork))
  btcClient.addProvider(new BitcoinEsploraSwapFindProvider(esploraApi))
  if (isTestnet) btcClient.addProvider(new BitcoinRpcFeeProvider())
  else btcClient.addProvider(new BitcoinEarnFeeProvider())

  return btcClient
}

function createEthClient (asset, network, mnemonic) {
  const isTestnet = network === 'testnet'
  const ethereumNetwork = isTestnet ? EthereumNetworks.rinkeby : EthereumNetworks.mainnet
  const infuraApi = isTestnet ? 'https://rinkeby.infura.io/v3/da99ebc8c0964bb8bb757b6f8cc40f1f' : 'https://mainnet.infura.io/v3/da99ebc8c0964bb8bb757b6f8cc40f1f'
  const scraperApi = isTestnet ? 'https://liquality.io/eth-rinkeby-api' : 'https://liquality.io/eth-mainnet-api'

  const ethClient = new Client()
  ethClient.addProvider(new EthereumRpcProvider(infuraApi))
  ethClient.addProvider(new EthereumJsWalletProvider(ethereumNetwork, mnemonic))
  if (isERC20(asset)) {
    const contractAddress = ERC20_CONTRACT_ADDRESSES[asset][ethereumNetwork.name]
    ethClient.addProvider(new EthereumErc20Provider(contractAddress))
    ethClient.addProvider(new EthereumErc20SwapProvider())
    ethClient.addProvider(new EthereumErc20ScraperSwapFindProvider(scraperApi))
  } else {
    ethClient.addProvider(new EthereumSwapProvider())
    ethClient.addProvider(new EthereumScraperSwapFindProvider(scraperApi))
  }
  if (isTestnet) ethClient.addProvider(new EthereumRpcFeeProvider())
  else ethClient.addProvider(new EthereumGasStationFeeProvider())

  return ethClient
}

export const createClient = (asset, network, mnemonic) => {
  if (asset === 'BTC') return createBtcClient(network, mnemonic)

  return createEthClient(asset, network, mnemonic)
}
