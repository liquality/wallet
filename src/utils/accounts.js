import { v4 as uuidv4 } from 'uuid'
import { getAssetIcon } from '@/utils/asset'
import { getDerivationPath } from '@/utils/derivationPath'
import { chains } from '@liquality/cryptoassets'

export const accountCreator = (payload) => {
  const { network, walletId, account } = payload
  const {
    name,
    alias,
    chain,
    index,
    addresses,
    assets,
    balances,
    type,
    color
  } = account

  const enabled = (
    account.enabled !== null && account.enabled !== undefined
  ) ? account.enabled : true

  const _addresses = addresses.map(a => {
    const address = chains[chain].formatAddress(a, network)
    return address.startsWith('0x') ? address.substring(2, address.length) : address
  })

  const derivationPath = account.derivationPath ? account.derivationPath : getDerivationPath(chain, network, index, type)
  const id = uuidv4()
  const createdAt = Date.now()

  return {
    id,
    walletId,
    type,
    name,
    alias,
    chain,
    index,
    derivationPath,
    addresses: _addresses,
    assets,
    balances: balances || {},
    createdAt,
    updatedAt: null,
    color,
    enabled
  }
}

export const accountColors = [
  '#000000',
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
  '#3AB24D',
  '#8247E5'
]

export const chainDefaultColors = {
  bitcoin: '#EAB300',
  ethereum: '#4F67E4',
  rsk: '#3AB24D',
  bsc: '#F7CA4F',
  near: '#000000',
  solana: '#008080',
  polygon: '#8247E5',
  arbitrum: '#28A0EF',
  terra: '#008080'
}

export const getAccountIcon = (chain) => {
  return {
    bitcoin: getAssetIcon('BTC'),
    ethereum: getAssetIcon('eth_account'),
    bsc: getAssetIcon('bnb_account', 'png'),
    rsk: getAssetIcon('rsk_account'),
    near: getAssetIcon('NEAR'),
    solana: getAssetIcon('SOL'),
    polygon: getAssetIcon('polygon_account'),
    arbitrum: getAssetIcon('ARBITRUM'),
    terra: getAssetIcon('TERRA')
  }[chain]
}

export const getChainIcon = (chainId) => {
  return {
    bitcoin: getAssetIcon(`${chainId}_chain`),
    ethereum: getAssetIcon(`${chainId}_chain`),
    bsc: getAssetIcon(`${chainId}_chain`),
    rsk: getAssetIcon(`${chainId}_chain`),
    near: getAssetIcon(`${chainId}_chain`),
    solana: getAssetIcon('SOL'),
    polygon: getAssetIcon(`${chainId}_chain`),
    arbitrum: getAssetIcon('ARBITRUM'),
    terra: getAssetIcon(`${chainId}_chain`)
  }[chainId]
}

export const getNextAccountColor = (chain, index) => {
  const defaultColor = chainDefaultColors[chain]
  const defaultIndex = accountColors.findIndex(c => c === defaultColor)
  if (defaultIndex === -1) {
    return defaultColor
  }
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
