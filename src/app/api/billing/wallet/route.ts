import { NextRequest, NextResponse } from 'next/server';
import { attachGuestCookie, resolveGuestId } from '@/lib/billing/guest';
import {
  computeCheckoutAmount,
  resolveEffectivePacks,
} from '@/lib/billing/config';
import {
  FREE_GENERATIONS_PER_GUEST,
  formatYuanFromFen,
} from '@/lib/billing/products';
import { getPaymentMode } from '@/lib/billing/payment';
import {
  availableCredits,
  getOrCreateWallet,
  getPricingConfig,
  guestHasPaidOrder,
} from '@/lib/billing/store';

export async function GET(request: NextRequest) {
  const { guestId, isNew } = resolveGuestId(request);
  const wallet = await getOrCreateWallet(guestId);
  const pricing = await getPricingConfig();
  const isFirstPaidOrder = !(await guestHasPaidOrder(guestId));
  const packs = resolveEffectivePacks(pricing).map((pack) => {
    const priced = computeCheckoutAmount({
      pack,
      pricing,
      isFirstPaidOrder,
    });
    return {
      ...pack,
      priceFen: priced.amountFen,
      listPriceFen: priced.listPriceFen,
      discountFen: priced.discountFen,
      priceYuan: formatYuanFromFen(priced.amountFen),
      listPriceYuan: formatYuanFromFen(priced.listPriceFen),
      firstPurchaseEligible: priced.discountFen > 0,
    };
  });

  const response = NextResponse.json({
    guestId,
    phone: wallet.phone,
    credits: wallet.credits,
    freeLeft: Math.max(0, FREE_GENERATIONS_PER_GUEST - wallet.freeUsed),
    available: availableCredits(wallet),
    freePerGuest: FREE_GENERATIONS_PER_GUEST,
    paymentMode: getPaymentMode(),
    firstPurchaseEligible:
      isFirstPaidOrder && pricing.firstPurchaseDiscountEnabled,
    firstPurchaseDiscountFen: pricing.firstPurchaseDiscountFen,
    packs,
  });
  if (isNew) attachGuestCookie(response, guestId);
  return response;
}
