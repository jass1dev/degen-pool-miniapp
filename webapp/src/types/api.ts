export type RoundStatus = 'active' | 'waiting_draw' | 'finished';

export interface RoundData {
  round_id: number;
  ticket_price_ton: number;
  max_tickets: number;
  sold_tickets: number;
  status: RoundStatus;
  target_address: string;
}

export interface UserStats {
  user_has_ticket: boolean;
  ticket_count?: number;
  referral_code?: string;
  referral_stats?: {
    level1_count: number;
    level2_count: number;
    tickets_from_level1: number;
    tickets_from_level2: number;
  };
}

