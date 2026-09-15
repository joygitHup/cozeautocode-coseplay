import { NextRequest, NextResponse } from 'next/server';
import { getPaymentMode } from '@/lib/billing/payment';
import { getOrder, markOrderPaid } from '@/lib/billing/store';
import { getSiteUrl } from '@/lib/seo';

/** 开发/演示环境：模拟支付成功并加次数 */
export async function GET(request: NextRequest) {
  if (getPaymentMode() !== 'mock') {
    return NextResponse.json(
      { error: 'Mock pay disabled' },
      { status: 403 },
    );
  }

  const orderId = request.nextUrl.searchParams.get('orderId');
  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
  }

  const existing = await getOrder(orderId);
  if (!existing) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  await markOrderPaid(orderId, `mock_${Date.now()}`);

  const returnTo =
    request.nextUrl.searchParams.get('returnTo') ||
    `${getSiteUrl()}/?paid=1&orderId=${orderId}`;

  return NextResponse.redirect(returnTo);
}
