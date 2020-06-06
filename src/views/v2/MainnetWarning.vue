<template>
  <div class="mainnet-warning wrapper form">
    <div class="wrapper_top">
      <h2 class="mt-2">Caution!</h2>
      <h3>You might lose your funds</h3>
      <Danger class="mt-4 mb-4" />
      <p>You are using experimental software. This version hasn’t been fully audited yet and you can lose your funds.</p>
    </div>
    <div class="wrapper_bottom">
      <button class="btn btn-primary btn-lg btn-block" @click="accept">I don’t care, let me do this</button>
      <button class="btn btn-light btn-outline-primary btn-lg btn-block" @click="$router.go(-1)">Back to safety</button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import Danger from '@/assets/icons/danger.svg'

export default {
  components: {
    Danger
  },
  methods: {
    ...mapActions(['changeActiveNetwork']),
    accept () {
      this.changeActiveNetwork({ network: 'mainnet' })
      this.$router.go(-1)
    }
  },
  props: {
    asset: String
  }
}
</script>

<style lang="scss">
.mainnet-warning {
  text-align: center;

  h2, h3 {
    color: $danger;
  }
}
</style>
