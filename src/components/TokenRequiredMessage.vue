<template>
  <div class="notification-content">
    <div class="notification-text text-center">
      A balance is required to swap and/or you need to pay for gas.
    </div>
    <div class="notification-buttons">
    <div>
    <router-link :to="tokenAccountUrl"
                 class="btn btn-option get-eth-btn">
      {{`Get ${this.asset}`}}
    </router-link>
    </div>
    <div>
    <router-link :to="buyGas"
                class="btn btn-option get-eth-btn">
      Buy Gas
    </router-link>
    </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    accountId: String,
    asset: String,
    toAsset: String
  },
  computed: {
    tokenAccountUrl () {
      return `/accounts/${this.accountId}/${this.asset}/receive`
    },
    buyGas () {
      return `/accounts/${this.accountId}/${this.toAsset}/receive`
    }
  }
}
</script>

<style lang="scss" scoped>
.notification-content {
  display: flex;
  align-items: center;
  flex-direction: column;

  .notification-buttons {
      display: flex;
      justify-content: space-evenly;
      width: 50%;
      margin: 0 auto;
  }

  .get-eth-btn {
    width: 75px;
    text-align: center;
    padding-left: 10px;
  }
  .notification-text {
    align-self: center;
  }
}
</style>
