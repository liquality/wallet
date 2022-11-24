<template>
  <div class="custom-token">
    <NavBar
      :showMenu="true"
      :showBack="true"
      backPath="/settings/manage-assets"
      :backLabel="$t('common.back')"
    >
      <span class="wallet_header">
        <strong>
          {{ $t('pages.customToken.addCustomToken') }}
        </strong>
      </span>
    </NavBar>
    <div class="wrapper form">
      <div class="wrapper_top">
        <div class="form-group">
          <label for="chain">{{ $t('common.chain') }}</label>
          <div class="dropdown">
            <button
              class="btn dropdown-toggle"
              id="select_chain_dropdown"
              type="button"
              @click.stop="chainDropdownOpen = !chainDropdownOpen"
            >
              {{ chain || $t('pages.customToken.selectChain') }}
              <ChevronUpIcon v-if="chainDropdownOpen" />
              <ChevronDownIcon v-else />
            </button>
            <ul class="dropdown-menu" :class="{ show: chainDropdownOpen }">
              <li v-for="chain in chainsWithFetchingTokenDetails" :key="chain.chainId">
                <a
                  class="dropdown-item"
                  :id="`${chain.chainId}_chain`"
                  href="#"
                  @click="selectChain(chain.chainId)"
                  :class="{ active: chain === chain.chainId }"
                >
                  {{ chain.label }}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <fieldset :disabled="!chain">
          <div class="form-group">
            <label for="contractAddress">
              {{ $t('pages.customToken.tokenContractAddress') }}
            </label>
            <input
              type="text"
              @change="contractAddressChange"
              @paste="contractAddressPaste"
              class="form-control form-control-sm"
              id="contractAddress"
              :placeholder="$t('common.address')"
              autocomplete="off"
              required
            />
            <small
              v-if="contractAddress && existingAsset && !addingToken"
              id="token_with_this_symbol_exits"
              class="text-danger form-text text-right"
              >{{ $t('pages.customToken.tokenExists') }}</small
            >
          </div>
          <div class="form-group">
            <label for="name">{{ $t('pages.customToken.name') }}</label>
            <input
              type="text"
              v-model="name"
              class="form-control form-control-sm"
              id="name"
              :placeholder="$t('pages.customToken.name')"
              autocomplete="off"
              required
              :disabled="autofilled"
            />
          </div>
          <div class="form-group">
            <label for="tokenSymbol">{{ $t('pages.customToken.tokenSymbol') }}</label>
            <input
              type="text"
              v-model="symbol"
              class="form-control form-control-sm"
              id="tokenSymbol"
              placeholder="ABC"
              autocomplete="off"
              required
              :disabled="autofilled && !isSymbolEditable"
            />
            <small
              v-if="symbol && symbolError && !addingToken"
              id="token_with_this_symbol_exits"
              class="text-danger form-text text-right"
              >{{ symbolError }}</small
            >
          </div>
          <div class="form-group">
            <label for="decimals">{{ $t('pages.customToken.decimals') }}</label>
            <input
              type="number"
              v-model.trim="decimals"
              @keypress="isNumber($event)"
              class="form-control form-control-sm"
              :maxlength="2"
              id="decimals"
              autocomplete="off"
              required
            />
          </div>
        </fieldset>
      </div>
      <div class="wrapper_bottom">
        <div class="button-group">
          <router-link :to="`/settings/manage-assets`"
            ><button id="cancel_add_token_button" class="btn btn-light btn-outline-primary btn-lg">
              {{ $t('common.cancel') }}
            </button></router-link
          >
          <button
            id="add_token_button"
            class="btn btn-primary btn-lg"
            @click="addToken"
            :disabled="!canAdd || existingAsset || isExistingNetworkAsset"
          >
            {{ $t('pages.customToken.addToken') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { debounce } from 'lodash-es'
import cryptoassets from '@liquality/wallet-core/dist/src/utils/cryptoassets'
import { CHAINS_WITH_FETCH_TOKEN_DETAILS } from '@liquality/wallet-core/dist/src/utils/fetchTokenDetails'
import NavBar from '@/components/NavBar.vue'
import ChevronDownIcon from '@/assets/icons/chevron_down.svg'
import ChevronUpIcon from '@/assets/icons/chevron_up.svg'
import { DuplicateTokenSymbolError } from '@liquality/error-parser/dist/src/LiqualityErrors/DuplicateTokenSymbolError'
import { errorToLiqualityErrorString } from '@liquality/error-parser/dist/src/utils'
import { reportLiqualityError } from '@liquality/error-parser'

export default {
  components: {
    NavBar,
    ChevronDownIcon,
    ChevronUpIcon
  },
  data() {
    return {
      contractAddress: '',
      name: null,
      symbol: null,
      decimals: null,
      chain: null,
      autofilled: false,
      chainDropdownOpen: false,
      isSymbolEditable: false,
      chainsWithFetchingTokenDetails: CHAINS_WITH_FETCH_TOKEN_DETAILS,
      addingToken: false
    }
  },
  computed: {
    ...mapState(['activeNetwork', 'accounts', 'activeWalletId', 'enabledAssets']),
    ...mapGetters(['accountsData']),
    networkAssets() {
      return this.enabledAssets[this.activeNetwork][this.activeWalletId]
    },
    isExistingNetworkAsset() {
      return Boolean(this.networkAssets.find((_symbol) => _symbol === this.symbol))
    },
    symbolError() {
      if (
        (!this.autofilled && Object.keys(cryptoassets).includes(this.symbol)) ||
        this.isExistingNetworkAsset
      ) {
        return this.$tle(new DuplicateTokenSymbolError())
      }
      return null
    },
    canAdd() {
      if (
        !this.symbol ||
        !this.name ||
        !this.chain ||
        !this.contractAddress ||
        this.decimals.length <= 0
      )
        return false
      if (this.symbol && this.symbolError) return false

      return true
    },
    existingAsset() {
      const existingAsset = Object.values(cryptoassets).find(
        (asset) =>
          asset.type === 'erc20' &&
          asset.contractAddress.toLowerCase() === this.contractAddress.toLowerCase() &&
          asset.chain === this.chain
      )
      return existingAsset ? { ...existingAsset, symbol: existingAsset.code } : null
    }
  },
  methods: {
    ...mapActions([
      'enableAssets',
      'addCustomToken',
      'toggleBlockchain',
      'toggleAccount',
      'fetchTokenDetails'
    ]),
    async addToken() {
      if (!this.existingAsset) {
        try {
          this.addingToken = true
          // Add only if it does not already exist
          await this.addCustomToken({
            network: this.activeNetwork,
            walletId: this.activeWalletId,
            chain: this.chain,
            contractAddress: this.contractAddress,
            name: this.name,
            symbol: this.symbol,
            decimals: Number(this.decimals)
          })

          const isChainEnabledForNative = this.accountsData.find(
            (account) => account.chain === this.chain
          )

          if (!isChainEnabledForNative) {
            await this.enableChain()
          }

          await this.enableAssets({
            network: this.activeNetwork,
            walletId: this.activeWalletId,
            assets: [this.symbol]
          })
          this.$router.replace('/settings/manage-assets')
        } catch (error) {
          const liqualityErrorString = errorToLiqualityErrorString(error)
          reportLiqualityError(error)
          return {
            error: liqualityErrorString
          }
        } finally {
          this.addingToken = false
        }
      }
    },
    async enableChain() {
      await this.toggleBlockchain({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        chainId: this.chain,
        enable: true
      })

      const accountIds = this.accounts[this.activeWalletId][this.activeNetwork]
        .filter((acc) => acc.chain === this.chain)
        .map((a) => a.id)

      await this.toggleAccount({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        accounts: accountIds,
        enable: true
      })
    },
    contractAddressPaste(e) {
      this.$nextTick(() => {
        this.contractAddress = e.clipboardData.getData('text')
        this.fetchToken()
      })
    },
    contractAddressChange(e) {
      if (this.contractAddress === e.target.value) return
      this.contractAddress = e.target.value
      this.fetchToken()
    },
    resetFields() {
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
        const { symbol, name, decimals } = await this.fetchTokenDetails({
          network: this.activeNetwork,
          walletId: this.activeWalletId,
          chain: this.chain,
          contractAddress: this.contractAddress
        })

        customToken = {
          symbol,
          name,
          decimals: parseInt(decimals),
          chain: this.chain
        }
      }

      if (customToken) {
        this.symbol = customToken.symbol
        this.name = customToken.name
        this.decimals = customToken.decimals
        this.autofilled = true
        this.isSymbolEditable = Boolean(
          this.networkAssets.find((_symbol) => _symbol === this.symbol)
        )
      }
    }, 500),
    async selectChain(chain) {
      this.chain = chain
      this.chainDropdownOpen = false
      this.resetFields()
      this.fetchToken()
    },
    isNumber(evt) {
      const keysAllowed = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
      const keyPressed = evt.key
      // The Decimals field can only have 2 digits (0 - 99) and must be a number
      if (!keysAllowed.includes(keyPressed) || this.decimals.length == 2) {
        evt.preventDefault()
      }
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
      border: 1px solid #d9dfe5;
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

      &:hover,
      &.active {
        background-color: #f0f7f9;
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
