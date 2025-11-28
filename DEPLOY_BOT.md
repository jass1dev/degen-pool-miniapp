# Деплой бота на хостинг

## Вариант 1: Railway (РЕКОМЕНДУЕТСЯ) ✅

**Плюсы:** Простой, бесплатный план, автоматический деплой из GitHub

### Шаг 1: Подготовка

1. Зарегистрируйся на [Railway](https://railway.app/)
2. Подключи GitHub аккаунт

### Шаг 2: Создай проект

1. Нажми "New Project"
2. Выбери "Deploy from GitHub repo"
3. Выбери репозиторий `degen-pool-miniapp`
4. Railway автоматически определит, что это Node.js проект

### Шаг 3: Настройка

1. В настройках проекта:
   - **Root Directory:** `bot`
   - **Start Command:** `npm start`
   - **Build Command:** `npm run build`

2. Добавь переменные окружения (Variables):
   ```
   BOT_TOKEN=твой_токен_бота
   TONCONNECT_MANIFEST_URL=https://raw.githubusercontent.com/jass1dev/ton-manifest/refs/heads/main/tonconnect-manifest.json
   CONTRACT_ADDRESS=твой_адрес_контракта
   OWNER_TON_ADDRESS=твой_адрес
   ADMIN_TON_ADDRESS=твой_адрес
   WEBAPP_URL=https://jass1dev.github.io/degen-pool-miniapp/
   TONCENTER_API_KEY=
   TONCENTER_ENDPOINT=https://toncenter.com/api/v2/jsonRPC
   ```

3. Railway автоматически назначит публичный URL (например: `https://your-bot.up.railway.app`)

### Шаг 4: Обнови Mini App

1. Добавь секрет в GitHub:
   - https://github.com/jass1dev/degen-pool-miniapp/settings/secrets/actions
   - Name: `VITE_API_BASE`
   - Value: `https://your-bot.up.railway.app` (URL из Railway)

2. Перезапусти workflow Mini App

---

## Вариант 2: Render

**Плюсы:** Бесплатный план, простой деплой

### Шаг 1: Подготовка

1. Зарегистрируйся на [Render](https://render.com/)
2. Подключи GitHub

### Шаг 2: Создай Web Service

1. New → Web Service
2. Выбери репозиторий `degen-pool-miniapp`
3. Настройки:
   - **Name:** `degen-pool-bot`
   - **Root Directory:** `bot`
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`

4. Добавь переменные окружения (Environment Variables)

5. Render назначит URL: `https://degen-pool-bot.onrender.com`

**⚠️ Важно:** На бесплатном плане сервис засыпает после 15 минут бездействия. Первый запрос может занять 30-60 секунд.

---

## Вариант 3: Fly.io

**Плюсы:** Хороший бесплатный план, не засыпает

### Шаг 1: Установка CLI

```bash
curl -L https://fly.io/install.sh | sh
```

### Шаг 2: Логин

```bash
fly auth login
```

### Шаг 3: Создай приложение

```bash
cd bot
fly launch
```

### Шаг 4: Настрой переменные

```bash
fly secrets set BOT_TOKEN=твой_токен
fly secrets set CONTRACT_ADDRESS=адрес
# ... и т.д.
```

### Шаг 5: Деплой

```bash
fly deploy
```

---

## Вариант 4: VPS (DigitalOcean, Hetzner, etc.)

**Плюсы:** Полный контроль, не засыпает, дешево

### Шаг 1: Создай VPS

1. Создай droplet/server (Ubuntu 22.04)
2. Подключись по SSH

### Шаг 2: Установи Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Шаг 3: Клонируй репозиторий

```bash
git clone https://github.com/jass1dev/degen-pool-miniapp.git
cd degen-pool-miniapp/bot
npm install
```

### Шаг 4: Настрой .env

```bash
nano .env
# Заполни все переменные
```

### Шаг 5: Установи PM2

```bash
sudo npm install -g pm2
pm2 start npm --name "degen-bot" -- start
pm2 save
pm2 startup
```

### Шаг 6: Настрой Nginx (опционально, для HTTPS)

```bash
sudo apt install nginx
# Настрой reverse proxy на порт 8080
```

---

## Рекомендация

**Для начала:** Railway (самый простой)
**Для продакшена:** VPS (самый надежный)

После деплоя обнови `VITE_API_BASE` в секретах GitHub для Mini App!

