import type { CreditPack, CreditPackId } from '@/lib/billing/products';
import { CREDIT_PACKS } from '@/lib/billing/products';

export type PricingConfig = {
  firstPurchaseDiscountEnabled: boolean;
  /** 首单立减金额（分） */
  firstPurchaseDiscountFen: number;
  /** 空数组 = 所有包均可首充优惠 */
  firstPurchasePackIds: CreditPackId[];
  /** 运行时改价：packId → priceFen */
  packPriceOverrides: Partial<Record<CreditPackId, number>>;
};

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  firstPurchaseDiscountEnabled:
    process.env.FIRST_PURCHASE_DISCOUNT_ENABLED === 'true',
  firstPurchaseDiscountFen: Number.parseInt(
    process.env.FIRST_PURCHASE_DISCOUNT_FEN || '200',
    10,
  ),
  firstPurchasePackIds: ['trial'],
  packPriceOverrides: {},
};

export function mergePricingConfig(
  override?: Partial<PricingConfig> | null,
): PricingConfig {
  return {
    ...DEFAULT_PRICING_CONFIG,
    ...override,
    packPriceOverrides: {
      ...DEFAULT_PRICING_CONFIG.packPriceOverrides,
      ...(override?.packPriceOverrides ?? {}),
    },
    firstPurchasePackIds:
      override?.firstPurchasePackIds ??
      DEFAULT_PRICING_CONFIG.firstPurchasePackIds,
  };
}

export function resolvePackPriceFen(
  pack: CreditPack,
  pricing: PricingConfig,
): number {
  const overridden = pricing.packPriceOverrides[pack.id];
  return typeof overridden === 'number' ? overridden : pack.priceFen;
}

export function resolveEffectivePacks(pricing: PricingConfig): CreditPack[] {
  return CREDIT_PACKS.map((pack) => ({
    ...pack,
    priceFen: resolvePackPriceFen(pack, pricing),
  }));
}

export function computeCheckoutAmount(input: {
  pack: CreditPack;
  pricing: PricingConfig;
  isFirstPaidOrder: boolean;
}): { amountFen: number; discountFen: number; listPriceFen: number } {
  const listPriceFen = resolvePackPriceFen(input.pack, input.pricing);
  const packEligible =
    input.pricing.firstPurchasePackIds.length === 0 ||
    input.pricing.firstPurchasePackIds.includes(input.pack.id);

  const discountFen =
    input.isFirstPaidOrder &&
    input.pricing.firstPurchaseDiscountEnabled &&
    packEligible
      ? Math.min(
          Math.max(0, input.pricing.firstPurchaseDiscountFen),
          Math.max(0, listPriceFen - 1),
        )
      : 0;

  return {
    listPriceFen,
    discountFen,
    amountFen: Math.max(1, listPriceFen - discountFen),
  };
}
