import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import type { NextRequest, NextResponse } from 'next/server';

export const GUEST_COOKIE = 'huashangji_guest_id';
const GUEST_MAX_AGE = 60 * 60 * 24 * 365;

export function createGuestId(): string {
  return `gst_${randomUUID().replace(/-/g, '')}`;
}

export async function getGuestIdFromCookies(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(GUEST_COOKIE)?.value ?? null;
}

export async function ensureGuestId(): Promise<{
  guestId: string;
  isNew: boolean;
}> {
  const jar = await cookies();
  const existing = jar.get(GUEST_COOKIE)?.value;
  if (existing) {
    return { guestId: existing, isNew: false };
  }
  const guestId = createGuestId();
  jar.set(GUEST_COOKIE, guestId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: GUEST_MAX_AGE,
  });
  return { guestId, isNew: true };
}

export function readGuestIdFromRequest(request: NextRequest): string | null {
  return request.cookies.get(GUEST_COOKIE)?.value ?? null;
}

export function attachGuestCookie(
  response: NextResponse,
  guestId: string,
): NextResponse {
  response.cookies.set(GUEST_COOKIE, guestId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: GUEST_MAX_AGE,
  });
  return response;
}

export function resolveGuestId(request: NextRequest): {
  guestId: string;
  isNew: boolean;
} {
  const existing = readGuestIdFromRequest(request);
  if (existing) {
    return { guestId: existing, isNew: false };
  }
  return { guestId: createGuestId(), isNew: true };
}
