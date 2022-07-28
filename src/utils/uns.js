import { ChainId } from '@liquality/cryptoassets'
const { default: Resolution } = require('@unstoppabledomains/resolution')

const resolutionService = 'https://unstoppabledomains.g.alchemy.com/domains/'
const tldAPI = 'https://resolve.unstoppabledomains.com/supported_tlds'
const alchemyKey = 'bKmEKAC4HJUEDNlnoYITvXYuhrIshFsa'
const reg = RegExp('^[.a-z0-9-]+$')
const resolution = new Resolution()
const tldKey = 'supported_tlds'

export function getUNSKey(chainId) {
  const unsKey = chainToUNSKey(chainId)
  return 'crypto.' + unsKey + '.address'
}

function chainToUNSKey(chainId) {
  switch (chainId) {
    case ChainId.Bitcoin:
      return 'BTC'
    case ChainId.Avalanche:
      return 'AVAX'
    case ChainId.BinanceSmartChain:
      return 'BNB'
    case ChainId.BitcoinCash:
      return 'BCH'
    case ChainId.Fuse:
      return 'FUSE'
    case ChainId.Near:
      return 'NEAR'
    case ChainId.Polygon:
      return 'MATIC'
    case ChainId.Solana:
      return 'SOL'
    case ChainId.Terra:
      return 'LUNA'
    case ChainId.Rootstock:
      return 'RSK'
    case ChainId.Ethereum:
    case ChainId.Arbitrum:
      return 'ETH'
  }
}

export async function isValidUNSAddress(address) {
  try {
    const domain = preparedDomain(address)
    if (await isValidTLD(domain)) {
      const response = await fetch(resolutionService + domain, {
        method: 'get',
        headers: new Headers({
          Authorization: 'Bearer ' + alchemyKey
        })
      })
      const data = await response.json()
      if (data.records) {
        return data.records
      }
    }
    return null
  } catch (e) {
    return null
  }
}

async function isValidTLD(domain) {
  let supportedTlds = localStorage.getItem(tldKey)
  if (!supportedTlds) {
    const response = await fetch(tldAPI)
    const data = await response.json()
    supportedTlds = data['tlds']
    if (supportedTlds) {
      localStorage.setItem(tldKey, JSON.stringify(supportedTlds))
    }
  } else {
    supportedTlds = JSON.parse(supportedTlds)
  }
  return supportedTlds.find((tld) => domain.endsWith(tld))
}

function preparedDomain(domain) {
  const retVal = domain ? domain.trim().toLowerCase() : ''
  if (!reg.test(retVal)) {
    throw 'Invalid domain name'
  }
  return retVal
}

export async function reverseUNS(address) {
  try {
    const domain = await resolution.reverse(address)
    return domain
  } catch (e) {
    return null
  }
}
