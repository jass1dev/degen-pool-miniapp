import React, { useState } from 'react';
import { UserStats } from '../types/api';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n/translations';

interface ReferralPanelProps {
  userStats: UserStats;
  botUsername?: string;
}

export function ReferralPanel({ userStats, botUsername = 'DegenLadderBot' }: ReferralPanelProps) {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!userStats.user_has_ticket || !userStats.referral_code) {
    return null;
  }

  const referralLink = `https://t.me/${botUsername}?start=ref_${userStats.referral_code}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      
      // Show Telegram popup if available
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.showPopup({
          title: t('link_copied', language),
          message: '',
          buttons: [{ type: 'ok' }],
        });
      }
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.shareUrl(referralLink, t('referral_link', language));
    } else {
      handleCopy();
    }
  };

  const stats = userStats.referral_stats || {
    level1_count: 0,
    level2_count: 0,
    tickets_from_level1: 0,
    tickets_from_level2: 0,
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
      <h2 className="text-xl font-bold text-center">{t('referral_panel', language)}</h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-2 block">{t('referral_link', language)}</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-mono"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl font-semibold transition"
            >
              {copied ? '✓' : t('copy_link', language)}
            </button>
          </div>
        </div>

        <button
          onClick={handleShare}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-500 transition"
        >
          {t('share_telegram', language)}
        </button>
      </div>

      <div className="space-y-4 pt-4 border-t border-white/10">
        <div>
          <h3 className="font-semibold mb-2">{t('referral_level1', language)}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">{t('level1_count', language, { count: stats.level1_count })}</p>
              <p className="text-lg font-bold">{stats.level1_count}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">{t('tickets_from_level1', language, { count: stats.tickets_from_level1 })}</p>
              <p className="text-lg font-bold">{stats.tickets_from_level1}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">{t('referral_level2', language)}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">{t('level2_count', language, { count: stats.level2_count })}</p>
              <p className="text-lg font-bold">{stats.level2_count}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">{t('tickets_from_level2', language, { count: stats.tickets_from_level2 })}</p>
              <p className="text-lg font-bold">{stats.tickets_from_level2}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

