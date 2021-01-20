import { changeActiveWalletId } from './changeActiveWalletId'
import { changeActiveNetwork } from './changeActiveNetwork'
import { changePassword } from './changePassword'
import { checkIfQuoteExpired } from './checkIfQuoteExpired'
import { checkPendingActions } from './checkPendingActions'
import { clientExec } from './clientExec'
import { getLockForAsset } from './getLockForAsset'
import { getUnusedAddresses } from './getUnusedAddresses'
import { newSwap } from './newSwap'
import { performNextAction } from './performNextAction'
import { proxyMutation } from './proxyMutation'
import { requestOriginAccess } from './requestOriginAccess'
import { requestPermission } from './requestPermission'
import { replyOriginAccess } from './replyOriginAccess'
import { replyPermission } from './replyPermission'
import { executeRequest } from './executeRequest'
import { retrySwap } from './retrySwap'
import { sendTransaction } from './sendTransaction'
import { updateTransactionFee } from './updateTransactionFee'
import { setupWallet } from './setupWallet'
import { createWallet } from './createWallet'
import { unlockWallet } from './unlockWallet'
import { lockWallet } from './lockWallet'
import { updateBalances } from './updateBalances'
import { updateFees } from './updateFees'
import { updateFiatRates } from './updateFiatRates'
import { updateMarketData } from './updateMarketData'
import { setEthereumInjectionAsset } from './setEthereumInjectionAsset'
import { enableEthereumInjection } from './enableEthereumInjection'
import { disableEthereumInjection } from './disableEthereumInjection'
import { enableAssets } from './enableAssets'
import { disableAssets } from './disableAssets'
import { addCustomToken } from './addCustomToken'

export {
  changeActiveWalletId,
  changeActiveNetwork,
  changePassword,
  checkIfQuoteExpired,
  checkPendingActions,
  clientExec,
  getLockForAsset,
  getUnusedAddresses,
  newSwap,
  performNextAction,
  proxyMutation,
  requestOriginAccess,
  requestPermission,
  replyOriginAccess,
  replyPermission,
  executeRequest,
  retrySwap,
  sendTransaction,
  updateTransactionFee,
  setupWallet,
  createWallet,
  unlockWallet,
  lockWallet,
  updateBalances,
  updateFees,
  updateFiatRates,
  updateMarketData,
  setEthereumInjectionAsset,
  enableEthereumInjection,
  disableEthereumInjection,
  enableAssets,
  disableAssets,
  addCustomToken
}
