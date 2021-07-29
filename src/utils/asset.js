import {
  chains,
  isEthereumChain as _isEthereumChain
} from "@liquality/cryptoassets";
import cryptoassets from "@/utils/cryptoassets";
import axios from "axios";
import * as ethers from "ethers";

const EXPLORERS = {
  ethereum: {
    testnet: {
      tx: "https://ropsten.etherscan.io/tx/0x",
      address: "https://ropsten.etherscan.io/address/"
    },
    mainnet: {
      tx: "https://etherscan.io/tx/0x",
      address: "https://etherscan.io/address/"
    }
  },
  bitcoin: {
    testnet: {
      tx: "https://blockstream.info/testnet/tx/",
      address: "https://blockstream.info/testnet/address/"
    },
    mainnet: {
      tx: "https://blockstream.info/tx/",
      address: "https://blockstream.info/address/"
    }
  },
  rsk: {
    testnet: {
      tx: "https://explorer.testnet.rsk.co/tx/0x",
      address: "https://explorer.testnet.rsk.co/address/"
    },
    mainnet: {
      tx: "https://explorer.rsk.co/tx/0x",
      address: "https://explorer.rsk.co/address/"
    }
  },
  bsc: {
    testnet: {
      tx: "https://testnet.bscscan.com/tx/",
      address: "https://testnet.bscscan.com/address/"
    },
    mainnet: {
      tx: "https://bscscan.com/tx/",
      address: "https://bscscan.com/address/"
    }
  },
  polygon: {
    testnet: {
      tx: "https://explorer-mumbai.maticvigil.com/tx/0x",
      address: "https://explorer-mumbai.maticvigil.com/address/0x"
    },
    mainnet: {
      tx: "https://explorer-mainnet.maticvigil.com/tx/0x",
      address: "https://explorer-mainnet.maticvigil.com/address/0x"
    }
  },
  near: {
    testnet: {
      tx: "https://explorer.testnet.near.org/transactions/",
      address: "https://explorer.testnet.near.org/accounts/"
    },
    mainnet: {
      tx: "https://explorer.mainnet.near.org/transactions/",
      address: "https://explorer.mainnet.near.org/accounts/"
    }
  },
  arbitrum: {
    testnet: {
      tx: "https://rinkeby-explorer.arbitrum.io/tx/0x",
      address: "https://rinkeby-explorer.arbitrum.io/address/0x"
    },
    mainnet: {
      tx: "https://explorer.arbitrum.io/tx/0x",
      address: "https://explorer.arbitrum.io/address/0x"
    }
  }
};

export const isERC20 = asset => {
  return cryptoassets[asset]?.type === "erc20";
};

export const isEthereumChain = asset => {
  const chain = cryptoassets[asset]?.chain;
  return _isEthereumChain(chain);
};

export const isEthereumNativeAsset = asset => {
  const chainId = cryptoassets[asset]?.chain;
  if (
    chainId &&
    _isEthereumChain(chainId) &&
    chains[chainId].nativeAsset === asset
  ) {
    return true;
  }

  return false;
};

export const getNativeAsset = asset => {
  const chainId = cryptoassets[asset]?.chain;
  return chainId ? chains[chainId].nativeAsset : asset;
};

export const getAssetColorStyle = asset => {
  const assetData = cryptoassets[asset];
  if (assetData && assetData.color) {
    return { color: assetData.color };
  }
  // return black as default
  return { color: "#000000" };
};

export const getTransactionExplorerLink = (hash, asset, network) => {
  const transactionHash = getExplorerTransactionHash(asset, hash);
  const chain = cryptoassets[asset].chain;
  return `${EXPLORERS[chain][network].tx}${transactionHash}`;
};

export const getAddressExplorerLink = (address, asset, network) => {
  const chain = cryptoassets[asset].chain;
  return `${EXPLORERS[chain][network].address}${address}`;
};

export const getAssetIcon = (asset, extension = "svg") => {
  try {
    return require(`../assets/icons/assets/${asset.toLowerCase()}.${extension}?inline`);
  } catch (e) {
    try {
      return require(`../../node_modules/cryptocurrency-icons/svg/color/${asset.toLowerCase()}.svg?inline`);
    } catch (e) {
      return require("../assets/icons/blank_asset.svg?inline");
    }
  }
};

export const getExplorerTransactionHash = (asset, hash) => {
  switch (asset) {
    case "NEAR":
      return hash.split("_")[0];
    default:
      return hash;
  }
};

export const TOKEN_DETAILS = {
  ethereum: {
    sourceUrl(contractAddress) {
      return `https://api.ethplorer.io/getTokenInfo/${contractAddress}?apiKey=freekey`;
    },
    async getDetails(contractAddress) {
      const data = await fetchData(this.sourceUrl(contractAddress));

      const { symbol, name, decimals } = data;

      return { symbol, name, decimals };
    }
  },
  bsc: {
    sourceUrl(contractAddress) {
      return `https://wallet.binance.org/api/v1/bsc-mainnet/assets/${contractAddress}`;
    },
    async getDetails(contractAddress) {
      const data = await fetchData(this.sourceUrl(contractAddress));

      const { displaySymbol, name, decimals } = data;

      return { symbol: displaySymbol, name, decimals };
    }
  },
  polygon: {
    sourceUrl(contractAddress) {
      return {
        symbol: `https://api.polygonscan.com/api?module=proxy&action=eth_call&to=${contractAddress}&data=0x06fdde03&tag=latest&apikey=8XR2CZ5HY3JRP6J4BGP1TBC3WJEU88NSVZ`,
        name: `https://api.polygonscan.com/api?module=proxy&action=eth_call&to=${contractAddress}&data=0x95d89b41&tag=latest&apikey=8XR2CZ5HY3JRP6J4BGP1TBC3WJEU88NSVZ`,
        decimals: `https://api.polygonscan.com/api?module=proxy&action=eth_call&to=${contractAddress}&data=0x313ce567&tag=latest&apikey=8XR2CZ5HY3JRP6J4BGP1TBC3WJEU88NSVZ`
      };
    },
    async getDetails(contractAddress) {
      const [_symbol, _name, _decimals] = await Promise.all([
        fetchData(this.sourceUrl(contractAddress).symbol),
        fetchData(this.sourceUrl(contractAddress).name),
        fetchData(this.sourceUrl(contractAddress).decimals)
      ]);
      return parseAssetData(_symbol.result, _name.result, _decimals.result);
    }
  },
  rsk: {
    sourceUrl() {
      return "https://public-node.rsk.co";
    },
    rpcBody(contractAddress) {
      return {
        decimals: {
          jsonrpc: "2.0",
          method: "eth_call",
          params: [
            {
              to: contractAddress,
              data: "0x313ce567"
            },
            "0x364428"
          ],
          id: 1
        },
        symbol: {
          jsonrpc: "2.0",
          method: "eth_call",
          params: [
            {
              to: contractAddress,
              data: "0x06fdde03"
            },
            "0x364428"
          ],
          id: 2
        },
        name: {
          jsonrpc: "2.0",
          method: "eth_call",
          params: [
            {
              to: contractAddress,
              data: "0x95d89b41"
            },
            "0x364428"
          ],
          id: 3
        }
      };
    },
    async getDetails(contractAddress) {
      const [_symbol, _name, _decimals] = await Promise.all([
        postData(this.sourceUrl(), this.rpcBody(contractAddress).symbol),
        postData(this.sourceUrl(), this.rpcBody(contractAddress).name),
        postData(this.sourceUrl(), this.rpcBody(contractAddress).decimals)
      ]);

      return parseAssetData(_symbol.result, _name.result, _decimals.result);
    }
  }
};

const fetchData = async url => {
  const { data } = await axios.get(url);

  return data;
};

const postData = async (url, body) => {
  const { data } = await axios.post(url, body);

  return data;
};

const parseAssetData = (_symbol, _name, _decimals) => {
  const iFace = new ethers.utils.Interface([
    "function decimals() public view returns (uint8)",
    "function name() public view returns (string)",
    "function symbol() public view returns (string)"
  ]);

  const symbol = iFace.decodeFunctionResult("symbol", _symbol);
  const name = iFace.decodeFunctionResult("name", _name);
  const decimals = iFace.decodeFunctionResult("decimals", _decimals);

  return { symbol, name, decimals };
};
