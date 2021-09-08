/* eslint-disable no-undef */
import { ChainId } from '@liquality/cryptoassets'
import { getDerivationPath } from './derivationPath'

// Bitcoin
test('get bitcoin derivation path for default account type Segwit', () => {
  expect(getDerivationPath(ChainId.Bitcoin, 'mainnet', 0, 'default')).toBe('84\'/0\'/0\'')
})

test('get bitcoin derivation path for ledger account type Segwit', () => {
  expect(getDerivationPath(ChainId.Bitcoin, 'mainnet', 0, 'bitcoin_ledger_nagive_segwit')).toBe('84\'/0\'/0\'')
})

test('get bitcoin derivation path for ledger account type Legacy', () => {
  expect(getDerivationPath(ChainId.Bitcoin, 'mainnet', 0, 'bitcoin_ledger_legacy')).toBe('44\'/0\'/0\'')
})

// Ethereum
test('get ETH derivation path for default accounts on mainnet and testnet', () => {
  const ethPathMainnet = getDerivationPath(ChainId.Ethereum, 'mainnet', 0, 'default')
  const ethPathTestnet = getDerivationPath(ChainId.Ethereum, 'testnet', 0, 'default')
  expect(ethPathMainnet).toBe('m/44\'/60\'/0\'/0/0')
  expect(ethPathMainnet).toEqual(ethPathTestnet)
})

// RSK
test('get RSK derivation path for Ledger accounts on mainnet', () => {
  expect(getDerivationPath(ChainId.Rootstock, 'mainnet', 0, 'rsk_ledger')).toBe('m/44\'/137\'/0\'/0/0')
})

test('get RSK derivation path for Ledger accounts on testnet', () => {
  expect(getDerivationPath(ChainId.Rootstock, 'testnet', 0, 'rsk_ledger')).toBe('m/44\'/37310\'/0\'/0/0')
})

test('get RSK derivation path for default accounts on mainnet', () => {
  const ethPath = getDerivationPath(ChainId.Ethereum, 'mainnet', 0, 'default')
  expect(getDerivationPath(ChainId.Rootstock, 'mainnet', 0, 'default')).toBe('m/44\'/60\'/0\'/0/0')
  expect(ethPath).toEqual(ethPath)
})

test('get RSK derivation path for default accounts on testnet', () => {
  const ethPath = getDerivationPath(ChainId.Ethereum, 'testnet', 0, 'default')
  expect(getDerivationPath(ChainId.Rootstock, 'testnet', 0, 'default')).toBe('m/44\'/60\'/0\'/0/0')
  expect(ethPath).toEqual(ethPath)
})
