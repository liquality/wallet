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
      </ul>
      <div class="options">
        <div class="options-text">
          <span>Select the same asset here</span>
        </div>
        <div class="dropdown" v-click-away="hideAssetList">
          <button class="btn dropdown-toggle" @click="toogleAssetList">
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
          <ul class="dropdown-menu" :class="{ show: assetsDropdownOpen }">
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
  data () {
    return {
      assetsDropdownOpen: false
    }
  },
  methods: {
    getAssetIcon,
    connect () {
      if (this.selectedAsset) {
        this.$emit('on-connect', this.selectedAsset)
      }
    },
    goToOverview () {
      this.$router.replace('/wallet')
    },
    selectAsset (asset) {
      this.$emit('on-select-asset', asset)
      this.hideAssetList()
    },
    toogleAssetList () {
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
.account-container {

    .dropdown-toggle {
      padding-left: 13px !important;
      padding-right: 0 !important;
      font-weight: 300;
      display: flex;
      align-items: center;

      &::after {
        display: none;
      }

      .input-group-text {
        margin-left: 5px;
        flex-direction: column;
        justify-content: center;
      }

      svg {
        margin-left: 4px;
        height: 16px;
         &.open {
            transform: rotate(90deg);
          }
      }
    }

    .dropdown-menu {
      width: 125px !important;
      min-width: 0;
      margin: 0;
      padding-left: 0 !important;
      padding-right: 0 !important;
      overflow: auto;
      border-radius: 0;
      padding-bottom: 0;
      padding-top: 0;
      border: 1px solid #d9dfe5;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);

      .dropdown-item {
        padding-left: 15px !important;
        padding-right: 0 !important;
        font-weight: 300;
        display: flex;
        align-items: center;
        border-bottom: 1px solid $hr-border-color;
        .input-group-text {
          margin-left: 5px;
        }

        &:hover,
        &.active {
          background-color: #f0f7f9;
          color: $color-text-primary;
        }
      }
    }
}
</style>
