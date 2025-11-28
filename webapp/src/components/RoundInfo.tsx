import React from 'react';
import { RoundData } from '../types/api';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n/translations';
import { ProgressBar } from './ProgressBar';

interface RoundInfoProps {
  round: RoundData;
}

export function RoundInfo({ round }: RoundInfoProps) {
  const { language } = useLanguage();
  const ticketsLeft = round.max_tickets - round.sold_tickets;

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{t('current_round', language)}</h2>
        <p className="text-3xl font-bold text-blue-400">{t('round_id', language, { id: round.round_id })}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-sm text-gray-400 mb-1">{t('ticket_price', language)}</p>
          <p className="text-xl font-bold">{round.ticket_price_ton} TON</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-sm text-gray-400 mb-1">{t('max_tickets', language)}</p>
          <p className="text-xl font-bold">{round.max_tickets}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-sm text-gray-400 mb-1">{t('sold_tickets', language)}</p>
          <p className="text-xl font-bold">{round.sold_tickets}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-sm text-gray-400 mb-1">{t('tickets_left', language, { count: ticketsLeft })}</p>
          <p className="text-xl font-bold text-green-400">{ticketsLeft}</p>
        </div>
      </div>

      <ProgressBar sold={round.sold_tickets} max={round.max_tickets} />

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <h3 className="font-semibold mb-2">{t('how_it_works', language)}</h3>
        <p className="text-sm text-gray-300">{t('how_it_works_desc', language)}</p>
      </div>
    </div>
  );
}

