const STORAGE_KEY = 'huashangji_device_fp';

function hashString(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/** 轻度设备指纹：稳定本地 ID + 环境弱特征（防免费额度刷号，非强安全） */
export function getDeviceFingerprint(): string {
  if (typeof window === 'undefined') return '';

  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing && existing.length >= 8) return existing;

    const parts = [
      navigator.userAgent,
      navigator.language,
      String(screen.width),
      String(screen.height),
      String(screen.colorDepth),
      String(window.devicePixelRatio || 1),
      Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      String(new Date().getTimezoneOffset()),
    ];
    const seed = `${hashString(parts.join('|'))}${Date.now().toString(36)}`;
    const fingerprint = `fp_${seed}`;
    window.localStorage.setItem(STORAGE_KEY, fingerprint);
    return fingerprint;
  } catch {
    return `fp_fallback_${Date.now().toString(36)}`;
  }
}
