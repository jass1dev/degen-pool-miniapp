import 'dotenv/config';
import { Address, beginCell, toNano } from 'ton-core';
import { TonConnect } from '@tonconnect/sdk';
import { DegenJackpotConfig, degenJackpotConfigToCell } from '../wrappers/DegenJackpot.ts';
import { readFileSync } from 'fs';

class SimpleStorage {
  private storage: Map<string, string> = new Map();
  async setItem(key: string, value: string) { this.storage.set(key, value); }
  async getItem(key: string) { return this.storage.get(key) || null; }
  async removeItem(key: string) { this.storage.delete(key); }
}

async function deploy() {
  const manifestUrl = process.env.TONCONNECT_MANIFEST_URL || 'https://raw.githubusercontent.com/jass1dev/ton-manifest/refs/heads/main/tonconnect-manifest.json';
  const connector = new TonConnect({ 
    manifestUrl,
    storage: new SimpleStorage()
  });

  // Connect wallet
  console.log('Connecting to wallet...');
  await connector.restoreConnection();
  if (!connector.wallet) {
    const wallets = await connector.getWallets();
    const wallet = wallets.find((w: any) => w.name?.toLowerCase().includes('tonkeeper')) || wallets[0];
    const url = connector.connect({ 
      universalLink: (wallet as any).universalLink || (wallet as any).appUrl,
      bridgeUrl: (wallet as any).bridgeUrl 
    });
    console.log('Open this URL in your wallet:', url);
    await new Promise((resolve) => {
      connector.onStatusChange((wallet) => {
        if (wallet) resolve(wallet);
      });
    });
  }

  const walletAddress = Address.parse(connector.wallet!.account.address);
  console.log('Connected to wallet:', walletAddress.toString());

  // Load config
  const admin = Address.parse(process.env.DEPLOY_ADMIN_ADDRESS || walletAddress.toString());
  const keyPriceTon = Number(process.env.DEPLOY_KEY_PRICE_TON ?? '1');
  const ownerFeeBps = Number(process.env.DEPLOY_OWNER_FEE_BPS ?? '600');
  const keysTarget = Number(process.env.DEPLOY_KEYS_TARGET ?? '10');
  const autoDouble = (process.env.DEPLOY_AUTO_DOUBLE ?? '0') === '1';
  const nextManual = Number(process.env.DEPLOY_NEXT_TARGET ?? String(keysTarget));
  const roundId = Number(process.env.DEPLOY_START_ROUND ?? '1');
  const serverSeedHex = process.env.DEPLOY_SERVER_SEED ?? '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  // Load compiled code
  const compiled = JSON.parse(readFileSync('build/DegenJackpot.compiled.json', 'utf8'));
  const { Cell, contractAddress, storeStateInit } = await import('ton-core');
  const code = Cell.fromBoc(Buffer.from(compiled.hex, 'hex'))[0];

  // Create data
  const config: DegenJackpotConfig = {
    admin,
    keyPrice: toNano(keyPriceTon),
    ownerFeeBps,
    roundId,
    keysTarget,
    autoDouble,
    nextManual,
    serverSeed: Buffer.from(serverSeedHex, 'hex')
  };
  const data = degenJackpotConfigToCell(config);

  // Calculate contract address
  const address = contractAddress(0, { code, data });
  console.log('Contract address:', address.toString());
  console.log('Code size:', code.toBoc().length, 'bytes');
  console.log('Data size:', data.toBoc().length, 'bytes');

  // Create stateInit using storeStateInit (correct format for TonConnect)
  const stateInit = beginCell()
    .store(storeStateInit({ code, data }))
    .endCell();

  // Send transaction
  console.log('Sending transaction...');
  const payload = beginCell().endCell();
  const stateInitBoc = stateInit.toBoc();
  
  console.log('Amount:', toNano('0.5').toString());
  console.log('Payload size:', payload.toBoc().length, 'bytes');
  console.log('StateInit size:', stateInitBoc.length, 'bytes');
  console.log('StateInit (first 100 chars):', stateInitBoc.toString('base64').substring(0, 100));
  
  const result = await connector.sendTransaction({
    validUntil: Date.now() + 5 * 60 * 1000,
    messages: [{
      address: address.toString(),
      amount: toNano('0.5').toString(),
      payload: payload.toBoc().toString('base64'),
      stateInit: stateInitBoc.toString('base64')
    }]
  });

  console.log('Transaction sent:', result);
  console.log('Contract deployed at:', address.toString());
}

deploy().catch(console.error);

