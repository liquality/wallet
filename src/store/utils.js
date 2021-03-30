import Vue from 'vue'
import { random, findKey, mapKeys, mapValues } from 'lodash-es'
import axios from 'axios'
import pkg from '../../package.json'
import { getChainFromAsset } from '../utils/asset'
import cryptoassets from '@liquality/cryptoassets'

export const CHAIN_LOCK = {}

export const emitter = new Vue()

const wait = (millis) => new Promise(resolve => setTimeout(() => resolve(), millis))

export { wait }

export const waitForRandom = (min, max) => wait(random(min, max))

export const timestamp = () => Date.now()

export const attemptToLockAsset = (network, walletId, asset) => {
  const chain = getChainFromAsset(asset)
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

export const VERSION_STRING = `Wallet ${pkg.version} (CAL ${pkg.dependencies['@liquality/client'].replace('^', '').replace('~', '')})`

export const newOrder = (agent, data) => {
  return axios({
    url: agent + '/api/swap/order',
    method: 'post',
    data,
    headers: {
      'x-requested-with': VERSION_STRING,
      'x-liquality-user-agent': VERSION_STRING
    }
  }).then(res => res.data)
}

export const updateOrder = (order) => {
  return axios({
    url: order.agent + '/api/swap/order/' + order.id,
    method: 'post',
    data: {
      fromAddress: order.fromAddress,
      toAddress: order.toAddress,
      fromFundHash: order.fromFundHash,
      secretHash: order.secretHash
    },
    headers: {
      'x-requested-with': VERSION_STRING,
      'x-liquality-user-agent': VERSION_STRING
    }
  }).then(res => res.data)
}

export const getMarketData = agent => {
  return axios({
    url: agent + '/api/swap/marketinfo',
    method: 'get',
    headers: {
      'x-requested-with': VERSION_STRING,
      'x-liquality-user-agent': VERSION_STRING
    }
  }).then(res => res.data)
}

const COIN_GECKO_API = 'https://api.coingecko.com/api/v3'

export async function getPrices (baseCurrencies, toCurrency) {
  const coindIds = baseCurrencies.filter(currency => cryptoassets[currency]?.coinGeckoId)
    .map(currency => cryptoassets[currency].coinGeckoId)
  const { data } = await axios.get(`${COIN_GECKO_API}/simple/price?ids=${coindIds.join(',')}&vs_currencies=${toCurrency}`)
  let prices = mapKeys(data, (v, coinGeckoId) => findKey(cryptoassets, asset => asset.coinGeckoId === coinGeckoId))
  prices = mapValues(prices, rates => mapKeys(rates, (v, k) => k.toUpperCase()))
  const symbolPrices = mapValues(prices, rates => rates[toCurrency.toUpperCase()])
  return symbolPrices
}
