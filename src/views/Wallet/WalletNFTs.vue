<template>
  <div class="nft-collectibles">
    <div v-if="!nftAssets">
      <template v-for="(asset, key) in nftAssets">
        <NFTAssets :nftAssets="asset" :collectionName="key" :key="asset.id" :source="source" />
      </template>
    </div>
    <div class="activity-empty" v-else>
      <p>
        Once you start owning NFTs with accounts in your Liquality wallet you will see them here.
      </p>
      <!-- <a
        class="btn-outline-clear"
        href="http://opensea.io"
        target="_blank"
        rel="noopener noreferrer"
        >Check Opensea</a
      > -->
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import NFTAssets from '../../components/NFTAssets.vue'

export default {
  components: {
    NFTAssets
  },
  props: {
    source: {
      type: String,
      required: false
    }
  },
  data() {
    return {
      assets: []
    }
  },
  mounted() {
    this.getNftCollections()
  },
  computed: {
    ...mapState(['activeWalletId', 'activeNetwork', 'nftAssetsNumber', 'nftAssets'])
  },
  methods: {
    ...mapActions(['getNFTAssets']),
    async getNftCollections() {
      try {
        await this.getNFTAssets({
          network: this.activeNetwork,
          walletId: this.activeWalletId
        })
      } catch (error) {
        console.error(error)
      }
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
</style>
