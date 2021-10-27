<template>
  <div  v-if='isPairAvailable' class="notification-content">
    <div>Liquidity low, please try again later.</div>
  </div>
  <div v-else class="notification-content">
    <div>Pair not yet supported - coming soon. See our list of compatible pairs
      <a href="https://liquality.io/blog/how-to-use-the-liquality-wallet-101/#q-which-token-pairs-can-i-swap-within-the-liquality-wallet"
      target="_blank">here.</a>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    isPairAvailable: Boolean
  }
}
</script>
<style lang="scss" scoped>
.notification-content {
  height: 65px;
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;

  .liq-telegram-btn {
    margin-left: 4px;
    width: 130px;
    display: inline-block;
  }
}
</style>
