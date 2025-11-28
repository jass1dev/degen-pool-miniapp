import React, { useEffect } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { useRound } from './hooks/useRound';
import { useUser } from './hooks/useUser';
import { LanguageSelector } from './components/LanguageSelector';
import { RoundInfo } from './components/RoundInfo';
import { BuyButton } from './components/BuyButton';
import { TicketStatus } from './components/TicketStatus';
import { ReferralPanel } from './components/ReferralPanel';
import { t } from './i18n/translations';

function AppContent() {
  const { language } = useLanguage();
  const { data: round, isLoading: roundLoading, error: roundError } = useRound();
  const { data: userStats, isLoading: userLoading } = useUser();

  useEffect(() => {
    // Initialize Telegram WebApp
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      
      // Set theme colors
      const theme = tg.themeParams;
      if (theme.bg_color) {
        document.documentElement.style.setProperty('--tg-theme-bg-color', theme.bg_color);
      }
      if (theme.text_color) {
        document.documentElement.style.setProperty('--tg-theme-text-color', theme.text_color);
      }
      if (theme.button_color) {
        document.documentElement.style.setProperty('--tg-theme-button-color', theme.button_color);
      }
      if (theme.button_text_color) {
        document.documentElement.style.setProperty('--tg-theme-button-text-color', theme.button_text_color);
      }
    }
  }, []);

  // Get referral code from URL or user stats
  const refCode = userStats?.referral_code || 
    (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('ref') : null);

  if (roundLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>{t('loading', language)}</p>
        </div>
      </div>
    );
  }

  if (roundError || !round) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">{t('error', language)}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-500 rounded-xl font-semibold"
          >
            {t('try_again', language)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {t('app_name', language)}
          </h1>
          <LanguageSelector />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {/* Round Info */}
        <RoundInfo round={round} />

        {/* Ticket Status */}
        {!userLoading && userStats && <TicketStatus userStats={userStats} />}

        {/* Buy Button */}
        <BuyButton
          round={round}
          refCode={refCode || undefined}
          disabled={round.status !== 'active'}
        />

        {/* Referral Panel */}
        {!userLoading && userStats && userStats.user_has_ticket && (
          <ReferralPanel userStats={userStats} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
