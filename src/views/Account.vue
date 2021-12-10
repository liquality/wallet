<template>
  <div class="account-container">
    <NavBar
      showMenu="true"
      showBack="true"
      backPath="/wallet"
      backLabel="Overview"
    >
      <span class="account-title"
        ><img :src="getAssetIcon(asset)" class="asset-icon" /> {{ asset }}</span
      >
    </NavBar>
    <div class="account-content">
      <div class="account-content-top">
        <RefreshIcon
          @click.stop="refresh"
          class="account-container_refresh-icon"
          id="refresh-icon"
          :class="{ 'infinity-rotate': updatingBalances }"
        />
        <div class="account-container_balance">
          <div
            class="account-container_balance_fiat"
            :id="`${asset}_fiat_value`"
          >
            <span v-if="fiatRates[asset]"> ${{ formatFiat(fiat) }} </span>
            <span v-else>&nbsp;</span>
          </div>
          <div>
            <span
              class="account-container_balance_value"
              :id="`${asset}_balance_value`"
              :style="{ fontSize: formatFontSize(balance) }"
            >
              {{ balance }}
            </span>
            <span class="account-container_balance_code">{{ asset }}</span>
          </div>
        </div>
        <div v-if="address" class="account-container_address">
          <button
            class="btn btn-outline-light"
            :id="`${asset}_address_container`"
            @click="copyAddress"
            v-tooltip.bottom="{
              content: addressCopied ? 'Copied!' : 'Click to copy',
              hideOnTargetClick: false,
            }"
          >
            {{ shortenAddress(address) }}
          </button>
          <a
            class="eye-btn"
            :id="`${asset}_view_in_explorer`"
            @click="copyAddress"
            :href="addressLink"
            target="_blank"
            v-tooltip.bottom="{ content: 'View in Explorer' }"
          >
            <EyeIcon />
          </a>
        </div>
        <div class="account-container_actions">
          <router-link :to="`/accounts/${accountId}/${asset}/send`">
            <button class="account-container_actions_button">
              <div
                class="account-container_actions_button_wrapper"
                :id="`${asset}_send_button`"
              >
                <SendIcon class="account-container_actions_button_icon" />
              </div>
              Send
            </button>
          </router-link>
          <router-link :to="`/accounts/${accountId}/${asset}/swap`">
            <button class="account-container_actions_button">
              <div
                class="account-container_actions_button_wrapper"
                :id="`${asset}_swap_button`"
              >
                <SwapIcon
                  class="
                    account-container_actions_button_icon
                    account-container_actions_button_swap
                  "
                />
              </div>
              Swap
            </button>
          </router-link>
          <router-link v-bind:to="`/accounts/${accountId}/${asset}/receive`">
            <button class="account-container_actions_button">
              <div
                class="account-container_actions_button_wrapper"
                :id="`${asset}_receive_button`"
              >
                <ReceiveIcon class="account-container_actions_button_icon" />
              </div>
              Receive
            </button>
          </router-link>
        </div>
      </div>
      <div class="account-container_transactions">
        <ActivityFilter
          @filters-changed="applyFilters"
          :activity-data="activityData"
          v-if="activityData.length > 0"
        />
        <TransactionList :transactions="activityData" />
        <div class="activity-empty" v-if="activityData.length <= 0">
          Once you start using your wallet you will see the activity here
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import cryptoassets from '@/utils/cryptoassets'
import { chains } from '@liquality/cryptoassets'
import NavBar from '@/components/NavBar.vue'
import RefreshIcon from '@/assets/icons/refresh.svg'
import SendIcon from '@/assets/icons/arrow_send.svg'
import ReceiveIcon from '@/assets/icons/arrow_receive.svg'
import SwapIcon from '@/assets/icons/arrow_swap.svg'
import { prettyBalance, formatFiat } from '@/utils/coinFormatter'
import { shortenAddress } from '@/utils/address'
import { getAssetIcon, getAddressExplorerLink } from '@/utils/asset'
import TransactionList from '@/components/TransactionList'
import ActivityFilter from '@/components/ActivityFilter'
import { applyActivityFilters } from '@/utils/history'
import EyeIcon from '@/assets/icons/eye.svg'
import BN from 'bignumber.js'
import { formatFontSize } from '@/utils/fontSize'

import amplitude from 'amplitude-js'

amplitude.getInstance().init('bf12c665d1e64601347a600f1eac729e')

export default {
  components: {
    NavBar,
    RefreshIcon,
    SendIcon,
    ReceiveIcon,
    SwapIcon,
    ActivityFilter,
    TransactionList,
    EyeIcon
  },
  data () {
    return {
      addressCopied: false,
      activityData: [],
      updatingBalances: false,
      address: null
    }
  },
  props: ['accountId', 'asset'],
  computed: {
    ...mapGetters(['activity', 'accountItem']),
    ...mapState([
      'activeWalletId',
      'activeNetwork',
      'addresses',
      'history',
      'fiatRates',
      'marketData'
    ]),
    account () {
      return this.accountItem(this.accountId)
    },
    fiat () {
      return this.account?.fiatBalances?.[this.asset] || BN(0)
    },
    balance () {
      return prettyBalance(this.account?.balances[this.asset] || 0, this.asset)
    },
    markets () {
      return this.marketData[this.activeNetwork][this.asset]
    },
    assetHistory () {
      return this.activity.filter((item) => item.from === this.asset)
    },
    addressLink () {
      if (this.account) {
        return getAddressExplorerLink(
          this.address,
          this.asset,
          this.activeNetwork
        )
      }

      return '#'
    }
  },
  methods: {
    ...mapActions([
      'updateAccountBalance',
      'getUnusedAddresses',
      'trackAnalytics'
    ]),
    getAssetIcon,
    shortenAddress,
    formatFontSize,
    formatFiat,
    async copyAddress () {
      await navigator.clipboard.writeText(this.address)
      this.addressCopied = true
      setTimeout(() => {
        this.addressCopied = false
      }, 2000)
    },
    async refresh () {
      if (this.updatingBalances) return

      this.updatingBalances = true
      await this.updateAccountBalance({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        accountId: this.accountId
      })
      this.updatingBalances = false
    },
    applyFilters (filters) {
      this.activityData = applyActivityFilters([...this.assetHistory], filters)
    }
  },
  async created () {
    if (this.account && this.account.type.includes('ledger')) {
      this.address = chains[cryptoassets[this.asset]?.chain]?.formatAddress(
        this.account.addresses[0],
        this.activeNetwork
      )
    } else {
      const addresses = await this.getUnusedAddresses({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        assets: [this.asset],
        accountId: this.accountId
      })
      const chainId = cryptoassets[this.asset]?.chain
      this.address = chains[chainId]?.formatAddress(
        addresses[0],
        this.activeNetwork
      )
    }
    await this.refresh()
    this.activityData = [...this.assetHistory]

    const { chain } = cryptoassets[this.asset]

    this.trackAnalytics({
      event: 'Refresh balance',
      properties: {
        category: 'Send/Receive',
        action: 'Update Balance',
        label: `${this.asset} (${chain}) address ${this.address}`
      }
    })

    this.trackAnalytics({
      event: 'Active Asset',
      properties: {
        category: `Select Asset on ${this.activeNetwork}`,
        action: `Active Asset on ${chain}`,
        label: `Select ${this.asset} (${chain})`
      }
    })
  },
  watch: {
    activeNetwork () {
      this.activityData = [...this.assetHistory]
    }
  }
}
</script>

<style lang="scss">
.account-container {
  .account-content-top {
    height: 220px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px 0;
    background: $brand-gradient-primary;
    color: $color-text-secondary;
    text-align: center;
    position: relative;
  }

  &_balance {
    &_fiat {
      min-height: 15px;
      margin-bottom: 6px;
    }

    &_value {
      line-height: 36px;
      margin-right: 8px;
    }

    &_code {
      font-size: $h3-font-size;
      line-height: 22px;
    }
  }

  &_refresh-icon {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 24px;
    height: 24px;
    cursor: pointer;

    path {
      fill: $color-text-secondary;
    }
  }

  &_actions {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;

    &_button {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      width: 70px;
      border: 0;
      cursor: pointer;
      color: $color-text-secondary;
      background: none;
      font-weight: 600;
      font-size: 13px;

      &.disabled {
        opacity: 0.5;
        cursor: auto;
      }

      &_wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 44px;
        height: 44px;
        background: #ffffff;
        border-radius: 50%;
        margin-bottom: 4px;
      }

      &_icon {
        width: 16px;
        height: 16px;
      }

      &_swap {
        height: 30px;
      }
    }
  }

  &_address {
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    button {
      font-size: $h4-font-size;
      font-weight: normal;
      color: $color-text-secondary;
      border: 0;
      background: none;
      outline: none;
    }

    .eye-btn {
      position: absolute;
      right: 60px;
      height: 40px;
      width: 35px;
      background-color: transparent;
      display: flex;
      align-items: center;

      svg {
        width: 20px;
      }

      &:hover {
        opacity: 0.8;
      }
    }
  }

  &_transactions {
    flex: 1;
    flex-basis: 0;
    overflow-y: scroll;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}
</style>
