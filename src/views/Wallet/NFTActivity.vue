<template>
  <div class="account-container">
    <NavBar showMenu="true" showBack="true" backPath="/wallet" backLabel="Overview">
      <span class="account-title"><NFTIcon class="asset-icon" /> NFTs</span>
    </NavBar>
    <div class="account-content">
      <NFTStats />
      <div class="wallet-tabs">
        <ul class="nav nav-tabs">
          <li class="nav-item" @click="activeTab = 'nfts'">
            <span :class="activeTab === 'nfts' ? 'nav-link active' : 'nav-link'"> NFTs </span>
          </li>
          <li class="nav-item" @click="activeTab = 'activity'">
            <span :class="activeTab === 'activity' ? 'nav-link active' : 'nav-link'">
              Activity
            </span>
          </li>
        </ul>
        <div v-if="activeTab === 'nfts'">
          <WalletNFTs :source="'NFTActivity'" />
        </div>
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
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import NavBar from '@/components/NavBar.vue'
import TransactionList from '@/components/TransactionList'
import ActivityFilter from '@/components/ActivityFilter'
import { applyActivityFilters } from '@liquality/wallet-core/dist/utils/history'
import NFTStats from '@/views/Wallet/NFTStats'
import amplitude from 'amplitude-js'
import WalletNFTs from './WalletNFTs.vue'
import { getAssetIcon } from '@/utils/asset'
import NFTIcon from '@/assets/icons/nft_icon.svg'

amplitude.getInstance().init('bf12c665d1e64601347a600f1eac729e')

export default {
  components: {
    NavBar,
    ActivityFilter,
    TransactionList,
    WalletNFTs,
    NFTStats,
    NFTIcon
  },
  data() {
    return {
      activityData: [],
      activeTab: 'nfts'
    }
  },
  props: ['asset'],
  computed: {
    ...mapGetters(['activity', 'accountItem']),
    ...mapState(['activeNetwork', 'history', 'nftAssetsNumber']),
    accountId() {
      return this.$route.params.accountId
    },
    account() {
      console.log(
        '🚀 ~ file: NFTActivity.vue ~ line 74 ~ account ~  this.accountItem(this.accountId',
        this.accountItem(this.accountId)
      )
      return this.accountItem(this.accountId)
    },
    assetHistory() {
      return this.activity.filter((item) => item.from === this.asset)
    }
  },
  methods: {
    getAssetIcon,
    applyFilters(filters) {
      this.activityData = applyActivityFilters([...this.assetHistory], filters)
    }
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
  overflow-y: scroll;
  padding-bottom: 2rem;

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
