import Bluebird from 'bluebird'
import { isEthereumChain } from '@/utils/asset'
import { ChainId } from '@liquality/cryptoassets'
import { callToBridge, getXPubVersion } from '@/utils/ledger-bridge-provider'
import { getDerivationPath } from '@/utils/derivationPath'
import {
  RequestNamespace,
  ExecutionMode
} from '@liquality/hw-web-bridge'

export const getUnusedAddresses = async ({ state, commit, getters }, { network, walletId, assets, accountId }) => {
  return Bluebird.map(assets, async asset => {
    const accounts = state.accounts[walletId]?.[network]
    const index = accounts.findIndex(a => a.id === accountId)
    if (index >= 0 && asset) {
      const account = accounts[index]
      let xPub = null
      if (account.type.includes('ledger') && account.chain === ChainId.Bitcoin && !account.xPub) {
        const path = getDerivationPath(account.chain, network, 0, account.type)
        const xpubVersion = getXPubVersion(network)
        xPub = await callToBridge({
          namespace: RequestNamespace.App,
          network,
          chainId: account.chain,
          action: 'getWalletXpub',
          execMode: ExecutionMode.Async,
          payload: [{ path, xpubVersion }]
        })
      }

      const result = await getters.client(
        {
          network,
          walletId,
          asset,
          accountId: account.id
        }
      ).wallet.getUnusedAddress()

      const address = isEthereumChain(asset) ? result.address.replace('0x', '') : result.address // TODO: Should not require removing 0x
      let updatedAddresses = []
      if (account.chain === ChainId.Bitcoin) {
        if (!account.addresses.includes(address)) {
          updatedAddresses = [...account.addresses, address]
        } else {
          updatedAddresses = [...account.addresses]
        }
      } else {
        updatedAddresses = [address]
      }

      const payload = {
        network,
        accountId: account.id,
        walletId,
        asset,
        addresses: updatedAddresses
      }

      if (account.chain === ChainId.Bitcoin && xPub) {
        payload.xPub = xPub
      }

      commit('UPDATE_ACCOUNT_ADDRESSES', payload)

      return address
    }
    return ''
  }, { concurrency: 1 })
}
