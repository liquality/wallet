<template></template>

<script>
import AnchorIcon from '@/assets/icons/anchor_earn_logo.png'

export default {
  props: ['accountId'],
  computed: {
    closeButton() {
      const span = document.createElement('span')
      span.className = 'getting-started-overlay-close-button'
      span.textContent = 'x'
      span.onclick = () => {
        console.log(this.$props)

        this.resetState()
      }
      return span
    },
    pageWrapper() {
      const div = document.createElement('div')
      div.className = 'getting-started-overlay'
      return div
    },
    header() {
      const header = document.createElement('h2')
      header.className = 'getting-started-overlay-header'
      header.textContent = 'Getting started with earning yields is easy.'
      return header
    },
    firstParagraph() {
      const p = document.createElement('p')
      p.className = 'getting-started-overlay-first-paragraph'
      p.textContent = 'All you need to do is deposit UST to your Liquality wallet.'
      return p
    },
    receive() {
      const wrapper = document.createElement('div')
      wrapper.className = 'getting-started-overlay-receive-wrapper'

      const icon = document.createElement('div')
      icon.className = 'getting-started-overlay-receive'

      icon.onclick = () => {
        this.$router.push(`/accounts/${this.accountId}/UST/receive`)
        this.resetState()
        this.$destroy()
      }

      const p = document.createElement('p')
      p.textContent = 'Receive'

      p.onclick = () => {
        this.$router.push(`/accounts/${this.accountId}/UST/receive`)
        this.resetState()
        this.$destroy()
      }

      wrapper.appendChild(icon)
      wrapper.appendChild(p)

      return wrapper
    },
    secondParagraph() {
      const p = document.createElement('p')
      p.className = 'getting-started-overlay-second-paragraph'
      p.textContent =
        'EARN with yield on Terra stablecoins. You can deposit and withdraw Terra stablecoins, track current deposit value, history of transactions, current deposit annualized percentage rate (APY), and amount of interest earned.'
      return p
    },
    buttons() {
      const buttonWrapper = document.createElement('div')
      buttonWrapper.className = 'getting-started-overlay-button-wrapper'

      const withdraw = document.createElement('p')

      withdraw.onclick = () => {
        this.resetState()
        this.$router.push(`/anchor/withdraw/${this.accountId}`)

        this.$destroy()
      }
      withdraw.textContent = 'Withdraw'

      const deposit = document.createElement('p')

      deposit.onclick = () => {
        this.$router.push(`/anchor/deposit/${this.accountId}`)
        this.resetState()
        this.$destroy()
      }
      deposit.textContent = 'Deposit'

      buttonWrapper.appendChild(withdraw)
      buttonWrapper.appendChild(deposit)

      return buttonWrapper
    },
    poweredBy() {
      const div = document.createElement('div')
      div.className = 'getting-started-overlay-powered-by'

      const span = document.createElement('span')
      span.textContent = 'powered by'

      const img = document.createElement('img')
      img.src = AnchorIcon

      div.appendChild(span)
      div.appendChild(img)

      return div
    }
  },
  mounted() {
    const app = document.getElementById('app')
    app.style.filter = 'brightness(0.5)'

    const body = document.getElementsByTagName('body')
    body[0].appendChild(this.pageWrapper)

    this.pageWrapper.appendChild(this.closeButton)
    this.pageWrapper.appendChild(this.header)
    this.pageWrapper.appendChild(this.firstParagraph)
    this.pageWrapper.appendChild(this.receive)
    this.pageWrapper.appendChild(this.secondParagraph)
    this.pageWrapper.appendChild(this.buttons)
    this.pageWrapper.appendChild(this.poweredBy)
  },
  methods: {
    resetState() {
      this.$emit('setGettingStarted')
      const app = document.getElementById('app')
      app.style.filter = 'brightness(1)'
      const body = document.getElementsByTagName('body')[0]
      body.removeChild(this.pageWrapper)
    }
  }
}
</script>

<style lang="scss">
.getting-started-overlay-close-button {
  position: absolute;
  top: -44px;
  right: 0;
  color: white;
  font-size: 32px;
  cursor: pointer;
}

.getting-started-overlay {
  padding: 20px;
  position: absolute;
  width: 315px;
  height: 523px;
  left: 24px;
  top: 48px;
  background: #ffffff;
  z-index: 999;
}

.getting-started-overlay-header {
  font-weight: 400;
  line-height: 34px;
  margin-bottom: 0;
}

.getting-started-overlay-first-paragraph {
  font-size: 16px;
  line-height: 26px;
  margin-top: 13px;
}

.getting-started-overlay-receive-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;

  p {
    font-weight: 600;
    font-size: 13px;
    color: #9d4dfa;
    margin-bottom: 0.3rem;
    cursor: pointer;
  }
}

.getting-started-overlay-receive {
  text-align: center;
  margin-bottom: 10px;
  width: 44px;
  height: 44px;
  background: #9d4dfa;
  border-radius: 52px;
  cursor: pointer;
  &::after {
    content: '\2193';
    display: block;
    color: white;
    font-size: 40px;
    text-align: center;
    position: relative;
    bottom: 11px;
  }
}

.getting-started-overlay-second-paragraph {
  font-weight: 400;
  font-size: 16px;
  line-height: 26px;
  margin-bottom: 0.5rem;
}

.getting-started-overlay-button-wrapper {
  display: flex;
  justify-content: space-between;
  p {
    border: 1px solid #9d4dfa;
    width: 127px;
    height: 36px;
    border-radius: 22px;
    color: #9d4dfa;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }
}

.getting-started-overlay-powered-by {
  display: flex;
  justify-content: center;

  span {
    font-size: 10px;
    font-weight: 300;
    color: #646f85;
    margin-right: 10px;
  }

  img {
    width: 117px;
    height: 18px;
  }
}
</style>
