<template>
  <div class="accordion">
    <div class="accordion-header" @click="toggle">
      <slot name="header"></slot>
      <AngleRightIcon v-if="!show" />
      <AngleDownIcon alt="" v-if="show" />
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
  margin-bottom: 20px;
  background: #fafbfc;
  border-radius: 5px;
  padding: 1rem;

  &-header {
    font-weight: 600;
    // line-height: 40px;
    background: #fafbfc;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;

    img {
      display: block;
      width: 3% !important;
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
    // white-space: pre-wrap;
  }

  @media (min-width: 1025px) {
    max-width: 70%;
  }

  @media (max-width: 1024px) {
    img {
      display: block !important;
    }

    max-width: 100%;
  }
}
</style>
