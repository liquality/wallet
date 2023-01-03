<template>
  <div class="view-container">
    <NavBar showMenu="true" showBack="true" :backPath="backPath" :backLabel="$t(navDisplayText)">
      <span class="wallet_header">
        <strong>{{ $t('pages.settings.settings') }}</strong>
      </span>
    </NavBar>
    <div class="settings">
      <transition name="fade" mode="out-in">
        <router-view></router-view>
      </transition>
      <SettingsFooter v-if="showFooter" />
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import SettingsFooter from '@/views/SettingsFooter.vue'

export default {
  components: {
    NavBar,
    SettingsFooter
  },
  computed: {
    currentRouteName() {
      return this.$route.name
    },
    showFooter() {
      return this.currentRouteName === 'AllSettings'
    },
    backPath() {
      return this.currentRouteName === 'AllSettings' ? '/wallet' : '/settings'
    },
    navDisplayText() {
      return this.currentRouteName === 'AllSettings' ? 'common.overview' : 'common.settings'
    }
  }
}
</script>

<style lang="scss">
.settings {
  overflow-y: auto;

  .setting-item {
    border-bottom: 1px solid $hr-border-color;
    padding: 16px 20px;
    position: relative;

    &_title {
      font-weight: 600;
      font-size: 12px;
      line-height: 14px;
      color: #000d35;
    }

    &_control {
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }

    &_sub {
      display: block;
      font-size: $font-size-tiny;
      color: $text-muted;
      font-weight: 300;
      line-height: 18px;
    }
  }

  .settings-footer {
    margin-top: 20px;
    margin-bottom: 20px;
    text-align: center;
  }

  .locale-options {
    min-width: 180px;
    border: 1px solid #d9dfe5;
    li {
      justify-content: flex-start;
    }
  }
}
</style>
