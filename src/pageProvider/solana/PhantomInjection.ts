import { SendOptions, Transaction, TransactionSignature, PublicKey } from '@solana/web3.js';
import type { EventEmitter } from '@solana/wallet-adapter-base';

interface PhantomWalletEvents {
  connect(...args: any[]): any;
  disconnect(...args: any[]): any;
  accountChanged(newPublicKey: PublicKey): any;
}

interface IPhantomWallet extends EventEmitter<PhantomWalletEvents> {
  isPhantom?: boolean;
  publicKey?: { toBytes(): Uint8Array };
  isConnected: boolean;
  signTransaction(transaction: Transaction): Promise<Transaction>;
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
  signAndSendTransaction(
    transaction: Transaction,
    options?: SendOptions
  ): Promise<{ signature: TransactionSignature }>;
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

export class PhantomWallet implements IPhantomWallet {
  window: any;
  isPhantom: boolean | undefined;
  publicKey: { toBytes(): Uint8Array } | undefined;
  isConnected: boolean;

  constructor(window) {
    this.window = window;
    this.isPhantom = true;
    this.isConnected = false;
    this.publicKey = undefined;
  }

  signTransaction(transaction: Transaction): Promise<Transaction> {
    throw new Error('Method not implemented.');
  }

  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    throw new Error('Method not implemented.');
  }

  signAndSendTransaction(
    transaction: Transaction,
    options?: SendOptions | undefined
  ): Promise<{ signature: string }> {
    throw new Error('Method not implemented.');
  }

  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }> {
    throw new Error('Method not implemented.');
  }

  async connect(): Promise<void> {
    const { accepted } = await this.window.providerManager.enable('solana');

    if (!accepted) {
      throw new Error('User rejected');
    }

    const solana = this.window.providerManager.getProviderFor('SOL');
    const addresses = await solana.getMethod('wallet.getAddresses')();
    const [address] = addresses;
    const { publicKey } = address;
    this.publicKey = publicKey;
    this.isConnected = true;
  }

  async disconnect(): Promise<void> {
    this.publicKey = undefined;
    this.isConnected = false;
  }

  // The methods below are required by the Phantom adapter but we don't need them
  eventNames() {
    return [];
  }

  listeners(/* _event */): (() => void)[] {
    return [
      () => {
        // do nothing?
      }
    ];
  }

  listenerCount() {
    return 0;
  }

  emit(/*_event, ..._args*/): boolean {
    return false;
  }

  addListener(/*_event, _fn*/): this {
    return this;
  }

  once(/*_event, _fn, _context*/): this {
    return this;
  }

  removeListener(/*_event, _fn*/): this {
    return this;
  }

  off(/*_event, _fn, _context, _once*/): this {
    return this;
  }

  removeAllListeners(/*_event*/): this {
    return this;
  }

  on(/*_event, _fn, _context*/): this {
    return this;
  }
}
