import { Client } from '@liquality/client'

import { BitcoinSwapProvider } from '@liquality/bitcoin-swap-provider'
import { BitcoinJsWalletProvider } from '@liquality/bitcoin-js-wallet-provider'
import { BitcoinEsploraBatchApiProvider } from '@liquality/bitcoin-esplora-batch-api-provider'
import { BitcoinEsploraSwapFindProvider } from '@liquality/bitcoin-esplora-swap-find-provider'
import { BitcoinFeeApiProvider } from '@liquality/bitcoin-fee-api-provider'
import { BitcoinRpcFeeProvider } from '@liquality/bitcoin-rpc-fee-provider'

import { EthereumRpcProvider } from '@liquality/ethereum-rpc-provider'
import { EthereumJsWalletProvider } from '@liquality/ethereum-js-wallet-provider'
import { EthereumSwapProvider } from '@liquality/ethereum-swap-provider'
import { EthereumScraperSwapFindProvider } from '@liquality/ethereum-scraper-swap-find-provider'
import { EthereumGasNowFeeProvider } from '@liquality/ethereum-gas-now-fee-provider'
import { EthereumRpcFeeProvider } from '@liquality/ethereum-rpc-fee-provider'

import { EthereumErc20Provider } from '@liquality/ethereum-erc20-provider'
import { EthereumErc20SwapProvider } from '@liquality/ethereum-erc20-swap-provider'
import { EthereumErc20ScraperSwapFindProvider } from '@liquality/ethereum-erc20-scraper-swap-find-provider'

import { NearSwapProvider } from '@liquality/near-swap-provider'
import { NearJsWalletProvider } from '@liquality/near-js-wallet-provider'
import { NearRpcProvider } from '@liquality/near-rpc-provider'
import { NearSwapFindProvider } from '@liquality/near-swap-find-provider'

import {
  BitcoinLedgerBridgeProvider,
  EthereumLedgerBridgeProvider,
  BitcoinLedgerBridgeApp,
  EthereumLedgerBridgeApp,
  LEDGER_BITCOIN_OPTIONS
} from '@/utils/ledger-bridge-provider'
import { bitcoin } from '@liquality/types'
import { chains } from '@liquality/cryptoassets'

import { isERC20 } from '@/utils/asset'
import { BTC_ADDRESS_TYPE_TO_PREFIX } from '@/utils/address'
import cryptoassets from '@/utils/cryptoassets'
import buildConfig from '../../build.config'
import { AssetNetworks } from '@/store/utils'

const LEDGER_BRIDGE_URL = process.env.VUE_APP_LEDGER_BRIDGE_URL

function createBtcClient (network, mnemonic, walletType, indexPath = 0) {
  const isTestnet = network === 'testnet'
  const bitcoinNetwork = AssetNetworks.BTC[network]
  const esploraApi = buildConfig.exploraApis[network]
  const batchEsploraApi = buildConfig.batchEsploraApis[network]

  const btcClient = new Client()
  btcClient.addProvider(new BitcoinEsploraBatchApiProvider(
    { batchUrl: batchEsploraApi, url: esploraApi, network: bitcoinNetwork, numberOfBlockConfirmation: 2 }
  ))

  if (walletType.includes('bitcoin_ledger')) {
    const option = LEDGER_BITCOIN_OPTIONS.find(o => o.name === walletType)
    const { addressType } = option
    const baseDerivationPath = `${BTC_ADDRESS_TYPE_TO_PREFIX[addressType]}'/${bitcoinNetwork.coinType}'/${indexPath}'`
    const bitcoinLedgerApp = new BitcoinLedgerBridgeApp(network, LEDGER_BRIDGE_URL)
    const ledger = new BitcoinLedgerBridgeProvider(
      {
        network: bitcoinNetwork,
        addressType,
        baseDerivationPath
      },
      bitcoinLedgerApp
    )
    btcClient.addProvider(ledger)
  } else {
    const baseDerivationPath = `${BTC_ADDRESS_TYPE_TO_PREFIX[bitcoin.AddressType.BECH32]}'/${bitcoinNetwork.coinType}'/${indexPath}'`
    btcClient.addProvider(new BitcoinJsWalletProvider(
      { network: bitcoinNetwork, mnemonic, baseDerivationPath }
    ))
  }

  btcClient.addProvider(new BitcoinSwapProvider({ network: bitcoinNetwork }))
  btcClient.addProvider(new BitcoinEsploraSwapFindProvider(esploraApi))
  if (isTestnet) btcClient.addProvider(new BitcoinRpcFeeProvider())
  else btcClient.addProvider(new BitcoinFeeApiProvider('https://liquality.io/swap/mempool/v1/fees/recommended'))

  return btcClient
}

function createEthereumClient (
  asset,
  network,
  ethereumNetwork,
  rpcApi,
  scraperApi,
  feeProvider,
  mnemonic,
  walletType,
  indexPath = 0
) {
  const ethClient = new Client()
  const derivationPath = `m/44'/${ethereumNetwork.coinType}'/${indexPath}'/0/0`
  ethClient.addProvider(new EthereumRpcProvider({ uri: rpcApi }))
  if (walletType === 'ethereum_ledger' || walletType === 'rsk_ledger') {
    const assetData = cryptoassets[asset]
    const { nativeAsset } = chains?.[assetData.chain]
    const ethereumLedgerApp = new EthereumLedgerBridgeApp(network, nativeAsset || 'ETH', LEDGER_BRIDGE_URL)
    const ledger = new EthereumLedgerBridgeProvider(
      {
        network: ethereumNetwork,
        derivationPath
      },
      ethereumLedgerApp
    )
    ethClient.addProvider(ledger)
  } else {
    ethClient.addProvider(new EthereumJsWalletProvider(
      { network: ethereumNetwork, mnemonic, derivationPath }
    ))
  }

  if (isERC20(asset)) {
    const contractAddress = cryptoassets[asset].contractAddress
    ethClient.addProvider(new EthereumErc20Provider(contractAddress))
    ethClient.addProvider(new EthereumErc20SwapProvider())
    if (scraperApi) ethClient.addProvider(new EthereumErc20ScraperSwapFindProvider(scraperApi))
  } else {
    ethClient.addProvider(new EthereumSwapProvider())
    if (scraperApi) ethClient.addProvider(new EthereumScraperSwapFindProvider(scraperApi))
  }
  ethClient.addProvider(feeProvider)

  return ethClient
}

function createEthClient (asset, network, mnemonic, walletType, indexPath = 0) {
  const isTestnet = network === 'testnet'
  const ethereumNetwork = AssetNetworks.ETH[network]
  const infuraApi = isTestnet ? 'https://rinkeby.infura.io/v3/da99ebc8c0964bb8bb757b6f8cc40f1f' : 'https://mainnet.infura.io/v3/da99ebc8c0964bb8bb757b6f8cc40f1f'
  const scraperApi = isTestnet ? 'https://liquality.io/eth-rinkeby-api' : 'https://liquality.io/eth-mainnet-api'
  const feeProvider = isTestnet ? new EthereumRpcFeeProvider() : new EthereumGasNowFeeProvider()

  return createEthereumClient(asset, network, ethereumNetwork, infuraApi, scraperApi, feeProvider, mnemonic, walletType, indexPath)
}

function createNearClient (network, mnemonic, indexPath = 0) {
  const nearNetwork = AssetNetworks.NEAR[network]
  const nearClient = new Client()
  const derivationPath = `m/44'/${nearNetwork.coinType}'/${indexPath}'`
  nearClient.addProvider(new NearRpcProvider(nearNetwork))
  nearClient.addProvider(new NearJsWalletProvider(
    {
      network: nearNetwork,
      mnemonic,
      derivationPath
    }
  ))
  nearClient.addProvider(new NearSwapProvider())
  nearClient.addProvider(new NearSwapFindProvider(nearNetwork?.helperUrl))

  return nearClient
}

function createRskClient (asset, network, mnemonic, walletType, indexPath = 0) {
  const isTestnet = network === 'testnet'
  const rskNetwork = AssetNetworks.RBTC[network]
  const rpcApi = isTestnet ? 'https://public-node.testnet.rsk.co' : 'https://public-node.rsk.co'
  const scraperApi = isTestnet ? 'https://liquality.io/rsk-testnet-api' : 'https://liquality.io/rsk-mainnet-api'
  const feeProvider = new EthereumRpcFeeProvider({ slowMultiplier: 1, averageMultiplier: 1, fastMultiplier: 1.25 })

  return createEthereumClient(asset, network, rskNetwork, rpcApi, scraperApi, feeProvider, mnemonic, walletType, indexPath)
}

function createBSCClient (asset, network, mnemonic, indexPath = 0) {
  const isTestnet = network === 'testnet'
  const bnbNetwork = AssetNetworks.BNB[network]
  const rpcApi = isTestnet ? 'https://data-seed-prebsc-1-s1.binance.org:8545' : 'https://bsc-dataseed.binance.org'
  const scraperApi = isTestnet ? 'https://liquality.io/bsc-testnet-api' : 'https://liquality.io/bsc-mainnet-api'
  const feeProvider = new EthereumRpcFeeProvider({ slowMultiplier: 1, averageMultiplier: 1, fastMultiplier: 1.25 })

  return createEthereumClient(asset, network, bnbNetwork, rpcApi, scraperApi, feeProvider, mnemonic, 'default', indexPath)
}

function createPolygonClient (asset, network, mnemonic, indexPath = 0) {
  const isTestnet = network === 'testnet'
  const polygonNetwork = AssetNetworks.POLYGON[network]
  const rpcApi = isTestnet ? 'https://rpc-mumbai.maticvigil.com/' : 'https://rpc-mainnet.maticvigil.com/'
  const scraperApi = isTestnet ? 'https://liquality.io/polygon-testnet-api' : 'https://liquality.io/polygon-mainnet-api'
  const feeProvider = new EthereumRpcFeeProvider({ slowMultiplier: 1, averageMultiplier: 1, fastMultiplier: 1.25 })

  return createEthereumClient(asset, network, polygonNetwork, rpcApi, scraperApi, feeProvider, mnemonic, 'default', indexPath)
}

export const createClient = (asset, network, mnemonic, walletType, indexPath = 0) => {
  const assetData = cryptoassets[asset]

  if (assetData.chain === 'bitcoin') return createBtcClient(network, mnemonic, walletType, indexPath)
  if (assetData.chain === 'rsk') return createRskClient(asset, network, mnemonic, walletType, indexPath)
  if (assetData.chain === 'bsc') return createBSCClient(asset, network, mnemonic, indexPath)
  if (assetData.chain === 'polygon') return createPolygonClient(asset, network, mnemonic, indexPath)
  if (assetData.chain === 'near') return createNearClient(network, mnemonic, indexPath)

  return createEthClient(asset, network, mnemonic, walletType, indexPath)
}
