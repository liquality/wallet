<template>
  <button @click="open" class="btn" :class="btnClass">Buy Crypto</button>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  props: ['asset', 'chain', 'address', 'btnClass'],
  methods: {
    ...mapActions('app', ['setBuyCryptoModalOpen']),
    open() {
      debugger
      const { asset, chain, address } = this
      this.setBuyCryptoModalOpen({ open: true, asset, chain, address })
    }
  }
}
</script>

<style lang="scss" scoped>
.btn {
  border-radius: 22px;

  &:focus {
    color: $primary;
    border-color: $primary;
    background-color: #f8faff;
    border: 1px solid $primary;
  }
}
</style>
