import { NextRequest, NextResponse } from 'next/server';
import { getPaymentMode } from '@/lib/billing/payment';
import { markOrderPaid } from '@/lib/billing/store';
import { verifyAndParseWechatNotify } from '@/lib/billing/wechat-v3';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    const mode = getPaymentMode();
    if (mode !== 'wechat_direct') {
      return NextResponse.json(
        { error: 'Webhook disabled in mock mode' },
        { status: 403 },
      );
    }

    const result = await verifyAndParseWechatNotify({
      headers: request.headers,
      rawBody,
    });

    if (!result.ok) {
      console.error('wechat webhook verify failed:', result.error);
      return new NextResponse('fail', { status: 400 });
    }

    const paid = await markOrderPaid(result.orderId, result.transactionId);
    if (!paid) {
      return new NextResponse('fail', { status: 404 });
    }

    // 微信要求 200 + JSON 响应
    return NextResponse.json({ code: 'SUCCESS', message: '成功' });
  } catch (error) {
    console.error('wechat webhook error:', error);
    return new NextResponse('fail', { status: 500 });
  }
}
