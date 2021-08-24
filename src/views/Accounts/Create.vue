<template>
<div class="account-container">
    <NavBar :showMenu="false" :showBack="false">
      <span class="account-title">
        Create Account
      </span>
    </NavBar>
    <div class="wrapper">
    <div class="wrapper_top">
        <div class="create-item-row">
          <div class="create-item-row-title">Select the corresponding Blockchain</div>
          <div class="dropdown" v-click-away="hideAssetList">
          <button class="btn custom-dropdown-toggle" @click="toggleAssetList">
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
          <ul class="dropdown-menu custom-dropdown-menu" :class="{ show: assetsDropdownOpen }">
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
import { getAssetIcon } from '@/utils/asset'
import ChevronRightIcon from '@/assets/icons/chevron_right_gray.svg'
import clickAway from '@/directives/clickAway'
import { mapState } from 'vuex'

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
    ...mapState(['networkAssets']),
    assetList () {
      return this.networkAssets
        .filter(a => a !== this.selectedAsset)
        .map()
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
    toggleAssetList () {
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

<style lang="scss">
.wrapper {
  .create-item-row-title {
    display: flex;
  }

  .create-item-row {
    padding: 26px 0px;
    font-style: normal;
      font-weight: bold;
      font-size: 12px;
      line-height: 16px;
      text-transform: uppercase;
      color: #3D4767;
  }
}
</style>
