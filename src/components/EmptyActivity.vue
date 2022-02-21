<template>
  <div class="empty-activity">
    <div>Once you start using your wallet you will see the activity here</div>
    <div v-show="activeNetwork === 'mainnet'" class="buy-crypto-container">
      <CartIcon />
      <BuyCryptoButton
        :btn-class="['btn-primary']"
        :asset="asset"
        :chain="chain"
        :address="address"
      />
    </div>
  </div>
</template>

<script>
import BuyCryptoButton from '@/components/BuyCrypto/BuyCryptoButton'
import CartIcon from '@/assets/icons/cart.svg'
export default {
  components: {
    BuyCryptoButton,
    CartIcon
  },
  props: ['asset', 'chain', 'address', 'activeNetwork']
}
</script>

<style lang="scss">
.empty-activity {
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  height: 100%;
}
.buy-crypto-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;

  svg {
    width: 75px;
  }

  button {
    width: 100%;
  }
}
</style>
