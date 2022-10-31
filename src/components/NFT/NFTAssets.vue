<template>
  <div class="nft-assets">
    <div class="nft-assets__container">
      <div class="nft-assets__container__heading">
        <div class="collection-name">
          <h5 :title="nftCollectionName" class="cursor-pointer">
            {{ nftCollectionName }}
          </h5>
          <span class="ml-1">({{ nftCollection.length }})</span>
        </div>
        <span class="d-flex align-items-center" v-if="!isAccount">
          <router-link
            class="d-flex align-items-center link"
            :to="{
              path: `/details/nft-collection/${collectionName}`,
              query: {
                collectionName: collectionName,
                source: source,
                isAccount: isAccount,
                chain: chain
              }
            }"
          >
            {{ $t('components.nft.seeAll') }}
          </router-link>
        </span>
      </div>
      <div
        class="nft-assets__container__images"
        :class="{ 'nft-assets__container__images--is-account': isAccount }"
      >
        <NFTAsset
          v-for="nft in isAccount ? assets : firstThreeAssets"
          :nftAsset="nft"
          :accountId="accountId"
          :mode="'thumbnail'"
          :key="nft.id"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import NFTAsset from './NFTAsset.vue'
export default {
  props: {
    assets: {
      type: Array,
      required: true
    },
    collectionName: {
      type: String,
      required: true
    },
    source: {
      type: String,
      required: false
    },
    isAccount: {
      type: Boolean,
      default: false
    },
    accountId: {
      type: String,
      required: false
    }
  },
  components: {
    NFTAsset
  },
  computed: {
    ...mapGetters(['allNftCollections', 'accountNftCollections', 'accountsData']),
    nftCollection() {
      if (this.isAccount) {
        return this.accountNftCollections(this.accountId)[this.collectionName]
      } else {
        return this.allNftCollections[this.collectionName]
      }
    },
    firstThreeAssets() {
      return this.assets.slice(0, 3)
    },
    account() {
      return this.accountsData.filter((account) => account.id === this.accountId)[0]
    },
    chain() {
      return this.account?.chain
    },
    nftCollectionName() {
      if (
        this.collectionName &&
        this.collectionName !== 'undefined' &&
        this.collectionName !== 'null'
      ) {
        return this.collectionName
      } else {
        return this.assets.filter((asset) => asset.name)[0]?.name || 'Unknown Collection'
      }
    }
  }
}
</script>

<style lang="scss">
.nft-assets {
  padding: 0 16px;

  &__container {
    &__heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 18px;
      .collection-name {
        display: flex;
        h5,
        span {
          font-weight: 600;
          font-size: 16px;
          line-height: 20.63px;
        }
        h5 {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          max-width: 260px;
        }
      }
    }
    &__images {
      display: flex;
      gap: 12px;
      width: 100%;
      overflow: auto;
      justify-content: flex-start;
      align-items: center;
      margin-right: 20px;

      &--is-account {
        flex-wrap: wrap;
      }

      img {
        border-radius: 10px;

        &.img-active {
          transform: translateX(-100%);
        }
      }
    }
  }

  .link {
    color: $color-primary;
    font-weight: 600;
  }
}
</style>
