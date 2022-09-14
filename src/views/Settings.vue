<template>
  <div class="view-container">
    <NavBar showMenu="true" showBack="true" backPath="/wallet" :backLabel="$t('common.overview')">
      <span class="wallet_header">
        <strong>{{ $t('pages.settings.settings') }}</strong>
      </span>
    </NavBar>
    <div class="settings">
      <div class="setting-item" id="settings_item_default_wallet">
        <div class="setting-item_title flex-fill mb-2">
          {{ $t('pages.settings.title') }}
          <span class="setting-item_sub">
            {{ $t('pages.settings.description') }}
          </span>
        </div>
        <div class="setting-item_control" id="default_web3_wallet_toggle_button">
          <toggle-button
            :css-colors="true"
            :value="injectEthereum"
            @change="(e) => toggleInjectEthereum(e.value)"
          />
        </div>
      </div>
      <div class="setting-item" id="forgetAllDappsDone">
        <div class="setting-item_title flex-fill mb-2">
          {{ $t('pages.settings.dappConnections') }}
          <span class="setting-item_sub">{{ $t('pages.settings.dappConnectionsSub') }}</span>
        </div>
        <div class="setting-item_control">
          <button
            class="btn btn-outline-clear"
            id="forget_all_connections_button"
            @click="forgetAllDappConnections"
            v-tooltip="{
              trigger: 'manual',
              content: $t('pages.settings.done'),
              hideOnTargetClick: false,
              show: forgetAllDappsDone
            }"
          >
            {{ $t('pages.settings.forgetAllConnections') }}
          </button>
        </div>
      </div>
      <div class="setting-item" id="settings_item_default_wallet_analytics">
        <div class="setting-item_title flex-fill mb-2">
          {{ $t('pages.settings.analytics') }}
          <span class="setting-item_sub">
            {{ $t('pages.settings.analyticsSub') }}
          </span>
        </div>
        <div class="setting-item_control" id="analytics_toggle_button">
          <toggle-button
            :css-colors="true"
            :value="analyticsEnabled"
            @change="(e) => setAnalyticsEnable(e.value)"
          />
        </div>
      </div>
      <div class="setting-item">
        <div class="setting-item_title flex-fill mb-2">
          {{ $t('pages.settings.locale') }}
        </div>
        <div class="setting-item_control">
          <div class="dropdown-list" @click.stop="toogleChangeLocale">
            {{ currentLocaleLabel }}
            <ChevronUpIcon v-if="showChangeLocaleList" />
            <ChevronDownIcon v-else />
            <ul
              class="menu_list locale-options"
              v-if="showChangeLocaleList"
              v-click-away="hideChangeLocale"
            >
              <li
                v-for="locale in localeOptions"
                :key="locale.code"
                @click="onChangeLocale(locale.code)"
              >
                {{ locale.label }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="setting-item" id="settings_item_wallet_logs">
        <div class="setting-item_title flex-fill mb-2">
          {{ $t('pages.settings.walletLogs') }}
          <span class="setting-item_sub">
            {{ $t('pages.settings.walletLogsSub') }}
          </span>
        </div>
        <div class="setting-item_control">
          <button class="btn btn-outline-clear" id="download_logs_button" @click="downloadLogs">
            {{ $t('pages.settings.downloadLogs') }}
          </button>
        </div>
      </div>
      <div class="settings-footer">
        <div id="settings_app_version">
          <router-link to="/settings/experiments">
            <span class="text-muted"> {{ $t('pages.settings.version') }} {{ appVersion }} </span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { version } from '../../package.json'
import { getWalletStateLogs, downloadFile } from '@/utils/export'
import NavBar from '@/components/NavBar.vue'
import ChevronUpIcon from '@/assets/icons/chevron_up.svg'
import ChevronDownIcon from '@/assets/icons/chevron_down.svg'

export default {
  components: {
    NavBar,
    ChevronUpIcon,
    ChevronDownIcon
  },
  data: function () {
    return {
      forgetAllDappsDone: false,
      showChangeLocaleList: false
    }
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId', 'injectEthereum']),
    ...mapGetters(['analyticsEnabled']),
    appVersion() {
      return version
    },
    localeOptions() {
      return (this.locales?.filter((i) => i !== this.currentLocale) || [])
        .map((l) => ({
          code: l,
          label: this.$t(`common.localesLabels.${l}`)
        }))
        .sort((a, b) => {
          if (a.label < b.label) {
            return -1
          }
          if (a.label > b.label) {
            return 1
          }
          return 0
        })
    },
    currentLocaleLabel() {
      return this.$t(`common.localesLabels.${this.currentLocale}`)
    }
  },
  methods: {
    ...mapActions([
      'enableEthereumInjection',
      'disableEthereumInjection',
      'setAnalyticsResponse',
      'forgetDappConnections'
    ]),
    ...mapActions('app', ['initializeAnalytics', 'setLocalePreference', 'trackAnalytics']),
    toggleInjectEthereum(enable) {
      if (enable) {
        this.enableEthereumInjection()
      } else {
        this.disableEthereumInjection()
      }
    },
    async setAnalyticsEnable(enable) {
      await this.setAnalyticsResponse({ accepted: enable })
      if (enable) {
        await this.initializeAnalytics()
      }
      this.trackAnalytics({
        event: 'Analytics Updated',
        properties: {
          walletVersion: version,
          category: 'Settings',
          action: 'Analytics toggle button on/off',
          label: `${enable}`
        }
      })
    },
    async downloadLogs() {
      const logs = await getWalletStateLogs()
      downloadFile({
        filename: 'Liquality Wallet Logs.json',
        type: 'application/javascript;charset=utf-8;',
        content: logs
      })
      this.trackAnalytics({
        event: 'User Downloaded wallet logs',
        properties: {
          walletVersion: version,
          category: 'Settings',
          action: 'Wallet Logs Accessed'
        }
      })
    },
    async forgetAllDappConnections() {
      this.trackAnalytics({
        event: 'User clicked on Forgot all Dapp Connections under settings',
        properties: {
          walletVersion: version,
          category: 'Settings',
          action: 'Forgot all Dapp Connections'
        }
      })
      this.forgetAllDappsDone = false
      await this.forgetDappConnections()
      this.forgetAllDappsDone = true
      setTimeout(() => {
        this.forgetAllDappsDone = false
      }, 4000)
    },
    async onChangeLocale(locale) {
      await this.changeLocale(locale)
      await this.setLocalePreference({ locale })
      this.hideChangeLocale()
    },
    toogleChangeLocale() {
      this.showChangeLocaleList = !this.showChangeLocaleList
    },
    showChangeLocale() {
      this.showChangeLocaleList = true
    },
    hideChangeLocale() {
      this.showChangeLocaleList = false
    }
  },
  created() {
    this.forgetAllDappsDone = false
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
