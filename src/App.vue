<template>
  <div id="app">
    <div class="cover">
      <nav class="navbar navbar-expand-lg navbar-dark mb-3">
        <div class="container">
          <router-link class="navbar-brand" to="/">p2p Exchange <sup>testnet &alpha;</sup></router-link>
        </div>
      </nav>
      <div class="container text-center">
        <h1 class="display-4 text-white">Your keys, your coins</h1>
        <h2 class="mb-0 h5 font-weight-light text-white">Trade securely without middlemen, thanks to Atomic Swaps!</h2>
      </div>
    </div>
    <router-view class="container mt-4 mb-5" />
  </div>
</template>

<style lang="scss">
.cover {
  background: linear-gradient(180deg,hsl(232, 47%, 58%),hsl(232, 47%, 55%));
  min-height: 490px;
  margin-bottom: -290px;

  @media (max-width: 768px) {
    min-height: 610px;
    margin-bottom: -460px;

    .display-4 {
      font-size: 2rem;
    }
  }

  @media (max-width: 375px) {
    .display-4 {
      font-size: 1.6rem;
    }
  }
}

.modal {
  overflow-x: hidden!important;
  overflow-y: auto!important;
}

.modal-content, .card, .table {
  box-shadow: 0 1px 0 0 rgba(22,29,37,.05), 0 0 0 0 transparent!important;
}

.table {
  border-radius: 0.25rem!important;
  border-collapse: separate!important;
  border-spacing: 0!important;
}

.btn-primary {
  box-shadow: inset 0 1px 0 0 #6774c8, 0 1px 0 0 rgba(22,29,37,.05), 0 0 0 0 transparent!important;
  background: linear-gradient(180deg,hsl(232, 47%, 58%),hsl(232, 47%, 55%))!important;
}

.navbar-brand {
  margin: 0 auto!important;
}
</style>
