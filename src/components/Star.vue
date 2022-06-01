<template>
  <svg
    width="23"
    height="26"
    viewBox="0 0 23 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    @click="toggleStarred"
  >
    <path
      d="M11 4.91214L12.7683 9.74879L13.7075 9.4054L12.7684 9.74879C13.0273 10.4571 13.6627 10.9595 14.4116 11.0481L19.9428 11.7031L15.6202 15.3165C14.9733 15.8573 14.735 16.7458 15.0246 17.5378L16.7359 22.2183L12.0235 19.4113C11.3928 19.0356 10.6071 19.0356 9.97644 19.4113L5.26402 22.2183L6.99558 17.4824C7.26483 16.746 7.07891 15.9202 6.52005 15.3702L2.79281 11.7021L7.61575 11.0543C8.35201 10.9554 8.9728 10.4566 9.22789 9.75887L11 4.91214Z"
      :fill="nftAsset.starred ? '#EAB300' : 'white'"
      :stroke="nftAsset.starred ? '#EAB300' : 'none'"
      stroke-width="2"
    />
    <path
      d="M20.625 10.2188C21.1458 10.2708 21.4844 10.5443 21.6406 11.0391C21.7969 11.5339 21.6927 11.9635 21.3281 12.3281L17.1875 16.3516L18.1641 22.0547C18.2422 22.5495 18.0729 22.9401 17.6562 23.2266C17.2396 23.5391 16.8099 23.5781 16.3672 23.3438L11.25 20.6875L6.13281 23.3438C5.6901 23.6042 5.26042 23.5781 4.84375 23.2656C4.42708 22.9531 4.25781 22.5495 4.33594 22.0547L5.3125 16.3516L1.17188 12.3281C0.807292 11.9635 0.703125 11.5339 0.859375 11.0391C1.01562 10.5443 1.35417 10.2708 1.875 10.2188L7.57812 9.35938L10.1172 4.20312C10.3516 3.73438 10.7292 3.5 11.25 3.5C11.7708 3.5 12.1484 3.73438 12.3828 4.20312L14.9219 9.35938L20.625 10.2188ZM15.8594 15.9219L20.4688 11.4297L14.1016 10.5312L11.25 4.75L8.39844 10.5312L2.03125 11.4297L6.64062 15.9219L5.54688 22.25L11.25 19.2812L16.9531 22.25L15.8594 15.9219Z"
      :fill="nftAsset.starred ? '#D9DFE5' : '#D9DFE5'"
    />
  </svg>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex'
import { ChainId } from '@liquality/cryptoassets'
export default {
  props: {
    nftAsset: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapState(['activeWalletId', 'activeNetwork']),
    ...mapGetters(['accountsData'])
  },
  methods: {
    ...mapMutations(['SET_STARRED_NFTS']),
    async toggleStarred() {
      this.nftAsset.starred = !this.nftAsset.starred
      this.SET_STARRED_NFTS({
        nftAsset: this.nftAsset,
        walletId: this.activeWalletId,
        network: this.activeNetwork,
        accountId: this.accountsData.filter((account) => account.chain === ChainId.Ethereum)[0].id
      })
    }
  }
}
</script>

<style lang="scss" scoped>
svg {
  position: absolute;
  top: 4px;
  left: 4px;
}
</style>
