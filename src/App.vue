<template>
  <div id="app" v-if="brokerReady">
    <NavBar v-if="unlockedAt" />
    <router-view />
  </div>
</template>

<script>
import { mapState } from 'vuex'

import NavBar from '@/views/v2/NavBar.vue'

export default {
  components: {
    NavBar
  },
  computed: mapState(['brokerReady', 'keyUpdatedAt', 'termsAcceptedAt', 'unlockedAt']),
  watch: {
    unlockedAt: function (unlocked) {
      if (unlocked) this.$router.replace('/wallet')
    }
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
