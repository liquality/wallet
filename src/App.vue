<template>
  <div id="app">
    <NavBar v-if="!['/', '/open', '/create', '/backup'].includes($route.path)" />
    <router-view />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import Cover from '@/components/Cover.vue'
import Pacman from '@/components/Pacman.vue'

import NavBar from '@/views/v2/NavBar.vue'

export default {
  components: {
    NavBar
  }
}
</script>

<style lang="scss">
#app {
  width: 375px;
  height: 600px;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  overflow: hidden;
}
</style>
