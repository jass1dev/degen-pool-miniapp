import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Dictionary, Sender, SendMode } from 'ton-core';

export type DegenJackpotConfig = {
  admin: Address;
  keyPrice: bigint;
  ownerFeeBps: number;
  roundId: number;
  keysTarget: number;
  autoDouble: boolean;
  nextManual: number;
  serverSeed: Buffer;
};

export function degenJackpotConfigToCell(config: DegenJackpotConfig): Cell {
  // Empty dictionary - store as empty cell (null dict in TON)
  const participantsDict = Dictionary.empty<number, Cell>(Dictionary.Keys.Uint(32), Dictionary.Values.Cell());
  // Empty dict is represented as a cell with 1 bit (0 = null dict)
  const participantsCell = beginCell().storeDict(participantsDict, Dictionary.Keys.Uint(32), Dictionary.Values.Cell()).endCell();
  // Server seed as ref
  const serverSeedCell = beginCell().storeBuffer(config.serverSeed).endCell();

  // Main data cell
  const dataCell = beginCell()
    .storeAddress(config.admin)
    .storeCoins(config.keyPrice)
    .storeUint(config.ownerFeeBps, 16)
    .storeUint(config.roundId, 32)
    .storeUint(config.keysTarget, 32)
    .storeUint(0, 32) // sold
    .storeUint(config.autoDouble ? 1 : 0, 1)
    .storeUint(config.nextManual, 32)
    .storeCoins(0n) // pot
    .storeRef(participantsCell)
    .storeRef(serverSeedCell)
    .endCell();
  
  return dataCell;
}

export class DegenJackpot implements Contract {
  constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

  static createFromAddress(address: Address) {
    return new DegenJackpot(address);
  }

  static createFromConfig(config: DegenJackpotConfig, code: Cell, workchain = 0) {
    const data = degenJackpotConfigToCell(config);
    const init = { code, data };
    return new DegenJackpot(contractAddress(workchain, init), init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    if (!this.init) {
      throw new Error('Contract not initialized');
    }
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell()
    });
  }
}
