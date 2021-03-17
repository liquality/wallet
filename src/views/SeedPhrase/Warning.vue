<template>
    <div class="wallet warning-phrase">
        <NavBar showMenu="true">
            <strong>Warning</strong>
        </NavBar>
        <div class="warning-phrase_warning-line"></div>
        <div class="warning-phrase_top-text">
            <h1>Show Seed Phrase?</h1>
            <h4>Anyone who has this seed phrase can steal your funds!</h4>
        </div>
        <div class="warning-phrase_eye-svg">
            <Eye />
        </div>
        <div class="warning-phrase_bottom-text">
            <h5>
                View it in private without cameras around
            </h5>
        </div>
        <div class="bottom-buttons-warning">
            <router-link to="/wallet"><button class="btn btn-outline-primary btn-lg width-button">Cancel</button></router-link>
            <router-link to="/seedLogin"><button class="btn btn-primary btn-lg width-button">I have privacy</button></router-link>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import NavBar from '@/components/NavBar.vue'
import Eye from '../../assets/icons/eye.svg'

export default {
  components: {
    NavBar,
    Eye
  },
  data () {
    return {
      loadingBalances: false
    }
  },
  async created () {
    this.loadingBalances = true
    try {
      await this.updateBalances({
        network: this.activeNetwork
      })
    } catch (error) {
      console.error(error)
    } finally {
      this.loadingBalances = false
    }
  },
  computed: {
    ...mapState(['activeNetwork'])
  },
  methods: {
    ...mapActions(['updateBalances'])
  }
}
</script>

<style lang="scss">

.warning-phrase {
  &_warning-line {
    display: flex;
    border: 3px solid #F12274;
  }
  &_top-text {
    display: flex;
    flex-direction: column;
    width: 90%;
    margin: 0 auto;
    margin-top: 3%;
    font-family: Montserrat;
    font-style: normal;
    font-weight: 600;
    font-size: 30px;
    line-height: 32px;
    text-align: center;
    letter-spacing: -0.08px;
    color: #000D35;
  }
  &_eye-svg {
    height: 150px;
    width: 150px;
    margin: 0 auto;
    margin-top: 20%;
  }
  &_bottom-text {
  width: 65%;
  margin: 0 auto;
    h5 {
        display: flex;
        text-align: center;
        margin: 0 auto;
        font-family: Montserrat;
        font-style: normal;
        font-weight: 600;
        font-size: 16px;
        line-height: 22px;
        text-align: center;
        letter-spacing: -0.08px;
        color: #000D35;
    }
  }
}
.bottom-buttons-warning {
  display: flex;
  justify-content: space-evenly;
  margin-top: 25%;
}
.width-button {
    width: 150px;
}

</style>
