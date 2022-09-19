<template>
  <div class="wrapper">
    <div class="wrapper_top">
      <div class="step-detail">
        <div class="step-number">1</div>
        <div class="step-name">{{ $t('pages.accounts.connectLedger') }}</div>
        <div class="step-icon">
          <LedgerIcon />
        </div>
      </div>
      <ul class="step-instructions">
        <li>{{ $t('pages.accounts.ledgerInstructions1') }}</li>
        <li>{{ $t('pages.accounts.ledgerInstructions2') }}</li>
        <li>{{ $t('pages.accounts.ledgerInstructions3') }}</li>
        <li v-if="isChainEvmCompatible(selectedAsset.name)">
          {{ $t('pages.accounts.ledgerInstructions4') }}
        </li>
      </ul>
      <div class="options">
        <div class="options-text">
          <span>{{ $t('pages.accounts.selectAsset') }}</span>
        </div>
        <div class="dropdown" v-click-away="hideAssetList">
          <button class="btn dropdown-toggle lg" @click="toggleAssetList">
            <div class="form" v-if="selectedAsset">
              <div class="input-group">
                <img :src="getAssetIcon(selectedAsset.name)" class="asset-icon" />
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
                    <img :src="getAssetIcon(asset.name)" class="asset-icon" />
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
          id="cancel-ledger-button"
          @click="cancel"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          id="connect-ledger-button"
          class="btn btn-primary btn-lg btn-icon"
          @click="connect"
          :disabled="loading || !selectedAsset"
        >
          <SpinnerIcon class="btn-loading" v-if="loading" />
          <template v-else>{{ $t('common.connect') }}</template>
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import SpinnerIcon from '@/assets/icons/spinner.svg'
import ChevronRightIcon from '@/assets/icons/chevron_right_gray.svg'
import LedgerIcon from '@/assets/icons/ledger_icon.svg'
import { LEDGER_OPTIONS } from '@liquality/wallet-core/dist/src/utils/ledger'
import clickAway from '@/directives/clickAway'
import { isChainEvmCompatible } from '@liquality/wallet-core/dist/src/utils/asset'
import { getAssetIcon } from '@/utils/asset'

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
  data() {
    return {
      assetsDropdownOpen: false
    }
  },
  methods: {
    getAssetIcon,
    isChainEvmCompatible,
    connect() {
      if (this.selectedAsset) {
        this.$emit('on-connect', { asset: this.selectedAsset })
      }
    },
    cancel() {
      chrome.tabs.getCurrent((tab) => {
        if (tab !== undefined) {
          chrome.tabs.remove([tab.id])
        }
      })
    },
    selectAsset(asset) {
      this.$emit('on-select-asset', asset)
      this.hideAssetList()
    },
    toggleAssetList() {
      this.assetsDropdownOpen = !this.assetsDropdownOpen
    },
    hideAssetList() {
      this.assetsDropdownOpen = false
    }
  },
  computed: {
    assetList() {
      return LEDGER_OPTIONS.filter((i) => i.name !== this.selectedAsset?.name)
    }
  }
}
</script>

<style lang="scss"></style>
