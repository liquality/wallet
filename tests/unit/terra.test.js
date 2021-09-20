import { Client } from '@liquality/client'
import { ChainNetworks } from '@/utils/networks'
import { TerraNetworks } from '@liquality/terra-networks'
import { TerraRpcProvider } from '@liquality/terra-rpc-provider'
import { TerraWalletProvider } from '@liquality/terra-wallet-provider'
import { TerraSwapProvider } from '@liquality/terra-swap-provider'
import { TerraSwapFindProvider } from '@liquality/terra-swap-find-provider'

test('Terra Network TesnetConfig', () => {
  expect(TerraNetworks.terra_testnet).toEqual({
    name: 'devnet',
    nodeUrl: 'http://liquality.devnet.rpcpool.com/',
    helperUrl: 'https://explorer-api.devnet.solana.com/',
    coinType: '501',
    isTestnet: true,
    walletIndex: 0,
    programId: '4B9k2YntFxQC93MezXZB3AKLsLrEaqDdXEaPmgTTF5WX'
  })
})

test('Terra Network Mainnet', () => {
  expect(TerraNetworks.terra_mainnet).toEqual({
    name: 'mainnet',
    nodeUrl: 'https://api.mainnet-beta.solana.com',
    helperUrl: 'https://explorer.solana.com/',
    coinType: '501',
    isTestnet: false,
    walletIndex: 0,
    programId: '!!! TODO: REPLACE AFTER DEPLOY ON THE MAINNET !!!'
  })
})

test('Create Client for testnet and attach Terra RpcProvider successfully', async () => {
  const client = new Client()

  client.addProvider(new TerraRpcProvider(TerraNetworks.terra_testnet))

  expect(client._providers.length).toEqual(1)

  const blockHeight = await client.getMethod('getBlockHeight')()

  expect(blockHeight).toBeGreaterThan(100)
})

test('Create Client for mainnet and attach Terra RpcProvider successfully', () => {
  const client = new Client()

  client.addProvider(new TerraRpcProvider(TerraNetworks.terra_mainnet))

  expect(client._providers.length).toEqual(1)
})

test('Create Client for testnet and attach Terra Wallet Provider successfully', () => {
  const terraNetwork = ChainNetworks.terra.testnet
  const client = new Client()
  const derivationPath = ''

  client.addProvider(new TerraWalletProvider(
    {
      network: terraNetwork,
      mnemonic: 'under visa else sweet voice result asset notable invite interest young abuse',
      derivationPath
    }
  ))

  expect(client._providers.length).toEqual(1)
})

test('Create Client for Mainnet and attach Terra Wallet Provider successfully', () => {
  const terraNetwork = ChainNetworks.terra.mainnet
  const client = new Client()
  const derivationPath = ''

  client.addProvider(new TerraWalletProvider(
    {
      network: terraNetwork,
      mnemonic: 'under visa else sweet voice result asset notable invite interest young abuse',
      derivationPath
    }
  ))

  expect(client._providers.length).toEqual(1)
})

test('Create Client for testnet and attach Terra Swap Provider successfully', () => {
  const client = new Client()

  client.addProvider(new TerraSwapFindProvider(TerraNetworks.terra_testnet))

  expect(client._providers.length).toEqual(1)
})

test('Create Client for mainnet and attach Terra Swap Provider successfully', () => {
  const client = new Client()

  client.addProvider(new TerraSwapFindProvider(TerraNetworks.terra_mainnet))

  expect(client._providers.length).toEqual(1)
})

test('Create Client for testnet and attach Terra Swap Find Provider successfully', () => {
  const client = new Client()

  client.addProvider(new TerraSwapProvider(TerraNetworks.terra_testnet))

  expect(client._providers.length).toEqual(1)
})

test('Create Client for mainnet and attach Terra Swap Find Provider successfully', () => {
  const client = new Client()

  client.addProvider(new TerraSwapProvider(TerraNetworks.terra_mainnet))

  expect(client._providers.length).toEqual(1)
})

test('Create Client for testnet and attach All Providers successfully', () => {
  const client = new Client()

  const terraNetwork = ChainNetworks.terra.testnet
  const derivationPath = ''

  client.addProvider(new TerraRpcProvider(TerraNetworks.terra_testnet))
  client.addProvider(new TerraWalletProvider(
    {
      network: terraNetwork,
      mnemonic: 'under visa else sweet voice result asset notable invite interest young abuse',
      derivationPath
    }
  ))
  client.addProvider(new TerraSwapProvider(TerraNetworks.terra_testnet))
  client.addProvider(new TerraSwapFindProvider(TerraNetworks.terra_mainnet))

  expect(client._providers.length).toEqual(4)
})

test('Create Client for mainnet and attach All Providers successfully', () => {
  const client = new Client()

  const terraNetwork = ChainNetworks.terra.mainnet
  const derivationPath = ''

  client.addProvider(new TerraRpcProvider(TerraNetworks.terra_mainnet))
  client.addProvider(new TerraWalletProvider(
    {
      network: terraNetwork,
      mnemonic: 'under visa else sweet voice result asset notable invite interest young abuse',
      derivationPath
    }
  ))
  client.addProvider(new TerraSwapProvider(TerraNetworks.terra_mainnet))
  client.addProvider(new TerraSwapFindProvider(TerraNetworks.terra_mainnet))

  expect(client._providers.length).toEqual(4)
})

test('Should throw error "Duplicate provider" if we try to attach twice same provider', () => {
  const client = new Client()

  client.addProvider(new TerraRpcProvider(TerraNetworks.terra_mainnet))

  expect(() => client.addProvider(new TerraRpcProvider(TerraNetworks.terra_mainnet)))
    .toThrow('Duplicate provider')
})

describe('Test RPC Provider Calls', () => {
  const client = new Client()

  client.addProvider(new TerraRpcProvider(TerraNetworks.terra_testnet))

  test('getBlockHeight', async () => {
    const blockHeight = await client.getMethod('getBlockHeight')()

    expect(blockHeight).toBeGreaterThan(100)
  })

  test('getBalance', async () => {
    const balance = await client.getMethod('getBalance')(['terra194rswjxvv0a2fm3f8hr4e4f3443dl3s7frsyhp'])

    expect(balance.toNumber()).toBeGreaterThan(0)
  })
})
