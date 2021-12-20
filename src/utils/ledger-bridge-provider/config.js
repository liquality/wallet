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
    name: 'BTC',
    label: 'BTC',
    types: [
      'bitcoin_ledger_nagive_segwit',
      'bitcoin_ledger_legacy'
    ],
    chain: 'bitcoin'
  },
  {
    name: 'ETH',
    label: 'ETH',
    types: ['ethereum_ledger'],
    chain: 'ethereum'
  },
  {
    name: 'RBTC',
    label: 'RSK',
    types: ['rsk_ledger'],
    chain: 'rsk'
  }
]
