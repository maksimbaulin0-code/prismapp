/**
 * В части клиентов (особенно мобильных WebView) initDataUnsafe.user бывает пустым,
 * при этом user всё ещё лежит в подписанной строке initData.
 */
export function getUserFromTelegramWebApp(): {
  id: number;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
} | null {
  const app = window.Telegram?.WebApp;
  if (!app) return null;

  const unsafe = app.initDataUnsafe?.user;
  if (unsafe?.id) return unsafe;

  const raw = (app as { initData?: string }).initData;
  if (!raw || typeof raw !== 'string') return null;

  try {
    const params = new URLSearchParams(raw);
    const userStr = params.get('user');
    if (!userStr) return null;
    const u = JSON.parse(userStr) as {
      id: number;
      first_name?: string;
      last_name?: string;
      photo_url?: string;
    };
    return u?.id ? u : null;
  } catch {
    return null;
  }
}

export function isInsideTelegramWebApp(): boolean {
  return Boolean(window.Telegram?.WebApp);
}
