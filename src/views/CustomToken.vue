<template>
  <div class="custom-token">
    <NavBar showMenu="true" showBack="true" backPath="/settings/manage-assets" backLabel="Back">
      <span class="wallet_header"><strong>Add Custom Token</strong></span>
    </NavBar>
    <div class="wrapper form">
      <div class="wrapper_top">
        <div class="form-group">
          <label for="chain">Chain</label>
          <div class="dropdown">
            <button class="btn dropdown-toggle"
                    id="select_chain_dropdown"
                    type="button"
                    @click.stop="chainDropdownOpen = !chainDropdownOpen">
              {{ chain || 'Select chain...' }}
              <ChevronUpIcon v-if="chainDropdownOpen" />
              <ChevronDownIcon v-else />
            </button>
            <ul class="dropdown-menu" :class="{ show: chainDropdownOpen }">
              <li>
                <a class="dropdown-item"
                   id="ethereum_chain"
                   href="#"
                   @click="selectChain('ethereum')"
                   :class="{active: chain === 'ethereum'}">
                  Ethereum (ETH)
                </a>
              </li>
              <li>
                <a class="dropdown-item"
                   id="rsk_chain"
                   href="#"
                   @click="selectChain('rsk')"
                   :class="{active: chain === 'rsk'}">
                  Rootstock (RSK)
                </a>
              </li>
              <li>
                <a class="dropdown-item"
                   id="bsc_chain"
                   href="#"
                   @click="selectChain('bsc')"
                   :class="{active: chain === 'bsc'}">
                  Binance Smart Chain (BSC)
                </a>
              </li>
              <li>
                <a class="dropdown-item"
                   id="polygon_chain"
                   href="#"
                   @click="selectChain('polygon')"
                   :class="{active: chain === 'polygon'}">
                  Polygon (MATIC)
                </a>
              </li>
              <li>
                <a class="dropdown-item"
                   id="arbitrum_chain"
                   href="#"
                   @click="selectChain('arbitrum')"
                   :class="{active: chain === 'arbitrum'}">
                  Arbitrum (ARB)
                </a>
              </li>
              <li>
                <a class="dropdown-item"
                   id="terra_chain"
                   href="#"
                   @click="selectChain('terra')"
                   :class="{active: chain === 'terra'}">
                  Terra (LUNA)
                </a>
              </li>
            </ul>
          </div>
        </div>
        <fieldset :disabled="!chain">
          <div class="form-group">
            <label for="contractAddress">Token Contract Address</label>
            <input type="text" @change="contractAddressChange" @paste="contractAddressPaste" class="form-control form-control-sm" id="contractAddress" placeholder="Address" autocomplete="off" required>
          </div>
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" v-model="name" class="form-control form-control-sm" id="name" placeholder="Name" autocomplete="off" required :disabled="autofilled">
          </div>
          <div class="form-group">
            <label for="tokenSymbol">Token Symbol</label>
            <input type="text" v-model="symbol" class="form-control form-control-sm" id="tokenSymbol" placeholder="ABC" autocomplete="off" required :disabled="autofilled && !isSymbolEditable">
            <small v-if="symbol && symbolError" id="token_with_this_symbol_exits" class="text-danger form-text text-right">{{ symbolError }}</small>
          </div>
          <div class="form-group">
            <label for="decimals">Decimals</label>
            <input type="text" v-model="decimals" class="form-control form-control-sm" id="decimals" autocomplete="off" required :disabled="autofilled">
          </div>
        </fieldset>
      </div>
      <div class="wrapper_bottom">
        <div class="button-group">
          <router-link :to="`/settings/manage-assets`"><button id="cancel_add_token_button" class="btn btn-light btn-outline-primary btn-lg">Cancel</button></router-link>
          <button id="add_token_button" class="btn btn-primary btn-lg" @click="addToken" :disabled="!canAdd || existingAsset || isExistingNetworkAsset">Add Token</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { debounce } from 'lodash-es'
import cryptoassets from '@/utils/cryptoassets'
import { tokenDetailProviders } from '@/utils/asset'
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
      chain: null,
      autofilled: false,
      chainDropdownOpen: false,
      isSymbolEditable: false
    }
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId', 'enabledAssets']),
    networkAssets () {
      return this.enabledAssets[this.activeNetwork][this.activeWalletId]
    },
    isExistingNetworkAsset () {
      return Boolean(this.networkAssets.find(_symbol => _symbol === this.symbol))
    },
    symbolError () {
      if ((!this.autofilled && Object.keys(cryptoassets).includes(this.symbol)) || this.isExistingNetworkAsset) {
        return 'Token with this symbol exists.'
      }
      return null
    },
    canAdd () {
      if (!this.symbol || !this.name || !this.chain || !this.contractAddress || !this.decimals) return false
      if (this.symbolError) return false

      return true
    },
    existingAsset () {
      const existingAsset = Object.values(cryptoassets).find(asset =>
        asset.type === 'erc20' && asset.contractAddress.toLowerCase() === this.contractAddress.toLowerCase() && asset.chain === this.chain)
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
          chain: this.chain,
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
    contractAddressPaste (e) {
      this.contractAddress = e.clipboardData.getData('text')
      this.fetchToken()
    },
    contractAddressChange (e) {
      if (this.contractAddress === e.target.value) return
      this.contractAddress = e.target.value
      this.fetchToken()
    },
    resetFields () {
      this.symbol = null
      this.name = null
      this.decimals = null
      this.assetExists = false
      this.autofilled = false
    },
    fetchToken: debounce(async function () {
      this.resetFields()

      let customToken

      if (this.existingAsset) {
        customToken = this.existingAsset
      } else if (this.activeNetwork === 'mainnet' && this.contractAddress) {
        const { symbol, name, decimals } = await tokenDetailProviders[this.chain].getDetails(this.contractAddress)
        customToken = { symbol, name, decimals: parseInt(decimals), chain: this.chain }
      }

      if (customToken) {
        this.symbol = customToken.symbol
        this.name = customToken.name
        this.decimals = customToken.decimals
        this.autofilled = true
        this.isSymbolEditable = Boolean(this.networkAssets.find(_symbol => _symbol === this.symbol))
      }
    }, 500),
    async selectChain (chain) {
      this.chain = chain
      this.chainDropdownOpen = false
      this.resetFields()
      this.fetchToken()
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
