# Деплой Mini App на GitHub Pages

## Вариант 1: Отдельный репозиторий (РЕКОМЕНДУЕТСЯ) ✅

### Шаг 1: Подготовка репозитория

1. Создай новый репозиторий на GitHub (например, `degen-pool-webapp` или `degen-pool-miniapp`)
2. Инициализируй git в проекте (если еще не сделано):
   ```bash
   cd /Users/d/Documents/DegenLadder
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/degen-pool-webapp.git
   git branch -M main
   git push -u origin main
   ```

## Шаг 2: Настройка GitHub Pages

1. Перейди в Settings → Pages твоего репозитория
2. В разделе "Source" выбери "GitHub Actions"
3. Сохрани изменения

## Шаг 3: Настройка Secrets (опционально)

Если хочешь использовать переменные окружения для production:

1. Перейди в Settings → Secrets and variables → Actions
2. Добавь секреты:
   - `VITE_API_BASE` - URL твоего API бота (например, `https://your-bot-api.com` или `http://your-server:8080`)
   - `VITE_TONCONNECT_MANIFEST` - URL манифеста TonConnect

**Важно:** Если не добавишь секреты, будут использованы значения по умолчанию из workflow файла.

## Шаг 4: Деплой

1. Запушь изменения в main ветку:
   ```bash
   git add .
   git commit -m "Deploy webapp"
   git push origin main
   ```

2. GitHub Actions автоматически соберет и задеплоит приложение

3. После деплоя твой Mini App будет доступен по адресу:
   ```
   https://YOUR_USERNAME.github.io/degen-pool-webapp/
   ```

## Шаг 5: Настройка бота через BotFather

1. Открой [@BotFather](https://t.me/BotFather) в Telegram
2. Отправь команду `/mybots`
3. Выбери своего бота
4. Выбери "Bot Settings" → "Menu Button"
5. Выбери "Configure Menu Button"
6. Введи:
   - **Button text:** `🎮 Degen Pool` (или любой другой текст)
   - **URL:** `https://YOUR_USERNAME.github.io/degen-pool-webapp/`
7. Готово! Теперь в боте будет кнопка меню, которая открывает Mini App

## Шаг 6: Обновление .env бота

Обнови `.env` файл бота:
```env
WEBAPP_URL=https://YOUR_USERNAME.github.io/degen-pool-webapp/
```

Перезапусти бота.

---

## Вариант 2: Использовать существующий репозиторий `ton-manifest`

Если хочешь использовать существующий репозиторий [ton-manifest](https://github.com/jass1dev/ton-manifest):

### Шаг 1: Клонируй репозиторий

```bash
cd /Users/d/Documents/DegenLadder
git clone https://github.com/jass1dev/ton-manifest.git temp-manifest
# Скопируй только webapp папку в репозиторий
cp -r webapp temp-manifest/
cd temp-manifest
```

### Шаг 2: Обнови GitHub Actions workflow

Скопируй `.github/workflows/deploy.yml` из этого проекта в `temp-manifest/.github/workflows/deploy-webapp.yml`

### Шаг 3: Настрой GitHub Pages

1. В репозитории `ton-manifest`: Settings → Pages → Source: GitHub Actions
2. Выбери workflow `Deploy to GitHub Pages`

### Шаг 4: Деплой

```bash
git add .
git commit -m "Add Mini App"
git push origin main
```

### Шаг 5: URL Mini App

После деплоя Mini App будет доступен по адресу:
```
https://jass1dev.github.io/ton-manifest/
```

**Важно:** Если в репозитории уже есть другие файлы, может потребоваться настроить base path в `vite.config.ts`.

---

## Альтернатива: Деплой на другой хостинг

Если не хочешь использовать GitHub Pages, можешь задеплоить на:
- **Vercel:** `npm i -g vercel && cd webapp && vercel`
- **Netlify:** Перетащи папку `webapp/dist` на [netlify.com/drop](https://app.netlify.com/drop)
- **Cloudflare Pages:** Подключи репозиторий и укажи build command: `npm run build` и output directory: `webapp/dist`

## Проверка работы

1. Открой бота в Telegram
2. Нажми на кнопку меню (или отправь `/start` и нажми "Открыть Mini App")
3. Mini App должен открыться в Telegram

## Troubleshooting

- **Mini App не открывается:** Проверь, что URL правильный и доступен (открой в браузере)
- **API не работает:** Убедись, что `VITE_API_BASE` указывает на правильный URL бота и CORS настроен
- **Ошибки сборки:** Проверь логи в GitHub Actions → Workflows

