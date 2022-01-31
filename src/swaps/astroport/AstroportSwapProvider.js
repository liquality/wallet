import { SwapProvider } from '../SwapProvider'

class AstroportSwapProvider extends SwapProvider { 
  getSupportedPairs() {
    console.log('Astroport getSupportedPairs')
    return [];
  }
  getQuote() {
    console.log('Astroport')
  }
  
}

export { AstroportSwapProvider }