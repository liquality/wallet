import { changeActiveWalletId } from './changeActiveWalletId'
import { changeActiveNetwork } from './changeActiveNetwork'
import { changePassword } from './changePassword'
import { checkIfQuoteExpired } from './checkIfQuoteExpired'
import { checkPendingSwaps } from './checkPendingSwaps'
import { clientExec } from './clientExec'
import { getLockForAsset } from './getLockForAsset'
import { getUnusedAddresses } from './getUnusedAddresses'
import { injectedProvider } from './injectedProvider'
import { newSwap } from './newSwap'
import { performNextAction } from './performNextAction'
import { proxyMutation } from './proxyMutation'
import { replyOriginAccess } from './replyOriginAccess'
import { replyPremission } from './replyPremission'
import { requestOriginAccess } from './requestOriginAccess'
import { retrySwap } from './retrySwap'
import { sendTransaction } from './sendTransaction'
import { updateTransactionFee } from './updateTransactionFee'
import { setupWallet } from './setupWallet'
import { createWallet } from './createWallet'
import { unlockWallet } from './unlockWallet'
import { lockWallet } from './lockWallet'
import { updateBalances } from './updateBalances'
import { updateFees } from './updateFees'
import { updateMarketData } from './updateMarketData'

export {
  changeActiveWalletId,
  changeActiveNetwork,
  changePassword,
  checkIfQuoteExpired,
  checkPendingSwaps,
  clientExec,
  getLockForAsset,
  getUnusedAddresses,
  injectedProvider,
  newSwap,
  performNextAction,
  proxyMutation,
  replyOriginAccess,
  replyPremission,
  requestOriginAccess,
  retrySwap,
  sendTransaction,
  updateTransactionFee,
  setupWallet,
  createWallet,
  unlockWallet,
  lockWallet,
  updateBalances,
  updateFees,
  updateMarketData
}
