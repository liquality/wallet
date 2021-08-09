import abi from 'human-standard-token-abi';
import * as ethers from 'ethers'

const hstInterface = new ethers.utils.Interface(abi);
 
export const parseTransactionData = (data) => hstInterface.parseTransaction({ data });