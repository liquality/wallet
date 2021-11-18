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
    <div class="experiments" id="experiments">
      <div class="setting-item">
        <div class="setting-item_title flex-fill mb-2">
          Multi-Accounts
          <span class="setting-item_sub">
            Allow account management and multiple accounts per network
          </span>
        </div>
        <div
          class="setting-item_control"
        >
          <toggle-button
            id="exp-manageAccounts-toggle-switch"
            :css-colors="true"
            :value="experiments['manageAccounts']"
            @change="toggleExperiment({ name: 'manageAccounts'})"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import { mapState, mapActions } from 'vuex'

export default {
  components: {
    NavBar
  },
  computed: {
    ...mapState(['experiments'])
  },
  methods: {
    ...mapActions(['toggleExperiment'])
  }
}
</script>

<style lang="scss">
.experiments {
  overflow-y: auto;
  flex: 1;

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
