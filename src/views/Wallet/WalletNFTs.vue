<template>
  <div class="nft-collectibles">
    <div v-if="Object.keys(assets).length">
      <template v-for="(asset, key) in assets">
        <NFTAssets
          :assets="asset"
          :collectionName="key"
          :key="asset.id"
          :source="source"
          :isAccount="isAccount"
          :accountId="accountId"
        />
      </template>
    </div>
    <div class="activity-empty m-4" v-else>
      <p>
        Once you start owning NFTs with accounts in your Liquality wallet you will see them here.
      </p>
      <div class="d-flex justify-content-center brand">
        <OpenSea @click="openMarketplace('polygon')" class="cursor-pointer" />
      </div>
      <p class="text-center">Explore NFTs on Polygon, Ethereum and Solana.</p>
      <div class="d-flex justify-content-center mb-2">
        <a
          class="btn btn-primary"
          :href="nftExplorerLink('polygon')"
          target="_blank"
          rel="noopener noreferrer"
          >Check out OpenSea</a
        >
      </div>
      <hr />
      <div class="d-flex justify-content-center brand">
        <StratosNFT @click="openMarketplace('arbitrum')" class="cursor-pointer" />
      </div>
      <p class="text-center">Discover and collect NFTs on Arbitrum</p>
      <div class="d-flex justify-content-center">
        <a
          class="btn btn-primary"
          :href="nftExplorerLink('arbitrum')"
          target="_blank"
          rel="noopener noreferrer"
          >Check out Stratos</a
        >
      </div>
      <div class="d-flex justify-content-center">
        <a
          class="text-primary font-weight-bold"
          href="https://blog.liquality.io/nfts-are-here-manage-your-collections-from-multiple-chains-on-your-liquality-wallet/"
          target="_blank"
          rel="noopener noreferrer"
          >Learn how it works</a
        >
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import NFTAssets from '../../components/NFT/NFTAssets.vue'
import OpenSea from '../../assets/icons/opensea.svg'
import StratosNFT from '../../assets/icons/stratosnft.svg'
import { getNftLink, openseaLink } from '@liquality/wallet-core/dist/utils/asset'
import { getItemIcon } from '@/utils/history'
import { chains } from '@liquality/cryptoassets'

export default {
  components: {
    NFTAssets,
    OpenSea,
    StratosNFT
  },
  props: {
    source: {
      type: String,
      required: false
    },
    isAccount: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      assets: []
    }
  },
  async created() {
    if (this.isAccount) {
      this.assets = this.accountNftCollections(this.accountId)
    } else {
      this.assets = this.allNftCollections
    }
  },
  computed: {
    ...mapState(['activeWalletId', 'activeNetwork']),
    ...mapGetters(['allNftCollections', 'accountNftCollections', 'accountsData']),
    accountId() {
      return this.$route.params.id
    },
    account() {
      return this.accountsData.filter((account) => account.id === this.accountId)[0]
    },
    chain() {
      return this.account?.chain
    },
    opensea() {
      return openseaLink(this.activeNetwork)
    }
  },
  methods: {
    getNftLink,
    openseaLink,
    getItemIcon,
    nftExplorerLink(chain) {
      const asset = chains[chain].nativeAsset
      return getNftLink(asset, this.activeNetwork)
    },
    openMarketplace(chain) {
      window.open(this.nftExplorerLink(chain), '_blank')
    }
  }
}
</script>

<style lang="scss" scoped>
.nft-collectibles {
  .section-header {
    font-size: 20px;
    line-height: 25.78px;
    padding: 16px;
    border-bottom: 1px solid $hr-border-color;
  }
  .wallet-info-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    margin-bottom: 24px;
    h5 {
      font-size: 12px;
      line-height: 14px;
      font-weight: 400;
    }
    .total-balance {
      display: flex;
      align-items: flex-start;
      .icon {
        width: 20px;
        height: 20px;
        margin-right: 9px;
      }
      span {
        font-size: 16px;
        line-height: 21.94px;
        font-weight: 300;
      }
    }
  }
}

.activity-empty {
  display: block;

  .btn {
    border-radius: 22px;
    color: #ffffff;
    margin-bottom: 30px;
  }

  .brand {
    border-radius: 10px;
    margin: 22px 0;
    svg {
      width: 215px;
      height: 49px;
    }
  }
}
</style>
