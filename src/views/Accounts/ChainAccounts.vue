<template>
      <div
        class="chain-item"
        :id="'chain-item-' + chain.code"
      >
        <div class="chain-item-content">
          <img
            :src="getChainIcon(chain.id)"
            class="asset-icon chain-item-icon"
          />
           <div class="d-flex flex-column mr-auto justify-content-start">
             <div class="chain-item-name" :id="'chain-item-name-' + chain.id">
            {{ chain.name }}
            </div>
            <div class="chain-item-accounts-len" :id="'chain-item-accounts-len-' + chain.id">
              ({{
              `${accountList.length} Account${
                accountList.length > 1 ? 's' : ''
              }`
            }})
            </div>
          </div>
          <router-link
            v-if="isChainEnabled(chain.id)"
            :to="{ name: 'CreateAccount', params: { chainId: chain.id }}"
            class="create-link"
            :id="'create-account-plus-icon-' + chain.id"
            v-tooltip="'Create Account'"
          >
            <PlusIcon />
          </router-link>
          <div
            class="chain-item-toggle"
            :id="'chain-item-toggle-' + chain.id"
          >
            <toggle-button
              :css-colors="true"
              :value="isChainEnabled(chain.id)"
              @change="(e) => toggleBlockchain(chain.id, e.value)"
            />
          </div>
        </div>
        <div class="chain-item-accounts" :id="'chain-item-accounts-' + chain.id">
          <ListItem
            :item-class="'custom-item'"
            v-for="account in accountList"
            :key="account.id"
            :class="'account-item-' + chain.id"
            :id="'account-item-' + chain.id"
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
                :sync="true"
                :disabled="!isChainEnabled(chain.id)"
                @change="(e) => toggleAccount([account.id], e.value)"
              />
            </template>
          </ListItem>
        </div>
      </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import cryptoassets from '@/utils/cryptoassets'
import PlusIcon from '@/assets/icons/plus_circle.svg'
import { formatFiat } from '@/utils/coinFormatter'
import { getAccountIcon, getChainIcon } from '@/utils/accounts'
import ListItem from '@/components/ListItem'

export default {
  components: {
    PlusIcon,
    ListItem
  },
  props: {
    chain: Object
  },
  computed: {
    ...mapGetters(['accountFiatBalance']),
    ...mapState([
      'activeNetwork',
      'activeWalletId',
      'enabledChains',
      'accounts'
    ]),
    accountList () {
      return this.accounts[this.activeWalletId][this.activeNetwork]
        .filter(a => a.chain === this.chain.id)
        .map(
          account => ({
            ...account,
            totalFiatBalance: this.accountFiatBalance(
              this.activeWalletId,
              this.activeNetwork,
              account.id
            )
          })
        )
    }
  },
  methods: {
    ...mapActions({
      _toggleBlockchain: 'toggleBlockchain',
      _toggleAccount: 'toggleAccount'
    }),
    getAccountIcon,
    getChainIcon,
    formatFiat,
    getAssetName (asset) {
      return cryptoassets[asset]?.name || asset
    },
    isChainEnabled (chainId) {
      return this.enabledChains[this.activeWalletId]?.[
        this.activeNetwork
      ]?.includes(chainId)
    },
    async toggleBlockchain (chainId, enable) {
      await this._toggleBlockchain({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        chainId,
        enable
      })

      const accountIds = this.accountList.map(a => a.id)
      await this.toggleAccount(accountIds, enable)
    },
    async toggleAccount (accountIds, enable) {
      await this._toggleAccount({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        accounts: accountIds,
        enable
      })
    }
  }
}
</script>

<style lang="scss">

.chain-item {
  display: flex;
  flex-direction: column;

  .list-item-icon {
    margin-left: 30px !important;
  }

  .chain-item-content {
    border-top: 1px solid $hr-border-color;
    border-bottom: 1px solid $hr-border-color;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 10px;
    width: 100%;

    .chain-item-icon {
      margin-right: 8px;
      margin-left: 8px;
    }

    .chain-item-name {
       width: 100%;
        color: $color-text-primary;
        font-weight: 400;
      }

      .chain-item-accounts-len {
          font-size: $font-size-tiny !important;
          color: $text-muted !important;
      }

      .chain-item-balance {
        display: block;
        font-size: $font-size-tiny;
        color: $text-muted;
      }

    .create-link {
      width: 20px;
      height: 20px;
      margin-right: 20px;
      svg {
        width: 20px;
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
