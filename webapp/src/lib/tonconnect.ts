import { TonConnect } from '@tonconnect/sdk';

const manifestUrl = import.meta.env.VITE_TONCONNECT_MANIFEST as string;

export const tonConnect = new TonConnect({ manifestUrl });

export async function ensureWallet() {
  if (tonConnect.account) {
    return tonConnect.account.address;
  }
  return new Promise<string>((resolve, reject) => {
    const unsubscribe = tonConnect.onStatusChange((wallet) => {
      if (wallet) {
        unsubscribe();
        resolve(wallet.address);
      }
    });
    tonConnect.connectWallet().catch((err) => {
      unsubscribe();
      reject(err);
    });
  });
}
