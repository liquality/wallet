import buildConfig from '../../build.config'
import { Networks } from '../utils'

export const updateEnabledAssets = async ({ state, dispatch, getters }) => {
  const { defaultAssets } = buildConfig
  const { enabledAssets, activeWalletId } = state
  for (const network of Networks) {
    const assetsToEnable = defaultAssets[network].filter(a => !enabledAssets[network][activeWalletId].includes(a))
    if (assetsToEnable && assetsToEnable.length > 0) {
      await dispatch('enableAssets', { network, walletId: activeWalletId, assets: assetsToEnable })
    }
  }
}
