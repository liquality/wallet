<template>
  <div class="view-container">
    <NavBar
      :showMenu="true"
      :showBack="true"
      backPath="/settings"
      :backLabel="$t('pages.settings.settings')"
    >
      <span class="wallet_header">
        <strong>
          {{ $t('pages.experiments.experiments') }}
        </strong>
      </span>
    </NavBar>
    <div class="experiments" id="experiments">
      <div class="setting-item">
        <div class="setting-item_title flex-fill mb-2">
          {{ $t('pages.experiments.errorReporting') }}
          <span class="setting-item_sub">
            {{ $t('pages.experiments.errorReportingDescription') }}
          </span>
        </div>
        <div class="setting-item_control">
          <toggle-button
            id="exp-reportErrors-toggle-switch"
            :css-colors="true"
            :value="experiments['reportErrors']"
            @change="toggleExperiment({ name: 'reportErrors' })"
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
      justify-content: flex-start;
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
