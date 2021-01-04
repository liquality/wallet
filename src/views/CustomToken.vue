<template>
  <div class="custom-token">
    <NavBar showMenu="true" showBack="true" backPath="/settings/manage-assets" backLabel="Back">
      <span class="wallet_header"><strong>Add Custom Token</strong></span>
    </NavBar>
    <div class="wrapper form">
      <div class="wrapper_top">
        <div class="form-group">
          <label for="contractAddress">Token Contract Address</label>
          <input type="text" v-model="contractAddress" @change="contractAddressChange" class="form-control form-control-sm" id="contractAddress" placeholder="Address" autocomplete="off" required>
        </div>
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" v-model="name" class="form-control form-control-sm" id="name" placeholder="Name" autocomplete="off" required :disabled="autofilled">
        </div>
        <div class="form-group">
          <label for="tokenSymbol">Token Symbol</label>
          <input type="text" v-model="symbol" class="form-control form-control-sm" id="tokenSymbol" placeholder="ABC" autocomplete="off" required :disabled="autofilled">
          <small v-if="symbol && symbolError" class="text-danger form-text text-right">{{ symbolError }}</small>
        </div>
        <div class="form-group">
          <label for="decimals">Decimals</label>
          <input type="text" v-model="decimals" class="form-control form-control-sm" id="decimals" autocomplete="off" required :disabled="autofilled">
        </div>
        <div class="form-group">
          <label for="network">Network</label>
          <div class="dropdown">
            <button class="btn dropdown-toggle"
                    type="button"
                    @click.stop="networkDropdownOpen = !networkDropdownOpen">
              {{ network }}
              <ChevronUpIcon v-if="networkDropdownOpen" />
              <ChevronDownIcon v-else />
            </button>
            <ul class="dropdown-menu" :class="{ show: networkDropdownOpen }">
              <li>
                <a class="dropdown-item"
                   href="#"
                   @click="setActiveNetwork('ethereum')"
                   :class="{active: network === 'ethereum'}">
                   Ethereum
                </a>
              </li>
              <li>
                <a class="dropdown-item"
                   href="#"
                   @click="setActiveNetwork('rsk')"
                   :class="{active: network === 'rsk'}">
                   RSK
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="wrapper_bottom">
        <div class="button-group">
          <router-link :to="`/settings/manage-assets`"><button class="btn btn-light btn-outline-primary btn-lg">Cancel</button></router-link>
          <button class="btn btn-primary btn-lg" @click="addToken" :disabled="!canAdd">Add Token</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { mapState, mapActions } from 'vuex'
import cryptoassets from '@/utils/cryptoassets'
import NavBar from '@/components/NavBar.vue'
import ChevronDownIcon from '@/assets/icons/chevron_down.svg'
import ChevronUpIcon from '@/assets/icons/chevron_up.svg'

export default {
  components: {
    NavBar,
    ChevronDownIcon,
    ChevronUpIcon
  },
  data () {
    return {
      contractAddress: '',
      name: null,
      symbol: null,
      decimals: null,
      network: 'ethereum',
      autofilled: false,
      networkDropdownOpen: false
    }
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId']),
    symbolError () {
      if (!this.autofilled && Object.keys(cryptoassets).includes(this.symbol)) {
        return 'Token with this symbol exists.'
      }
      return null
    },
    canAdd () {
      if (!this.symbol || !this.name || !this.network || !this.contractAddress || !this.decimals) return false
      if (this.symbolError) return false

      return true
    },
    existingAsset () {
      const existingAsset = Object.values(cryptoassets).find(asset =>
        asset.type === 'erc20' && asset.contractAddress.toLowerCase() === this.contractAddress.toLowerCase())
      return existingAsset ? { ...existingAsset, symbol: existingAsset.code } : null
    }
  },
  methods: {
    ...mapActions(['enableAssets', 'addCustomToken']),
    async addToken () {
      if (!this.existingAsset) { // Add only if it does not already exist
        await this.addCustomToken({
          network: this.activeNetwork,
          walletId: this.activeWalletId,
          erc20Network: this.network,
          contractAddress: this.contractAddress,
          name: this.name,
          symbol: this.symbol,
          decimals: this.decimals
        })
      }
      await this.enableAssets({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        assets: [this.symbol]
      })
      this.$router.replace('/settings/manage-assets')
    },
    async contractAddressChange () {
      this.symbol = null
      this.name = null
      this.decimals = null
      this.assetExists = false
      this.autofilled = false

      let customToken

      if (this.existingAsset) {
        customToken = this.existingAsset
      } else if (this.activeNetwork === 'mainnet') {
        try {
          const result = await axios.get(`https://api.ethplorer.io/getTokenInfo/${this.contractAddress}?apiKey=freekey`)
          const { symbol, name, decimals } = result.data
          customToken = { symbol, name, decimals: parseInt(decimals), network: 'ethereum' }
        } catch (e) {}
      }

      if (customToken) {
        this.symbol = customToken.symbol
        this.name = customToken.name
        this.network = customToken.network
        this.decimals = customToken.decimals
        this.autofilled = true
      }
    },
    setActiveNetwork (network) {
      this.network = network
      this.networkDropdownOpen = false
    }
  }
}
</script>

<style lang="scss">
.custom-token {
  display: flex;
  flex-direction: column;
  min-height: 0;

  .form-group {
    margin-bottom: 30px;
  }

  .dropdown {
      .dropdown-menu {
      min-width: 2rem;
      border: 1px solid #D9DFE5;
      border-radius: 0;
      padding: 0;
      margin: 0;
    }
    .dropdown-item {
      height: 30px;
      display: flex;
      align-items: center;
      padding-left: 10px;
      padding-right: 10px;
      &:not(:last-child) {
        border-bottom: 1px solid $hr-border-color;
      }

      &:hover, &.active {
        background-color: #F0F7F9;
        color: $color-text-primary;
      }
    }
  }

  .dropdown-toggle {
    text-transform: capitalize;
    padding-left: 0 !important;
    font-weight: 300;
    display: flex;
    align-items: center;

    &::after {
      display: none;
    }

   svg {
      width: 8px;
      height: 4px;
      margin-left: 2px;
    }
}
}
</style>
