<template>
 <div class="details-container">
          <div class="details-header" @click.stop="showDetails = !showDetails">
            <ChevronDownIcon v-if="showDetails"/>
            <ChevronUpIcon v-else/>
            &nbsp;  <slot name="header"></slot>
          </div>
          <ul class="details-list" v-if="showDetails">
             <slot name="content"></slot>
          </ul>
        </div>
</template>

<script>
import ChevronUpIcon from '@/assets/icons/chevron_up.svg'
import ChevronDownIcon from '@/assets/icons/chevron_down.svg'

export default {
   components: {
    ChevronUpIcon,
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
    justify-content: left;
    font-size: $font-size-tiny;
  }
  .details-list {
    list-style-type: none;
    background: #ffffff;
    border: none;
    padding: 0;
    li {
      display: flex;
      align-items: flex-start;
      justify-content: flex-start;
      padding: 5px 20px;
      border: none;
      font-size: $font-size-tiny;
      label {
        font-weight: bold;
        float: left;
      }
    }
  }
  svg {
    height: 6px;
    margin-right: 4px;
  }
}
</style>
