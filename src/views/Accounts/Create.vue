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
            <div class="form" v-if="selectedChain">
              <div class="input-group">
                <img
                  :src="getAssetIcon(selectedChain.nativeAsset)"
                  class="asset-icon"
                />
                <span class="input-group-text">
                  {{ selectedChain.name }}
                </span>
              </div>
            </div>
            <ChevronRightIcon :class="{ open: assetsDropdownOpen }" />
          </button>
          <ul class="dropdown-menu custom-dropdown-menu" :class="{ show: assetsDropdownOpen }">
            <li v-for="chain in chains" :key="chain.code">
              <a class="dropdown-item" href="#" @click="selectChain(chain)">
                 <div class="form">
              <div class="input-group">
                <img
                  :src="getAssetIcon(chain.nativeAsset)"
                  class="asset-icon"
                />
                <span class="input-group-text">
                  {{ chain.name }}
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
          :disabled="loading || !selectedChain"
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
import { mapGetters } from 'vuex'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import { chains } from '@liquality/cryptoassets'

export default {
  directives: {
    clickAway
  },
  components: {
    NavBar,
    ChevronRightIcon,
    SpinnerIcon
  },
  data () {
    return {
      loading: false,
      selectedChain: null,
      assetsDropdownOpen: false
    }
  },
  computed: {
    ...mapGetters(['networkAssets']),
    chains () {
      return Object.values(chains)
        .filter(chain => chain.code !== this.selectedChain?.code)
    }
  },
  created () {
    this.selectedChain = Object.values(chains)[0]
  },
  methods: {
    getAssetIcon,
    goToOverview () {
      this.$router.replace('/wallet')
    },
    selectChain (chain) {
      this.selectedChain = chain
    },
    toggleAssetList () {
      this.assetsDropdownOpen = !this.assetsDropdownOpen
    },
    hideAssetList () {
      this.assetsDropdownOpen = false
    },
    createAccount () {
      // TODO: implement create account
    },
    getNextAccountIndex () {
      //
    }
  }
}
</script>

<style lang="scss" scoped>
.dropdown {
  text-transform: none !important;
  .input-group-text {
    font-weight: 300 !important;
    font-size: 12px !important;
    line-height: 150% !important;
    margin-left: 5px;
  }
}

.custom-dropdown-menu {
  max-width: 100% !important;
  max-height: 250px !important;
}

.wrapper {
  padding-top: 0 !important;
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
