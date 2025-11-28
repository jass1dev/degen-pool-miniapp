import React from 'react';
import { UserStats } from '../types/api';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n/translations';

interface TicketStatusProps {
  userStats: UserStats;
}

export function TicketStatus({ userStats }: TicketStatusProps) {
  const { language } = useLanguage();

  if (!userStats.user_has_ticket) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6 text-center">
      <div className="text-4xl mb-2">🎉</div>
      <h3 className="text-xl font-bold mb-2">{t('you_are_in_round', language)}</h3>
      {userStats.ticket_count && (
        <p className="text-lg text-gray-300">
          {t('your_tickets', language, { count: userStats.ticket_count })}
        </p>
      )}
    </div>
  );
}

