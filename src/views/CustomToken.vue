<template>
  <div>
    <NavBar showMenu="true" showBack="true" backPath="/settings/manage-assets" backLabel="Back">
      <span class="wallet_header"><strong>Add Custom Token</strong></span>
    </NavBar>
    <div class="wrapper text-center">
      <h3>Coming Soon</h3>
      <router-link to="/settings/manage-assets"><button class="btn btn-primary">Back</button></router-link>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar'

export default {
  components: {
    NavBar
  }
}
</script>
