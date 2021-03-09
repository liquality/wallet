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
            Select the same asset here
          </div>
          <div class="dropdown asset-list"
                v-click-away="hideAssetList">
            <button class="btn dropdown-toggle"
                    @click="toogleAssetList">
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
                <ChevronUpIcon v-if="assetsDropdownOpen" />
                  <ChevronDownIcon v-else />
            </button>
            <ul class="dropdown-menu" :class="{ show: assetsDropdownOpen }">
              <li v-for="asset in assetList" :key="asset.name">
                <a class="dropdown-item"
                  href="#"
                  @click="selectAsset(asset)">
                    <div class="dropdown-item-asset-item">
                      <img
                          :src="getAssetIcon(asset.name)"
                          class="asset-icon"
                        />
                        {{ asset }}
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
import ChevronDownIcon from '@/assets/icons/chevron_down.svg'
import ChevronUpIcon from '@/assets/icons/chevron_up.svg'
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
    ChevronDownIcon,
    ChevronUpIcon
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
      this.selectedAsset = asset
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
      return LEDGER_OPTIONS
    }
  }
}
</script>

<style lang="scss">

.account-container {
  .dropdown-toggle {
    padding-left: 0 !important;
    padding-right: 0 !important;
    font-weight: 300;
    display: flex;
    align-items: center;

    &::after {
      display: none;
    }

    .input-group-text {
      margin-left: 5px;
    }

    svg {
        width: 16px;
        margin-left: 4px;
    }
  }
  }
</style>
