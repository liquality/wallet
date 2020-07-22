<template>
  <div>
    <div class="head">
      <LogoIcon class="head_logo" />
      <div class="head_network" @click.stop="showNetworks = !showNetworks">
        {{activeNetwork}}
        <ChevronUpIcon v-if="showNetworks" />
        <ChevronDownIcon v-else />
      </div>
      <ul class="menu_list" v-if="showNetworks" v-click-away="hideNetworks">
        <li @click="switchNetwork('mainnet')">Mainnet</li>
        <li @click="switchNetwork('testnet')">Testnet</li>
      </ul>
    </div>
    <div class="navbar d-flex justify-content-between">
      <router-link to='/wallet' :style="{visibility: $route.name === 'Account' ? 'visible' : 'hidden'}">
        <div class="navbar_prev"><ChevronLeftIcon class="navbar_prev_icon" />Assets</div>
      </router-link>
      <div class="navbar_title">
        <span class="navbar_title_name">{{wallet.name}}</span>&nbsp;<span class="navbar_title_network text-muted">({{activeNetwork}})</span>
      </div>
      <div class="navbar_menu" @click.stop="showMenu = !showMenu"><HamburgerIcon class="navbar_menu_icon" /></div>
      <ul class="menu_list navbar_menu_list" v-if="showMenu" v-click-away="hideMenu">
        <li @click="backup"><PaperIcon /> Backup Seed</li>
        <li @click="lock"><LockIcon class="lock_icon"/> Lock</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

import clickAway from '@/directives/clickAway'
import HamburgerIcon from '@/assets/icons/hamburger.svg'
import LockIcon from '@/assets/icons/lock.svg'
import PaperIcon from '@/assets/icons/paper.svg'
import LogoIcon from '@/assets/icons/logo_icon.svg'
import ChevronLeftIcon from '@/assets/icons/chevron_left.svg'
import ChevronUpIcon from '@/assets/icons/chevron_up.svg'
import ChevronDownIcon from '@/assets/icons/chevron_down.svg'

export default {
  directives: {
    clickAway
  },
  components: {
    ChevronLeftIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    HamburgerIcon,
    LockIcon,
    PaperIcon,
    LogoIcon
  },
  data () {
    return {
      showMenu: false,
      showNetworks: false
    }
  },
  computed: {
    ...mapState(['wallets', 'activeWalletId', 'activeNetwork']),
    wallet: function () {
      return this.wallets.find(wallet => wallet.id === this.activeWalletId)
    }
  },
  methods: {
    ...mapActions(['lockWallet', 'changeActiveNetwork']),
    async lock () {
      this.showMenu = false
      await this.lockWallet()
      this.$router.replace('/open')
    },
    backup () {
      this.showMenu = false
      this.$router.replace('/backup')
    },
    hideMenu () {
      this.showMenu = false
    },
    hideNetworks () {
      this.showNetworks = false
    },
    switchNetwork (network) {
      this.showNetworks = false
      this.changeActiveNetwork({ network })
    }
  }
}
</script>

<style lang="scss">

.menu_list {
  position: absolute;
  z-index: 3;
  top: 35px;
  right: 0;
  left: 0;
  list-style-type: none;
  background: #ffffff;
  border: {
    top: 1px solid $hr-border-color;
    bottom: 1px solid $hr-border-color;
  }
  padding: 0;

  li {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px 20px;
    border-bottom: 1px solid $hr-border-color;
    cursor: pointer;
    font-size: $font-size-tiny;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: #F0F7F9;
    }
  }
  }

.head {
  position: relative;
  height: 36px;
  border-bottom: 1px solid $hr-border-color;

  &_logo {
    position: absolute;
    top: 10px;
    left: 20px;
    height: 12px;
  }

  &_network {
    width: 200px;
    height: 100%;
    margin: 0 auto;
    display: flex;
    font-size: $font-size-tiny;
    justify-content: center;
    align-items: center;
    text-transform: capitalize;
    cursor: pointer;

    svg {
      height: 6px;
      margin-left: 4px;
    }
  }
}

.navbar {
  position: relative;
  height: 52px;
  padding: 17px;
  border-bottom: 1px solid $hr-border-color;

  &_title {
    &_name {
      font-weight: $headings-font-weight;
    }
  }
  &_menu, &_prev {
    color: $color-text-muted;
    font-size: $font-size-sm;
    cursor: pointer;
  }

  &_menu {
    &_icon {
      margin-left: 22px;
      margin-top: 2px;
      width: 18px;
    }
  }

  &_menu_list {
    top: 51px;
    right: 0;
    left: auto;

    li {
      justify-content: start;
      padding: 7px 20px;
    }

    svg {
      height: 18px;
      width: 20px;
      object-fit: cover;
      margin-right: 6px;
    }

    .lock_icon {
      path {
        fill: $color-text-primary;
      }
    }
  }

  &_prev {
    &_icon {
      margin-right: 7px;
      margin-top: 3px;
    }
  }
}
</style>
