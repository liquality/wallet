<template>
  <div>
    <Cover title="Your keys, your coins" subtitle="Secure multi-crypto wallet with built-in Atomic Swaps!" />

    <div class="container" v-if="wallets">
      <div v-if="wallets.length > 0">
        <div class="row balance-box justify-content-center">
          <div class="col-md-4 col-sm-6 mb-4" v-for="wallet in wallets" :key="wallet.id">
            <div class="card card-up cursor-pointer">
              <div class="card-body">
                <h1 class="h4 text-center text-primary">{{wallet.name}}</h1>
                <h2 class="h6 text-center font-weight-normal text-muted mb-4" v-if="wallet.at" :title="new Date(wallet.at)">
                  <span v-if="wallet.imported">Imported</span>
                  <span v-else>Generated</span> {{distance(wallet.at)}} ago
                </h2>

                <router-link class="btn btn-primary btn-lg btn-block mt-4" :to="'/wallet/' + wallet.id">Unlock &rsaquo;</router-link>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-4 text-center font-weight-normal">
          <router-link to="/generate" class="mr-1">Generate a new wallet</router-link>
          &bull;
          <router-link to="/import" class="ml-1">Import an existing wallet</router-link>
        </div>
      </div>
      <div class="row justify-content-center" v-else>
        <div class="col-md-4 col-sm-6 mb-4">
          <div class="card card-up cursor-pointer">
            <div class="card-body">
              <h1 class="h4 text-center text-primary">Welcome!</h1>

              <router-link to="/generate" class="btn btn-primary btn-lg btn-block mt-4">Generate a new wallet &rsaquo;</router-link>
              <router-link to="/import" class="btn btn-link btn-block mt-2">Import an existing wallet &rsaquo;</router-link>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-2 text-center font-weight-normal">
        <router-link v-if="isTestnet" to="/wallet/demo" class="mr-1">Use demo wallet</router-link>
        <span v-if="isTestnet">&bull;</span>
        <a href="#" class="ml-1 cursor-pointer" @click="toggleNetwork">Toggle network</a>
      </div>
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
import { mapState, mapGetters } from 'vuex'
import { formatDistance } from 'date-fns'

import Cover from '@/components/Cover.vue'
import Pacman from '@/components/Pacman.vue'

export default {
  components: {
    Pacman,
    Cover
  },
  data () {
    return {
      unlockedWalletId: null,
      password: null,
      wallets: null
    }
  },
  computed: {
    ...mapState(['isTestnet']),
    ...mapGetters(['client'])
  },
  methods: {
    distance (ref) {
      return formatDistance(Date.now(), ref)
    },
    toggleNetwork () {
      this.$store.commit('TOGGLE_NETWORK')
    }
  },
  async created () {
    this.wallets = await this.client('wallet')('getListOfWallets')()
  }
}
</script>
