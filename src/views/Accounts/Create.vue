<template>
<div class="account-container">
    <NavBar :showMenu="false" :showBack="false">
      <span class="account-title">
        Create Account
      </span>
    </NavBar>
    <div class="wrapper">
    <div class="wrapper_top">
      <div class="options">
        <div class="options-text">
          <span>Select Asset <br/> to Create</span>
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
                  <span class="text-description">
                    {{ selectedAsset.blockchain }}
                  </span>
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
          @click="createAccount"
          :disabled="loading || !selectedAsset"
        >
          <SpinnerIcon class="btn-loading" v-if="loading" />
          <template v-else>Create</template>
        </button>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import { ACCOUNT_TYPE_OPTIONS } from '@/utils/accounts'
import { getAssetIcon } from '@/utils/asset'
import ChevronRightIcon from '@/assets/icons/chevron_right_gray.svg'
import clickAway from '@/directives/clickAway'

export default {
  directives: {
    clickAway
  },
  components: {
    NavBar,
    ChevronRightIcon
  },
  data () {
    return {
      loading: false,
      selectedAsset: null,
      assetsDropdownOpen: false
    }
  },
  computed: {
    assetList () {
      return ACCOUNT_TYPE_OPTIONS.filter(i => i.name !== this.selectedAsset?.name)
    }
  },
  created () {
    this.selectedAsset = this.assetList[0]
  },
  methods: {
    getAssetIcon,
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
    },
    createAccount () {
      // TODO: implement create account
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  padding-top: 0 !important;

  .options {
    border-top: none;
  }
}
</style>
