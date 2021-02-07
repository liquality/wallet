<template>
  <div class="dropdown head-menu"
      v-click-away="hide">
  <button class="btn btn-icon dropdown-toggle"
          @click="toogle">
  </button>
  <ul class="dropdown-menu" :class="{ show: dropdownOpen }">
    <li>
      <div class="dropdown-header">
          Accounts
      </div>
    </li>
    <li>
        <button class="dropdown-item"
                @click="navigate('#')">
            Create
        </button>
    </li>
    <li>
        <button class="dropdown-item"
                @click="navigate('#')">
            Import
        </button>
    </li>
    <li>
        <button class="dropdown-item"
                @click="navigate('/add-hardware-wallet')">
            Hardware
        </button>
    </li>
  </ul>
  </div>
</template>

<script>
import clickAway from '@/directives/clickAway'

export default {
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
    width: 20px !important;
    height: 20px;
    border-radius: 20px;
    background-color: #A8AEB7;
    border: 1px solid #1D1E21;
    padding: 0;

    &::after {
      display: none;
    }
  }

  .dropdown-menu {
    position: absolute;
    left: -150px;
    width: 180px;
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

      &:hover, &.active {
        background-color: #F0F7F9;
        color: $color-text-primary;
      }
    }
  }
}
</style>
