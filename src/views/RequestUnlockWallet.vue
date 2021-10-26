<template>
  <UnlockWallet @unlocked="unlocked" />
</template>

<script>
import { mapActions } from 'vuex'
import UnlockWallet from './UnlockWallet'

export default {
  components: {
    UnlockWallet
  },
  data () {
    return {
      replied: false
    }
  },
  methods: {
    ...mapActions(['replyUnlockWallet']),
    unlocked () {
      this.reply(true)
    },
    async reply (unlocked) {
      const { id } = this.$route.query
      await this.replyUnlockWallet({ id, unlocked })

      this.replied = true

      window.close()
    }
  }
}
</script>
