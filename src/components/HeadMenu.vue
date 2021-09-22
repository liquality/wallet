<template>
  <div id="account" class="dropdown head-menu"
      v-click-away="hide">
    <button class="btn dropdown-toggle"
            @click="toggle">
          <div class="label-menu">Account</div>
          <ChevronRightIcon class="chevron"
                        :class="{ open: dropdownOpen }"
          />
    </button>
    <ul class="dropdown-menu" :class="{ show: dropdownOpen }">
      <li>
          <button class="dropdown-item"
                  @click="navigate('/accounts/hardware-wallet')">
              <div class="head-option">
                <HardwareIcon class="hardware-icon" />
              </div>
              Hardware
          </button>
      </li>
    </ul>
  </div>
</template>

<script>
import clickAway from '@/directives/clickAway'
import ChevronRightIcon from '@/assets/icons/chevron_right_gray.svg'
import HardwareIcon from '@/assets/icons/hardware_icon.svg'

export default {
  components: {
    ChevronRightIcon,
    HardwareIcon
  },
  directives: {
    clickAway
  },
  data () {
    return {
      dropdownOpen: false
    }
  },
  methods: {
    toggle () {
      this.dropdownOpen = !this.dropdownOpen
    },
    hide () {
      this.dropdownOpen = false
    },
    navigate (path) {
      this.hide()
      this.$router.push(path)
    }
  }
}
</script>

<style lang="scss">
.head-menu {
    .dropdown-toggle {
      padding-left: 0 !important;
      padding-right: 0 !important;
      display: flex;
      align-items: center;

      &::after {
        display: none;
      }

      .label-menu {
        font-weight: 300;
        font-size: 12px;
        line-height: 14px;
        display: flex;
        align-items: center;
        text-align: right;
        color: #646F85;
      }

      .chevron {
          width: 5px;
          margin: 0 0 0 8px !important;
          padding: 0 !important;
          vertical-align: middle;
          transform: rotate(90deg);

          &.open {
            transform: rotate(-90deg);
          }
      }
  }

  .dropdown-menu {
    position: absolute;
    left: -61px;
    width: 116px;
    top: 33px;
    height: auto;
    overflow: hidden;
    border-radius: 0;
    padding: 0;
    margin: 0;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);

    .dropdown-header {
      text-align: center;
      text-transform: uppercase;
      padding: 5px 15px;
    }

    .dropdown-item {
      text-transform: uppercase;
      padding: 5px 15px;
      height: 30px;
      border-left: 1px solid $hr-border-color;;
      border-right: 1px solid $hr-border-color;
      border-bottom: 1px solid $hr-border-color;
      display: flex;
      align-items: center;

      &:hover, &.active {
        background-color: #F0F7F9;
        color: $color-text-primary;
      }

      .head-option {
        margin-right: 7px;
        display: flex;
        align-items: center;
        justify-content: center;

        width: 22px;
        height: 15px;
        .create-icon {
          width: 15px;
        }

        .import-icon {
          width: 15px;
        }

        .hardware-icon {
          width: 20px;
        }
      }
    }
  }
}
</style>
