<template>

    <div class="login-wrapper confirm-seed h-100">
        <div class="confirm-seed_logo-wrap mx-auto mt-1">
            <img :src="logo"/>
        </div>
        <div class="confirm-seed_top">
            <h2>Confirm Seed Phrase</h2>
            <p class="px-3">Tap the 3 words matching their position in the seed phrase.  Once confirmed, store the phrase securely.</p>
        </div>
        <div class="confirm-seed_bottom">
            <div class="confirm-seed_bottom-top">
                <form class="form import-wallet_seed">
                    <div class="confirm-seed_inputs d-flex flex-row justify-content-evenly">
                        <div>
                            <label>1<sub>st</sub> Word</label>
                            <input type="text" class="form-control form-control-sm" autocomplete="off" required />
                        </div>
                        <div>
                            <label>5<sub>th</sub> Word</label>
                            <input type="text" class="form-control form-control-sm" autocomplete="off" required />
                        </div>
                        <div>
                            <label>12<sub>th</sub> Word</label>
                            <input type="text" class="form-control form-control-sm" autocomplete="off" required />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
</template>

<script>

import LogoWallet from '@/assets/icons/logo_wallet.svg?inline'

export default {
    computed: {
        logo () {
            return LogoWallet
        }
    }
}

</script>

<style lang="scss">
.confirm-seed {
  &_logo-wrap {
    height: 100px;
    width: 100px;
  }
  &_bottom {
      background: $color-text-secondary;
  }
  &_inputs {
      div {
          label {
              color: $color-text-primary;
          }
      }
  }
}
</style>