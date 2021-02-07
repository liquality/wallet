<template>
  <div class="add-hardware-wallet">
    <NavBar :showMenu="false">
      <span class="header">
        <strong>Add Hardware Wallet</strong>
      </span>
    </NavBar>
    <div class="wrapper" v-if="currentStep === 'connect'">
      <div class="wrapper_top">
      wrapper_top
      </div>
       <div class="wrapper_bottom">
        wrapper_bottom
      </div>
    </div>
    <div class="wrapper" v-else>
      <div class="wrapper_top">
      wrapper_top
      </div>
       <div class="wrapper_bottom">
        wrapper_bottom
      </div>
    </div>
  </div>
</template>

<script>

import NavBar from '@/components/NavBar.vue'

export default {
  components: {
    NavBar
  },
  data () {
    return {
      currentStep: 'connnect'
    }
  },
  computed: {
  }
}
</script>

<style lang="scss" scoped>
.add-hardware-wallet {
  display: flex;
  flex-direction: column;

    .header {
        font-weight: normal;
        text-transform: uppercase;
    }

    .step {

    }

}
</style>
