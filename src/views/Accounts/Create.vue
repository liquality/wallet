<template>
<div class="account-container">
    <NavBar :showMenu="false" :showBack="false">
      <span class="account-title">
        Create Account
      </span>
    </NavBar>
    <div class="wrapper">
        Create account
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
