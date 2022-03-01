import { MsgExecuteContract } from '@terra-money/terra.js'

const ADDRESSES = {
  ASSETS_CONTRACT: 'terra1m6ywlgn6wrjuagcmmezzz2a029gtldhey5k552',
  FACTORY_CONTRACT: 'terra16t7dpwwgx9n3lq6l6te3753lsjqwhxwpday9zx'
}

// ============== Get Rate Queries ==============

/*
  This can handle rates for:
    1. UST <-> LUNA
    2. UST -> ERC20
 */
export const getRateNativeToAsset = (fromAmount, asset, pairAddress) => {
  const isDenom = asset === 'uluna' || asset === 'uusd'

  const query = {
    simulation: {
      offer_asset: {
        amount: fromAmount,
        ...(isDenom && {
          // Apply this query when we do NATIVE <-> ERC20
          info: {
            native_token: {
              denom: asset
            }
          }
        }),
        ...(!isDenom && {
          // Apply this query when we do ERC20 <-> NATIVE
          info: {
            token: {
              contract_addr: asset
            }
          }
        })
      }
    }
  }

  // This address is for following pairs
  // UST <-> Luna
  let address = ADDRESSES.ASSETS_CONTRACT

  // This address is for UST -> ERC20
  if (pairAddress) {
    address = pairAddress
  }

  return { query, address }
}

/*
  This can handle rates for:
    1. ERC20 <-> LUNA
    2. ERC20 <-> ERC20
    3. ERC20 -> UST
 */
export const getRateERC20ToERC20 = (fromAmount, firstAsset, secondAsset, pairAddress) => {
  const isFirstAssetDenom = firstAsset === 'uluna' || firstAsset === 'uusd'
  const isSecondAssetDenom = secondAsset === 'uluna' || secondAsset === 'uusd'

  const query = {
    simulate_swap_operations: {
      offer_amount: fromAmount,
      operations: [
        {
          astro_swap: {
            ...(isFirstAssetDenom && {
              // Apply this query when we do LUNA <-> ERC20
              offer_asset_info: {
                native_token: {
                  denom: firstAsset
                }
              }
            }),
            ...(!isFirstAssetDenom && {
              // Apply This query when we do ERC20 <-> ERC20
              offer_asset_info: {
                token: {
                  contract_addr: firstAsset
                }
              }
            }),
            ask_asset_info: {
              native_token: { denom: 'uusd' }
            }
          }
        },
        {
          astro_swap: {
            offer_asset_info: {
              native_token: { denom: 'uusd' }
            },
            ...(isSecondAssetDenom && {
              // Apply this query when we do ERC20 <-> LUNA
              ask_asset_info: {
                native_token: {
                  denom: secondAsset
                }
              }
            }),
            ...(!isSecondAssetDenom && {
              // Apply this query when we do ERC20 <-> ERC20
              ask_asset_info: {
                token: {
                  contract_addr: secondAsset
                }
              }
            })
          }
        }
      ]
    }
  }

  // This address is for following pairs
  // Luna <-> ERC20
  // ERC20 <-> ERC20
  let address = ADDRESSES.FACTORY_CONTRACT

  // This address is used for ERC20 -> UST
  if (pairAddress) {
    address = pairAddress
  }

  return { query, address }
}

// ============== Get Swap Messages ==============

/*
  This can handle swaps for:
    1. UST <-> Luna
    1. UST -> ERC20
*/
export const buildSwapFromNativeTokenMsg = (quote, denom, address, pairAddress) => {
  const to = pairAddress ? pairAddress : ADDRESSES.ASSETS_CONTRACT // This address is for UST <-> Luna pair

  return {
    data: {
      fee: quote.fee,
      msgs: [
        new MsgExecuteContract(
          address,
          to,
          {
            swap: {
              offer_asset: {
                info: {
                  native_token: {
                    denom
                  }
                },
                amount: quote.fromAmount
              },
              to: address
            }
          },
          { [denom]: Number(quote.fromAmount) }
        )
      ],
      gasLimit: 400_000
    }
  }
}

/*
  This can handle swaps for:
    1. ERC20 <-> ERC20
    2. ERC20 <-> LUNA
*/

export const buildSwapFromContractTokenMsg = (
  quote,
  recipient,
  fromTokenAddress,
  toTokenAddress
) => {
  const isERC20ToLuna = quote.to === 'LUNA'
  const isLunaToERC20 = quote.from === 'LUNA'
  const isERC20ToERC20 = quote.to !== 'LUNA' && quote.from !== 'LUNA'

  const swapMsg = {
    execute_swap_operations: {
      offer_amount: quote.fromAmount,
      operations: [
        {
          astro_swap: {
            ...((isERC20ToERC20 || isERC20ToLuna) && {
              offer_asset_info: {
                token: {
                  contract_addr: fromTokenAddress
                }
              }
            }),
            ...(isLunaToERC20 && {
              offer_asset_info: {
                native_token: {
                  denom: 'uluna'
                }
              }
            }),
            ask_asset_info: {
              native_token: {
                denom: 'uusd'
              }
            }
          }
        },
        {
          astro_swap: {
            offer_asset_info: {
              native_token: {
                denom: 'uusd'
              }
            },
            ...((isLunaToERC20 || isERC20ToERC20) && {
              ask_asset_info: {
                token: {
                  contract_addr: toTokenAddress
                }
              }
            }),
            ...(isERC20ToLuna && {
              ask_asset_info: {
                native_token: {
                  denom: 'uluna'
                }
              }
            })
          }
        }
      ]
    }
  }

  if (isERC20ToERC20 || isERC20ToLuna) {
    const msgInBase64 = Buffer.from(JSON.stringify(swapMsg)).toString('base64')

    return {
      data: {
        fee: quote.fee,
        msgs: [
          new MsgExecuteContract(recipient, fromTokenAddress, {
            send: {
              msg: msgInBase64,
              amount: quote.fromAmount,
              contract: ADDRESSES.FACTORY_CONTRACT // USE FOR ERC20 <-> ERC20 AND ERC20 <-> LUNA Swaps
            }
          })
        ],
        gasLimit: 1_500_000
      }
    }
  }

  return {
    data: {
      fee: quote.fee,
      msgs: [
        new MsgExecuteContract(
          recipient,
          ADDRESSES.FACTORY_CONTRACT, // USE for Luna <-> ERC20 Swaps
          swapMsg,
          { ['uluna']: Number(quote.fromAmount) }
        )
      ],
      gasLimit: 1_500_000
    }
  }
}

/*
  This can handle swaps for:
    1. ERC20 -> UST
*/

export const buildSwapFromContractTokenToUSTMsg = (
  quote,
  address,
  fromTokenAddress,
  pairAddress
) => {
  const msgInBase64 = Buffer.from(
    JSON.stringify({
      swap: {}
    })
  ).toString('base64')

  return {
    data: {
      fee: quote.fee,
      msgs: [
        new MsgExecuteContract(address, fromTokenAddress, {
          send: {
            msg: msgInBase64,
            amount: quote.fromAmount,
            contract: pairAddress
          }
        })
      ],
      gasLimit: 400_000
    }
  }
}

// ============== Get Pair Address ==============
export const getPairAddressQuery = (tokenAddress) => ({
  pair: {
    asset_infos: [
      {
        token: {
          contract_addr: tokenAddress
        }
      },
      {
        native_token: {
          denom: 'uusd'
        }
      }
    ]
  }
})
