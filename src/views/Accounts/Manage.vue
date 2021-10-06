<template>
  <div class="manage-accounts">
    <NavBar
      showMenu="false"
      showBack="true"
      backPath="/wallet"
      backLabel="Back"
    >
      <span class="wallet_header">
        <strong>Manage Accounts</strong>
      </span>
    </NavBar>
    <div class="account-search form wrapper">
      <div class="input-group">
        <SearchIcon />
        <input
          type="text"
          id="search_for_an_assert_input"
          autocomplete="off"
          class="form-control form-control-sm"
          v-model="search"
          placeholder="Search for an Asset, Account or Chain"
        />
      </div>
      <div v-if="filteredChainAccounts.length === 0" class="mt-3 d-flex">
        <div>
          <h4>Can't find this asset or chain</h4>
        </div>
      </div>
    </div>
    <div class="chain-list">
      <div
        v-for="chain in filteredChainAccounts"
        :key="chain.code"
        class="chain-item"
        :id="'chain-item-' + chain.code"
      >
        <div class="chain-item-content">
          <div
            class="chain-item-toggle"
            :id="'chain-item-toggle-' + chain.code"
          >
            <toggle-button
              :css-colors="true"
              :value="isChainEnabled(chain.id)"
              @change="(e) => toggleBlockchain(chain.id, e.value)"
            />
          </div>
          <img
            :src="getAccountIcon(chain.id)"
            class="asset-icon chain-item-icon"
          />
          <div class="chain-item-name" :id="'chain-item-name-' + chain.id">
            {{ chain.name }}
            ({{
              `${chain.accounts.length} Account${
                chain.accounts.length > 1 ? 's' : ''
              }`
            }})
          </div>
          <router-link
            :to="{ name: 'CreateAccount', params: { chainId: chain.id }}"
            class="create-link"
            v-tooltip="'Create Account'"
          >
            <PlusIcon />
          </router-link>
        </div>
        <div class="chain-item-accounts">
          <ListItem
            :item-class="'custom-item'"
            v-for="account in chain.accounts"
            :key="account.id"
          >
            <template #prefix>
              <div
                class="account-color"
                :style="{ 'background-color': account.color }"
              ></div>
            </template>
            <template #icon>
              <img :src="getAccountIcon(account.chain)" class="asset-icon" />
            </template>

            {{ account.alias ? `${account.name} - ${account.alias}` : account.name }}

            <template #sub-title v-if="account.totalFiatBalance">
              ${{ formatFiat(account.totalFiatBalance) }}
            </template>
            <template #detail>
              <toggle-button
                :css-colors="true"
                :value="account.enabled"
                @change="(e) => toggleAccount(account.id, e.value)"
              />
            </template>
          </ListItem>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import cryptoassets from '@/utils/cryptoassets'
import NavBar from '@/components/NavBar.vue'
import buildConfig from '@/build.config'
import { chains } from '@liquality/cryptoassets'
import PlusIcon from '@/assets/icons/plus_icon.svg'
import { formatFiat } from '@/utils/coinFormatter'
import { getAccountIcon } from '@/utils/accounts'
import ListItem from '@/components/ListItem'
import SearchIcon from '@/assets/icons/search.svg'

export default {
  components: {
    NavBar,
    PlusIcon,
    ListItem,
    SearchIcon
  },
  data () {
    return {
      search: null
    }
  },
  computed: {
    ...mapGetters(['accountFiatBalance']),
    ...mapState([
      'activeNetwork',
      'activeWalletId',
      'enabledChains',
      'accounts'
    ]),
    chains () {
      return buildConfig.chains.map((chainId) => {
        const { name, code, nativeAsset } = chains[chainId]
        const accounts = this.accountList.filter((a) => a.chain === chainId)
        return {
          id: chainId,
          name,
          code,
          nativeAsset,
          accounts
        }
      })
    },
    accountList () {
      return this.accounts[this.activeWalletId]?.[this.activeNetwork].map(
        (account) => {
          const totalFiatBalance = this.accountFiatBalance(
            this.activeWalletId,
            this.activeNetwork,
            account.id
          )
          return {
            ...account,
            totalFiatBalance
          }
        }
      )
    },
    filteredChainAccounts () {
      if (!this.search) return this.chains
      const _search = new RegExp(this.search.toUpperCase())
      return this.chains.filter((chain) => {
        const { name, id, nativeAsset } = chain
        const accountCount = chain.accounts.filter((a) => {
          return a.assets
            .map((a) => cryptoassets[a]?.name.toUpperCase() || a.toUpperCase())
            .some(a => a.match(_search))
        })

        return (
          accountCount.length > 0 ||
          [
            name.toUpperCase(),
            id.toUpperCase(),
            nativeAsset.toUpperCase()
          ].some(a => a.match(_search))
        )
      })
    }
  },
  methods: {
    ...mapActions({
      _toggleBlockchain: 'toggleBlockchain',
      _toggleAccount: 'toggleAccount'
    }),
    getAccountIcon,
    formatFiat,
    getAssetName (asset) {
      return cryptoassets[asset]?.name || asset
    },
    isChainEnabled (chainId) {
      return this.enabledChains[this.activeWalletId]?.[
        this.activeNetwork
      ]?.includes(chainId)
    },
    toggleBlockchain (chainId, enable) {
      this._toggleBlockchain({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        chainId,
        enable
      })
    },
    toggleAccount (accountId, enable) {
      this._toggleAccount({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        accountId,
        enable
      })
    }
  }
}
</script>

<style lang="scss">
.account-search {
  border-bottom: 1px solid $hr-border-color;
  input {
    margin-right: 8px;
    padding-left: 20px;
  }

  a {
    padding-top: 20px;
  }

  .input-group {
    align-items: center;
    svg {
      position: absolute;
      left: 0;
      top: 5px;
    }
  }

  svg {
    width: 16px;
    margin-right: 8px;
  }
}

.manage-accounts {
  display: flex;
  flex-direction: column;
  min-height: 0;

  .chain-list {
    overflow-y: auto;
  }
}

.chain-item {
  display: flex;
  flex-direction: column;

  .list-item-icon {
    margin-left: 41px !important;
  }

  .chain-item-content {
    border-top: 1px solid $hr-border-color;
    border-bottom: 1px solid $hr-border-color;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    width: 100%;

    .chain-item-icon {
      margin-right: 8px;
      margin-left: 8px;
    }

    .chain-item-name {
      width: 100%;
    }

    .create-link {
      width: 20px;
      height: 20px;
      svg {
        width: 12px;
      }
    }

    .chain-item-details {
      display: flex;
      flex-direction: column;
      width: 100%;

      .chain-item-name {
        color: $color-text-primary;
        font-weight: 400;
      }

      .chain-item-balance {
        display: block;
        font-size: $font-size-tiny;
        color: $text-muted;
      }
    }
  }
}

.account-color {
  width: 5px;
  height: 60px;
  position: absolute;
  left: 0;
  margin-right: 5px;
}

.custom-item {
  &:hover,
  &.active {
    background-color: #ffffff;
    color: $color-text-primary;
    cursor: default;
  }
}
</style>
