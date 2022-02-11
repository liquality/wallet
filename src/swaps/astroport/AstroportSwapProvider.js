import { LCDClient } from '@terra-money/terra.js';
import { TerraNetworks } from '@liquality/terra-networks';
import cryptoassets from '@/utils/cryptoassets'
import { currencyToUnit } from '@liquality/cryptoassets'

import { SwapProvider } from '../SwapProvider'

class AstroportSwapProvider extends SwapProvider {
  async getSupportedPairs() {
    console.log('Astroport getSupportedPairs')
    return [];
  }

  async getQuote({ network, from, to, amount }) {
    console.log('Astroport getQuote', network, from, to, amount)

    const fromInfo = cryptoassets[from]
    const toInfo = cryptoassets[to]

    // only Terra network swaps
    if (fromInfo.chain !== 'terra' || toInfo.chain !== 'terra' || amount <= 0) {
      return null
    }


    const rate = await this._getSwapRate();

    console.log('rate', rate)
  }

  // Helper
  _getRPC() {
    const { chainID, nodeUrl } = TerraNetworks.terra_mainnet

    return new LCDClient({
      chainID,
      URL: nodeUrl
    })
  }

  async _getSwapRate() {
    const rpc = this._getRPC();

    return await rpc.wasm.contractQuery(
      ASTROPORT_ADDRESS,
      {
        simulate_swap_operations: {
          offer_amount: '100000',
          operations: [
            {
              astro_swap:
              {
                offer_asset_info:
                {
                  token:
                    { contract_addr: "terra1dy9kmlm4anr92e42mrkjwzyvfqwz66un00rwr5" }
                },
                ask_asset_info:
                {
                  native_token:
                    { denom: "uusd" }
                }
              }
            },
            {
              astro_swap:
              {
                offer_asset_info:
                {
                  native_token:
                    { denom: "uusd" }
                },
                ask_asset_info:
                {
                  token:
                    { contract_addr: "terra1kkyyh7vganlpkj0gkc2rfmhy858ma4rtwywe3x" }
                }
              }
            }]
        }
      }
    )

  }

}

export { AstroportSwapProvider }