import { PageProvider } from './pageProvider';
import { PhantomWallet } from './solana/PhantomInjection';
import { COMMON_REQUEST_MAP } from './utils';

class SolanaPageProvider extends PageProvider {
  async handleRequest(req) {
    const solana = this.window.providerManager.getProviderFor('SOL');
    const method = COMMON_REQUEST_MAP[req.method] || req.method;
    return solana.getMethod(method)(...req.params);
  }
  setup() {
    this.window.sollet = {
      enable: async () => {
        const { accepted } = await this.window.providerManager.enable('solana');
        if (!accepted) throw new Error('User rejected');
        const solana = this.window.providerManager.getProviderFor('SOL');
        return solana.getMethod('wallet.getAddresses')();
      },
      request: async (req) => {
        const params = req.params || [];
        return this.handleRequest({
          method: req.method,
          params
        });
      }
    };

    const phantomWallet = new PhantomWallet(this.window);
    this.window.phantom.solana = phantomWallet;
    this.window.solana = phantomWallet;
  }
}

export { SolanaPageProvider };
