import { shouldApplyRskLegacyDerivation } from '../utils'

const rskLegacyDerivationMigration = async (state) => {
  const hasAccounts = Object.keys(state.accounts || {}).length > 0

  if (!hasAccounts) {
    return {
      ...state
    }
  }

  const rskLegacyDerivation = await shouldApplyRskLegacyDerivation(
    state.accounts
  )

  return {
    ...state,
    rskLegacyDerivation
  }
}

export const rskLegacyDerivationPath = {
  // rskLegacyDerivation
  version: 11,
  migrate: rskLegacyDerivationMigration
}

export const rskLegacyDerivationPathFix = {
  // rskLegacyDerivation for fix
  version: 12,
  migrate: rskLegacyDerivationMigration
}
