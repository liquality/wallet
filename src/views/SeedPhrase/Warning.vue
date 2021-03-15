<template>
    <div class="wallet">
        <NavBar showMenu="true">
            <strong>Warning</strong>
        </NavBar>
        <div class="warning-line"></div>
        <div class="top-text">
            <h1>Show Seed Phrase?</h1>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex' 
import NavBar from "@/components/NavBar.vue"

export default {
    components: {
        NavBar
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
                network: this.activeNetwork,
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
        left: 28px;
        top: 96px;
    h2 {

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
}

</style>