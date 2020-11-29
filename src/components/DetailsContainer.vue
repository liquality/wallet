<template>
 <div class="details-container">
          <div class="details-header" @click.stop="showDetails = !showDetails">
            <ChevronDownIcon :class="showDetails ? '' : 'right'"/>
            &nbsp;  <slot name="header"></slot>
          </div>
          <ul class="details-list" v-if="showDetails">
             <slot name="content"></slot>
          </ul>
        </div>
</template>

<script>
import ChevronRightIcon from '@/assets/icons/chevron_right.svg'

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
  },
}
</script>

<style lang="scss">
.details-container {
  text-align: left;
  margin-bottom: 1rem;

  .details-header {
    cursor: pointer;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    align-content: space-between;
    font-size: $font-size-tiny;

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

  .details-list {
    list-style-type: none;
    background: #ffffff;
    border: none;
    padding: 0;

    li {
      display: flex;
      align-items: flex-start;
      justify-content: left;
      padding: 5px 20px;
      border: none;
      font-size: $font-size-tiny;
      label {
        font-weight: bold;
        float: left;
      }
    }
  }
}
</style>
