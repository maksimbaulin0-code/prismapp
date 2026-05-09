/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TELEGRAM_BOT_USERNAME?: string;
  /** Публичный URL бэкенда (Express), без завершающего слэша, без /api — например https://prism-api.railway.app */
  readonly VITE_API_URL?: string;
}
