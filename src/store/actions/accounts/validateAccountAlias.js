export const validateAccountAlias = async (_context, { accountAlias }) => {
  if (
    !accountAlias ||
    accountAlias.length < 5 ||
    (accountAlias.match(/^[^\s]+(\s+[^\s]+)*$/) || []).length <= 0
  ) {
    return 'Name should have 5 or more characters'
  } else if (accountAlias.length > 20) {
    return "Name shouldn't have more than 20 characters"
  } else if (
    this.accounts[this.activeWalletId]?.[this.activeNetwork]?.findIndex(
      (a) =>
        (a.alias && a.alias?.toLowerCase() === accountAlias.toLowerCase()) ||
        (a.index === this.accountIndex && a.chain === this.selectedChain.id)
    ) >= 0
  ) {
    return 'Existing account with the same name or path'
  }

  return null
}
