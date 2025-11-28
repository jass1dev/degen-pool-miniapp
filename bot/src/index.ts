import { Bot, InlineKeyboard, NextFunction, InputFile } from 'grammy';
import Fastify from 'fastify';
import crypto from 'node:crypto';
import { Address } from '@ton/core';
import { config } from './config.js';
import { TonJackpotService } from './services/ton.js';

const ton = new TonJackpotService();
const bot = new Bot(config.botToken);
const api = Fastify();
const pendingCustomBuys = new Map<string, true>();

// Add CORS headers for Mini App
api.addHook('onRequest', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type');
  if (request.method === 'OPTIONS') {
    return reply.status(200).send();
  }
});

function fromNano(value: bigint) {
  return Number(value) / 1e9;
}

function roundText(state: Awaited<ReturnType<typeof ton.getRoundState>>) {
  return (
    `Раунд #${state.round}\n` +
    `Ключей продано: ${state.sold} / ${state.target}\n` +
    `В пуле: ${state.potTon.toFixed(2)} TON\n` +
    `Цена ключа: ${state.priceTon.toFixed(2)} TON\n` +
    `Главный приз: ~${(state.potTon * 0.15).toFixed(2)} TON`
  );
}

function buyKeyboard(round: number) {
  return new InlineKeyboard()
    .text('Купить 1', `buy:1:${round}`).row()
    .text('Купить X', `buy:custom:${round}`);
}

bot.catch((err) => {
  console.error('Bot error:', err);
});

bot.command('start', async (ctx) => {
  try {
    // Welcome message with image and Mini App button
    const welcomeText = 
      `🚀 *Degen Pool*\n\n` +
      `Buy keys → fill the pot → ONE transaction triggers the chaos\n\n` +
      `Last buyers take the fattest shares, 94% to players, zero mercy.\n` +
      `Round ends automatically, winners paid instantly.\n\n` +
      `Hop in or stay poor. 🚀`;
    
    const keyboard = new InlineKeyboard()
      .webApp('🎮 Открыть Mini App', config.webAppUrl)
      .row()
      .text('📊 Текущий раунд', 'show_round');
    
    // Send photo if URL is provided, otherwise send text
    if (config.welcomeImageUrl) {
      await ctx.replyWithPhoto(config.welcomeImageUrl, {
        caption: welcomeText,
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } else {
      await ctx.reply(welcomeText, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    }
  } catch (error: any) {
    console.error('Error in /start:', error);
    await ctx.reply(`Ошибка: ${error.message || 'Не удалось получить данные контракта'}`);
  }
});

bot.command('round', async (ctx) => {
  const state = await ton.getRoundState();
  const participants = await ton.getLastParticipants();
  const list = participants
    .map((p) => `#${p.index + 1} · ${p.address}`)
    .join('\n') || '—';
  await ctx.reply(`${roundText(state)}\n\nПоследние участники:\n${list}`);
});

bot.command('admin', async (ctx) => {
  await ctx.reply('Админ-панель доступна после подтверждения TON-кошелька.', {
    reply_markup: new InlineKeyboard().url('Открыть WebApp', `${config.webAppUrl}?mode=admin`)
  });
});

bot.command('setround', async (ctx) => {
  // Quick admin command to set round: /setround price target
  // Example: /setround 1 4 (1 TON per key, 4 keys target)
  if (!ctx.message?.text) return;
  
  const args = ctx.message.text.split(' ');
  if (args.length < 3) {
    await ctx.reply('Использование: /setround <цена_в_тон> <количество_ключей>\nПример: /setround 1 4');
    return;
  }
  
  const priceTon = parseFloat(args[1]);
  const target = parseInt(args[2]);
  
  if (isNaN(priceTon) || priceTon < 1 || priceTon > 50) {
    await ctx.reply('Цена должна быть от 1 до 50 TON');
    return;
  }
  
  if (isNaN(target) || target < 1 || target > 1000000) {
    await ctx.reply('Количество ключей должно быть от 1 до 1000000');
    return;
  }
  
  const priceNano = BigInt(Math.floor(priceTon * 1e9));
  const link = ton.adminConfigLink({
    priceNano,
    ownerFeeBps: 600, // 6%
    nextTarget: target,
    autoDouble: false
  });
  
  await ctx.reply(`Настройка раунда:\nЦена: ${priceTon} TON\nЦель: ${target} ключей\n\nПодтверди в кошельке:`, {
    reply_markup: new InlineKeyboard().url('🔗 Подтвердить', link)
  });
});

async function sendPayment(ctx: any, amount: number, state: Awaited<ReturnType<typeof ton.getRoundState>>) {
  const available = state.target - state.sold;
  if (amount < 1) {
    await ctx.reply('Нужно указать число ключей больше нуля.');
    return;
  }
  if (amount > available) {
    await ctx.reply(`В раунде осталось только ${available} ключей.`);
    return;
  }
  const links = ton.buyLink(amount, state.round, state.priceNano);
  const totalTon = fromNano(state.priceNano * BigInt(amount));
  await ctx.reply(`Оплати ${amount} ключей (${totalTon.toFixed(2)} TON)`, {
    reply_markup: new InlineKeyboard()
      .url('💳 Оплатить', links.tonConnect)
  });
}

bot.on('callback_query:data', async (ctx) => {
  const data = ctx.callbackQuery.data;
  
  // Handle show_round button
  if (data === 'show_round') {
    try {
      const state = await ton.getRoundState();
      await ctx.answerCallbackQuery();
      await ctx.editMessageText(roundText(state), {
        reply_markup: buyKeyboard(state.round)
      });
    } catch (error: any) {
      await ctx.answerCallbackQuery({ text: 'Ошибка загрузки данных', show_alert: true });
    }
    return;
  }
  
  const [action, valueRaw, roundRaw] = data.split(':');
  if (action !== 'buy') return ctx.answerCallbackQuery();
  const round = Number(roundRaw);
  const state = await ton.getRoundState();
  if (round !== state.round) {
    await ctx.answerCallbackQuery({ text: 'Раунд обновился, нажми снова', show_alert: true });
    return;
  }

  if (valueRaw === 'custom') {
    pendingCustomBuys.set(ctx.from.id.toString(), true);
    await ctx.answerCallbackQuery();
    await ctx.reply('Сколько ключей хотите купить? (1–100)', {
      reply_markup: { force_reply: true }
    });
    return;
  }

  const amount = Number(valueRaw);
  await ctx.answerCallbackQuery();
  await sendPayment(ctx, amount, state);
});

bot.on('message:text', async (ctx: any, next: NextFunction) => {
  const key = ctx.from?.id.toString();
  if (!key || !pendingCustomBuys.has(key) || !ctx.message?.text) {
    await next();
    return;
  }

  pendingCustomBuys.delete(key);
  const input = ctx.message.text.trim();
  const amount = Number(input);
  if (!Number.isFinite(amount) || amount < 1) {
    await ctx.reply('Нужно указать число ключей от 1 до 100.');
    return;
  }
  if (amount > 100) {
    await ctx.reply('За одну транзакцию можно купить максимум 100 ключей.');
    return;
  }
  const state = await ton.getRoundState();
  await sendPayment(ctx, amount, state);
});

api.get('/health', async () => ({ ok: true }));
api.get('/api/round', async () => {
  const state = await ton.getRoundState();
  return {
    priceNano: state.priceNano.toString(),
    priceTon: state.priceTon,
    ownerFeeBps: state.ownerFeeBps,
    round: state.round,
    target: state.target,
    sold: state.sold,
    autoDouble: state.autoDouble,
    potTon: state.potTon
  };
});
api.get('/api/current-round', async () => {
  const state = await ton.getRoundState();
  // Convert contract address to non-bounceable format for deeplink
  const addr = Address.parse(config.contractAddress);
  const nonBounceableAddress = addr.toString({ bounceable: false, urlSafe: true });
  
  return {
    round_id: state.round,
    ticket_price_ton: state.priceTon,
    max_tickets: state.target,
    sold_tickets: state.sold,
    status: state.sold >= state.target ? 'waiting_draw' : 'active',
    target_address: nonBounceableAddress
  };
});
api.get('/api/user/stats', async (request) => {
  // For now, return mock data - will be implemented with real user tracking
  // In production, extract user ID from Telegram WebApp initData
  const params = new URLSearchParams(request.url.split('?')[1] || '');
  const userId = params.get('user_id') || '0';
  
  // TODO: Implement real user stats tracking
  // For now, return default values
  return {
    user_has_ticket: false,
    ticket_count: 0,
    referral_code: undefined,
    referral_stats: {
      level1_count: 0,
      level2_count: 0,
      tickets_from_level1: 0,
      tickets_from_level2: 0
    }
  };
});
api.get('/api/participants', async () => ton.getLastParticipants());
api.post('/api/buy', async (request, reply) => {
  const body = request.body as { count?: number };
  if (!body?.count || body.count < 1 || body.count > 100) {
    reply.status(400);
    return { error: 'invalid_count' };
  }
  const state = await ton.getRoundState();
  const links = ton.buyLink(body.count, state.round, state.priceNano);
  return {
    tonConnect: links.tonConnect,
    telegramWallet: links.telegramWallet,
    round: state.round
  };
});

function assertAdmin(wallet: string, reply: any) {
  if (wallet !== config.adminAddress) {
    reply.status(403);
    throw new Error('unauthorized');
  }
}

api.post('/api/admin/config', async (request, reply) => {
  const body = request.body as {
    wallet: string;
    priceNano: string;
    ownerFeeBps: number;
    nextTarget: number;
    autoDouble: boolean;
  };
  assertAdmin(body.wallet, reply);
  return {
    link: ton.adminConfigLink({
      priceNano: BigInt(body.priceNano),
      ownerFeeBps: body.ownerFeeBps,
      nextTarget: body.nextTarget,
      autoDouble: body.autoDouble
    })
  };
});

api.post('/api/admin/finish', async (request, reply) => {
  const body = request.body as { wallet: string };
  assertAdmin(body.wallet, reply);
  return { link: ton.forceFinishLink() };
});

api.post('/api/admin/withdraw', async (request, reply) => {
  const body = request.body as { wallet: string };
  assertAdmin(body.wallet, reply);
  return { link: ton.withdrawLink() };
});

async function main() {
  await bot.api.deleteWebhook();
  bot.start();
  const port = Number(process.env.PORT ?? 8080);
  await api.listen({ port, host: '0.0.0.0' });
  console.log(`Bot is running, REST on ${port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
