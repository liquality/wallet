<template>
  <Modal
    v-if="open"
    @close="close"
    body-class=""
    type="modal-lg"
    isFullHeight
    :closeId="'wats_new_close_btn'"
  >
    <template #header>
      <Logo />
    </template>
    <h6 class="modal-header mt-4 text-uppercase">
      {{ $t('components.whatsNew.title') }} &#124; v {{ appVersion }}
    </h6>
    <template>
      <div v-for="item in whatsNewModalContent" :key="item.page">
        <div v-if="item.page == currentView">
          <h2 class="page-title">{{ item.title }}</h2>
          <p v-if="item.description" class="mt-3" v-html="item.description"></p>
          <ul v-if="item.content">
            <li v-for="(listItem, index) in item.content" v-html="listItem" :key="index"></li>
          </ul>
        </div>
      </div>
    </template>
    <template #footer v-if="whatsNewModalContent.length > 1">
      <div class="footer">
        <div class="carousel">
          <span
            v-for="(line, index) in carouselLines"
            :key="line"
            class="carousel-line"
            :class="index + 1 == currentView ? 'active' : ''"
            @click="currentView = index + 1"
          ></span>
        </div>
        <div class="footer-buttons">
          <button
            class="icon-wrapper"
            :class="currentView === whatsNewModalContent.length ? 'active' : ''"
            @click="currentView -= 1"
            :disabled="currentView === 1"
          >
            <ArrowLeftIcon />
          </button>
          <button
            class="icon-wrapper"
            :class="currentView < whatsNewModalContent.length ? 'active' : ''"
            @click="currentView += 1"
            :disabled="currentView === whatsNewModalContent.length"
          >
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </template>
  </Modal>
</template>
<script>
import Modal from '@/components/Modal'
import Logo from '@/components/icons/Logo'
import { version } from '/package.json'
import { mapActions, mapState } from 'vuex'
import ArrowLeftIcon from '@/assets/icons/arrow_left.svg'
import ArrowRightIcon from '@/assets/icons/arrow_right.svg'

export default {
  components: {
    Modal,
    ArrowRightIcon,
    ArrowLeftIcon,
    Logo
  },
  data: function () {
    return {
      open: false,
      currentView: 1,
      hasClapped: false,
      loading: false
    }
  },
  computed: {
    ...mapState(['whatsNewModalVersion', 'termsAcceptedAt', 'unlockedAt']),
    ...mapState('app', ['whatsNewModalContent']),
    appVersion() {
      return version
    },

    carouselLines() {
      return this.whatsNewModalContent.length
    }
  },
  methods: {
    ...mapActions(['setWhatsNewModalVersion']),
    close() {
      this.open = false
    }
  },
  created() {
    if (
      this.whatsNewModalVersion !== this.appVersion ||
      process.env.VUE_APP_SHOW_WHATS_NEW_ALWAYS
    ) {
      this.open = true
      this.setWhatsNewModalVersion({ version: this.appVersion })
    }
  }
}
</script>

<style lang="scss" scoped>
p,
li {
  font-size: 13px;
  line-height: 19px;
}

ul {
  padding-inline-start: 0;
  margin-block-start: 0;
  margin-block-end: 0;
  padding: 12px;
}

.header {
  display: flex;
  width: 100%;
  align-items: center;
}
.modal-header {
  font-weight: 600;
  font-size: 12px;
  line-height: 22px;
  letter-spacing: 0.92px;
  color: $color-text-grey;
  padding-left: 0 !important;
}
.page-title {
  font-weight: 600;
  font-size: 32px;
  line-height: 36px;
  letter-spacing: 1px;
  color: $color-text-grey;
}
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px;

  .carousel {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    width: 100%;
    gap: 3px;

    &-line {
      width: 100%;
      height: 0px;
      border: 1px solid #bfc3c7;
      cursor: pointer;

      &.active {
        border: 1px solid #7700d5;
      }
    }
  }
  .footer-buttons {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 20px;
    width: 100%;

    .icon-wrapper {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1px solid $color-text-grey;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      &.active {
        background: #9742fb;
        border: 1px solid #9742fb;

        svg {
          > path {
            fill: #fff;
          }
        }
      }
    }
  }
}
</style>
