<template>
  <div class="view-container">
    <NavBar
      showMenu="true"
      showBack="true"
      backPath="/settings"
      backLabel="Settings"
    >
      <span class="wallet_header"><strong>Experiments</strong></span>
    </NavBar>
    <div class="experiments">
      <div class="setting-item">
        <div class="setting-item_title flex-fill mb-2">
          Do Something Experimental
          <span class="setting-item_sub">
            Description of the setting.
          </span>
        </div>
        <div
          class="setting-item_control"
          id="default_web3_wallet_toggle_button"
        >
          <toggle-button
            :css-colors="true"
          />
        </div>
      </div>
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
.experiments {
  overflow-y: auto;

  .setting-item {
    border-bottom: 1px solid $hr-border-color;
    padding: 16px 20px;

    &_control {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    &_sub {
      display: block;
      font-size: $font-size-tiny;
      color: $text-muted;
    }
  }
}
</style>
