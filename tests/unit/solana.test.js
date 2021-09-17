import { Client } from '@liquality/client'
import { ChainNetworks } from '@/utils/networks'
import { SolanaNetworks } from '@liquality/solana-networks'
import { SolanaRpcProvider } from '@liquality/solana-rpc-provider'
import { SolanaWalletProvider } from '@liquality/solana-wallet-provider'
import { SolanaSwapProvider } from '@liquality/solana-swap-provider'
import { SolanaSwapFindProvider } from '@liquality/solana-swap-find-provider'

test('Solana Network TesnetConfig', () => {
  expect(SolanaNetworks.solana_testnet).toEqual({
    name: 'devnet',
    nodeUrl: 'http://liquality.devnet.rpcpool.com/',
    helperUrl: 'https://explorer-api.devnet.solana.com/',
    coinType: '501',
    isTestnet: true,
    walletIndex: 0,
    programId: '4B9k2YntFxQC93MezXZB3AKLsLrEaqDdXEaPmgTTF5WX'
  })
})

test('Solana Network Mainnet', () => {
  expect(SolanaNetworks.solana_mainnet).toEqual({
    name: 'mainnet',
    nodeUrl: 'https://api.mainnet-beta.solana.com',
    helperUrl: 'https://explorer.solana.com/',
    coinType: '501',
    isTestnet: false,
    walletIndex: 0,
    programId: '!!! TODO: REPLACE AFTER DEPLOY ON THE MAINNET !!!'
  })
})

test('Create Client for testnet and attach Solana RpcProvider successfully', async () => {
  const client = new Client()

  client.addProvider(new SolanaRpcProvider(SolanaNetworks.solana_testnet))

  expect(client._providers.length).toEqual(1)

  const blockHeight = await client.getMethod('getBlockHeight')()

  expect(blockHeight).toBeGreaterThan(100)
})

test('Create Client for mainnet and attach Solana RpcProvider successfully', () => {
  const client = new Client()

  client.addProvider(new SolanaRpcProvider(SolanaNetworks.solana_mainnet))

  expect(client._providers.length).toEqual(1)
})

test('Create Client for testnet and attach Solana Wallet Provider successfully', () => {
  const solanaNetwork = ChainNetworks.solana.testnet
  const client = new Client()
  const derivationPath = `m/44'/501'/${solanaNetwork.walletIndex}'/0'`

  client.addProvider(new SolanaWalletProvider(
    {
      network: solanaNetwork,
      mnemonic: 'under visa else sweet voice result asset notable invite interest young abuse',
      derivationPath
    }
  ))

  expect(client._providers.length).toEqual(1)
})

test('Create Client for Mainnet and attach Solana Wallet Provider successfully', () => {
  const solanaNetwork = ChainNetworks.solana.mainnet
  const client = new Client()
  const derivationPath = `m/44'/501'/${solanaNetwork.walletIndex}'/0'`

  client.addProvider(new SolanaWalletProvider(
    {
      network: solanaNetwork,
      mnemonic: 'under visa else sweet voice result asset notable invite interest young abuse',
      derivationPath
    }
  ))

  expect(client._providers.length).toEqual(1)
})

test('Create Client for testnet and attach Solana Swap Provider successfully', () => {
  const client = new Client()

  client.addProvider(new SolanaSwapFindProvider(SolanaNetworks.solana_testnet))

  expect(client._providers.length).toEqual(1)
})

test('Create Client for mainnet and attach Solana Swap Provider successfully', () => {
  const client = new Client()

  client.addProvider(new SolanaSwapFindProvider(SolanaNetworks.solana_mainnet))

  expect(client._providers.length).toEqual(1)
})

test('Create Client for testnet and attach Solana Swap Find Provider successfully', () => {
  const client = new Client()

  client.addProvider(new SolanaSwapProvider(SolanaNetworks.solana_testnet))

  expect(client._providers.length).toEqual(1)
})

test('Create Client for mainnet and attach Solana Swap Find Provider successfully', () => {
  const client = new Client()

  client.addProvider(new SolanaSwapProvider(SolanaNetworks.solana_mainnet))

  expect(client._providers.length).toEqual(1)
})

test('Create Client for testnet and attach All Providers successfully', () => {
  const client = new Client()

  const solanaNetwork = ChainNetworks.solana.testnet
  const derivationPath = `m/44'/501'/${solanaNetwork.walletIndex}'/0'`

  client.addProvider(new SolanaRpcProvider(SolanaNetworks.solana_testnet))
  client.addProvider(new SolanaWalletProvider(
    {
      network: solanaNetwork,
      mnemonic: 'under visa else sweet voice result asset notable invite interest young abuse',
      derivationPath
    }
  ))
  client.addProvider(new SolanaSwapProvider(SolanaNetworks.solana_testnet))
  client.addProvider(new SolanaSwapFindProvider(SolanaNetworks.solana_testnet))

  expect(client._providers.length).toEqual(4)
})

test('Create Client for mainnet and attach All Providers successfully', () => {
  const client = new Client()

  const solanaNetwork = ChainNetworks.solana.mainnet
  const derivationPath = `m/44'/501'/${solanaNetwork.walletIndex}'/0'`

  client.addProvider(new SolanaRpcProvider(SolanaNetworks.solana_mainnet))
  client.addProvider(new SolanaWalletProvider(
    {
      network: solanaNetwork,
      mnemonic: 'under visa else sweet voice result asset notable invite interest young abuse',
      derivationPath
    }
  ))
  client.addProvider(new SolanaSwapProvider(SolanaNetworks.solana_mainnet))
  client.addProvider(new SolanaSwapFindProvider(SolanaNetworks.solana_mainnet))

  expect(client._providers.length).toEqual(4)
})

test('Should throw error "Duplicate provider" if we try to attach twice same provider', () => {
  const client = new Client()

  client.addProvider(new SolanaRpcProvider(SolanaNetworks.solana_mainnet))

  expect(() => client.addProvider(new SolanaRpcProvider(SolanaNetworks.solana_mainnet)))
    .toThrow('Duplicate provider')
})

describe('Test RPC Provider Calls', () => {
  const client = new Client()

  client.addProvider(new SolanaRpcProvider(SolanaNetworks.solana_testnet))

  test('getBlockHeight', async () => {
    const blockHeight = await client.getMethod('getBlockHeight')()

    expect(blockHeight).toBeGreaterThan(100)
  })

  test('getBalance', async () => {
    const balance = await client.getMethod('getBalance')(['9U5t5Nn3BAdasm8j3sQ273TsM7YZvUAjYcD16qhhNi5P'])

    expect(balance.toNumber()).toBeGreaterThan(0)
  })
})
