<template>
    <div class="wallet warning-phrase">
        <NavBar showMenu="true">
          <strong>Warning</strong>
        </NavBar>
        <div class="warning-phrase_warning-line w-100"></div>
        <div class="mx-auto mt-2 px-2 mb-5 text-center">
          <h1 class="my-2" id="show_seed_phrase">{{title}}</h1>
          <h4 id="show_seed_phrase_warning">Anyone who has this can steal your funds!</h4>
        </div>
        <div class="warning-phrase_eye-svg mx-auto mt-4">
          <Eye />
        </div>
        <div class="mx-auto text-center">
          <h5 class="mx-auto px-5">
            View it in private without cameras around.
          </h5>
        </div>
        <div class="wrapper_bottom">
        <div class="button-group">
          <button @click="$router.back()" class="btn btn-outline-primary btn-lg width-button" id="show_seed_phrase_cancel_button">Cancel</button>
          <router-link :to="nextPath"><button class="btn btn-primary btn-lg width-button" id="i_have_privacy_button">I have privacy</button></router-link>
        </div>
        </div>
    </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import Eye from '../../../assets/icons/eye.svg'

export default {
  components: {
    NavBar,
    Eye
  },
  props: {
    title: {
      type: String,
      default: 'Show Seed Phrase?'
    },
    nextPath: {
      type: String,
      default: '/seedLogin'
    }
  }
}
</script>

<style lang="scss">

.warning-phrase {
  &_warning-line {
    height: 3px;
    background-color: $danger;
  }
  &_eye-svg {
    height: 150px;
    width: 150px;
  }
}

</style>
