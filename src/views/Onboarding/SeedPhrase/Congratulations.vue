<template>
    <div class="login-wrapper congrats-seed no-outer-pad">
        <div class="congrats-seed_confetti-wrapper">
          <div v-for="n in 150" :key="n" :class="`confetti-${n}`"></div>
        </div>
        <div class="congrats-seed_top">
            <h1 class="mb-3">Congrats!</h1>
            <CompletedIcon class="congrats-seed_icon" />
        </div>
    </div>
</template>

<script>

import CompletedIcon from '@/assets/icons/checkmark-large.svg'

export default {
  components: {
    CompletedIcon
  }
}

</script>

<style lang="scss">

.congrats-seed {
  padding: 0 !important;
  overflow: hidden;
  &_top {
    z-index: 2;
    position: absolute;
    top: 178px;
    left: 112px;
      h1 {
          color: $color-text-secondary;
      }
  }
  &_icon {
    height: 100px;
    width: 100px;
  }
  &_confetti-wrapper {
    position: relative;
    min-height: 100vh;
  }
}

[class|="confetti"] {
  position: absolute;
}

$colors: (#9D4DFA, #1CE5C3, #F12274);

@for $i from 0 through 150 {
  $w: random(8);
  $l: random(100);
  .confetti-#{$i} {
    width: #{$w}px;
    height: #{$w*0.4}px;
    background-color: nth($colors, random(3));
    top: -10%;
    left: unquote($l+"%");
    opacity: random() + 0.5;
    transform: rotate(#{random()*360}deg);
    animation: drop-#{$i} unquote(2+random()+"s") unquote(random()+"s") infinite;
  }

  @keyframes drop-#{$i} {
    100% {
      top: 110%;
      left: unquote($l+random(15)+"%");
    }
  }
}
</style>
