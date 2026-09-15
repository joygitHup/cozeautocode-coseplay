import { NextRequest, NextResponse } from 'next/server';
import { attachGuestCookie, resolveGuestId } from '@/lib/billing/guest';
import {
  availableCredits,
  claimStoreCode,
  getOrCreateWallet,
} from '@/lib/billing/store';

export async function POST(request: NextRequest) {
  const { guestId, isNew } = resolveGuestId(request);
  try {
    const body = (await request.json()) as {
      code?: string;
      deviceFingerprint?: string;
    };
    const headerFp = request.headers.get('x-device-fp');
    const fingerprint =
      body.deviceFingerprint ||
      (headerFp && headerFp.length >= 8 ? headerFp : null);

    if (!body.code) {
      const response = NextResponse.json(
        { error: '缺少门店码' },
        { status: 400 },
      );
      if (isNew) attachGuestCookie(response, guestId);
      return response;
    }

    const claimed = await claimStoreCode({
      code: body.code,
      guestId,
      fingerprint,
    });
    const wallet = await getOrCreateWallet(guestId);
    const response = NextResponse.json({
      ok: true,
      alreadyClaimed: claimed.alreadyClaimed,
      addedCredits: claimed.credits,
      available: availableCredits(wallet),
    });
    if (isNew) attachGuestCookie(response, guestId);
    return response;
  } catch (error) {
    const response = NextResponse.json(
      {
        error: error instanceof Error ? error.message : '领取失败',
      },
      { status: 400 },
    );
    if (isNew) attachGuestCookie(response, guestId);
    return response;
  }
}
