import axios from 'axios';
import { beginCell, Cell, Dictionary, Address } from '@ton/core';
import { config } from '../config.js';

const OP_BUY_KEYS = 0x424b4559;
const OP_ADMIN_CONFIG = 0x41444d4e;
const OP_FORCE_FINISH = 0x47474e44;
const OP_WITHDRAW_OWNER = 0x574f574e;

function stackBigInt(item: any | undefined, index = 0): bigint {
  if (!item) {
    throw new Error(`Stack item #${index} is undefined`);
  }

  // tonapi.io: { type: "num", num: "0x..." } or { type: "num", value: "..." }
  if (typeof item === 'object' && !Array.isArray(item)) {
    if ((item.type === 'num' || item.type === 'int')) {
      // Handle hex string (0x...) or decimal string
      if (item.num) {
        return BigInt(item.num); // BigInt handles both hex (0x...) and decimal
      }
      if (item.value) {
        return BigInt(item.value);
      }
    }
  }

  // Fallback: ['num', value]
  if (Array.isArray(item) && (item[0] === 'num' || item[0] === 'int')) {
    return BigInt(item[1]);
  }

  throw new Error(`Unsupported stack item #${index}: ${JSON.stringify(item)}`);
}

function fromNano(value: bigint) {
  return Number(value) / 1e9;
}

// Use tonapi.io (no API key required)
const client = axios.create({
  baseURL: 'https://tonapi.io/v2',
  timeout: 10000
});

export class TonJackpotService {
  async runGet(method: string, stack: any[] = []) {
    try {
      // Use tonapi.io format - need to convert stack items properly
      const stackItems = stack.map((item: any) => {
        if (typeof item === 'bigint') {
          return { type: 'num', value: item.toString() };
        }
        if (Array.isArray(item) && item[0] === 'num') {
          return { type: 'num', value: item[1].toString() };
        }
        return item;
      });
      
      const { data } = await client.post(
        `/blockchain/accounts/${config.contractAddress}/methods/${method}`,
        { args: stackItems }
      );

      // tonapi.io may return success field or exit_code
      if (data.exit_code !== undefined && data.exit_code !== 0) {
        throw new Error(`Method ${method} failed with exit code ${data.exit_code}`);
      }
      
      // tonapi.io returns stack directly
      return { stack: data.stack ?? [] };
    } catch (error: any) {
      console.error('API error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getRoundState() {
    try {
      const res = await this.runGet('get_round_state');
      const stack = res.stack;
      if (!stack || stack.length < 7) {
        throw new Error('Invalid contract response: insufficient stack items');
      }
      const price = stackBigInt(stack[0], 0);
      const ownerFee = Number(stackBigInt(stack[1], 1));
      const round = Number(stackBigInt(stack[2], 2));
      const target = Number(stackBigInt(stack[3], 3));
      const sold = Number(stackBigInt(stack[4], 4));
      const auto = stackBigInt(stack[5], 5) === 1n;
      const pot = stackBigInt(stack[6], 6);
      return {
        priceNano: price,
        priceTon: fromNano(price),
        ownerFeeBps: ownerFee,
        round,
        target,
        sold,
        autoDouble: auto,
        potTon: fromNano(pot)
      };
    } catch (error: any) {
      console.error('Failed to get round state:', error);
      // Return fallback state if API fails
      return {
        priceNano: 1000000000n, // 1 TON
        priceTon: 1,
        ownerFeeBps: 600, // 6%
        round: 1,
        target: 10,
        sold: 0,
        autoDouble: false,
        potTon: 0
      };
    }
  }

  async getLastParticipants(limit = 10) {
    const res = await this.runGet('get_participants_dict');
    const dictCell = res.stack[0];
    if (!dictCell || dictCell[0] !== 'cell') return [];
    const cell = Cell.fromBoc(Buffer.from(dictCell[1].bytes, 'base64'))[0];
    const dict = Dictionary.loadDirect(
      Dictionary.Keys.Uint(32),
      Dictionary.Values.Cell(),
      cell.beginParse()
    );
    const entries: { index: number; address: string }[] = [];
    for (const key of dict.keys()) {
      const value = dict.get(key);
      if (!value) continue;
      const slice = value.beginParse();
      const addr = slice.loadAddress();
      entries.push({ index: Number(key), address: addr.toString() });
    }
    return entries.sort((a, b) => b.index - a.index).slice(0, limit);
  }

  buyLink(keys: number, round: number, priceNano: bigint) {
    // Simple deeplink format: ton://transfer/ADDRESS?amount=AMOUNT&text=ROUND_X
    // User sends TON to fixed address with round label in comment
    const amount = priceNano * BigInt(keys);
    const amountNano = amount.toString();
    // Use contract address as payment receiver
    const addr = Address.parse(config.contractAddress);
    const walletAddress = addr.toString({ bounceable: false, urlSafe: true });
    // Round label in comment
    const roundLabel = `ROUND_${round}`;
    
    // Simple deeplink - opens wallet with pre-filled transfer
    const deeplink = `ton://transfer/${walletAddress}?amount=${amountNano}&text=${encodeURIComponent(roundLabel)}`;
    
    return {
      tonConnect: deeplink,
      telegramWallet: deeplink // Same format works for all wallets
    };
  }

  adminConfigLink(args: { priceNano: bigint; ownerFeeBps: number; nextTarget: number; autoDouble: boolean }) {
    const payload = beginCell()
      .storeUint(OP_ADMIN_CONFIG, 32)
      .storeUint(args.priceNano, 64)
      .storeUint(args.ownerFeeBps, 16)
      .storeUint(args.nextTarget, 32)
      .storeUint(args.autoDouble ? 1 : 0, 1)
      .endCell()
      .toBoc()
      .toString('base64');
    return this.buildTonConnectLink(0n, payload);
  }

  forceFinishLink() {
    const payload = beginCell().storeUint(OP_FORCE_FINISH, 32).endCell().toBoc().toString('base64');
    return this.buildTonConnectLink(0n, payload);
  }

  withdrawLink() {
    const payload = beginCell().storeUint(OP_WITHDRAW_OWNER, 32).endCell().toBoc().toString('base64');
    return this.buildTonConnectLink(0n, payload);
  }

  private buildTonConnectLink(amount: bigint, payload: string) {
    // TonConnect v2 format - transaction request (for admin operations)
    const request = {
      network: 'ton-mainnet',
      valid_until: Math.floor(Date.now() / 1000) + 600,
      messages: [
        {
          address: config.contractAddress,
          amount: amount.toString(),
          payload
        }
      ]
    };
    const encoded = Buffer.from(JSON.stringify(request)).toString('base64url');
    // Use universal TonConnect link
    return `https://app.tonkeeper.com/ton-connect?request=${encoded}`;
  }

}
