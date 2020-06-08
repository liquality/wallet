<template>
  <div class="navbar d-flex justify-content-between">
    <div class="navbar_prev" @click="$router.go(-1)"><ChevronLeftIcon class="navbar_prev_icon" />Back</div>
    <div class="navbar_title">
      <span class="navbar_title_name">{{wallet.name}}</span>&nbsp;<span class="navbar_title_network text-muted">({{activeNetwork}})</span>
    </div>
    <div class="navbar_menu" @click="showMenu = !showMenu"><HamburgerIcon class="navbar_menu_icon" /></div>
    <ul class="navbar_menu_list" v-if="showMenu">
      <li @click="switchNetwork">Switch to {{inactiveNetwork}}</li>
      <li @click="backup"><PaperIcon /> Backup</li>
      <li @click="lock"><LockIcon class="lock_icon"/> Lock</li>
    </ul>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

import HamburgerIcon from '@/assets/icons/hamburger.svg'
import ChevronLeftIcon from '@/assets/icons/chevron_left.svg'
import LockIcon from '@/assets/icons/lock.svg'
import PaperIcon from '@/assets/icons/paper.svg'

export default {
  components: {
    HamburgerIcon,
    ChevronLeftIcon,
    LockIcon,
    PaperIcon
  },
  data () {
    return { showMenu: false }
  },
  computed: {
    ...mapState(['wallets', 'activeWalletId', 'activeNetwork']),
    wallet: function () {
      return this.wallets.find(wallet => wallet.id === this.activeWalletId)
    },
    inactiveNetwork: function () {
      return this.activeNetwork === 'mainnet' ? 'testnet' : 'mainnet'
    }
  },
  methods: {
    ...mapActions(['lockWallet', 'changeActiveNetwork']),
    switchNetwork () {
      this.showMenu = false
      if (this.inactiveNetwork === 'mainnet') {
        this.$router.push('/wallet/warning')
      } else this.changeActiveNetwork({ network: 'testnet' })
    },
    async lock () {
      this.showMenu = false
      await this.lockWallet()
      this.$router.replace('/open')
    },
    backup () {
      this.showMenu = false
      this.$router.replace('/backup')
    }
  }
}
</script>

<style lang="scss">
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
      margin-top: 4px;
      width: 18px;
    }
  }

  &_menu_list {
    position: absolute;
    z-index: 3;
    top: 51px;
    right: 0;
    list-style-type: none;
    background: #ffffff;
    border: 1px solid $hr-border-color;
    padding: 0;

    li {
      display: flex;
      align-items: center;
      padding: 7px 20px;
      border-bottom: 1px solid $hr-border-color;
      cursor: pointer;

      &:last-child {
        border-bottom: none;
      }
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
