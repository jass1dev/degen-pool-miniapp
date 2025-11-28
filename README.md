# DegenLadder 

Полностью прозрачный TON джекпот: FunC контракт + Telegram бот (grammy + Fastify + TonConnect) + WebApp (Vite + React + Tailwind).

## Структура
- `contracts/DegenJackpot.fc` — смарт-контракт.
- `bot/` — Telegram-бот и REST API.
- `webapp/` — WebApp для пользователей и админ-панели.
- `.env.example`, `webapp/.env.example` — шаблоны переменных окружения.

## 1. Контракт
1. Установи Blueprint CLI: `npm i -g @ton-community/blueprint`.
2. Скомпилируй: `npx blueprint build` (создаёт `build/DegenJackpot.compiled.json`).
3. Деплой: `npx blueprint run deployDegenJackpot --tonconnect` (заполнить адрес админа, цену ключа, fee, target, server_seed). Подтверди транзакцию в TonConnect.
4. Запиши адрес контракта и используй в `.env` бота/WebApp.

## 2. Mini App (WebApp)

### Деплой на GitHub Pages

1. Создай репозиторий на GitHub
2. Настрой GitHub Pages (Settings → Pages → Source: GitHub Actions)
3. Запушь код в main ветку
4. После деплоя Mini App будет доступен по адресу: `https://YOUR_USERNAME.github.io/REPO_NAME/`
5. Настрой бота через [@BotFather](https://t.me/BotFather):
   - `/mybots` → выбери бота → Bot Settings → Menu Button
   - Укажи URL Mini App
6. Обнови `WEBAPP_URL` в `.env` бота

Подробная инструкция: см. `DEPLOY_WEBAPP.md`

## 3. Бот (@DegenLadderBot)
```
cd bot
npm install
cp ../.env.example .env # заполнить реальные значения
npm run build
npm start
```
- `/start` — текущий раунд, кнопки «Купить 1/5/10/50» (TonConnect).
- `/round` — статус + последние участники.
- `/admin` — ссылка на WebApp ?mode=admin.
- REST API (по умолчанию `:8080`):
  - `GET /api/round`, `GET /api/participants`.
  - `POST /api/buy { count }` → TonConnect ссылка.
  - `POST /api/admin/config|finish|withdraw` (только для `ADMIN_TON_ADDRESS`).

## 4. WebApp (локальная разработка)
```
cd webapp
cp .env.example .env
npm install
npm run dev   # локально
npm run build # прод сборка (dist/)
```
- Base view: раунд, прогресс-бар, кнопки покупки, последние выплаты (ссылки на TON Viewer).
- Admin mode `?mode=admin` + TonConnect: меняем цену, процент, target, включаем авто×2, принудительно завершаем раунд/выводим долю.
- Деплой `dist/` на HTTPS-домен → указать в BotFather (`/setdomain`, `/setmenubutton`).

## 4. TonConnect
- Manifest JSON (name, icon, url) выкладывается по HTTPS и используется и ботом, и WebApp.
- Все платежи/админ-действия подтверждаются кошельком, никаких приватных ключей.

## 5. Checklist запуска
1. Деплой контракта, записать адрес.
2. Заполнить `.env` и запустить бота (`npm run start`).
3. Сконфигурировать WebApp, задеплоить на HTTPS.
4. В BotFather настроить WebApp URL и команды.
5. Проверить покупку ключей через TonConnect и автоматический розыгрыш.
