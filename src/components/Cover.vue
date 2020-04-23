<template>
  <div class="cover">
    <div class="text-center bg-warning mb-2 cursor-pointer" v-if="isPublicWeb">
      <div class="container py-2">
        <p class="mb-0 font-weight-normal"><strong>Heads up!</strong> Other extensions installed on your browser can access your private keys if wallet is accessed via a public URL. Install our Chrome extension or Desktop apps for a secure access.</p>
      </div>
    </div>
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container">
        <router-link to="/" class="navbar-brand">Liquality Wallet <sup>{{network}}</sup></router-link>
      </div>
    </nav>
    <div class="container text-center">
      <h1 class="display-4 text-white cover-element">{{title}}</h1>
      <h2 v-if="subtitle" class="h5 font-weight-light text-white cover-element">{{subtitle}}</h2>
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { isPublicWeb } from '@/utils/network'

export default {
  props: {
    title: String,
    subtitle: String
  },
  computed: {
    ...mapState(['isTestnet']),
    network () {
      return this.isTestnet ? 'testnet' : 'mainnet'
    },
    isPublicWeb () {
      return isPublicWeb
    }
  }
}
</script>
