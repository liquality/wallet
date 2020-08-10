import Vue from 'vue'
import { random } from 'lodash-es'
import axios from 'axios'
import { getChainFromAsset } from '../utils/asset'

export const CHAIN_LOCK = {}

export const emitter = new Vue()

export const waitForRandom = (min, max) => new Promise(resolve => setTimeout(() => resolve(), random(min, max)))

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

export const updateOrder = (agent, id, data) => {
  return axios({
    url: agent + '/api/swap/order/' + id,
    method: 'post',
    data,
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
