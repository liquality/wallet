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

import NearSwapProvider from '@liquality/near-swap-provider'
import NearJsWalletProvider from '@liquality/near-js-wallet-provider'
import NearRpcProvider from '@liquality/near-rpc-provider'
import NearSwapFindProvider from '@liquality/near-swap-find-provider'
import NearRpcFeeProvider from '@liquality/near-rpc-fee-provider'

import EthereumErc20Provider from '@liquality/ethereum-erc20-provider'
import EthereumErc20SwapProvider from '@liquality/ethereum-erc20-swap-provider'
import EthereumErc20ScraperSwapFindProvider from '@liquality/ethereum-erc20-scraper-swap-find-provider'

import BitcoinNetworks from '@liquality/bitcoin-networks'
import EthereumNetworks from '@liquality/ethereum-networks'
import NearNetworks from '@liquality/near-networks'

import { isERC20 } from '../../utils/asset'
import cryptoassets from '../../utils/cryptoassets'

export const Networks = ['mainnet', 'testnet']

export const AssetNetworks = {
  BTC: {
    testnet: BitcoinNetworks.bitcoin_testnet,
    mainnet: BitcoinNetworks.bitcoin
  },
  ETH: {
    testnet: EthereumNetworks.rinkeby,
    mainnet: EthereumNetworks.mainnet
  },
  RBTC: {
    testnet: EthereumNetworks.rsk_testnet,
    mainnet: EthereumNetworks.rsk_mainnet
  },
  BNB: {
    testnet: EthereumNetworks.bsc_testnet,
    mainnet: EthereumNetworks.bsc_mainnet
  },
  NEAR: {
    testnet: NearNetworks.testnet,
    mainnet: NearNetworks.mainnet
  }
}

function createBtcClient (network, mnemonic) {
  const isTestnet = network === 'testnet'
  const bitcoinNetwork = AssetNetworks.BTC[network]
  const esploraApi = isTestnet ? 'https://liquality.io/testnet/electrs' : 'https://liquality.io/electrs'
  const batchEsploraApi = isTestnet ? 'https://liquality.io/electrs-testnet-batch' : 'https://liquality.io/electrs-batch'

  const btcClient = new Client()
  btcClient.addProvider(new BitcoinEsploraBatchApiProvider(batchEsploraApi, esploraApi, bitcoinNetwork, 2))
  btcClient.addProvider(new BitcoinJsWalletProvider(bitcoinNetwork, mnemonic))
  btcClient.addProvider(new BitcoinSwapProvider(bitcoinNetwork))
  btcClient.addProvider(new BitcoinEsploraSwapFindProvider(esploraApi))
  if (isTestnet) btcClient.addProvider(new BitcoinRpcFeeProvider())
  else btcClient.addProvider(new BitcoinEarnFeeProvider('https://liquality.io/swap/mempool/v1/fees/recommended'))

  return btcClient
}

function createEthereumClient (asset, network, rpcApi, scraperApi, FeeProvider, mnemonic) {
  const ethClient = new Client()
  ethClient.addProvider(new EthereumRpcProvider(rpcApi))
  ethClient.addProvider(new EthereumJsWalletProvider(network, mnemonic))
  if (isERC20(asset)) {
    const contractAddress = cryptoassets[asset].contractAddress
    ethClient.addProvider(new EthereumErc20Provider(contractAddress))
    ethClient.addProvider(new EthereumErc20SwapProvider())
    if (scraperApi) ethClient.addProvider(new EthereumErc20ScraperSwapFindProvider(scraperApi))
  } else {
    ethClient.addProvider(new EthereumSwapProvider())
    if (scraperApi) ethClient.addProvider(new EthereumScraperSwapFindProvider(scraperApi))
  }
  ethClient.addProvider(new FeeProvider())

  return ethClient
}

function createEthClient (asset, network, mnemonic) {
  const isTestnet = network === 'testnet'
  const ethereumNetwork = AssetNetworks.ETH[network]
  const infuraApi = isTestnet ? 'https://rinkeby.infura.io/v3/da99ebc8c0964bb8bb757b6f8cc40f1f' : 'https://mainnet.infura.io/v3/da99ebc8c0964bb8bb757b6f8cc40f1f'
  const scraperApi = isTestnet ? 'https://liquality.io/eth-rinkeby-api' : 'https://liquality.io/eth-mainnet-api'
  const FeeProvider = isTestnet ? EthereumRpcFeeProvider : EthereumGasStationFeeProvider

  return createEthereumClient(asset, ethereumNetwork, infuraApi, scraperApi, FeeProvider, mnemonic)
}

function createRskClient (asset, network, mnemonic) {
  const isTestnet = network === 'testnet'
  const rskNetwork = AssetNetworks.RBTC[network]
  const rpcApi = isTestnet ? 'https://public-node.testnet.rsk.co' : 'https://public-node.rsk.co'
  const scraperApi = isTestnet ? 'https://liquality.io/rsk-testnet-api' : 'https://liquality.io/rsk-mainnet-api'

  return createEthereumClient(asset, rskNetwork, rpcApi, scraperApi, EthereumRpcFeeProvider, mnemonic)
}

function createBSCClient (asset, network, mnemonic) {
  const isTestnet = network === 'testnet'
  const bnbNetwork = AssetNetworks.BNB[network]
  const rpcApi = isTestnet ? 'https://data-seed-prebsc-1-s1.binance.org:8545' : 'https://bsc-dataseed.binance.org'
  const scraperApi = isTestnet ? 'https://liquality.io/bsc-testnet-api' : 'https://liquality.io/bsc-mainnet-api'

  return createEthereumClient(asset, bnbNetwork, rpcApi, scraperApi, EthereumRpcFeeProvider, mnemonic)
}

function createNearClient (network, mnemonic) {
  const nearNetwork = AssetNetworks.NEAR[network]

  const nearClient = new Client()
  nearClient.addProvider(new NearRpcProvider(nearNetwork))
  nearClient.addProvider(new NearJsWalletProvider(nearNetwork, mnemonic))
  nearClient.addProvider(new NearSwapProvider())
  nearClient.addProvider(new NearSwapFindProvider(nearNetwork?.helperUrl))
  nearClient.addProvider(new NearRpcFeeProvider())
  nearClient.assertValidTransaction = function (transaction) {}
  nearClient.chain.getTransactionByHash = async (txHash) => {
    const transaction = await nearClient.getMethod('getTransactionByHash')(txHash)
    return transaction
  }

  return nearClient
}

export const createClient = (asset, network, mnemonic) => {
  const assetData = cryptoassets[asset]

  if (asset === 'BTC') return createBtcClient(network, mnemonic)
  if (asset === 'RBTC' || assetData.network === 'rsk') return createRskClient(asset, network, mnemonic)
  if (asset === 'BNB' || assetData.network === 'bsc') return createBSCClient(asset, network, mnemonic)
  if (asset === 'NEAR' || assetData.network === 'near') return createNearClient(network, mnemonic)

  return createEthClient(asset, network, mnemonic)
}
