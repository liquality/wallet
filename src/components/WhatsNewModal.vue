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
      <span>
        <Clap :fill="hasClapped ? '#9d4dfa' : '#3D4767'" class="cursor-pointer" @click="clap()" />
        <span class="ml-2">
          <template v-if="loading">
            <SpinnerIcon class="btn-loading" />
          </template>
          <span v-else>{{ clapCount }}</span>
        </span>
      </span>
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
import Clap from './icons/Clap.vue'
import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import { doc, setDoc } from 'firebase/firestore'

console.log('🚀 ~ file: WhatsNewModal.vue ~ line 79 ~ signInAnonymously', signInAnonymously)
console.log('🚀 ~ file: WhatsNewModal.vue ~ line 79 ~ getAuth', getAuth)

const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
  measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENT_ID
}

// eslint-disable-next-line no-unused-vars
// const db = firebase.firestore()
// console.log('🚀 ~ file: WhatsNewModal.vue ~ line 102 ~ firestore', firebase)

export default {
  components: {
    Modal,
    ArrowRightIcon,
    ArrowLeftIcon,
    Logo,
    Clap,
    SpinnerIcon
  },
  data: function () {
    return {
      open: false,
      currentView: 1,
      hasClapped: false,
      loading: false,
      loadingContent: true,
      clapCount: 0,
      whatsNewModalContent: {}
    }
  },
  mounted() {
    initializeApp(firebaseConfig)
    const auth = getAuth()
    signInAnonymously(auth)
      .then(() => {
        console.log('signed in anonymously')
      })
      .catch((error) => {
        console.error(error)
      })
    // this.getClapCount()
  },
  computed: {
    ...mapState(['whatsNewModalVersion', 'termsAcceptedAt', 'unlockedAt']),
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
    },
    getClapCount() {
      this.loading = true
      db.collection('claps')
        .doc(this.appVersion)
        .get()
        .then((doc) => {
          if (doc.exists) {
            this.clapCount = doc.data().count
          } else {
            db.collection('claps').doc(this.appVersion).set({ count: 0 })
          }
        })
        .catch((error) => {
          console.error(error)
        })
        .finally(() => {
          this.loading = false
        })
    },
    clap() {
      if (this.hasClapped) {
        this.hasClapped = false
        this.clapCount > 0 ? this.clapCount-- : this.clapCount
        firebase.firestore().collection('claps').doc(this.appVersion).update({
          count: this.clapCount
        })
      } else {
        this.hasClapped = true
        this.clapCount++
        firebase.firestore().collection('claps').doc(this.appVersion).update({
          count: this.clapCount
        })
      }
    }
  },
  async created() {
    if (
      this.whatsNewModalVersion !== this.appVersion ||
      process.env.VUE_APP_SHOW_WHATS_NEW_ALWAYS
    ) {
      const locale = this.currentLocale || process.env.VUE_APP_DEFAULT_LOCALE
      const content = await import(`@/locales/${locale}/whats_new.json`)
      this.whatsNewModalContent = content.default
      this.loadingContent = false
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
