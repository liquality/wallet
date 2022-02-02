<template>
  <div class="nft-asset">
    <img src="@/assets/images/nft.png" alt="" />
    <div class="drawer"></div>
  </div>
</template>

<script>
export default {
  created() {
    console.log('NFTAsssetDetails', this.$route)
  }
}
</script>

<style lang="scss" scoped>
.nft-asset {
  height: 100%;
  display: flex;
  justify-content: center;
  // img {
  //   height: 100%;
  // }
  .drawer {
    background: #ffffff;
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 40px;
    border-radius: 15px 15px 0 0;
  }
}
</style>
