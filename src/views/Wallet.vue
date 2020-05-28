<template>
  <div>
    <Cover :title="wallet.name || '...'">
      <div class="cover-element" v-if="wallet">
        <button class="btn btn-link text-white">Some action</button>
      </div>
    </Cover>
    <div class="container" v-if="wallet">
      <Wallet />
    </div>
    <div class="container" v-else>
      <div class="row justify-content-center">
        <div class="col-md-4 col-sm-6">
          <div class="card card-up">
            <div class="card-body d-flex justify-content-center align-items-center" style="min-height: 240px">
              <Pacman class="d-inline-block mr-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import Cover from '@/components/Cover.vue'
import Pacman from '@/components/Pacman.vue'
import Wallet from '@/components/Wallet.vue'

export default {
  components: {
    Pacman,
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
