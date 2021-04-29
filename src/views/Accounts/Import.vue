<template>
<div class="account-container">
    <NavBar :showMenu="false" :showBack="false">
      <span class="account-title">Import Account</span>
    </NavBar>
    <div class="wrapper">
        Import account
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'

export default {
  components: {
    NavBar
  }
}
</script>

<style lang="scss">

</style>
