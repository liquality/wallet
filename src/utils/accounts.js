import { v4 as uuidv4 } from 'uuid'
import { getAssetIcon } from '@/utils/asset'

export const accountCreator = (payload) => {
  const { walletId, account } = payload
  const {
    name,
    chain,
    index,
    addresses,
    assets,
    balances,
    type,
    color
  } = account

  const _addresses = addresses.map(a => {
    if (a.startsWith('0x')) {
      return a.substring(2, a.length)
    }
    return a
  })
  const id = uuidv4()
  const createdAt = Date.now()
  return {
    id,
    walletId,
    type,
    name,
    chain,
    index,
    addresses: _addresses,
    assets,
    balances: balances || {},
    createdAt,
    updatedAt: null,
    color
  }
}

export const accountColors = [
  '#1CE5C3',
  '#007AFF',
  '#4F67E4',
  '#9D4DFA',
  '#D421EB',
  '#FF287D',
  '#FE7F6B',
  '#EAB300',
  '#F7CA4F',
  '#A1E44A',
  '#3AB24D'
]

export const chainDefaultColors = {
  bitcoin: '#EAB300',
  ethereum: '#4F67E4',
  rsk: '#3AB24D',
  bsc: '#F7CA4F'
}

export const getAccountIcon = (chain) => {
  return {
    bitcoin: getAssetIcon('BTC'),
    ethereum: getAssetIcon('eth_account'),
    bsc: getAssetIcon('bnb_account', 'png'),
    rsk: getAssetIcon('rsk_account')
  }[chain]
}

export const getNextAccountColor = (chain, index) => {
  const defaultColor = chainDefaultColors[chain]
  const defaultIndex = accountColors.findIndex(c => c === defaultColor)
  const finalIndex = index + defaultIndex
  if (finalIndex >= accountColors.length) {
    return accountColors[defaultIndex]
  }
  return accountColors[finalIndex]
}

export const ACCOUNT_TYPE_OPTIONS = [
  {
    name: 'ETH',
    label: 'ETH',
    type: 'ethereum_imported',
    chain: 'ethereum',
    blockchain: 'Ethereum Blockchain'
  },
  {
    name: 'BTC',
    label: 'BTC',
    type: 'bitcoin_imported',
    chain: 'bitcoin',
    blockchain: 'Bitcoin Blockchain'
  }
]
