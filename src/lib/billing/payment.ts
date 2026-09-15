import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { getSiteUrl } from '@/lib/seo';
import type { CreditPack } from '@/lib/billing/products';
import type { OrderRecord } from '@/lib/billing/store-types';

export type PaymentChannel = 'mock' | 'wechat' | 'alipay';

export function getPaymentMode(): 'mock' | 'xunhupay' {
  const mode = process.env.PAYMENT_MODE?.toLowerCase();
  if (mode === 'xunhupay') return 'xunhupay';
  return 'mock';
}

export function resolveChannel(preferred?: string): PaymentChannel {
  if (preferred === 'alipay' || preferred === 'wechat' || preferred === 'mock') {
    return preferred;
  }
  return getPaymentMode() === 'mock' ? 'mock' : 'wechat';
}

/** 真实支付上线前校验：域名、密钥、管理员口令 */
export function assertProductionBillingConfig(): void {
  const mode = getPaymentMode();
  const siteUrl = getSiteUrl();
  const isProdLike =
    mode === 'xunhupay' || process.env.NODE_ENV === 'production';

  if (mode === 'xunhupay') {
    if (!process.env.XUNHUPAY_APPID || !process.env.XUNHUPAY_APPSECRET) {
      throw new Error(
        'PAYMENT_MODE=xunhupay 时必须配置 XUNHUPAY_APPID / XUNHUPAY_APPSECRET',
      );
    }
    if (
      !process.env.NEXT_PUBLIC_SITE_URL ||
      siteUrl.includes('localhost') ||
      siteUrl.includes('your-domain')
    ) {
      throw new Error(
        '真实支付必须设置公网 NEXT_PUBLIC_SITE_URL（不可为 localhost / your-domain 占位）',
      );
    }
    if (!siteUrl.startsWith('https://')) {
      throw new Error('真实支付要求 NEXT_PUBLIC_SITE_URL 使用 https://');
    }
  }

  if (isProdLike) {
    const password = process.env.ADMIN_PASSWORD;
    if (!password || password === 'huashangji-admin') {
      throw new Error(
        '请修改默认 ADMIN_PASSWORD（不可继续使用 huashangji-admin）',
      );
    }
  }
}

export type CheckoutResult = {
  orderId: string;
  payUrl: string;
  channel: PaymentChannel;
  mock?: boolean;
};

export async function createCheckoutSession(input: {
  order: OrderRecord;
  pack: CreditPack;
  channel: PaymentChannel;
  returnPath?: string;
}): Promise<CheckoutResult> {
  const mode = getPaymentMode();
  const siteUrl = getSiteUrl();

  if (mode === 'mock') {
    return {
      orderId: input.order.id,
      payUrl: `${siteUrl}/api/billing/mock-pay?orderId=${input.order.id}`,
      channel: 'mock',
      mock: true,
    };
  }

  assertProductionBillingConfig();

  const appId = process.env.XUNHUPAY_APPID!;
  const appSecret = process.env.XUNHUPAY_APPSECRET!;

  const notifyUrl =
    process.env.XUNHUPAY_NOTIFY_URL || `${siteUrl}/api/billing/webhook`;
  const returnPath =
    input.returnPath ||
    process.env.XUNHUPAY_RETURN_URL ||
    `${siteUrl}/`;
  const returnUrl = returnPath.startsWith('http')
    ? returnPath
    : `${siteUrl}${returnPath.startsWith('/') ? '' : '/'}${returnPath}`;

  const type = input.channel === 'alipay' ? 'alipay' : 'wechat';
  const payload: Record<string, string> = {
    version: '1.1',
    appid: appId,
    trade_order_id: input.order.id,
    total_fee: (input.order.amountFen / 100).toFixed(2),
    title: input.pack.nameZh,
    time: Math.floor(Date.now() / 1000).toString(),
    notify_url: notifyUrl,
    return_url: returnUrl.includes('?')
      ? `${returnUrl}&paid=1&orderId=${input.order.id}`
      : `${returnUrl}?paid=1&orderId=${input.order.id}`,
    callback_url: returnUrl,
    plugins: 'huashangji',
    nonce_str: createHash('md5').update(input.order.id).digest('hex').slice(0, 16),
    type,
  };

  payload.hash = signXunhu(payload, appSecret);

  const endpoint =
    process.env.XUNHUPAY_GATEWAY ||
    'https://api.xunhupay.com/payment/do.html';

  const body = new URLSearchParams(payload);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const json = (await response.json()) as {
    errcode?: number;
    errmsg?: string;
    url?: string;
    url_qrcode?: string;
  };

  if (json.errcode !== 0 || (!json.url && !json.url_qrcode)) {
    throw new Error(json.errmsg || 'Payment gateway error');
  }

  return {
    orderId: input.order.id,
    payUrl: json.url || json.url_qrcode || '',
    channel: input.channel,
    mock: false,
  };
}

export function signXunhu(
  params: Record<string, string>,
  secret: string,
): string {
  const keys = Object.keys(params)
    .filter((key) => key !== 'hash' && params[key] !== '' && params[key] != null)
    .sort();
  const str = keys.map((key) => `${key}=${params[key]}`).join('&');
  return createHash('md5')
    .update(str + secret)
    .digest('hex');
}

export function verifyXunhuSign(
  params: Record<string, string>,
  secret: string,
): boolean {
  const incoming = params.hash;
  if (!incoming) return false;
  const expected = signXunhu(params, secret);
  try {
    return timingSafeEqual(
      Buffer.from(incoming.toLowerCase()),
      Buffer.from(expected.toLowerCase()),
    );
  } catch {
    return false;
  }
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'huashangji-admin';
}

export function signAdminToken(password: string): string {
  const secret = getAdminPassword();
  return createHmac('sha256', secret).update(password).digest('hex');
}

export function verifyAdminSession(token: string | undefined): boolean {
  if (!token) return false;
  const password = getAdminPassword();
  const expected = signAdminToken(password);
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}
