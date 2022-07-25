<template>
  <UnlockWallet @unlocked="unlocked" />
</template>

<script>
import UnlockWallet from './UnlockWallet'

export default {
  components: {
    UnlockWallet
  },
  methods: {
    unlocked() {
      this.$router.replace('/wallet')
    }
  }
}
</script>
