import 'dotenv/config';
import { Address, toNano } from 'ton-core';
import { compile, NetworkProvider } from '@ton-community/blueprint';
import { DegenJackpotConfig, DegenJackpot } from '../wrappers/DegenJackpot.ts';

export async function run(provider: NetworkProvider) {
  const admin = Address.parse(process.env.DEPLOY_ADMIN_ADDRESS ?? (() => { throw new Error('DEPLOY_ADMIN_ADDRESS required'); })());
  const keyPriceTon = Number(process.env.DEPLOY_KEY_PRICE_TON ?? '5');
  const ownerFeeBps = Number(process.env.DEPLOY_OWNER_FEE_BPS ?? '600');
  const keysTarget = Number(process.env.DEPLOY_KEYS_TARGET ?? '1000');
  const autoDouble = (process.env.DEPLOY_AUTO_DOUBLE ?? '0') === '1';
  const nextManual = Number(process.env.DEPLOY_NEXT_TARGET ?? String(keysTarget));
  const roundId = Number(process.env.DEPLOY_START_ROUND ?? '1');
  const serverSeedHex = process.env.DEPLOY_SERVER_SEED ?? '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

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

  const jackpot = provider.open(DegenJackpot.createFromConfig(config, await compile('DegenJackpot')));

  console.log('Contract address:', jackpot.address.toString());
  console.log('Deploying with 0.5 TON...');
  if (jackpot.init) {
    console.log('Init code size:', jackpot.init.code.toBoc().length, 'bytes');
    console.log('Init data size:', jackpot.init.data.toBoc().length, 'bytes');
    console.log('Init data bits:', jackpot.init.data.bits.length);
    console.log('Init data refs:', jackpot.init.data.refs.length);
  }

  await jackpot.sendDeploy(provider.sender(), toNano('0.5'));
  
  // Manual check
  const isDeployed = await provider.isContractDeployed(jackpot.address);
  if (isDeployed) {
    console.log('Contract already deployed at', jackpot.address.toString());
    return;
  }

  await provider.waitForDeploy(jackpot.address, 20, 3000);

  console.log('Deployed at', jackpot.address.toString());
}
