import * as wormhole from '@certusone/wormhole-sdk'

export default {
  ethereum: {
    WormholeChainID: wormhole.CHAIN_ID_ETH,
    testnet: {
      // Goerli
      networkID: 5,
      tokenBridge: '0xF890982f9310df57d00f659cf4fd87e65adEd8d7',
      rpcURL: 'https://goerli.infura.io/v3/'
    },
    mainnet: {
      networkID: 1,
      tokenBridge: '0x3ee18B2214AFF97000D974cf647E7C347E8fa585',
      rpcURL: 'https://mainnet.infura.io/v3/'
    }
  },
  bsc: {
    WormholeChainID: wormhole.CHAIN_ID_BSC,
    testnet: {
      networkID: 97,
      tokenBridge: '0x9dcF9D205C9De35334D646BeE44b2D2859712A09',
      rpcURL: 'https://data-seed-prebsc-1-s1.binance.org:8545'
    },
    mainnet: {
      networkID: 56,
      tokenBridge: '0xB6F6D86a8f9879A9c87f643768d9efc38c1Da6E7',
      rpcURL: 'https://bsc-dataseed.binance.org/'
    }
  },
  polygon: {
    WormholeChainID: wormhole.CHAIN_ID_POLYGON,
    testnet: {
      networkID: 80001,
      tokenBridge: '0x377D55a7928c046E18eEbb61977e714d2a76472a',
      rpcURL: 'https://rpc-mumbai.maticvigil.com'
    },
    mainnet: {
      networkID: 137,
      tokenBridge: '0x5a58505a96D1dbf8dF91cB21B54419FC36e93fdE',
      rpcURL: 'https://polygon-rpc.com'
    }
  },
  avalanche: {
    WormholeChainID: wormhole.CHAIN_ID_AVAX,
    testnet: {
      networkID: 43113,
      tokenBridge: '0x61e44e506ca5659e6c0bba9b678586fa2d729756',
      rpcURL: 'https://api.avax-test.network/ext/bc/C/rpc'
    },
    mainnet: {
      networkID: 43114,
      tokenBridge: '0x0e082f06ff657d94310cb8ce8b0d9a04541d8052',
      rpcURL: 'https://api.avax.network/ext/bc/C/rpc'
    }
  },
  ethereum_ropsten: {
    WormholeChainID: wormhole.CHAIN_ID_ETHEREUM_ROPSTEN,
    testnet: {
      networkID: 3,
      tokenBridge: '0xf174f9a837536c449321df1ca093bb96948d5386',
      rpcURL: 'https://ropsten.infura.io/v3/'
    }
  },
  terra: {
    WormholeChainID: wormhole.CHAIN_ID_TERRA,
    testnet: {
      networkID: 'bombay-12',
      tokenBridge: 'terra1pseddrv0yfsn76u4zxrjmtf45kdlmalswdv39a',
      rpcURL: 'https://bombay-lcd.terra.dev'
    },
    mainnet: {
      networkID: 'columbus-5',
      tokenBridge: 'terra10nmmwe8r3g99a9newtqa7a75xfgs2e8z87r2sf',
      rpcURL: 'https://lcd.terra.dev'
    }
  }
  // solana: {
  //   WormholeChainID: wormhole.CHAIN_ID_SOLANA,
  //   testnet: {
  //     networkID: 'devnet',
  //     tokenBridge: 'DZnkkTmCiFWfYTfT41X3Rd1kDgozqzxWaHqsw6W4x2oe',
  //     rpcURL: 'http://liquality.devnet.rpcpool.com/'
  //   },
  //   mainnet: {
  //     networkID: 'mainnet-beta',
  //     tokenBridge: 'wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb',
  //     rpcURL: 'https://api.mainnet-beta.solana.com'
  //   }
  // },
}
