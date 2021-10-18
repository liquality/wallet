<template>
  <div class="export-account">
    <NavBar
      showBack="true"
      backLabel="Back"
      :backPath="backPath"
    >
      <span class="wallet_header">
        <strong>Export Private Key</strong>
      </span>
    </NavBar>
    <h1>hello world</h1>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'

export default {
  components: {
    NavBar
  },
  props: ['accountId', 'asset'],
  computed: {
    backPath () {
      const { accountId, asset } = this.$props
      return `/accounts/${accountId}/${asset}`
    }
  }
}
</script>

<style lang="scss">
.export-account {
  h1 {
    padding: 1em;
    text-align: center;
    color: $text-muted;
  }
}
</style>
