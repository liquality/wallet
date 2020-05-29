<template>
  <div>
    <Cover :title="wallet.name">
      <div class="cover-element" v-if="false">
        <button class="btn btn-link text-white">Some action</button>
      </div>
    </Cover>
    <div class="container">
      <Wallet />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import Cover from '@/components/Cover.vue'
import Wallet from '@/components/Wallet.vue'

export default {
  components: {
    Cover,
    Wallet
  },
  computed: {
    ...mapState(['wallets']),
    wallet () {
      return this.wallets.find(w => w.id === this.walletId)
    },
    walletId () {
      return this.$route.params.walletId
    }
  }
}
</script>
