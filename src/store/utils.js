import Vue from 'vue'
import { random, findKey, mapKeys, mapValues } from 'lodash-es'
import axios from 'axios'
import { assets as cryptoassets } from '@liquality/cryptoassets'
import { Client } from '@liquality/client'
import { EthereumRpcProvider } from '@liquality/ethereum-rpc-provider'
import { EthereumJsWalletProvider } from '@liquality/ethereum-js-wallet-provider'
import { EthereumErc20Provider } from '@liquality/ethereum-erc20-provider'
import { ChainNetworks } from '@/utils/networks'

export const CHAIN_LOCK = {}

export const emitter = new Vue()

const wait = (millis) => new Promise(resolve => setTimeout(() => resolve(), millis))

export { wait }

export const waitForRandom = (min, max) => wait(random(min, max))

export const timestamp = () => Date.now()

export const attemptToLockAsset = (network, walletId, asset) => {
  const chain = cryptoassets[asset].chain
  const key = [network, walletId, chain].join('-')

  if (CHAIN_LOCK[key]) {
    return {
      key,
      success: false
    }
  }

  CHAIN_LOCK[key] = true

  return {
    key,
    success: true
  }
}

export const unlockAsset = key => {
  CHAIN_LOCK[key] = false

  emitter.$emit(`unlock:${key}`)
}

const COIN_GECKO_API = 'https://api.coingecko.com/api/v3'

const getRskERC20Assets = () => {
  const erc20 = Object.keys(cryptoassets)
    .filter(asset => cryptoassets[asset].chain === 'rsk' && cryptoassets[asset].type === 'erc20')

  return erc20.map(erc => cryptoassets[erc])
}

export const shouldApplyRskLegacyDerivation = async (accounts, mnemonic, indexPath = 0) => {
  const rskERC20Assets = getRskERC20Assets()
  const walletIds = Object.keys(accounts)

  const addresses = []

  walletIds.forEach((wallet) => {
    const walletAccounts = accounts[wallet].mainnet

    walletAccounts.forEach(account => {
      if (account.chain === 'rsk') {
        addresses.push(...account.addresses)
      }
    })
  })

  const client = new Client()
    .addProvider(
      new EthereumRpcProvider({ uri: process.env.VUE_APP_SOVRYN_RPC_URL_MAINNET })
    )

  if (mnemonic) {
    client.addProvider(
      new EthereumJsWalletProvider({
        network: ChainNetworks.rsk.mainnet,
        mnemonic,
        derivationPath: `m/44'/137'/${indexPath}'/0/0`
      }))

    const _addresses = await client.wallet.getAddresses()

    addresses.push(..._addresses.map(e => e.address))
  }

  const erc20BalancesPromises = rskERC20Assets.map(asset => {
    const client = new Client()
      .addProvider(new EthereumRpcProvider({ uri: 'https://public-node.rsk.co' }))
      .addProvider(new EthereumErc20Provider(asset.contractAddress))

    return client.chain.getBalance(addresses)
  })

  const balances = await Promise.all([
    client.chain.getBalance(addresses),
    ...erc20BalancesPromises
  ])

  return balances.some(amount => amount.isGreaterThan(0))
}

export async function getPrices (baseCurrencies, toCurrency) {
  const coindIds = baseCurrencies.filter(currency => cryptoassets[currency]?.coinGeckoId)
    .map(currency => cryptoassets[currency].coinGeckoId)
  const { data } = await axios.get(`${COIN_GECKO_API}/simple/price?ids=${coindIds.join(',')}&vs_currencies=${toCurrency}`)
  let prices = mapKeys(data, (v, coinGeckoId) => findKey(cryptoassets, asset => asset.coinGeckoId === coinGeckoId))
  prices = mapValues(prices, rates => mapKeys(rates, (v, k) => k.toUpperCase()))

  for (const baseCurrency of baseCurrencies) {
    if (!prices[baseCurrency] && cryptoassets[baseCurrency]?.matchingAsset) {
      prices[baseCurrency] = prices[cryptoassets[baseCurrency]?.matchingAsset]
    }
  }
  const symbolPrices = mapValues(prices, rates => rates[toCurrency.toUpperCase()])
  return symbolPrices
}
