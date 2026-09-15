import { NextRequest, NextResponse } from 'next/server';
import { getPaymentMode, verifyXunhuSign } from '@/lib/billing/payment';
import { markOrderPaid } from '@/lib/billing/store';

async function parseBody(
  request: NextRequest,
): Promise<Record<string, string>> {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = (await request.json()) as Record<string, unknown>;
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(json)) {
      if (value == null) continue;
      result[key] = String(value);
    }
    return result;
  }

  const text = await request.text();
  const params = new URLSearchParams(text);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const params = await parseBody(request);
    const mode = getPaymentMode();

    if (mode === 'xunhupay') {
      const secret = process.env.XUNHUPAY_APPSECRET;
      if (!secret) {
        return NextResponse.json(
          { error: 'Payment not configured' },
          { status: 500 },
        );
      }
      if (!verifyXunhuSign(params, secret)) {
        return new NextResponse('fail', { status: 400 });
      }
      const orderId = params.trade_order_id;
      const status = params.status;
      if (!orderId) {
        return new NextResponse('fail', { status: 400 });
      }
      // status OD = paid in xunhupay
      if (status && status !== 'OD' && status !== 'paid') {
        return new NextResponse('success');
      }
      const result = await markOrderPaid(orderId, params.transaction_id);
      if (!result) {
        return new NextResponse('fail', { status: 404 });
      }
      return new NextResponse('success');
    }

    // mock / manual webhook
    const orderId = params.orderId || params.trade_order_id;
    const token = params.token || request.headers.get('x-billing-token');
    const expected =
      process.env.BILLING_WEBHOOK_TOKEN ||
      process.env.ADMIN_PASSWORD ||
      'huashangji-admin';
    if (!orderId || token !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const result = await markOrderPaid(orderId, params.providerTradeNo);
    if (!result) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      alreadyPaid: result.alreadyPaid,
      orderId: result.order.id,
    });
  } catch (error) {
    console.error('webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
