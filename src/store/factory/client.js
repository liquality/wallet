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

import { SolanaRpcProvider } from '@liquality/solana-rpc-provider'
import { SolanaWalletProvider } from '@liquality/solana-wallet-provider'
import { SolanaSwapProvider } from '@liquality/solana-swap-provider'
import { SolanaSwapFindProvider } from '@liquality/solana-swap-find-provider'

import { TerraSwapProvider } from '@liquality/terra-swap-provider'
import { TerraWalletProvider } from '@liquality/terra-wallet-provider'
import { TerraRpcProvider } from '@liquality/terra-rpc-provider'
import { TerraSwapFindProvider } from '@liquality/terra-swap-find-provider'

import {
  BitcoinLedgerBridgeProvider,
  EthereumLedgerBridgeProvider,
  BitcoinLedgerBridgeApp,
  EthereumLedgerBridgeApp,
  LEDGER_BITCOIN_OPTIONS
} from '@/utils/ledger-bridge-provider'
import { ChainId } from '@liquality/cryptoassets'

import { isERC20 } from '@/utils/asset'
import cryptoassets from '@/utils/cryptoassets'
import buildConfig from '../../build.config'
import { ChainNetworks } from '@/utils/networks'

function createBtcClient (network, mnemonic, accountType, derivationPath) {
  const isTestnet = network === 'testnet'
  const bitcoinNetwork = ChainNetworks.bitcoin[network]
  const esploraApi = buildConfig.exploraApis[network]
  const batchEsploraApi = buildConfig.batchEsploraApis[network]

  const btcClient = new Client()
  btcClient.addProvider(new BitcoinEsploraBatchApiProvider(
    { batchUrl: batchEsploraApi, url: esploraApi, network: bitcoinNetwork, numberOfBlockConfirmation: 2 }
  ))

  if (accountType.includes('bitcoin_ledger')) {
    const option = LEDGER_BITCOIN_OPTIONS.find(o => o.name === accountType)
    const { addressType } = option
    const bitcoinLedgerApp = new BitcoinLedgerBridgeApp(network, ChainId.Bitcoin)
    const ledger = new BitcoinLedgerBridgeProvider(
      {
        network: bitcoinNetwork,
        addressType,
        baseDerivationPath: derivationPath
      },
      bitcoinLedgerApp
    )
    btcClient.addProvider(ledger)
  } else {
    btcClient.addProvider(new BitcoinJsWalletProvider(
      { network: bitcoinNetwork, mnemonic, baseDerivationPath: derivationPath }
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
  accountType,
  derivationPath
) {
  const ethClient = new Client()
  ethClient.addProvider(new EthereumRpcProvider({ uri: rpcApi }))

  if (accountType === 'ethereum_ledger' || accountType === 'rsk_ledger') {
    const assetData = cryptoassets[asset]
    const ethereumLedgerApp = new EthereumLedgerBridgeApp(network, assetData.chain || ChainId.Ethereum)
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

function createEthClient (asset, network, mnemonic, accountType, derivationPath) {
  const isTestnet = network === 'testnet'
  const ethereumNetwork = ChainNetworks.ethereum[network]
  const infuraApi = isTestnet ? `https://ropsten.infura.io/v3/${buildConfig.infuraApiKey}` : `https://mainnet.infura.io/v3/${buildConfig.infuraApiKey}`
  const scraperApi = isTestnet ? 'https://liquality.io/eth-ropsten-api' : 'https://liquality.io/eth-mainnet-api'
  const feeProvider = isTestnet ? new EthereumRpcFeeProvider() : new EthereumGasNowFeeProvider('https://gasoracle.liquality.io')

  return createEthereumClient(asset, network, ethereumNetwork, infuraApi, scraperApi, feeProvider, mnemonic, accountType, derivationPath)
}

function createNearClient (network, mnemonic, derivationPath) {
  const nearNetwork = ChainNetworks.near[network]
  const nearClient = new Client()
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

function createSolanaClient (network, mnemonic, derivationPath) {
  const solanaNetwork = ChainNetworks.solana[network]
  const solanaClient = new Client()
  solanaClient.addProvider(new SolanaRpcProvider(solanaNetwork))
  solanaClient.addProvider(new SolanaWalletProvider(
    {
      network: solanaNetwork,
      mnemonic,
      derivationPath
    }
  ))
  solanaClient.addProvider(new SolanaSwapProvider(solanaNetwork))
  solanaClient.addProvider(new SolanaSwapFindProvider(solanaNetwork))

  return solanaClient
}

function createRskClient (asset, network, mnemonic, accountType, derivationPath) {
  const isTestnet = network === 'testnet'
  const rskNetwork = ChainNetworks.rsk[network]
  const rpcApi = isTestnet ? process.env.VUE_APP_SOVRYN_RPC_URL_TESTNET : process.env.VUE_APP_SOVRYN_RPC_URL_MAINNET
  const scraperApi = isTestnet ? 'https://liquality.io/rsk-testnet-api' : 'https://liquality.io/rsk-mainnet-api'
  const feeProvider = new EthereumRpcFeeProvider({ slowMultiplier: 1, averageMultiplier: 1, fastMultiplier: 1.25 })

  return createEthereumClient(asset, network, rskNetwork, rpcApi, scraperApi, feeProvider, mnemonic, accountType, derivationPath)
}

function createBSCClient (asset, network, mnemonic, derivationPath) {
  const isTestnet = network === 'testnet'
  const bnbNetwork = ChainNetworks.bsc[network]
  const rpcApi = isTestnet ? 'https://data-seed-prebsc-1-s1.binance.org:8545' : 'https://bsc-dataseed.binance.org'
  const scraperApi = isTestnet ? 'https://liquality.io/bsc-testnet-api' : 'https://liquality.io/bsc-mainnet-api'
  const feeProvider = new EthereumRpcFeeProvider({ slowMultiplier: 1, averageMultiplier: 2, fastMultiplier: 2.2 })

  return createEthereumClient(asset, network, bnbNetwork, rpcApi, scraperApi, feeProvider, mnemonic, 'default', derivationPath)
}

function createPolygonClient (asset, network, mnemonic, derivationPath) {
  const isTestnet = network === 'testnet'
  const polygonNetwork = ChainNetworks.polygon[network]
  const rpcApi = isTestnet ? 'https://rpc-mumbai.maticvigil.com' : 'https://polygon-rpc.com'
  const scraperApi = isTestnet ? 'https://liquality.io/polygon-testnet-api' : 'https://liquality.io/polygon-mainnet-api'
  const feeProvider = new EthereumRpcFeeProvider({ slowMultiplier: 1, averageMultiplier: 2, fastMultiplier: 2.2 })

  return createEthereumClient(asset, network, polygonNetwork, rpcApi, scraperApi, feeProvider, mnemonic, 'default', derivationPath)
}

function createArbitrumClient (asset, network, mnemonic, derivationPath) {
  const isTestnet = network === 'testnet'
  const arbitrumNetwork = ChainNetworks.arbitrum[network]
  const rpcApi = isTestnet ? 'https://rinkeby.arbitrum.io/rpc' : `https://arbitrum-mainnet.infura.io/v3/${buildConfig.infuraApiKey}`
  const scraperApi = isTestnet ? 'https://liquality.io/arbitrum-testnet-api' : 'https://liquality.io/arbitrum-mainnet-api'
  const feeProvider = new EthereumRpcFeeProvider({ slowMultiplier: 1, averageMultiplier: 1, fastMultiplier: 1.25 })

  return createEthereumClient(asset, network, arbitrumNetwork, rpcApi, scraperApi, feeProvider, mnemonic, 'default', derivationPath)
}

function createTerraClient (network, mnemonic, baseDerivationPath, asset) {
  let _asset, feeAsset, tokenAddress

  const terraNetwork = ChainNetworks.terra[network]

  switch (asset) {
    case 'LUNA': {
      _asset = 'uluna'
      feeAsset = 'uluna'
      break
    } case 'UST': {
      _asset = 'uusd'
      feeAsset = 'uusd'
      break
    } default: {
      _asset = asset
      feeAsset = 'uluna'
      tokenAddress = cryptoassets[asset].contractAddress
      break
    }
  }

  const terraClient = new Client()

  terraClient.addProvider(new TerraRpcProvider(terraNetwork, _asset, feeAsset, tokenAddress))
  terraClient.addProvider(new TerraWalletProvider(
    {
      network: terraNetwork,
      mnemonic,
      baseDerivationPath,
      asset: _asset,
      feeAsset,
      tokenAddress
    }
  ))
  terraClient.addProvider(new TerraSwapProvider(terraNetwork, _asset))
  terraClient.addProvider(new TerraSwapFindProvider(terraNetwork, _asset))

  return terraClient
}

export const createClient = (asset, network, mnemonic, accountType, derivationPath) => {
  const assetData = cryptoassets[asset]

  if (assetData.chain === 'bitcoin') return createBtcClient(network, mnemonic, accountType, derivationPath)
  if (assetData.chain === 'rsk') return createRskClient(asset, network, mnemonic, accountType, derivationPath)
  if (assetData.chain === 'bsc') return createBSCClient(asset, network, mnemonic, derivationPath)
  if (assetData.chain === 'polygon') return createPolygonClient(asset, network, mnemonic, derivationPath)
  if (assetData.chain === 'arbitrum') return createArbitrumClient(asset, network, mnemonic, derivationPath)
  if (assetData.chain === 'near') return createNearClient(network, mnemonic, derivationPath)
  if (assetData?.chain === 'solana') return createSolanaClient(network, mnemonic, derivationPath)
  if (assetData.chain === 'terra') return createTerraClient(network, mnemonic, derivationPath, asset)

  return createEthClient(asset, network, mnemonic, accountType, derivationPath)
}
