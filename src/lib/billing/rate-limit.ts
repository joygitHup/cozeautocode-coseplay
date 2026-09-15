type Bucket = { count: number; resetAt: number };

const guestBuckets = new Map<string, Bucket>();
const ipBuckets = new Map<string, Bucket>();
const imageHashBuckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const IMAGE_HASH_WINDOW_MS = 10 * 60_000;
const MAX_PER_GUEST = 8;
const MAX_PER_IP = 20;
const MAX_PER_IMAGE_HASH = 3;

function hit(
  map: Map<string, Bucket>,
  key: string,
  max: number,
  windowMs = WINDOW_MS,
): boolean {
  const now = Date.now();
  const current = map.get(key);
  if (!current || current.resetAt <= now) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= max) {
    return false;
  }
  current.count += 1;
  return true;
}

export function checkGenerationRateLimit(
  guestId: string,
  request: { headers: Headers },
  imageHash?: string | null,
): { ok: true } | { ok: false; reason: 'guest' | 'ip' | 'image' } {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip =
    forwarded?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (!hit(guestBuckets, guestId, MAX_PER_GUEST)) {
    return { ok: false, reason: 'guest' };
  }
  if (!hit(ipBuckets, ip, MAX_PER_IP)) {
    return { ok: false, reason: 'ip' };
  }
  if (
    imageHash &&
    !hit(imageHashBuckets, imageHash, MAX_PER_IMAGE_HASH, IMAGE_HASH_WINDOW_MS)
  ) {
    return { ok: false, reason: 'image' };
  }
  return { ok: true };
}
