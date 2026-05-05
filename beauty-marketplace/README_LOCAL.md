# Beauty Marketplace TMA - Local Development Setup

## 🚀 Quick Start (Localhost + SQLite + ngrok)

Этот проект настроен для локальной разработки с использованием:
- **Frontend**: Vite + React (порт 5173 или 5174)
- **Backend**: Express + SQLite (порт 3001)
- **Telegram Integration**: ngrok для туннелирования

### Быстрая проверка

✅ Backend запущен: `http://localhost:3001`
✅ Frontend запущен: `http://localhost:5174`

Проверка API:
```bash
curl http://localhost:3001/api/specialists
curl http://localhost:3001/api/categories
```

### 1. Установка зависимостей (если еще не установлено)

```bash
cd /workspace/beauty-marketplace
npm install
```

### 2. Запуск серверов

#### Терминал 1 - Backend (Express + SQLite):
```bash
npm run server
```
Сервер запустится на `http://localhost:3001`
База данных создастся в `/data/marketplace.db`

#### Терминал 2 - Frontend (Vite):
```bash
npm run dev
```
Фронтенд запустится на `http://localhost:5173` или `5174` (доступен по сети благодаря `--host`)

**Примечание**: Если порт 5173 занят, Vite автоматически использует 5174.

### 3. Настройка ngrok для Telegram

1. Установите ngrok: https://ngrok.com/download
2. Запустите туннель для бэкенда:
```bash
ngrok http 3001
```
3. Скопируйте HTTPS URL (например: `https://abc123.ngrok.io`)

### 4. Создание .env файла

Создайте файл `.env` в корне проекта:

```env
VITE_API_URL=https://your-ngrok-url.ngrok.io/api
VITE_TELEGRAM_BOT_TOKEN=your_bot_token
```

### 5. Настройка Telegram Bot

1. Откройте @BotFather в Telegram
2. Создайте нового бота или выберите существующего
3. Используйте команду `/newapp` или настройте Menu Button:
   ```
   /setmenubutton
   ```
4. Укажите URL вашего приложения:
   ```
   https://your-ngrok-url.ngrok.io
   ```

### 6. Тестирование в Telegram

- Откройте вашего бота в Telegram
- Нажмите Menu Button или перейдите по прямой ссылке:
  ```
  https://t.me/your_bot_username/app
  ```

## 📁 Структура проекта

```
beauty-marketplace/
├── server/              # Express backend с SQLite
│   └── index.ts
├── src/
│   ├── hooks/
│   │   ├── useApi.ts       # API client для бэкенда
│   │   └── useTelegram.ts  # Telegram WebApp SDK
│   ├── components/         # UI компоненты
│   ├── pages/             # Страницы приложения
│   └── main.tsx           # Точка входа
├── data/                  # SQLite база данных
│   └── marketplace.db
├── package.json
└── README.md
```

## 🔧 API Endpoints

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/specialists` | Получить всех специалистов (с фильтрацией) |
| GET | `/api/specialists/:id` | Получить специалиста по ID |
| GET | `/api/specialists/:id/services` | Услуги специалиста |
| GET | `/api/categories` | Все категории |
| POST | `/api/bookings` | Создать бронирование |
| GET | `/api/users/:id/bookings` | Бронирования пользователя |
| POST | `/api/users` | Сохранить/обновить пользователя |

## 🎨 Особенности локальной разработки

### Горячая перезагрузка
- Frontend автоматически обновляется при изменении кода
- Backend требует перезапуска при изменении `server/index.ts`

### База данных
- SQLite хранится в `/data/marketplace.db`
- При первом запуске создаются таблицы и тестовые данные
- Для сброса данных удалите файл базы данных

### Telegram WebApp в браузере
Для тестирования без Telegram:
1. Откройте `http://localhost:5174` (или порт который показывает Vite)
2. Добавьте параметр `?tgWebAppData=test` для симуляции
3. Используйте DevTools для эмуляции мобильного устройства

### 📱 Тестирование прямо сейчас

Frontend доступен по адресу: **http://localhost:5174**
Backend API доступен по адресу: **http://localhost:3001/api**

## 🐛 Отладка

### Логи сервера
Бэкенд выводит логи в терминал, где запущен `npm run server`

### Консоль браузера
Откройте DevTools (F12) для просмотра логов фронтенда

### Проверка API
```bash
curl http://localhost:3001/api/specialists
curl http://localhost:3001/api/categories
```

## 🔄 Обновление ngrok URL

При каждом перезапуске ngrok выдает новый URL. Не забудьте:
1. Обновить `.env` файл с новым URL
2. Перезапустить frontend (`npm run dev`)
3. Обновить URL в настройках бота через @BotFather

## 📱 Мобильное тестирование

Так как Vite запущен с `--host`, вы можете открыть приложение с телефона:
1. Узнайте локальный IP компьютера (например, `192.168.1.100`)
2. Откройте в браузере телефона: `http://YOUR_IP:5174`

**Ваш текущий IP для доступа**: http://21.0.5.162:5174/

## ⚡ Production Build

Для сборки production версии:

```bash
npm run build
npm run preview
```

Затем направьте ngrok на порт preview (обычно 4173).
