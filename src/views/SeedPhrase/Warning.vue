<template>
    <div class="wallet warning-phrase">
        <NavBar showMenu="true">
            <strong>Warning</strong>
        </NavBar>
        <div class="warning-phrase_warning-line"></div>
        <div class="warning-phrase_top-text mx-auto mt-2 px-2 mb-5">
            <h1>Show Seed Phrase?</h1>
            <h4>Anyone who has this seed phrase can steal your funds!</h4>
        </div>
        <div class="warning-phrase_eye-svg mx-auto mt-4">
            <Eye />
        </div>
        <div class="warning-phrase_bottom-text mx-auto">
            <h5 class="mx-auto px-5">
                View it in private without cameras around
            </h5>
        </div>
        <div class="wrapper_bottom">
        <div class="button-group">
            <router-link to="/wallet"><button class="btn btn-outline-primary btn-lg width-button">Cancel</button></router-link>
            <router-link to="/seedLogin"><button class="btn btn-primary btn-lg width-button">I have privacy</button></router-link>
        </div>
        </div>
    </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import Eye from '../../assets/icons/eye.svg'

export default {
  components: {
    NavBar,
    Eye
  }
}
</script>

<style lang="scss">

.warning-phrase {
  &_warning-line {
    border: 3px solid $danger;
  }
  &_top-text {
    font-style: normal;
    font-weight: 600;
    font-size: 30px;
    line-height: 32px;
    text-align: center;
    letter-spacing: -0.08px;
    color: $color-text-primary;
  }
  &_eye-svg {
    height: 150px;
    width: 150px;
  }
  &_bottom-text {
    text-align: center;
  }
}

</style>
