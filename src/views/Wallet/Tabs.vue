<template>
  <ul class="nav nav-tabs">
    <li class="nav-item">
      <router-link
        class="nav-link"
        :to="{ name: 'WalletAssets' }"
      >
        Assets
      </router-link>
    </li>
    <li class="nav-item">
      <router-link
        class="nav-link"
        :to="{ name: 'WalletActivity' }"
      >
        Activity
      </router-link>
    </li>
  </ul>
</template>

<script>
export default {
}
</script>

<style lang="scss">
.nav-tabs {
  height: 48px;
  border-bottom: none !important;

  .nav-item {
    width: 50%;
    height: 100%;
    margin-bottom: none !important;

    .nav-link {
      height: 100%;
      font-size: $font-size-sm;
      text-transform: uppercase;
      color: #646f85;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none !important;
      border-bottom: 1px solid #d9dfe5 !important;
      padding: 0 !important;
    }

    .nav-link:hover,
    .router-link-active {
      color: #000d35;
      border: none !important;
      border-bottom: 1px solid #1d1e21 !important;
    }
  }
}
</style>
