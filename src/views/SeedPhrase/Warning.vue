<template>
    <div class="wallet">
        <NavBar showMenu="true">
            <strong>Warning</strong>
        </NavBar>
        <div class="warning-line"></div>
        <div class="top-text">
            <h1>Show Seed Phrase?</h1>
            <h4>Anyone who has this seed phrase can steal your funds!</h4>
        </div>
        <div class="eye-svg">
            <Eye />
        </div>
        <div class="bottom-text">
            <h5>
                View it in private without cameras around
            </h5>
        </div>
        <div class="bottom-buttons">
            <button class="btn btn-primary btn-lg cancel-button">Cancel</button>
            <router-link to="/seedLogin"><button class="btn btn-primary btn-lg privacy-button">I have privacy</button></router-link>
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

.warning-line {
    position: absolute;
    left: -4.17%;
    right: 0%;
    top: 12.67%;
    bottom: 87.33%;

    border: 3px solid #F12274;
}

.top-text {
    position: absolute;
    width: 335px;
    height: 81px;
    left: 16px;
    top: 96px;

    font-family: Montserrat;
    font-style: normal;
    font-weight: 600;
    font-size: 30px;
    line-height: 32px;
    /* or 107% */

    text-align: center;
    letter-spacing: -0.08px;

    color: #000D35;
}
.eye-svg {
    height: 150px;
    width: 150px;
    margin: 0 auto;
    position: absolute;
    top: 45%;
    left: 30%;
}
.bottom-text {
    h5 {
        position: absolute;
        left: 20px;
        right: 20px;
        top: 449px;
        bottom: 81px;

        font-family: Montserrat;
        font-style: normal;
        font-weight: 600;
        font-size: 16px;
        line-height: 22px;
        /* or 137% */

        text-align: center;
        letter-spacing: -0.08px;

        color: #000D35;
    }
}
.privacy-button {
    position: absolute;
    width: 150px;
    left: 52.22%;
    right: 5.56%;
    top: 90.67%;
    bottom: 3.33%;
}
.cancel-button {
    position: absolute;
    width: 150px;
    left: 5.56%;
    right: 52.22%;
    top: 90.67%;
    bottom: 3.33%;
    background: #F8FAFF;
    border: 1px solid #9D4DFA;
    box-sizing: border-box;
    border-radius: 22px;
}

</style>
