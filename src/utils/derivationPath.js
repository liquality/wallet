import { ChainId } from '@liquality/cryptoassets'
import { ChainNetworks } from '@/utils/networks'
import { BTC_ADDRESS_TYPE_TO_PREFIX } from '@/utils/address'
import { bitcoin } from '@liquality/types'
import { LEDGER_BITCOIN_OPTIONS } from '@/utils/ledger-bridge-provider'

const getBitcoinDerivationPath = (walletType, coinType, index) => {
  if (walletType.includes('bitcoin_ledger')) {
    const option = LEDGER_BITCOIN_OPTIONS.find(o => o.name === walletType)
    const { addressType } = option
    return `${BTC_ADDRESS_TYPE_TO_PREFIX[addressType]}'/${coinType}'/${index}'`
  } else {
    return `${BTC_ADDRESS_TYPE_TO_PREFIX[bitcoin.AddressType.BECH32]}'/${coinType}'/${index}'`
  }
}

const getEthereumBasedDerivationPath = (coinType, index) => `m/44'/${coinType}'/${index}'/0/0`

const derivationPaths = {
  [ChainId.Bitcoin]: (network, index, walletType = 'default') => {
    const bitcoinNetwork = ChainNetworks[ChainId.Bitcoin][network]
    return getBitcoinDerivationPath(walletType, bitcoinNetwork.coinType, index)
  },
  [ChainId.Ethereum]: (network, index) => {
    const ethNetwork = ChainNetworks[ChainId.Ethereum][network]
    return getEthereumBasedDerivationPath(ethNetwork.coinType, index)
  },
  [ChainId.Rootstock]: (network, index, walletType = 'default') => {
    let coinType
    if (walletType === 'rsk_ledger') {
      coinType = network === 'mainnet' ? '137' : '37310'
    } else {
      const ethNetwork = ChainNetworks[ChainId.Rootstock][network]
      coinType = ethNetwork.coinType
    }

    return getEthereumBasedDerivationPath(coinType, index)
  },
  [ChainId.BinanceSmartChain]: (network, index) => {
    const ethNetwork = ChainNetworks[ChainId.BinanceSmartChain][network]
    return getEthereumBasedDerivationPath(ethNetwork.coinType, index)
  },
  [ChainId.Near]: (network, index) => {
    const ethNetwork = ChainNetworks[ChainId.Near][network]
    return getEthereumBasedDerivationPath(ethNetwork.coinType, index)
  },
  [ChainId.Polygon]: (network, index) => {
    const ethNetwork = ChainNetworks[ChainId.Polygon][network]
    return getEthereumBasedDerivationPath(ethNetwork.coinType, index)
  },
  [ChainId.Rootstock]: (network, index) => {
    const ethNetwork = ChainNetworks[ChainId.Rootstock][network]
    return getEthereumBasedDerivationPath(ethNetwork.coinType, index)
  },
  [ChainId.Arbitrum]: (network, index) => {
    const ethNetwork = ChainNetworks[ChainId.Arbitrum][network]
    return getEthereumBasedDerivationPath(ethNetwork.coinType, index)
  },
  [ChainId.Solana]: (network, index) => {
    const solanaNetwork = ChainNetworks[ChainId.Solana][network]
    return `m/44'/501'/${solanaNetwork.walletIndex}'/${index}'`
  }
}

export const getDerivationPath = (chainId, network, index, walletType) => {
  return derivationPaths[chainId](network, index, walletType)
}
