import { PublicKey, SystemInstruction, Connection } from '@solana/web3.js';
import { SolanaParser } from '@debridge-finance/solana-transaction-parser';

import { COMMON_REQUEST_MAP } from '../utils';

export class PhantomWallet {
  window;
  isPhantom;
  publicKey;
  isConnected;
  solanaParser;

  constructor(window) {
    this.window = window;
    this.isPhantom = true;
    this.isConnected = false;
    this.publicKey = undefined;
    this.solanaParser = new SolanaParser([]);
  }

  async signTransaction(transaction) {
    // TODO: get signer

    try {
      const connection = new Connection(
        'https://red-sleek-rain.solana-mainnet.discover.quiknode.pro/fc112deb1e0228d09d0d8c12b8de5a601d251d80'
      );

      const result = await connection.simulateTransaction(transaction, { sigVerify: true });
      console.log('simulated', result);
    } catch (err) {
      console.log(err);
    }

    console.log('transaction', transaction);
    let from, to, value;
    transaction.instructions.forEach((instruction) => {
      try {
        const parsed = this.solanaParser.parseInstruction(instruction);
        console.log('DEBRIDGE PARSER', parsed);

        const decoded = SystemInstruction.decodeTransfer(instruction);
        if (decoded) {
          console.log(decoded);
          from = decoded.fromPubkey.toString();
          to = decoded.toPubkey.toString();
          value = decoded.lamports.toString(10);
        }
      } catch (err) {
        console.debug(err);
      }
    });

    console.log(from, to, value);
    const solana = this.window.providerManager.getProviderFor('SOL');
    const response = await solana.getMethod(COMMON_REQUEST_MAP.wallet_sendTransaction)({
      ...transaction,
      from,
      to,
      value
    });
    console.log('response', response);
    console.log('tuka sam', 'signTransaction');
    // transaction.sign();
    // return transaction;
  }

  async signAllTransactions(transactions) {
    // TODO: get signer
    console.log('tuka sam', 'signAllTransactions');

    transactions.forEach((t) => t.sign());
    return transactions;
  }

  signAndSendTransaction(/*_transaction, _options*/) {
    console.log('tuka sam', 'signAndSendTransaction');
    throw new Error('Method not implemented.');
    // {signature}
  }

  signMessage(/*message*/) {
    console.log('tuka sam', 'signMessage');
    throw new Error('Method not implemented.');
  }

  async connect() {
    const { accepted } = await this.window.providerManager.enable('solana');

    if (!accepted) {
      throw new Error('User rejected');
    }

    const solana = this.window.providerManager.getProviderFor('SOL');
    const addresses = await solana.getMethod('wallet.getAddresses')();
    const [{ publicKey }] = addresses;
    this.publicKey = new PublicKey(publicKey);
    this.isConnected = true;
  }

  async disconnect() {
    console.log('tuka sam disconnect');
    this.publicKey = undefined;
    this.isConnected = false;
  }

  /**
   * NOT USED
   * @dev The methods below are required by the Phantom adapter but we don't need them
   * https://github.com/solana-labs/wallet-adapter/blob/master/packages/wallets/phantom/src/adapter.ts
   */
  eventNames() {
    console.log('tuka sam eventNames');
    return [];
  }

  listeners(/* _event */) {
    console.log('tuka sam listeners');
    return [
      () => {
        // do nothing?
      }
    ];
  }

  listenerCount() {
    console.log('tuka sam listenerCount');
    return 0;
  }

  emit(/*_event, ..._args*/) {
    console.log('tuka sam emit');
    return false;
  }

  addListener(/*_event, _fn*/) {
    console.log('tuka sam addListener');
    return this;
  }

  once(/*_event, _fn, _context*/) {
    console.log('tuka sam once');
    return this;
  }

  removeListener(/*_event, _fn*/) {
    console.log('tuka sam removeListener');
    return this;
  }

  off(/*_event, _fn, _context, _once*/) {
    console.log('tuka sam off');
    return this;
  }

  removeAllListeners(/*_event*/) {
    console.log('tuka sam removeAllListeners');
    return this;
  }

  on(_event, _fn, _context) {
    console.log('tuka sam on', _event, _fn, _context);
    return this;
  }
}
