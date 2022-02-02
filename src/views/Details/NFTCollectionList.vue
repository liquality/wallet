<template>
  <div class="nft-collectibles">
    <h1 class="section-header">Cryptokitties</h1>
    <div class="wallet-info-heading">
      <h5>Total Value of Cryptokitties</h5>
      <div class="total-balance">
        <WalletBalanceEye class="icon" />
        <span>23,253.89 USD</span>
      </div>
    </div>
    <div class="nft-collection">
      <NFTAsset v-for="asset in nftCollection.number" :key="asset.id" :nftAsset="nftCollection" />
    </div>
  </div>
</template>

<script>
import WalletBalanceEye from '@/assets/icons/nft-wallet-eye.svg'
import NFTAsset from '../../components/NFTAsset.vue'

export default {
  components: {
    WalletBalanceEye,
    NFTAsset
  },
  data() {
    return {}
  },
  created() {
    console.log('NFTAssets created', this.$route)
  },
  computed: {
    nftCollection() {
      return this.$route.query.nftAsset
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
  .nft-collection {
    padding: 0 10px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 5px;
  }
}
</style>
