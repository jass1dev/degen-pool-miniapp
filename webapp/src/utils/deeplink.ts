export function buildDeeplink(address: string, amountTon: number, roundId: number, refCode?: string): string {
  const amountNano = Math.floor(amountTon * 1e9).toString();
  // Format: ROUND_<id>_<refCode> or ROUND_<id>
  const text = refCode ? `ROUND_${roundId}_${refCode}` : `ROUND_${roundId}`;
  return `ton://transfer/${address}?amount=${amountNano}&text=${encodeURIComponent(text)}`;
}

export function openDeeplink(deeplink: string) {
  window.location.href = deeplink;
}

