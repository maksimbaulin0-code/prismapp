/** Ссылка для шаринга профиля мастера: Mini App в Telegram или веб-URL. */
export function getSpecialistReferralShareUrl(specialistId: number): string {
  const bot = (import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string | undefined)?.replace(/^@/, '').trim();
  if (bot) {
    return `https://t.me/${bot}?startapp=ref_${specialistId}`;
  }
  if (typeof window === 'undefined') return `?ref=${specialistId}`;
  return `${window.location.origin}${window.location.pathname}?ref=${specialistId}`;
}

/** Нормализация поля Telegram в профиле: без обязательного @, URL оставляем как есть. */
export function normalizeSpecialistTelegramInput(raw: string): string {
  const s = raw.trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  return s.replace(/^@+/, '').trim();
}

/** Для отображения и открытия контакта мастера (ник, канал, ссылка). */
export function telegramContactToOpenUrl(raw: string | null | undefined): { href: string; display: string } | null {
  const s = raw?.trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) {
    const short = s.length > 48 ? `${s.slice(0, 45)}…` : s;
    return { href: s, display: short };
  }
  let path = s.replace(/^@+/, '').trim();
  if (!path) return null;
  if (/^t\.me\//i.test(path)) {
    const slug = path.replace(/^t\.me\//i, '');
    return { href: `https://t.me/${slug}`, display: `@${slug}` };
  }
  return { href: `https://t.me/${path}`, display: s.startsWith('@') ? s : `@${path}` };
}
