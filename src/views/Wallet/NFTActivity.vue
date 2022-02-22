<template>
  <div class="account-container">
    <NavBar showMenu="true" showBack="true" backPath="/wallet" backLabel="Overview">
      <span class="account-title"><img :src="getAssetIcon(asset)" class="asset-icon" /> NFTs</span>
    </NavBar>
    <div class="account-content">
      <div class="account-content-top">
        <div class="account-container_balance">
          <div>
            <span class="account-container_balance_value">
              {{ nftAssetsNumber }}
            </span>
            <span class="account-container_balance_code"
              >NFT<span v-if="balance !== 1">s</span></span
            >
          </div>
        </div>
        <div class="account-container_actions">
          <button class="account-container_actions_button" disabled>
            <div class="account-container_actions_button_wrapper" :id="`${asset}_send_button`">
              <SendIcon class="account-container_actions_button_icon" />
            </div>
            Send
          </button>
          <button class="account-container_actions_button" disabled>
            <div class="account-container_actions_button_wrapper" :id="`${asset}_swap_button`">
              <SwapIcon
                class="account-container_actions_button_icon account-container_actions_button_swap"
              />
            </div>
            Swap
          </button>
          <button class="account-container_actions_button" disabled>
            <div class="account-container_actions_button_wrapper" :id="`${asset}_receive_button`">
              <ReceiveIcon class="account-container_actions_button_icon" />
            </div>
            Receive
          </button>
        </div>
      </div>
      <div class="wallet-tabs">
        <ul class="nav nav-tabs">
          <li class="nav-item" @click="activeTab = 'activity'">
            <span :class="activeTab === 'activity' ? 'nav-link active' : 'nav-link'">
              Activity
            </span>
          </li>
          <li class="nav-item" @click="activeTab = 'nfts'">
            <span :class="activeTab === 'nfts' ? 'nav-link active' : 'nav-link'"> NFTs </span>
          </li>
        </ul>
        <div class="account-container_transactions" v-if="activeTab === 'activity'">
          <ActivityFilter
            @filters-changed="applyFilters"
            :activity-data="activityData"
            v-if="activityData.length > 0"
          />
          <TransactionList :transactions="activityData" />
          <div class="activity-empty" v-if="activityData.length <= 0">
            Once you start using your NFTs you will see the activity here
          </div>
        </div>
        <div v-if="activeTab === 'nfts'">
          <WalletNFTs :source="'NFTActivity'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import NavBar from '@/components/NavBar.vue'
import SendIcon from '@/assets/icons/arrow_send.svg'
import ReceiveIcon from '@/assets/icons/arrow_receive.svg'
import SwapIcon from '@/assets/icons/arrow_swap.svg'
import TransactionList from '@/components/TransactionList'
import ActivityFilter from '@/components/ActivityFilter'
import { applyActivityFilters } from '@/utils/history'
import amplitude from 'amplitude-js'
import WalletNFTs from './WalletNFTs.vue'
import { getAssetIcon } from '@/utils/asset'

amplitude.getInstance().init('bf12c665d1e64601347a600f1eac729e')

export default {
  components: {
    NavBar,
    ActivityFilter,
    TransactionList,
    WalletNFTs,
    SendIcon,
    ReceiveIcon,
    SwapIcon
  },
  data() {
    return {
      activityData: [],
      activeTab: 'activity'
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
      'marketData',
      'nftAssetsNumber'
    ]),
    account() {
      return this.accountItem(this.accountId)
    },
    markets() {
      return this.marketData[this.activeNetwork][this.asset]
    },
    assetHistory() {
      return this.activity.filter((item) => item.from === this.asset)
    }
  },
  methods: {
    ...mapActions(['updateAccountBalance', 'getUnusedAddresses', 'trackAnalytics']),
    getAssetIcon,
    applyFilters(filters) {
      this.activityData = applyActivityFilters([...this.assetHistory], filters)
    }
  },
  async created() {
    console.log('Account created', this.asset)
  },
  watch: {
    activeNetwork() {
      this.activityData = [...this.assetHistory]
    }
  }
}
</script>

<style lang="scss" scoped>
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
    display: flex;
    align-items: center;
    justify-content: center;
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

  &_transactions {
    flex: 1;
    flex-basis: 0;
    overflow-y: scroll;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  button:disabled {
    opacity: 0.5;
    cursor: auto;
  }
}
.nav-item {
  width: 50%;

  .nav-link {
    cursor: pointer;
    &.active,
    &:hover {
      color: #000d35 !important;
      font-weight: 600;
      border: none !important;
      border-bottom: 1px solid #1d1e21 !important;
    }
  }
}
</style>
