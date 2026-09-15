import { NextRequest, NextResponse } from 'next/server';
import {
  signAdminToken,
  verifyAdminSession,
} from '@/lib/billing/payment';
import {
  createStoreCode,
  getAdminStats,
  getPricingConfig,
  listGenerationLogs,
  listOrders,
  listStoreCodes,
  markOrderPaid,
  setStoreCodeActive,
  updatePricingConfig,
} from '@/lib/billing/store';
import {
  computeCheckoutAmount,
  resolveEffectivePacks,
  type PricingConfig,
} from '@/lib/billing/config';
import {
  FREE_GENERATIONS_PER_GUEST,
  estimatedMarginFenPerCredit,
  formatYuanFromFen,
  getEstimatedCostCnyPerGeneration,
  unitPriceFen,
  type CreditPackId,
} from '@/lib/billing/products';
import { getBillingStoreBackend } from '@/lib/billing/store';
import { getSiteUrl } from '@/lib/seo';

const ADMIN_COOKIE = 'huashangji_admin';

function isAuthed(request: NextRequest): boolean {
  return verifyAdminSession(request.cookies.get(ADMIN_COOKIE)?.value);
}

export async function GET(request: NextRequest) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stats = await getAdminStats();
  const orders = await listOrders(50);
  const generations = await listGenerationLogs(50);
  const storeCodes = await listStoreCodes();
  const pricing = await getPricingConfig();
  const packs = resolveEffectivePacks(pricing);
  const siteUrl = getSiteUrl();

  return NextResponse.json({
    stats,
    orders,
    generations,
    storeCodes: storeCodes.map((code) => ({
      ...code,
      claimCount: code.claims.length,
      giftUrl: `${siteUrl}/gift/${code.code}`,
    })),
    pricing,
    products: packs.map((pack) => {
      const priced = computeCheckoutAmount({
        pack,
        pricing,
        isFirstPaidOrder: true,
      });
      return {
        id: pack.id,
        nameZh: pack.nameZh,
        credits: pack.credits,
        priceYuan: formatYuanFromFen(pack.priceFen),
        firstPurchasePriceYuan: formatYuanFromFen(priced.amountFen),
        unitPriceYuan: formatYuanFromFen(unitPriceFen(pack)),
        estimatedMarginYuan: formatYuanFromFen(
          estimatedMarginFenPerCredit(pack),
        ),
        featured: pack.featured ?? false,
      };
    }),
    unitEconomics: {
      estimatedCostCny: getEstimatedCostCnyPerGeneration(),
      freePerGuest: FREE_GENERATIONS_PER_GUEST,
      storeBackend: getBillingStoreBackend(),
      note: '用真实 Coze 账单设置 ESTIMATED_COST_CNY_PER_GENERATION；生产请配置 DATABASE_URL',
    },
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    action?: string;
    password?: string;
    orderId?: string;
    label?: string;
    credits?: number;
    maxClaims?: number;
    code?: string;
    active?: boolean;
    pricing?: Partial<PricingConfig>;
    packId?: CreditPackId;
    priceFen?: number;
  };

  if (body.action === 'login') {
    const { getAdminPassword } = await import('@/lib/billing/payment');
    const password = getAdminPassword();
    if (body.password !== password) {
      return NextResponse.json({ error: '密码错误' }, { status: 401 });
    }
    const token = signAdminToken(password);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }

  if (!isAuthed(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (body.action === 'mark_paid' && body.orderId) {
    const result = await markOrderPaid(body.orderId, `admin_${Date.now()}`);
    if (!result) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, alreadyPaid: result.alreadyPaid });
  }

  if (body.action === 'create_store_code') {
    try {
      const code = await createStoreCode({
        label: body.label || '门店赠送',
        credits: body.credits ?? 1,
        maxClaims: body.maxClaims ?? 200,
        code: body.code,
      });
      const siteUrl = getSiteUrl();
      return NextResponse.json({
        ok: true,
        code,
        giftUrl: `${siteUrl}/gift/${code.code}`,
      });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : '创建失败' },
        { status: 400 },
      );
    }
  }

  if (body.action === 'toggle_store_code' && body.code) {
    const updated = await setStoreCodeActive(
      body.code,
      body.active !== false,
    );
    if (!updated) {
      return NextResponse.json({ error: '门店码不存在' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, code: updated });
  }

  if (body.action === 'update_pricing' && body.pricing) {
    const pricing = await updatePricingConfig(body.pricing);
    return NextResponse.json({ ok: true, pricing });
  }

  if (
    body.action === 'update_pack_price' &&
    body.packId &&
    typeof body.priceFen === 'number'
  ) {
    const current = await getPricingConfig();
    const pricing = await updatePricingConfig({
      packPriceOverrides: {
        ...current.packPriceOverrides,
        [body.packId]: Math.max(1, Math.round(body.priceFen)),
      },
    });
    return NextResponse.json({ ok: true, pricing });
  }

  if (body.action === 'logout') {
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, '', { path: '/', maxAge: 0 });
    return response;
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
