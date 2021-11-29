<template>
  <div>
    <div class="navbar">
      <router-link
        v-if="showBack"
        class="navbar_prev"
        id="previous_nav_bar"
        v-bind:to="backPath"
      >
        <div>
          <ChevronLeftIcon class="navbar_prev_icon" />
          {{ backLabel }}
        </div>
      </router-link>
      <a
        v-else-if="showBackButton"
        class="navbar_prev"
        href="#"
        @click="backClick"
      >
        <div>
          <ChevronLeftIcon class="navbar_prev_icon" />
          {{ backLabel }}
        </div>
      </a>
      <div class="navbar_title" id="overview">
        <slot></slot>
      </div>
      <div
        class="navbar_menu"
        id="burger_icon_menu"
        v-if="showMenu"
        @click.stop="showMenuList = !showMenuList"
      >
        <HamburgerIcon class="navbar_menu_icon" />
      </div>
      <ul
        class="menu_list navbar_menu_list"
        v-if="showMenuList"
        v-click-away="hideMenu"
      >
        <li id="manage_assets" @click="assets">
          <AssetsIcon />
          Manage Assets
        </li>
        <li
          id="manage_accounts"
          v-if="experiments.manageAccounts"
          @click="manageAccounts"
        >
          <AccountsIcon />
          Manage Accounts
        </li>
        <li
          id="export_privkey"
          v-if="$route.params.accountId"
          @click="exportPrivateKey"
        >
          <KeyIcon />
          Export Private Key
        </li>
        <li id="settings" @click="settings">
          <SettingsIcon />
          Settings
        </li>
        <li id="ledger" @click="ledger">
          <LedgerIcon />
          Ledger
        </li>
        <li id="backup_seed" @click="backup">
          <PaperIcon />
          Backup Seed
        </li>
        <li id="lock" @click="lock">
          <LockIcon class="lock_icon" />
          Lock
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import clickAway from '@/directives/clickAway'
import HamburgerIcon from '@/assets/icons/hamburger.svg'
import LockIcon from '@/assets/icons/lock.svg'
import PaperIcon from '@/assets/icons/paper.svg'
import ChevronLeftIcon from '@/assets/icons/chevron_left.svg'
import SettingsIcon from '@/assets/icons/settings.svg'
import AssetsIcon from '@/assets/icons/assets.svg'
import AccountsIcon from '@/assets/icons/accounts_menu_icon.svg'
import LedgerIcon from '@/assets/icons/ledger_menu_icon.svg'
import KeyIcon from '@/assets/icons/key.svg'

export default {
  directives: {
    clickAway
  },
  components: {
    ChevronLeftIcon,
    HamburgerIcon,
    LockIcon,
    PaperIcon,
    AssetsIcon,
    SettingsIcon,
    AccountsIcon,
    LedgerIcon,
    KeyIcon
  },
  props: [
    'showMenu',
    'showBack',
    'backPath',
    'backLabel',
    'showBackButton',
    'backClick'
  ],
  data () {
    return {
      showMenuList: false
    }
  },
  computed: {
    ...mapState(['experiments'])
  },
  methods: {
    ...mapActions(['lockWallet', 'trackAnalytics']),
    async lock () {
      this.trackAnalytics({
        event: 'HamburgerIcon',
        properties: {
          category: 'HamburgerIcon',
          action: 'Click on Lock'
        }
      })
      this.showMenuList = false
      await this.lockWallet()
      this.$router.replace('/open')
    },
    backup () {
      this.trackAnalytics({
        event: 'HamburgerIcon',
        properties: {
          category: 'HamburgerIcon',
          action: 'Click on Backup Seed'
        }
      })
      this.showMenuList = false
      this.$router.replace('/privacywarning')
    },
    assets () {
      this.trackAnalytics({
        event: 'HamburgerIcon',
        properties: {
          category: 'HamburgerIcon',
          action: 'Click on Manage Assets'
        }
      })
      this.showMenuList = false
      this.$router.replace('/settings/manage-assets')
    },
    settings () {
      this.trackAnalytics({
        event: 'HamburgerIcon',
        properties: {
          category: 'HamburgerIcon',
          action: 'Click on Settings'
        }
      })
      this.showMenuList = false
      this.$router.replace('/settings')
    },
    exportPrivateKey () {
      this.trackAnalytics({
        event: 'HamburgerIcon',
        properties: {
          category: 'HamburgerIcon',
          action: 'Click on Export Private Key'
        }
      })
      this.showMenuList = false
      const { accountId } = this.$route.params
      this.$router.push(`/export/${accountId}`)
    },
    manageAccounts () {
      this.trackAnalytics({
        event: 'HamburgerIcon',
        properties: {
          category: 'HamburgerIcon',
          action: 'Click on Manage Accounts'
        }
      })
      this.showMenuList = false
      this.$router.replace('/accounts/management')
    },
    ledger () {
      this.trackAnalytics({
        event: 'HamburgerIcon',
        properties: {
          category: 'HamburgerIcon',
          action: 'Click on Ledger'
        }
      })
      this.showMenuList = false
      this.$router.replace('/accounts/hardware-wallet')
    },
    hideMenu () {
      this.showMenuList = false
    }
  }
}
</script>

<style lang="scss">
.navbar {
  position: relative;
  height: 44px;
  padding: 0 !important;
  border-bottom: 1px solid $hr-border-color;

  &_title {
    width: 100%;
    text-align: center;
    font-weight: bold;
    text-transform: uppercase;
  }

  &_menu,
  &_prev {
    position: absolute;
    color: $color-text-muted;
    font-size: $font-size-sm;
    cursor: pointer;
  }

  &_menu {
    right: $wrapper-padding;
    &_icon {
      float: right;
      width: 18px;
    }
  }

  &_menu_list.menu_list {
    top: 44px;
    right: 0;
    left: auto;
    border-left: 1px solid $hr-border-color;
    border-top: 0 none;

    li {
      justify-content: start;
      padding: 7px $wrapper-padding;
    }

    svg {
      height: 18px;
      width: $wrapper-padding;
      object-fit: cover;
      margin-right: 10px;
    }

    .lock_icon {
      path {
        fill: $color-text-primary;
      }
    }
  }

  &_prev {
    left: $wrapper-padding;
    &_icon {
      width: 6px;
      margin-right: 7px;
      margin-top: 3px;
    }
  }
}
</style>
