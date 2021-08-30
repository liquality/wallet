<template>
  <div class="notification-content">
    <div class="notification-text">
     {{`A balance is required to swap and you need ${asset} to pay for gas.`}}
    </div>
    <router-link :to="accountUrl"
                 class="btn btn-option get-eth-btn">
      {{`Get ${asset}`}}
    </router-link>
  </div>
</template>

<script>
export default {
  props: {
    accountId: String,
    asset: String
  },
  computed: {
    accountUrl () {
      return `/accounts/${this.accountId}/${this.asset}/receive`
    }
  }
}
</script>

<style lang="scss" scoped>
.notification-content {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .get-eth-btn {
    display: flex;
    justify-content: center;
    width: 90px;
    text-align: center;
  }
  .notification-text {
    width: 250px;
  }
}
</style>
