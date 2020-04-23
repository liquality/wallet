<template>
  <div class="cover">
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

export default {
  props: {
    title: String,
    subtitle: String
  },
  computed: {
    ...mapState(['isTestnet']),
    network () {
      return this.isTestnet ? 'testnet' : 'mainnet'
    }
  }
}
</script>
