<template>
  <component :is="itemComponent"
             class="list-item-container"
             :class="[itemClass]"
             v-bind:to="to"
             @click="$emit('item-selected')">
        <div class="list-item d-flex align-items-center h-padding" :style="itemStyles">
          <div class="list-item-icon ml-0" v-if="hasSlot('icon')">
              <slot name="icon"></slot>
          </div>
          <div class="d-flex flex-column mr-auto justify-content-start">
            <div class="list-item-title">
              <slot></slot>
            </div>
            <div class="list-item-sub-title" v-if="hasSlot('sub-title')">
              <slot name="sub-title"></slot>
            </div>
          </div>
          <div class="d-flex flex-column justify-content-end"
               :class="{ 'list-item-detail-mr': !hasSlot('detail-icon') }">
            <div class="list-item-detail" v-if="hasSlot('detail')">
              <slot name="detail"></slot>
            </div>
            <div class="list-item-detail-sub" v-if="hasSlot('detail-sub')">
               <slot name="detail-sub"></slot>
            </div>
          </div>
          <div class="list-item-detail-icon" v-if="hasSlot('detail-icon')"
               :class="{ 'mr-0': !to }" >
              <slot name="detail-icon"></slot>
          </div>
          <ChevronRightIcon class="list-item-chevron" v-if="to"/>
        </div>
    </component>
</template>

<script>
import ChevronRightIcon from '@/assets/icons/chevron_right.svg'

export default {
  components: {
    ChevronRightIcon
  },
  props: ['to', 'itemClass', 'itemStyles'],
  methods: {
    hasSlot (name) {
      return this.$slots[name]
    }
  },
  computed: {
    itemComponent () {
      if (this.to) {
        return 'router-link'
      }

      return 'div'
    }
  }
}
</script>

<style lang="scss">
.list-item {
  width: 100%;
  border-bottom: 1px solid $hr-border-color;
  height: 60px;
  padding-top: 16px;
  padding-bottom: 16px;

  &:hover {
    cursor: pointer;
    text-decoration: none;
  }

  .list-item-detail,
  .list-item-detail-sub {
    text-align: right;

  }

  .list-item-detail-mr {
    margin-right: 12px;
  }

  .list-item-sub-title,
  .list-item-detail-sub {
      font-size: $font-size-tiny;
      color: $text-muted;
  }

  .list-item-icon {
    width: 28px;
    height: 28px;
    margin-right: 8px;
  }

   .list-item-detail-icon {
    width: 28px;
    height: 28px;
    margin-right: 12px;
    margin-left: 12px;
  }

  .list-item-chevron {
    width: 6px;
    margin-bottom: 2px;
  }
}
</style>
