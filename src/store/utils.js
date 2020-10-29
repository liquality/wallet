import Vue from 'vue'
import { random } from 'lodash-es'
import axios from 'axios'
import { getChainFromAsset } from '../utils/asset'

export const CHAIN_LOCK = {}

export const emitter = new Vue()

const wait = (millis) => new Promise(resolve => setTimeout(() => resolve(), millis))

export { wait }

export const waitForRandom = (min, max) => wait(random(min, max))

export const timestamp = () => Math.ceil(Date.now() / 1000)

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

export const newOrder = (agent, data) => {
  return axios({
    url: agent + '/api/swap/order',
    method: 'post',
    data,
    headers: {
      'x-requested-with': 'wallet',
      'x-liquality-user-agent': 'wallet'
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
      'x-requested-with': 'wallet',
      'x-liquality-user-agent': 'wallet'
    }
  }).then(res => res.data)
}

export const getMarketData = agent => {
  return axios({
    url: agent + '/api/swap/marketinfo',
    method: 'get',
    headers: {
      'x-requested-with': 'wallet',
      'x-liquality-user-agent': 'wallet'
    }
  }).then(res => res.data)
}

const COIN_GECKO_CACHE = {}
const COIN_GECKO_API = 'https://api.coingecko.com/api/v3'

async function getCoins () {
  if ('coins' in COIN_GECKO_CACHE) {
    return COIN_GECKO_CACHE.coins
  }

  const response = await axios.get(`${COIN_GECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250`)
  const coins = response.data
  COIN_GECKO_CACHE.coins = coins
  return coins
}

export async function getPrices (baseCurrencies, toCurrency) {
  const coins = await getCoins()
  const coindIds = baseCurrencies.reduce((list, currency) => {
    const coin = coins.find(coin => coin.symbol === currency.toLowerCase())
    return coin ? [...list, coin.id] : list
  }, [])
  const response = await axios.get(`${COIN_GECKO_API}/simple/price?ids=${coindIds.join(',')}&vs_currencies=${toCurrency}`)
  const prices = response.data
  const symbolPrices = Object.entries(prices).reduce((curr, [id, toPrices]) => {
    const currencySymbol = coins.find(coin => coin.id === id).symbol
    return Object.assign(curr, { [currencySymbol.toUpperCase()]: toPrices[toCurrency] })
  }, {})
  return symbolPrices
}
