<template>
  <div class="nft-collectibles">
    <template v-for="(asset, key) in assets">
      <NFTAssets :nftAsset="asset" :collectionName="key" :key="asset.id" />
    </template>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import WalletBalanceEye from '@/assets/icons/nft-wallet-eye.svg'
import NFTAssets from '../../components/NFTAssets.vue'
export default {
  components: {
    WalletBalanceEye,
    NFTAssets
  },
  data() {
    return {
      assets: [],
      NFTAssetsList: [
        {
          name: 'CryptoKitties',
          number: 8,
          nft: [
            {
              name: 'Habibi Mehrain',
              collection: 'CryptoKitties',
              number: '#4243, X Gen6'
            }
          ]
        },
        {
          name: 'Pancakes',
          number: 3
        },
        {
          name: 'CryptoPunks',
          number: 10
        }
      ]
    }
  },
  mounted() {
    this.getNftCollections()
  },
  computed: {
    ...mapState([
      'activeWalletId',
      'activeNetwork',
      'addresses',
      'history',
      'fiatRates',
      'marketData'
    ]),
    ...mapGetters(['client'])
  },
  methods: {
    async getNftCollections() {
      const client = this.client({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        asset: 'ETH'
      })
      const nft = await client.nft.fetch()
      console.log(
        '🚀 ~ file: WalletNFTs.vue ~ line 75 ~ getNftCollections ~ nft.assets',
        nft.assets
      )
      const result = nft.assets.reduce(function (r, a) {
        r[a.collection.name] = r[a.collection.name] || []
        r[a.collection.name].push(a)
        return r
      }, Object.create(null))

      console.log(result)
      this.assets = result
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
