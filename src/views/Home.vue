<template>
  <div>
    <Cover title="Your keys, your coins" subtitle="Secure multi-crypto wallet with built-in Atomic Swaps!" />

    <div class="container">
      <div v-if="wallets.length > 0">
        <div class="row justify-content-center">
          <div class="col-md-4 col-sm-6 mb-4" v-for="wallet in wallets" :key="wallet.id">
            <div class="card card-up">
              <div class="card-body">
                <h1 class="h4 text-center text-primary">{{wallet.name}}</h1>
                <h2 class="h6 text-center font-weight-normal text-muted mb-4" v-if="wallet.at" :title="new Date(wallet.at)">
                  <span v-if="wallet.imported">Imported</span>
                  <span v-else>Generated</span> {{distance(wallet.at)}} ago
                </h2>

                <router-link class="btn btn-primary btn-lg btn-block mt-4" :to="'/wallet/' + wallet.id">Open &rsaquo;</router-link>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-4 text-center font-weight-normal">
          <router-link to="/generate" class="mx-1">Generate a new wallet</router-link>
          &bull;
          <router-link to="/import" class="mx-1">Import an existing wallet</router-link>
          &bull;
          <router-link to="/changePassword" class="mx-1">Change password</router-link>
        </div>
      </div>
      <div class="row justify-content-center" v-else>
        <div class="col-md-4 col-sm-6 mb-4">
          <div class="card card-up">
            <div class="card-body">
              <h1 class="h4 text-center text-primary">Welcome!</h1>

              <router-link to="/generate" class="btn btn-primary btn-lg btn-block mt-4">Generate a new wallet &rsaquo;</router-link>
              <router-link to="/import" class="btn btn-link btn-block mt-2">Import an existing wallet &rsaquo;</router-link>
              <router-link to="/changePassword" class="btn btn-link btn-block mt-2">Change password &rsaquo;</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { formatDistance } from 'date-fns'

import Cover from '@/components/Cover.vue'

export default {
  components: {
    Cover
  },
  computed: mapState(['wallets']),
  methods: {
    distance (ref) {
      return formatDistance(Date.now(), ref)
    },
    toggleNetwork () {
      this.$store.commit('TOGGLE_NETWORK')
    }
  }
}
</script>
