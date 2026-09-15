import { NextRequest, NextResponse } from 'next/server';
import { attachGuestCookie, resolveGuestId } from '@/lib/billing/guest';
import { availableCredits, bindPhoneToWallet } from '@/lib/billing/store';

export async function POST(request: NextRequest) {
  const { guestId, isNew } = resolveGuestId(request);
  try {
    const body = (await request.json()) as { phone?: string };
    if (!body.phone) {
      const response = NextResponse.json(
        { error: '请输入手机号' },
        { status: 400 },
      );
      if (isNew) attachGuestCookie(response, guestId);
      return response;
    }

    const result = await bindPhoneToWallet(guestId, body.phone);
    const response = NextResponse.json({
      ok: true,
      phone: result.wallet.phone,
      credits: result.wallet.credits,
      available: availableCredits(result.wallet),
      mergedFromGuestId: result.mergedFromGuestId,
    });
    if (isNew) attachGuestCookie(response, guestId);
    return response;
  } catch (error) {
    const response = NextResponse.json(
      {
        error: error instanceof Error ? error.message : '绑定失败',
      },
      { status: 400 },
    );
    if (isNew) attachGuestCookie(response, guestId);
    return response;
  }
}
