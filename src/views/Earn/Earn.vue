<template>
  <div class="view-container">
    <div class="send" v-if="currentStep === 'inputs'">
      <NavBar
        showBack="true"
        :backPath="routeSource === 'assets' ? '/wallet' : `/accounts/${account.id}/${asset}`"
        backLabel="Back"
      >
        Send
      </NavBar>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import NavBar from '@/components/NavBar'

export default {
  components: {
    NavBar
  },
  props: ['accountId'],
  ...mapGetters(['accountItem']),
  account() {
    return this.accountItem(this.accountId)
  }
}
</script>

<style lang="scss"></style>
