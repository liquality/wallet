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
          <div class="create-item-row-title">Select Network</div>
          <div class="dropdown" v-click-away="hideAssetList">
            <button class="btn custom-dropdown-toggle" @click="toggleAssetList">
              <div class="form" v-if="selectedChain">
                <div class="input-group">
                  <img
                    :src="getChainIcon(selectedChain.id)"
                    class="asset-icon"
                  />
                  <span class="input-group-text">
                    {{ selectedChain.name }}
                  </span>
                </div>
              </div>
              <ChevronRightIcon :class="{ open: assetsDropdownOpen }" />
            </button>
            <ul
              class="dropdown-menu custom-dropdown-menu"
              :class="{ show: assetsDropdownOpen }"
            >
              <li v-for="chain in chains" :key="chain.code">
                <a class="dropdown-item" href="#" @click="selectChain(chain)">
                  <div class="form">
                    <div class="input-group">
                      <img
                        :src="getChainIcon(chain.id)"
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
        <div class="create-item-row">
          <div class="create-item-row-title">Choose Account Name</div>
          <div class="form">
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text account-name">
                  {{ accountName }}
                </span>
              </div>
              <input
                type="text"
                autocomplete="off"
                class="form-control form-control-sm"
                v-model="accountAlias"
                placeholder="Choose name"
                id="choose-account-name"
                required
                :class="{ 'is-invalid': accountAliasError }"
              />
            </div>
            <small class="text-danger form-text text-right" v-if="accountAliasError">
                {{ accountAliasError }}
              </small>
          </div>
        </div>
        <div class="create-item-row">
          <div class="create-item-row-title">Choose the Color</div>
          <div class="form">
            <div class="input-group">
              <input
                type="color"
                id="choose-color"
                v-model="accountColor"
                placeholder="Choose color"
                required
              />
            </div>
          </div>
        </div>
      </div>
      <div class="wrapper_bottom">
        <div class="button-group">
          <button
            class="btn btn-light btn-outline-primary btn-lg"
            id="cancel-button"
            @click="cancel"
          >
            Cancel
          </button>
          <button
            class="btn btn-primary btn-lg btn-icon"
            id="create-account-button"
            @click="createNewAccount"
            :disabled="loading || !inputsValidated"
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
import ChevronRightIcon from '@/assets/icons/chevron_right_gray.svg'
import clickAway from '@/directives/clickAway'
import { mapActions, mapGetters, mapState } from 'vuex'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import { chains } from '@liquality/cryptoassets'
import buildConfig from '@/build.config'
import { getChainIcon, getNextAccountColor } from '@/utils/accounts'
import cryptoassets from '@/utils/cryptoassets'
import _ from 'lodash'

export default {
  directives: {
    clickAway
  },
  components: {
    NavBar,
    ChevronRightIcon,
    SpinnerIcon
  },
  props: {
    chainId: String
  },
  data () {
    return {
      loading: false,
      selectedChain: null,
      assetsDropdownOpen: false,
      accountAlias: '',
      accountColor: '',
      accountAliasError: null,
      accountIndex: 0
    }
  },
  computed: {
    ...mapState([
      'accounts',
      'activeWalletId',
      'activeNetwork',
      'enabledAssets'
    ]),
    ...mapGetters(['networkAssets']),
    chains () {
      return buildConfig.chains
        .map((chainId) => {
          const { name, code, nativeAsset } = chains[chainId]
          return {
            id: chainId,
            name,
            code,
            nativeAsset
          }
        })
        .filter((chain) => chain.id !== this.selectedChain?.id)
    },
    accountName () {
      return `${this.selectedChain?.name} ${this.accountIndex + 1}`
    },
    inputsValidated () {
      return this.selectedChain &&
          !this.accountAliasError &&
          this.accountColor &&
          this.accountColor.length > 5
    }
  },
  created () {
    let chain
    if (this.chainId) {
      chain = this.chains.find((c) => c.id === this.chainId)
    }
    this.selectedChain = chain || Object.values(chains)[0]
    this.accountIndex = this.getAccountIndex()
    this.accountColor = getNextAccountColor(
      this.selectedChain.id,
      this.accountIndex - 1
    )

    this.debouncedCheckAccountAlias = _.debounce(this.checkAccountAlias, 500)
    this.checkAccountAlias()
  },
  methods: {
    ...mapActions([
      'createAccount'
    ]),
    getChainIcon,
    cancel () {
      this.$router.replace({ name: 'ManageAccounts' })
    },
    selectChain (chain) {
      this.selectedChain = chain
      this.accountIndex = this.getAccountIndex()
      this.checkAccountAlias()
    },
    toggleAssetList () {
      this.assetsDropdownOpen = !this.assetsDropdownOpen
    },
    hideAssetList () {
      this.assetsDropdownOpen = false
    },
    getAccountIndex () {
      const _accounts =
        this.accounts[this.activeWalletId]?.[this.activeNetwork]?.filter(
          (a) => a.chain === this.selectedChain?.id
        ) || []

      if (_accounts.length <= 0) {
        return 0
      }

      const lastAccount = _accounts.sort((a, b) => {
        if (a.index > b.index) {
          return -1
        }

        return 0
      })[0]

      return lastAccount.index + 1
    },
    async createNewAccount () {
      this.loading = true
      const assetKeys =
        this.enabledAssets[this.activeNetwork]?.[this.activeWalletId] || []

      const assets = assetKeys.filter((asset) => {
        return cryptoassets[asset].chain === this.selectedChain.id
      })
      const account = {
        name: this.accountName,
        alias: this.accountAlias,
        chain: this.selectedChain.id,
        addresses: [],
        assets,
        index: this.accountIndex,
        type: 'default',
        enabled: true,
        color: this.accountColor
      }

      await this.createAccount({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        account
      })

      this.loading = false

      this.cancel()
    },
    checkAccountAlias () {
      if (!this.accountAlias ||
          this.accountAlias.length < 5 ||
          (this.accountAlias.match(/^[^\s]+(\s+[^\s]+)*$/) || []).length <= 0) {
        this.accountAliasError = 'Name should have 5 or more characters'
      } else if (this.accountAlias.length > 20) {
        this.accountAliasError = 'Name shouldn\'t have more than 20 characters'
      } else if (this.accounts[this.activeWalletId]?.[this.activeNetwork]?.findIndex(
        a => (a.alias && a.alias?.toLowerCase() === this.accountAlias.toLowerCase()) ||
        (a.index === this.accountIndex && a.chain === this.selectedChain.id)
      ) >= 0) {
        this.accountAliasError = 'Existing account with the same name or path'
      } else {
        this.accountAliasError = null
      }
    }
  },
  watch: {
    accountAlias (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.debouncedCheckAccountAlias()
      }
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
  min-width: 11rem;

  .dropdown-item {
    padding: 0.3rem 1em;
  }
}

.wrapper {
  padding-top: 0 !important;

  .wrapper_top {
    position: absolute;
    width: 100%;
    left: 0;
  }

  .create-item-row {
    padding: 26px 20px;
    border-bottom: 1px solid $hr-border-color;

    input[type=color] {
      height: 40px;
      border: none;
      border-radius: 20px;
      max-width: 40px !important;
      cursor: pointer;

    }

    input[type=color]::-webkit-color-swatch {
      border: none;
      border-radius: 50%;
      padding: 0;
    }

    input[type=color]::-webkit-color-swatch-wrapper {
        border: none;
        border-radius: 50%;
        padding: 0;
    }

    .create-item-row-title,
    .account-name {
      font-style: normal;
      font-weight: bold;
      font-size: 12px;
      line-height: 16px;
      color: #3d4767;
      display: flex;
    }

    .create-item-row-title {
      text-transform: uppercase;
    }
    .account-name {
      margin-right: 8px;
    }
  }
}
</style>
