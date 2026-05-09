/** Ужимает data URL перед отправкой в API (base64 быстро раздувает JSON и ломает прокси / лимиты). */

const DEFAULT_MAX_DIM = 1600;
const DEFAULT_QUALITY = 0.82;
const MIN_LEN_TO_COMPRESS = 80_000;

export function compressFileToJpegDataUrl(
  file: File,
  maxDim = DEFAULT_MAX_DIM,
  quality = DEFAULT_QUALITY
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        let { width, height } = img;
        const m = Math.max(width, height);
        if (m > maxDim) {
          const s = maxDim / m;
          width = Math.round(width * s);
          height = Math.round(height * s);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas недоступен'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Не удалось прочитать изображение'));
    };
    img.src = url;
  });
}

export async function compressDataUrlIfLarge(
  dataUrl: string,
  maxDim = DEFAULT_MAX_DIM,
  quality = DEFAULT_QUALITY,
  minLen = MIN_LEN_TO_COMPRESS
): Promise<string> {
  if (!dataUrl.startsWith('data:image') || dataUrl.length < minLen) {
    return dataUrl;
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        let { width, height } = img;
        const m = Math.max(width, height);
        const scale = m > maxDim ? maxDim / m : 1;
        const w = Math.round(width * scale);
        const h = Math.round(height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/** Сжимает только картинки, остальные поля профиля пробрасывает как есть. */
export async function shrinkProProfileImagesForApi<T extends { coverImage?: string; portfolio?: string[] }>(
  data: T
): Promise<T> {
  const out = { ...data };
  if (typeof data.coverImage === 'string' && data.coverImage.length > 0) {
    out.coverImage = await compressDataUrlIfLarge(data.coverImage);
  }
  if (data.portfolio?.length) {
    out.portfolio = await Promise.all(data.portfolio.map((p) => compressDataUrlIfLarge(p)));
  }
  return out;
}
