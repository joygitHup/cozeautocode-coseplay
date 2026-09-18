import { NextRequest, NextResponse } from 'next/server';
import { attachGuestCookie, resolveGuestId } from '@/lib/billing/guest';
import {
  computeCheckoutAmount,
  resolveEffectivePacks,
} from '@/lib/billing/config';
import {
  createCheckoutSession,
  resolveChannel,
} from '@/lib/billing/payment';
import type { WechatScene } from '@/lib/billing/wechat-v3';
import {
  createOrder,
  getPricingConfig,
  guestHasPaidOrder,
} from '@/lib/billing/store';

export async function POST(request: NextRequest) {
  const { guestId, isNew } = resolveGuestId(request);

  try {
    const body = (await request.json()) as {
      packId?: string;
      channel?: string;
      returnPath?: string;
      scene?: WechatScene;
      openid?: string;
    };
    const pricing = await getPricingConfig();
    const packs = resolveEffectivePacks(pricing);
    const pack = body.packId
      ? packs.find((item) => item.id === body.packId)
      : undefined;
    if (!pack) {
      const response = NextResponse.json(
        { error: '无效的次数包' },
        { status: 400 },
      );
      if (isNew) attachGuestCookie(response, guestId);
      return response;
    }

    const isFirstPaidOrder = !(await guestHasPaidOrder(guestId));
    const priced = computeCheckoutAmount({
      pack,
      pricing,
      isFirstPaidOrder,
    });

    const channel = resolveChannel(body.channel);
    const order = await createOrder({
      guestId,
      packId: pack.id,
      credits: pack.credits,
      amountFen: priced.amountFen,
      listPriceFen: priced.listPriceFen,
      discountFen: priced.discountFen,
      channel,
    });

    const checkout = await createCheckoutSession({
      order,
      pack,
      channel,
      scene: body.scene,
      openid: body.openid,
      returnUrl: body.returnPath,
      headers: request.headers,
    });

    const response = NextResponse.json({
      orderId: order.id,
      payUrl: 'payUrl' in checkout ? checkout.payUrl : undefined,
      channel: checkout.channel,
      mock: checkout.mock,
      scene: 'scene' in checkout ? checkout.scene : undefined,
      codeUrl: 'codeUrl' in checkout ? checkout.codeUrl : undefined,
      mwebUrl: 'mwebUrl' in checkout ? checkout.mwebUrl : undefined,
      jsapiParams:
        'jsapiParams' in checkout ? checkout.jsapiParams : undefined,
      needOAuth: 'needOAuth' in checkout ? checkout.needOAuth : undefined,
      authorizeUrl:
        'authorizeUrl' in checkout ? checkout.authorizeUrl : undefined,
      amountFen: order.amountFen,
      listPriceFen: order.listPriceFen,
      discountFen: order.discountFen,
      credits: order.credits,
      firstPurchaseApplied: priced.discountFen > 0,
    });
    if (isNew) attachGuestCookie(response, guestId);
    return response;
  } catch (error) {
    console.error('checkout error:', error);
    const response = NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : '创建支付订单失败',
      },
      { status: 500 },
    );
    if (isNew) attachGuestCookie(response, guestId);
    return response;
  }
}
