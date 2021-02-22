<template>
  <div class="dropdown head-menu"
      v-click-away="hide">
    <button class="btn btn-icon dropdown-toggle"
            @click="toogle">
          <AccountIcon class="account-icon"/>
          <DropdownIcon class="chevron"
                        :class="{ open: dropdownOpen }"
          />
    </button>
    <ul class="dropdown-menu" :class="{ show: dropdownOpen }">
      <li>
          <button class="dropdown-item"
                  @click="navigate('#')">
              <div class="head-option">
                <CreateIcon class="create-icon" />
              </div>
              Create
          </button>
      </li>
      <li>
          <button class="dropdown-item"
                  @click="navigate('#')">
              <div class="head-option">
                <ImportIcon class="import-icon" />
              </div>
              Import
          </button>
      </li>
      <li>
          <button class="dropdown-item"
                  @click="navigate('/add-hardware-wallet')">
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
import DropdownIcon from '@/assets/icons/dropdown_arrow.svg'
import AccountIcon from '@/assets/icons/account_icon.svg'
import CreateIcon from '@/assets/icons/create_icon.svg'
import ImportIcon from '@/assets/icons/import_icon.svg'
import HardwareIcon from '@/assets/icons/hardware_icon.svg'

export default {
  components: {
    DropdownIcon,
    AccountIcon,
    CreateIcon,
    ImportIcon,
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
    toogle () {
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

      .account-icon {
        width: 14px !important;
        height: 15px !important;
        margin: 0 !important;
      }

      .chevron {
          width: 12px;
          margin: 0 0 0 8px !important;
          padding: 0 !important;

          &.open {
            transform: rotate(-180deg);
          }
      }
  }

  .dropdown-menu {
    position: absolute;
    left: -100px;
    width: 116px;
    top: 33px;
    height: auto;
    overflow: hidden;
    border-radius: 0;
    padding: 0;
    margin: 0;
    border: 1px solid #D9DFE5;
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
