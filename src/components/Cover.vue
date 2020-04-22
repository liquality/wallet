<template>
  <div class="cover">
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container">
        <router-link to="/" class="navbar-brand">{{appName}} <sup>{{network}}</sup></router-link>
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
import { isAppOrExtension, hostname, network } from '@/utils/network'

export default {
  props: {
    title: String,
    subtitle: String
  },
  computed: {
    network () {
      return network
    },
    appName () {
      if ((hostname && hostname.includes('liquality')) || isAppOrExtension) {
        return 'Liquality Wallet'
      }

      return 'My Crypto Wallet'
    }
  }
}
</script>
