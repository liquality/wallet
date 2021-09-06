import { getDerivationPath } from '@/utils/derivationPath'
import { Networks } from '@/utils/networks'
import { accountCreator, getNextAccountColor } from '@/utils/accounts'
import { ChainId, chains } from '@liquality/cryptoassets'

export const accountSetDerivationPath = {
  version: 14,
  migrate: async (state) => {
    const hasAccounts = Object.keys(state.accounts || {}).length > 0

    if (!hasAccounts) {
      return {
        ...state
      }
    }

    const _accounts = {}

    for (const walletId in state.accounts) {
      _accounts[walletId] = {}

      for (const network of Networks) {
        const accounts = state.accounts[walletId][network]
        const updatedAccounts = []
        for (const account of accounts) {
          const derivationPath = getDerivationPath(
            account.chain,
            network,
            account.index,
            account.type
          )
          const updatedAccount = {
            ...account,
            alias: '',
            addresses: [],
            balances: {},
            derivationPath
          }
          updatedAccounts.push(updatedAccount)

          if (account.chain === ChainId.Rootstock && !account.type.includes('ledger')) {
            // get the legacy rsk derivation path
            const coinType = network === 'mainnet' ? '137' : '37310'
            const chain = chains[ChainId.Rootstock]
            const _account = accountCreator({
              walletId,
              network,
              account: {
                name: `Legacy ${chain.name} 1`,
                alias: '',
                chain: ChainId.Rootstock,
                addresses: [],
                assets: [...account.assets],
                balances: {},
                type: 'default',
                index: 0,
                derivationPath: `m/44'/${coinType}'/0'/0/0`,
                color: getNextAccountColor(ChainId.Rootstock, 1)
              }
            })
            updatedAccounts.push(_account)
          }
        }
        _accounts[walletId][network] = updatedAccounts
      }
    }

    delete state.rskLegacyDerivation

    return {
      ...state,
      accounts: _accounts
    }
  }
}
