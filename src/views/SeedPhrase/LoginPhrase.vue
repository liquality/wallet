<template>
    <div class="login-wrapper no-outer-pad">
        <div class="logo-wrap">
            <Logo />
        </div>
        <div class="middle-text">
            <h2>Sign in to See Seed Phrase</h2>
        </div>
        <div class="sign-in">
            <form class="form d-flex flex-column h-100" autocomplete="off" @submit.prevent="unlock">
                <div class="form-group">
                    <label for="password">Password</label>
                    <div class="input-group">
                    <input type="password" class="form-control" id="password" v-model="password" autocomplete="off" required :readonly="loading">
                    </div>
                    <p v-if="errors.length">
                    <b>Please correct the following error(s):</b>
                    <ul>
                        <li v-for="error in errors" :key="error">{{ error }}</li>
                    </ul>
                    </p>
                </div>
            </form>
        </div>
        <div class="privacy-check">
            <input type="checkbox" class="form-control" autocomplete="off" required>
            <h4>I have privacy and understand the risk</h4>
        </div>
        <div class="bottom-buttons">
            <router-link to="/wallet"><button class="btn btn-outline-primary btn-lg cancel-button">Cancel</button></router-link>
            <router-link to="/seedreveal"><button class="btn btn-primary btn-lg continue-button">Continue</button></router-link>
        </div>
    </div>
</template>

<script>

import { mapActions } from 'vuex'
import Logo from '../../assets/icons/logo_wallet.svg'

export default {
  components: {
    Logo
  },
  data () {
    return {
      loading: false,
      errors: [],
      password: null
    }
  },
   methods: {
    ...mapActions(['unlockWallet']),
    async unlock () {
      this.errors = []
      this.loading = true
      try {
        await this.unlockWallet({ key: this.password })
        this.$emit('unlocked')
      } catch (e) {
        console.log(e)
        this.errors.push(e.message)
      } finally {
        this.loading = false
      }
    }
  }
}

</script>

<style lang="scss">

.logo-wrap {
    height: 100px;
    width: 100px;
    margin: 0 auto;
    position: absolute;
    top: 12%;
    left: 37.5%;
}

.middle-text {
    h2 {
        position: absolute;
        width: 60%;
        height: 64px;
        left: 20%;
        top: 35%;

        font-family: Montserrat;
        font-style: normal;
        font-weight: normal;
        font-size: 28px;
        line-height: 32px;
        /* or 114% */

        display: flex;
        align-items: center;
        text-align: center;
        letter-spacing: -0.16px;

        color: #FFFFFF;
    }
}
.sign-in {
    width: 90%;
    margin: 0 auto;
    position: absolute;
    top: 50%;
    left: 5%;
}
.privacy-check {
    input {
    position: absolute;
    width: 13px;
    height: 13px;
    bottom: 13%;
    left: 9%;
    }
    h4 {
        position: absolute;
        left: 15%;
        right: 5.56%;
        bottom: 10.80%;

        font-family: Montserrat;
        font-style: normal;
        font-weight: 600;
        font-size: 14px;
        line-height: 24px;
        /* or 171% */

        display: flex;
        align-items: center;

        color: #FFFFFF;
    }
}
.continue-button {
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
