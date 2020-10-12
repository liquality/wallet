import { mapActions } from 'vuex'

// TODO: remove when injection public
export default {
  data () {
    return {
      satmode: false,
      code: {}
    }
  },
  methods: {
    ...mapActions(['enableEthereumInjection']),
    keypress: function (e) {
      this.code[e.key] = e.type === 'keydown'
      if ('satoshi'.split('').every(c => this.code[c])) {
        this.enableEthereumInjection()
        this.satmode = true
        setTimeout(() => { this.satmode = false }, 3000)
      }
    }
  },
  created () {
    window.addEventListener('keydown', this.keypress)
    window.addEventListener('keyup', this.keypress)
  }
}
