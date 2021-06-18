<template>
  <div class="wallet-tabs">
    <ul class="nav nav-tabs">
    <li class="nav-item">
      <router-link
        class="nav-link"
        id="asserts_tab"
        :to="{ name: 'WalletAssets' }"
      >
        Assets
      </router-link>
    </li>
    <li class="nav-item">
      <router-link
        class="nav-link"
        id="activity_tab"
        :to="{ name: 'WalletActivity' }"
      >
        Activity
      </router-link>
    </li>
  </ul>
   <div class="wallet-tab-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
}
</script>

<style lang="scss">
.wallet-tabs {
  margin: 0;
  padding: 0;
}
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
      font-weight: 500;
      text-transform: uppercase;
      color: #646f85;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none !important;
      border-bottom: 1px solid $hr-border-color !important;
      padding: 0 !important;
    }

    .nav-link:hover,
    .router-link-active {
      color: #000d35;
      font-weight: 600;
      border: none !important;
      border-bottom: 1px solid #1d1e21 !important;
    }
  }
}

.wallet-tab-content {
    a {
      color: $color-text-primary;
    }
    a:hover {
      text-decoration: none;
    }
  }
</style>
