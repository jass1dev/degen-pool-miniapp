import { RoundData, UserStats } from '../types/api';

export type RoundState = {
  priceTon: number;
  ownerFeeBps: number;
  round: number;
  target: number;
  sold: number;
  autoDouble: boolean;
  potTon: number;
};

export type Participant = {
  index: number;
  address: string;
};

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    throw new Error(`API ${res.status}`);
  }
  return res.json();
}

export const api = {
  round: () => request<RoundState>('/api/round'),
  participants: () => request<Participant[]>('/api/participants'),
  buy: (count: number) =>
    request<{ link: string; round: number }>('/api/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count })
    }),
  // New endpoints for Mini App
  getCurrentRound: async (): Promise<RoundData> => {
    return request<RoundData>('/api/current-round');
  },
  getUserStats: async (): Promise<UserStats> => {
    // Get user ID from Telegram WebApp if available
    const tg = (window as any).Telegram?.WebApp;
    const userId = tg?.initDataUnsafe?.user?.id;
    const url = userId ? `/api/user/stats?user_id=${userId}` : '/api/user/stats';
    return request<UserStats>(url);
  },
  adminConfig: (body: {
    wallet: string;
    priceNano: string;
    ownerFeeBps: number;
    nextTarget: number;
    autoDouble: boolean;
  }) =>
    request<{ link: string }>('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }),
  adminFinish: (wallet: string) =>
    request<{ link: string }>('/api/admin/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet })
    }),
  adminWithdraw: (wallet: string) =>
    request<{ link: string }>('/api/admin/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet })
    })
};
