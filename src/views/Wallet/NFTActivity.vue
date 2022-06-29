<template>
  <div class="account-container">
    <NavBar showMenu="true" showBack="true" backPath="/wallet" backLabel="Overview">
      <div class="account-title">
        <div class="icons d-flex justify-content-center">
          <span class="mr-2">
            <NFTIcon class="asset-icon" />
            <img :src="getAssetIcon(asset)" :alt="`${asset}-icon`" class="asset-icon" />
          </span>
          {{ account.chain }}
        </div>
      </div>
    </NavBar>
    <div class="account-content">
      <NFTStats :isAccount="true" :id="id" />
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
          <WalletNFTs :source="'NFTActivity'" :isAccount="true" :id="id" />
        </div>
        <div class="account-container_transactions" v-if="activeTab === 'activity'">
          <ActivityFilter
            @filters-changed="applyFilters"
            :activity-data="activityData"
            v-if="activityData.length > 0"
          />
          <TransactionList :transactions="activityData" />
          <div class="activity-empty m-3" v-if="activityData.length <= 0">
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
import NFTIcon from '@/assets/icons/nft.svg'
import { chains } from '@liquality/cryptoassets'

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
  props: ['id'],
  data() {
    return {
      activityData: [],
      activeTab: 'nfts'
    }
  },
  created() {
    this.activityData = [...this.activity]
  },
  computed: {
    ...mapState(['activeNetwork', 'history']),
    ...mapGetters(['activity', 'accountsData', 'accountNftCollections']),
    assetHistory() {
      return this.activity.filter((item) => item.type === 'NFT')
    },
    nftAssets() {
      return this.accountNftCollections(this.id) || []
    },
    nftAssetsCount() {
      return Object.values(this.nftAssets).reduce((acc, collection) => acc + collection.length, 0)
    },
    account() {
      return this.accountsData.filter((account) => account.id === this.id)[0]
    },
    asset() {
      return chains[this.account.chain].nativeAsset
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
.icons {
  span {
    width: 52px;
  }
  img {
    position: absolute;
  }
  svg {
    position: absolute;
    &:first-child {
      left: calc(50% - 58px);
      z-index: 2;
    }
  }
}

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
