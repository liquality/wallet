import { shouldApplyRskLegacyDerivation } from '@/store/utils'

export const checkRSKDerivationPath = async ({ commit, state }, { mnemonic }) => {
  const rskLegacyDerivation = await shouldApplyRskLegacyDerivation(
    state.accounts,
    mnemonic
  )
  console.log('RSK DERIVATION PATH => ', rskLegacyDerivation)
  commit('SET_RSK_LEGACY_DERIVATION_PATH_FLAG', { rskLegacyDerivation })
}
