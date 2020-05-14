<template>
  <div id="app" class="mb-5">
    <NavBar v-if="!['/', '/open', '/create', '/backup'].includes($route.path)" />
    <router-view />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import NavBar from '@/views/v2/NavBar.vue'

export default {
  components: {
    NavBar
  },
  computed: {
    ...mapGetters(['agentUrls'])
  }
}
</script>

<style lang="scss">
#app {
  width: 375px;
  height: 694px;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 20px;
  margin: 20px auto;
  overflow: hidden;
}
</style>
