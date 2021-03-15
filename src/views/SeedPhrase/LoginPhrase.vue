<template>
    <div class="login-wrapper">
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
    </div>
</template>

<script>

import Logo from "../../assets/icons/logo_icon.svg"
import { mapActions } from 'vuex'

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
}

</script>

<style lang="scss">

.logo-wrap {
    height: 100px;
    width: 100px;
    margin: 0 auto;
}

.middle-text {
    h2 {
        position: absolute;
        width: 50%;
        width: 360px;
        height: 64px;
        left: 0px;
        top: 200px;

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
    top: 55%;
    left: 5%;
}

</style>