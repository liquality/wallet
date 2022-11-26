<template>
  <div class="account-container">
    <NavBar :showMenu="false">
      <span class="account-title"> Wallet Connect </span>
    </NavBar>
    <div></div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar'

export default {
  components: {
    NavBar
  },
  data() {
    return {
      uri: null
    }
  },
  computed: {},
  methods: {},
  async created() {}
}
</script>

<style lang="scss"></style>
