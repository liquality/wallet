<template>
 <div class="details-container">
          <div class="details-header" id="details_header_chevron_down_icon" @click.stop="showDetails = !showDetails">
            <ChevronDownIcon :class="showDetails ? '' : 'right'"/>
            &nbsp;  <slot name="header"></slot>
          </div>
          <div class="details-content" v-if="showDetails">
            <slot name="content"></slot>
          </div>
        </div>
</template>

<script>
import ChevronDownIcon from '@/assets/icons/chevron_down.svg'

export default {
  components: {
    ChevronDownIcon
  },
  props: ['open'],
  methods: {
    mounted () {
      this.showDetails = this.open || false
    }
  },
  data () {
    return {
      showDetails: false
    }
  }
}
</script>

<style lang="scss">
.details-container {
  text-align: left;
  margin-bottom: 25px;

  .details-header {
    cursor: pointer;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    align-content: space-between;
    font-size: $font-size-tiny;
    line-height: $font-size-tiny;

    svg {
      height: 5px;
      margin-right: 10px;
    }

    svg.right {
      transform: rotate(-90deg);
    }

    .details-title {
      font-weight: bold;
      text-transform: uppercase;
      padding-right: 0.5em;
    }
  }

  .details-content {
    padding: 0;
    font-size: $font-size-tiny;
    ul {
    list-style-type: none;
    background: #ffffff;
    border: none;
    padding: 0;

      li {
        display: flex;
        align-items: center;
        justify-content: left;
        border: none;
        padding-left: 20px;

        label {
          float: left;
        }
      }
    }

    ul.selectors {
      li {
        padding-top: 10px;
      }
    }

    ul.items {
      li {
        padding-top: 5px;
      }
    }
  }
}
</style>
