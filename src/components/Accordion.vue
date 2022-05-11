<template>
  <div class="accordion">
    <div class="accordion-header" @click="toggle">
      <AngleRightIcon v-if="!show" />
      <AngleDownIcon alt="" v-if="show" />
      <slot name="header"></slot>
    </div>
    <transition
      name="accordion"
      @before-enter="beforeEnter"
      @enter="enter"
      @before-leave="beforeLeave"
      @leave="leave"
    >
      <div class="accordion-body" v-show="show">
        <div class="accordion-body-inner">
          <slot></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import AngleRightIcon from '@/assets/icons/angle_right.svg'
import AngleDownIcon from '@/assets/icons/angle_down.svg'

export default {
  data: () => {
    return {
      show: false
    }
  },
  components: {
    AngleRightIcon,
    AngleDownIcon
  },
  methods: {
    toggle() {
      this.show = !this.show
    },
    // enter: function(el, done) {
    //   $(el).slideDown(150, done);
    // },
    // leave: function(el, done) {
    //   $(el).slideUp(150, done);
    // },
    beforeEnter(el) {
      el.style.height = '0'
    },
    enter(el) {
      el.style.height = el.scrollHeight + 'px'
    },
    beforeLeave(el) {
      el.style.height = el.scrollHeight + 'px'
    },
    leave(el) {
      el.style.height = '0'
    }
  }
}
</script>

<style lang="scss">
.accordion {
  margin: 16px 0;

  &-header {
    cursor: pointer;
    display: flex;
    align-items: center;

    h3 {
      font-size: initial;
      margin-bottom: 0;
    }

    svg {
      width: 10px;
      height: 10px;
      cursor: pointer;
      margin-right: 10px;
    }
  }

  &-body {
    overflow: hidden;
    background: #fafbfc;
    border-top: 0;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    transition: 150ms ease-out;
    padding-top: 1rem;
    p {
      text-align: justify;
    }
  }

  &-body-inner {
    padding: 0;
    overflow-wrap: break-word;
  }
}
</style>
