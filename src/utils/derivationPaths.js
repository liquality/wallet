import { LEDGER_BITCOIN_OPTIONS } from '@/utils/ledger'
import { BTC_ADDRESS_TYPE_TO_PREFIX } from '@/utils/address'
import { ChainNetworks } from '@/store/utils'
import { bitcoin } from '@liquality/types'

const bitcoinDerivationPath = (walletType, indexPath, network) => {
  const bitcoinNetwork = ChainNetworks.bitcoin[network]

  if (walletType) {
    const option = LEDGER_BITCOIN_OPTIONS.find(o => o.name === walletType)
    const { addressType } = option
    return `${BTC_ADDRESS_TYPE_TO_PREFIX[addressType]}'/${bitcoinNetwork.coinType}'/${indexPath}'`
  }

  return `${BTC_ADDRESS_TYPE_TO_PREFIX[bitcoin.AddressType.BECH32]}'/${bitcoinNetwork.coinType}'/${indexPath}'`
}

const ethereumDerivationPath = (indexPath, ethereumNetwork) => {
  return `m/44'/${ethereumNetwork.coinType}'/${indexPath}'/0/0`
}

export const DEFAULT_DERIVATION_PATHS = {
  bitcoin: {
    default: (index, network) => bitcoinDerivationPath(null, index, network),
    bitcoin_ledger_nagive_segwit: (index, network) => bitcoinDerivationPath('bitcoin_ledger_nagive_segwit', index, network),
    bitcoin_ledger_legacy: (index, network) => bitcoinDerivationPath('bitcoin_ledger_legacy', index, network)
  },
  ethereum: {
    default: (index, network) => {
      const ethereumNetwork = ChainNetworks.ethereum[network]
      ethereumDerivationPath(index, ethereumNetwork)
    },
    ethereum_ledger: (index, network) => {
      const ethereumNetwork = ChainNetworks.ethereum[network]
      ethereumDerivationPath(index, ethereumNetwork)
    }
  },
  rsk: {
    default: (index, network, userRSKPath = false) => {
      const ethereumNetwork = userRSKPath ? ChainNetworks.ethereum[network] : ChainNetworks.rsk[network]
      ethereumDerivationPath(index, ethereumNetwork)
    },
    rsk_ledger: (index, network, userRSKPath = false) => {
      const ethereumNetwork = userRSKPath ? ChainNetworks.ethereum[network] : ChainNetworks.rsk[network]
      ethereumDerivationPath(index, ethereumNetwork)
    }
  },
  bsc: {
    default: (index, network) => {
      const bscNetwork = ChainNetworks.bsc[network]
      ethereumDerivationPath(index, bscNetwork)
    }
  },
  polygon: {
    default: (index, network) => {
      const polygonNetwork = ChainNetworks.polygon[network]
      ethereumDerivationPath(index, polygonNetwork)
    }
  },
  arbitrum: {
    default: (index, network) => {
      const arbitrumNetwork = ChainNetworks.arbitrum[network]
      ethereumDerivationPath(index, arbitrumNetwork)
    }
  }
}
