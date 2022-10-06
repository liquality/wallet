<template>
  <div class="nft-collectibles">
    <NavBar
      showBack="true"
      :backPath="routeSource === 'NFTActivity' ? '/wallet/nfts/activity' : '/wallet/nfts'"
      :backLabel="$t('common.back')"
    >
      <span class="wallet-header cursor-pointer" :title="nftCollectionName">
        <strong class="text-uppercase">
          {{ nftCollectionName }} ({{ nftCollection.length }})</strong
        >
      </span>
    </NavBar>
    <div class="nft-collection">
      <NFTAsset
        v-for="asset in nftCollection"
        :key="asset.id"
        :nftAsset="asset"
        :mode="'thumbnail'"
        v-tooltip.bottom="{
          content: asset ? asset.name : '',
          hideOnTargetClick: false
        }"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import NFTAsset from '../../components/NFT/NFTAsset.vue'
import NavBar from '../../components/NavBar.vue'

export default {
  components: {
    NFTAsset,
    NavBar
  },
  computed: {
    ...mapGetters(['allNftCollections', 'accountNftCollections']),
    nftCollection() {
      if (this.isAccount === true) {
        return this.accountNftCollections[this.chain][this.collectionName]
      } else {
        return this.allNftCollections[this.collectionName]
      }
    },
    collectionName() {
      return this.$route.query.collectionName
    },

    routeSource() {
      return this.$route.query.source || null
    },
    isAccount() {
      return this.$route.query.isAccount
    },
    chain() {
      return this.$route.query.chain
    },
    nftCollectionName() {
      if (
        this.collectionName &&
        this.collectionName !== 'undefined' &&
        this.collectionName !== 'null'
      ) {
        return this.collectionName
      } else {
        return this.nftCollection.filter((asset) => asset.name)[0]?.name || 'Unknown Collection'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.nft-collectibles {
  overflow-y: hidden;
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
  .nft-collection {
    padding: 16px 10px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 5px;
    overflow-y: auto;
    height: 100%;
  }
}
</style>
