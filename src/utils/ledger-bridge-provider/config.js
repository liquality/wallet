import { ChainId } from '@liquality/cryptoassets'

export const LEDGER_BITCOIN_OPTIONS = [
  {
    name: 'bitcoin_ledger_nagive_segwit',
    label: 'Segwit',
    addressType: 'bech32'
  },
  {
    name: 'bitcoin_ledger_legacy',
    label: 'Legacy',
    addressType: 'legacy'
  }
]

export const LEDGER_OPTIONS = [
  {
    name: 'ETH',
    label: 'ETH',
    types: ['ethereum_ledger'],
    chain: ChainId.Ethereum
  },
  {
    name: 'BTC',
    label: 'BTC',
    types: ['bitcoin_ledger_nagive_segwit', 'bitcoin_ledger_legacy'],
    chain: ChainId.Bitcoin
  },
  {
    name: 'RBTC',
    label: 'RSK',
    types: ['rsk_ledger'],
    chain: ChainId.Rootstock
  }
]
