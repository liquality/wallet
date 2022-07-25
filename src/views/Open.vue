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
      console.log('unlocked', new Date())
    }
  }
}
</script>
