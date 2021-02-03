<template>
  <div class="account">
    <NavBar showMenu="true" showBack="true" backPath="/wallet" backLabel="Overview">
      <span class="account_header"><img :src="getAssetIcon(asset)" class="asset-icon" /> {{asset}}</span>
    </NavBar>
    <div class="account_main">
      <div class="account_top">
        <RefreshIcon @click.stop="refresh"
                     class="account_refresh-icon"
                     :class="{ 'infinity-rotate': updatingBalances }"
        />
        <div class="account_balance">
          <div class="account_balance_fiat">
            <span v-if="fiatRates[asset]" >
              ${{prettyFiatBalance(balance, fiatRates[asset])}}
            </span>
            <span v-else>&nbsp;</span>
          </div>
          <div>
            <span class="account_balance_value"
                  :style="{ fontSize: balanceFontSize }">
              {{balance}}
            </span>
            <span class="account_balance_code">{{asset}}</span>
          </div>
        </div>
        <div v-if="address" class="account_address">
          <button class="btn btn-outline-light"
            @click="copyAddress()"
            v-tooltip.bottom="{ content: addressCopied ? 'Copied!' : 'Copy', hideOnTargetClick: false }">
            {{ shortenAddress(this.address) }}
          </button>
        </div>
        <div class="account_actions">
          <router-link :to="'/account/' + asset + '/send'"><button class="account_actions_button">
            <div class="account_actions_button_wrapper"><SendIcon class="account_actions_button_icon" /></div>Send
          </button></router-link>
          <router-link :to="'/account/' + asset + '/swap'"><button class="account_actions_button">
            <div class="account_actions_button_wrapper"><SwapIcon class="account_actions_button_icon account_actions_button_swap" /></div>Swap
          </button></router-link>
          <router-link v-bind:to="'/account/' + asset + '/receive'"><button class="account_actions_button">
            <div class="account_actions_button_wrapper"><ReceiveIcon class="account_actions_button_icon" /></div>Receive
          </button></router-link>
        </div>
      </div>
      <div class="account_transactions">
        <ActivityFilter @filters-changed="applyFilters"
                        :activity-data="activityData"
                        v-if="activityData.length > 0"/>
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
import NavBar from '@/components/NavBar.vue'
import RefreshIcon from '@/assets/icons/refresh.svg'
import SendIcon from '@/assets/icons/arrow_send.svg'
import ReceiveIcon from '@/assets/icons/arrow_receive.svg'
import SwapIcon from '@/assets/icons/arrow_swap.svg'
import { prettyBalance, prettyFiatBalance } from '@/utils/coinFormatter'
import { shortenAddress } from '@/utils/address'
import { getAssetIcon } from '@/utils/asset'
import TransactionList from '@/components/TransactionList'
import ActivityFilter from '@/components/ActivityFilter'
import { applyActivityFilters } from '@/utils/history'

export default {
  components: {
    NavBar,
    RefreshIcon,
    SendIcon,
    ReceiveIcon,
    SwapIcon,
    ActivityFilter,
    TransactionList
  },
  data () {
    return {
      addressCopied: false,
      activityData: [],
      updatingBalances: false
    }
  },
  props: ['asset'],
  computed: {
    ...mapGetters(['activity']),
    ...mapState([
      'activeWalletId',
      'activeNetwork',
      'balances',
      'addresses',
      'history',
      'fiatRates',
      'marketData'
    ]),
    balance () {
      return prettyBalance(this.balances[this.activeNetwork][this.activeWalletId][this.asset], this.asset)
    },
    address () {
      const address = this.addresses[this.activeNetwork]?.[this.activeWalletId]?.[this.asset]
      return address && cryptoassets[this.asset].formatAddress(address)
    },
    markets () {
      return this.marketData[this.activeNetwork][this.asset]
    },
    assetHistory () {
      return this.activity.filter((item) => item.from === this.asset)
    },
    balanceFontSize () {
      let fontSize = 50
      if (this.balance.length > 6) {
        fontSize = 30
      } else if (this.balance.length > 13) {
        fontSize = 15
      }

      return `${fontSize}px`
    }
  },
  methods: {
    ...mapActions(['updateBalances', 'getUnusedAddresses']),
    getAssetIcon,
    shortenAddress,
    prettyFiatBalance,
    async copyAddress () {
      await navigator.clipboard.writeText(this.address)
      this.addressCopied = true
      setTimeout(() => { this.addressCopied = false }, 2000)
    },
    async refresh () {
      this.updatingBalances = true
      await this.updateBalances({ network: this.activeNetwork, walletId: this.activeWalletId })
      this.updatingBalances = false
    },
    applyFilters (filters) {
      this.activityData = applyActivityFilters([...this.assetHistory], filters)
    }
  },
  async created () {
    if (!this.address) {
      await this.getUnusedAddresses({ network: this.activeNetwork, walletId: this.activeWalletId, assets: [this.asset] })
    }
    this.activityData = [...this.assetHistory]
  },
  watch: {
    activeNetwork (newVal, oldVal) {
      this.activityData = [...this.assetHistory]
    }
  }
}
</script>

<style lang="scss">
.account {
  display: flex;
  flex-direction: column;
  flex: 1;

  &_header {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $h3-font-size;
    text-transform: uppercase;
    font-weight: normal;

    img {
      margin-right: 4px;
    }
  }

  &_main {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  &_top {
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

    button {
      font-size: $h4-font-size;
      font-weight: normal;
      color: $color-text-secondary;
      border: 0;
      background: none;
      outline: none;
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
