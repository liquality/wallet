<template>
  <div class="wrapper">
    <div class="wrapper_top">
      <div class="step-detail">
        <div class="step-number">1</div>
        <div class="step-name">Connect Ledger</div>
        <div class="step-icon">
          <LedgerIcon />
        </div>
      </div>
      <ul class="step-instructions">
        <li>Plug the Ledger into the computer</li>
        <li>Enter pin to unlock it</li>
        <li>
          On the device, navigate to the asset that you want to access
        </li>
        <li v-if="isEthereumChain(selectedAsset.name)">
          To Swap, on your Ledger in the eth App, Go to Settings, then Select 'Allow Contract Data'
        </li>
      </ul>
      <div class="options">
        <div class="options-text">
          <span>Select the same asset here</span>
        </div>
        <div class="dropdown" v-click-away="hideAssetList">
          <button class="btn dropdown-toggle lg" @click="toggleAssetList">
            <div class="form" v-if="selectedAsset">
              <div class="input-group">
                <img
                  :src="getAssetIcon(selectedAsset.name)"
                  class="asset-icon"
                />
                <span class="input-group-text">
                  {{ selectedAsset.label }}
                </span>
              </div>
            </div>
            <ChevronRightIcon :class="{ open: assetsDropdownOpen }" />
          </button>
          <ul class="dropdown-menu lg" :class="{ show: assetsDropdownOpen }">
            <li v-for="asset in assetList" :key="asset.name">
              <a class="dropdown-item" href="#" @click="selectAsset(asset)">
                 <div class="form">
              <div class="input-group">
                <img
                  :src="getAssetIcon(asset.name)"
                  class="asset-icon"
                />
                <span class="input-group-text">
                  {{ asset.label }}
                </span>
              </div>
            </div>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="wrapper_bottom">
      <div class="button-group">
        <button
          class="btn btn-light btn-outline-primary btn-lg"
          @click="goToOverview"
        >
          Cancel
        </button>
        <button
          class="btn btn-primary btn-lg btn-icon"
          @click="connect"
          :disabled="loading || !selectedAsset"
        >
          <SpinnerIcon class="btn-loading" v-if="loading" />
          <template v-else>Connect</template>
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import SpinnerIcon from '@/assets/icons/spinner.svg'
import ChevronRightIcon from '@/assets/icons/chevron_right_gray.svg'
import LedgerIcon from '@/assets/icons/ledger_icon.svg'
import { LEDGER_OPTIONS } from '@/utils/ledger-bridge-provider'
import clickAway from '@/directives/clickAway'
import { isEthereumChain, getAssetIcon } from '@/utils/asset'

export default {
  directives: {
    clickAway
  },
  components: {
    SpinnerIcon,
    LedgerIcon,
    ChevronRightIcon
  },
  props: ['selectedAsset', 'loading'],
  data () {
    return {
      assetsDropdownOpen: false
    }
  },
  methods: {
    getAssetIcon,
    isEthereumChain,
    connect () {
      if (this.selectedAsset) {
        this.$emit('on-connect', { asset: this.selectedAsset })
      }
    },
    goToOverview () {
      this.$router.replace('/wallet')
    },
    selectAsset (asset) {
      this.$emit('on-select-asset', asset)
      this.hideAssetList()
    },
    toggleAssetList () {
      this.assetsDropdownOpen = !this.assetsDropdownOpen
    },
    hideAssetList () {
      this.assetsDropdownOpen = false
    }
  },
  computed: {
    assetList () {
      return LEDGER_OPTIONS.filter(i => i.name !== this.selectedAsset?.name)
    }
  }
}
</script>

<style lang="scss">

</style>
