# 🚂 Деплой бота на Railway - Пошаговая инструкция

## Шаг 1: Регистрация на Railway

1. Открой: https://railway.app/
2. Нажми "Start a New Project"
3. Выбери "Login with GitHub"
4. Разреши доступ к GitHub

## Шаг 2: Создание проекта

1. После входа нажми "New Project"
2. Выбери "Deploy from GitHub repo"
3. Выбери репозиторий: `jass1dev/degen-pool-miniapp`
4. Railway автоматически начнет деплой

## Шаг 3: Настройка Root Directory

1. В настройках проекта (Settings) найди "Root Directory"
2. Установи: `bot`
3. Сохрани изменения

## Шаг 4: Настройка Build и Start команд

Railway автоматически определит команды из `package.json`, но можно проверить:

1. Settings → Build & Deploy
2. **Build Command:** `npm run build` (должно быть автоматически)
3. **Start Command:** `npm start` (должно быть автоматически)

## Шаг 5: Добавление переменных окружения

1. В проекте открой вкладку "Variables"
2. Добавь все переменные:

```
BOT_TOKEN=7963694071:AAH3nAxflB9HQc3QMvEeatNAXeg8w0_-2wQ
TONCONNECT_MANIFEST_URL=https://raw.githubusercontent.com/jass1dev/ton-manifest/refs/heads/main/tonconnect-manifest.json
CONTRACT_ADDRESS=EQBW49jiBAEvoWd8QHsOn_R2U-F5bG4OrknbdsRqRA_YLWEZ
OWNER_TON_ADDRESS=UQASa9rqs4WbT7DATvXmvFkMGLf2dfmVe0EWbwmOnnqfWoHI
ADMIN_TON_ADDRESS=UQASa9rqs4WbT7DATvXmvFkMGLf2dfmVe0EWbwmOnnqfWoHI
WEBAPP_URL=https://jass1dev.github.io/degen-pool-miniapp/
TONCENTER_API_KEY=
TONCENTER_ENDPOINT=https://toncenter.com/api/v2/jsonRPC
```

**Важно:** Замени значения на свои реальные!

## Шаг 6: Получение публичного URL

1. После деплоя Railway автоматически создаст публичный URL
2. В настройках проекта (Settings) → Networking
3. Нажми "Generate Domain" или используй автоматически созданный
4. Скопируй URL (например: `https://degen-pool-bot.up.railway.app`)

## Шаг 7: Обновление Mini App

1. Открой: https://github.com/jass1dev/degen-pool-miniapp/settings/secrets/actions
2. Нажми "New repository secret"
3. Name: `VITE_API_BASE`
4. Value: URL из Railway (например: `https://degen-pool-bot.up.railway.app`)
5. Сохрани

## Шаг 8: Пересборка Mini App

1. Открой: https://github.com/jass1dev/degen-pool-miniapp/actions
2. Найди workflow "Deploy to GitHub Pages"
3. Нажми "Run workflow" → "Run workflow"
4. Дождись завершения деплоя (2-3 минуты)

## Шаг 9: Проверка

1. Проверь, что бот работает:
   - Открой URL из Railway в браузере
   - Должен вернуться: `{"ok":true}` (эндпоинт `/health`)

2. Проверь Mini App:
   - Открой: https://jass1dev.github.io/degen-pool-miniapp/
   - Должен загрузиться без ошибок

3. Протестируй в Telegram:
   - Открой бота
   - Отправь `/start`
   - Нажми "🎮 Открыть Mini App"
   - Mini App должен работать!

## Troubleshooting

**Бот не запускается:**
- Проверь логи в Railway (Deployments → View Logs)
- Убедись, что все переменные окружения добавлены
- Проверь, что Root Directory установлен в `bot`

**Mini App не может обратиться к API:**
- Проверь, что `VITE_API_BASE` добавлен в секреты GitHub
- Убедись, что URL правильный (с `https://`)
- Проверь CORS в боте (должен быть настроен)

**Ошибки в логах:**
- Проверь, что все переменные окружения правильные
- Убедись, что контракт развернут и адрес правильный

