<template>
  <div class="nft-collectibles">
    <div v-if="Object.keys(nftAssetsByCollection['ethereum']).length">
      <template v-for="(asset, key) in nftAssetsByCollection['ethereum']">
        <NFTAssets
          :assets="asset"
          :collectionName="key"
          :key="asset.id"
          :source="source"
          :isAccount="isAccount"
        />
      </template>
    </div>
    <div class="activity-empty" v-else>
      <p>
        Once you start owning NFTs with accounts in your Liquality wallet you will see them here.
      </p>
      <div class="d-flex justify-content-center brand">
        <OpenSea @click="openOnOpenSea" class="cursor-pointer" />
      </div>
      <div class="d-flex justify-content-center">
        <a
          class="btn btn-outline-primary"
          :href="`http://${activeNetwork === 'testnet' ? 'testnets.' : ''}opensea.io`"
          target="_blank"
          rel="noopener noreferrer"
          >Check out Opensea</a
        >
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import NFTAssets from '../../components/NFTAssets.vue'
import OpenSea from '../../assets/icons/opensea_brand.svg'

export default {
  components: {
    NFTAssets,
    OpenSea
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
  computed: {
    ...mapState(['activeWalletId', 'activeNetwork']),
    ...mapGetters(['nftAssetsByCollection'])
  },
  methods: {
    openOnOpenSea() {
      window.open(
        `http://${this.activeNetwork === 'testnet' ? 'testnets.' : ''}opensea.io`,
        '_blank'
      )
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
    color: #9d4dfa;
  }

  .brand {
    background: rgba(217, 223, 229, 0.5);
    border-radius: 10px;
    padding: 28px 58px;
    margin-bottom: 20px;

    svg {
      width: 215px;
      height: 49px;
    }
  }
}
</style>
