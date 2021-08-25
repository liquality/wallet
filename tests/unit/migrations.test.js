/* eslint-env jest */
import { processMigrations } from '@/store/migrations'
import buildConfig from '../../src/build.config'

test('Migrates to v2', async () => {
  expect(await processMigrations({ network: 'mainnet', activeWalletId: '123-123-123' })).toEqual({
    version: 2,
    network: 'mainnet',
    activeWalletId: '123-123-123',
    assets: {
      mainnet: {
        '123-123-123': buildConfig.defaultAssets.mainnet
      },
      testnet: {
        '123-123-123': buildConfig.defaultAssets.testnet
      }
    }
  })
})
