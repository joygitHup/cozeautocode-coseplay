import { NextRequest, NextResponse } from 'next/server';
import { getOrder } from '@/lib/billing/store';
import {
  availableCredits,
  getOrCreateWallet,
} from '@/lib/billing/store';

type Params = { params: Promise<{ orderId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { orderId } = await params;
  const order = await getOrder(orderId);
  if (!order) {
    return NextResponse.json({ error: '订单不存在' }, { status: 404 });
  }

  const wallet = await getOrCreateWallet(order.guestId);
  return NextResponse.json({
    id: order.id,
    status: order.status,
    packId: order.packId,
    credits: order.credits,
    amountFen: order.amountFen,
    paidAt: order.paidAt,
    available: availableCredits(wallet),
  });
}
