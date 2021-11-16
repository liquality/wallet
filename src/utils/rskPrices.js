import {
  assets as cryptoassets,
  currencyToUnit,
  unitToCurrency
} from '@liquality/cryptoassets'
import SovrynSwapNetworkABI from '@blobfishkate/sovryncontracts/abi/abiSovrynSwapNetwork.json'
import { ethers } from 'ethers'

import buildConfig from '@/build.config'

const cachedProvider = {}

export const fetchRskTokenPrices = async (
  baseCurrencies,
  toCurrency,
  network
) => {
  try {
    const sovrynConfig = buildConfig.swapProviders[network].sovryn

    let provider = null
    if (cachedProvider[network]) {
      provider = cachedProvider[network]
    } else {
      provider = new ethers.providers.StaticJsonRpcProvider(sovrynConfig.rpcURL)
      cachedProvider[network] = provider
    }

    const sovrynContract = new ethers.Contract(
      sovrynConfig.routerAddress.toLowerCase(),
      SovrynSwapNetworkABI,
      provider
    )

    let _toCurrency = cryptoassets.DOC.contractAddress
    if (toCurrency !== 'usd') {
      _toCurrency = cryptoassets[toCurrency].contractAddress
    }

    if (_toCurrency) {
      const coins = baseCurrencies.filter(currency => {
        return (
          cryptoassets[currency].chain === 'rsk' &&
          !cryptoassets[currency].coinGeckoId &&
          cryptoassets[currency].contractAddress
        )
      })

      const symbolPrices = {}
      for (const c of coins) {
        const asset = cryptoassets[c]
        const path = await sovrynContract.conversionPath(
          asset.contractAddress,
          _toCurrency
        )
        const one = currencyToUnit(asset, 1).toFixed()
        const rate = await sovrynContract.rateByPath(path, one)
        const fixedRate = unitToCurrency(asset, rate.toString())
        symbolPrices[asset.code] = Number(fixedRate.toFixed())
      }

      return symbolPrices
    } else {
      console.warn(`Cannot fetch RSK prices against ${toCurrency}`)
    }
  } catch (err) {
    console.error(`Could not fetch RSK prices: ${err}`)
  }
}
