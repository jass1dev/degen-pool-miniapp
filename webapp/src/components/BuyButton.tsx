import React from 'react';
import { RoundData } from '../types/api';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n/translations';
import { buildDeeplink, openDeeplink } from '../utils/deeplink';

interface BuyButtonProps {
  round: RoundData;
  refCode?: string;
  disabled?: boolean;
}

export function BuyButton({ round, refCode, disabled }: BuyButtonProps) {
  const { language } = useLanguage();

  const handleBuy = () => {
    if (disabled || round.status !== 'active') return;
    
    // Get contract address from round data
    const address = round.target_address;
    if (!address) {
      console.error('Contract address not available');
      return;
    }
    
    // Address is already in non-bounceable format from API
    const deeplink = buildDeeplink(address, round.ticket_price_ton, round.round_id, refCode);
    openDeeplink(deeplink);
  };

  const isDisabled = disabled || round.status !== 'active';

  return (
    <button
      onClick={handleBuy}
      disabled={isDisabled}
      className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all ${
        isDisabled
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:from-blue-600 hover:to-cyan-500 active:scale-95 shadow-lg'
      }`}
    >
      {round.status === 'active'
        ? t('buy_ticket', language, { price: round.ticket_price_ton })
        : round.status === 'waiting_draw'
        ? t('round_waiting_draw', language)
        : t('round_closed', language)}
    </button>
  );
}

