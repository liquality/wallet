import { v4 as uuidv4 } from 'uuid'

export const accountCreator = (payload) => {
  const { walletId, account } = payload
  const {
    name,
    chain,
    index,
    addresses,
    assets,
    balances,
    type
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
    updatedAt: null
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
  '#48D870'
]

export const chainDefaultColors = {
  BTC: '#EAB300',
  ETH: '#4F67E4',
  RBTC: '#3AB34D',
  BNB: '#F7CA4F'
}

export const getNextAccountColor = (chain, count) => {

}

export const ACCOUNT_TYPE_OPTIONS = [
  {
    name: 'ETH',
    label: 'ETH',
    type: 'ethereum_imported',
    chain: 'ETH',
    blockchain: 'Ethereum Blockchain'
  },
  {
    name: 'BTC',
    label: 'BTC',
    type: 'bitcoin_imported',
    chain: 'BTC',
    blockchain: 'Bitcoin Blockchain'
  }
]
