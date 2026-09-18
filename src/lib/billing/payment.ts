import { createHmac, timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';
import { getSiteUrl } from '@/lib/seo';
import type { CreditPack } from '@/lib/billing/products';
import type { OrderRecord } from '@/lib/billing/store-types';
import {
  createWechatOrder,
  type WechatCheckoutResult,
  type WechatScene,
} from '@/lib/billing/wechat-v3';

export type PaymentChannel = 'mock' | 'wechat' | 'alipay';

/** mock = 本地演示；wechat_direct = 微信支付 V3 直连 */
export type PaymentMode = 'mock' | 'wechat_direct';

export function getPaymentMode(): PaymentMode {
  const mode = process.env.PAYMENT_MODE?.toLowerCase();
  return mode === 'wechat_direct' ? 'wechat_direct' : 'mock';
}

export function resolveChannel(preferred?: string): PaymentChannel {
  if (preferred === 'alipay' || preferred === 'wechat' || preferred === 'mock') {
    return preferred;
  }
  // 默认按 mode 选：mock 时 mock，wechat_direct 时 wechat
  return getPaymentMode() === 'mock' ? 'mock' : 'wechat';
}

/** 真实支付上线前校验：域名、密钥、管理员口令 */
export function assertProductionBillingConfig(): void {
  const mode = getPaymentMode();
  const siteUrl = getSiteUrl();
  const isProdLike =
    mode === 'wechat_direct' || process.env.NODE_ENV === 'production';

  if (mode === 'wechat_direct') {
    const required = [
      'WECHAT_MCHID',
      'WECHAT_APPID',
      'WECHAT_API_V3_KEY',
      'WECHAT_PRIVATE_KEY_PATH',
      'WECHAT_CERT_SERIAL_NO',
    ];
    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`微信支付 V3 缺少配置：${key}`);
      }
    }
    if (
      !process.env.NEXT_PUBLIC_SITE_URL ||
      siteUrl.includes('localhost') ||
      siteUrl.includes('your-domain')
    ) {
      throw new Error(
        '真实支付必须设置公网 NEXT_PUBLIC_SITE_URL（不可为 localhost / your-domain）',
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

export type CheckoutResult =
  | { orderId: string; payUrl: string; channel: 'mock'; mock: true }
  | (WechatCheckoutResult & { mock: false });

export async function createCheckoutSession(input: {
  order: OrderRecord;
  pack: CreditPack;
  channel: PaymentChannel;
  scene?: WechatScene;
  openid?: string;
  returnUrl?: string;
  headers: Headers;
}): Promise<CheckoutResult> {
  const mode = getPaymentMode();
  const siteUrl = getSiteUrl();

  if (mode === 'mock' || input.channel === 'mock') {
    return {
      orderId: input.order.id,
      payUrl: `${siteUrl}/api/billing/mock-pay?orderId=${input.order.id}`,
      channel: 'mock',
      mock: true,
    };
  }

  assertProductionBillingConfig();

  const scene: WechatScene =
    input.scene ||
    resolveWechatScene({
      userAgent: input.headers.get('user-agent') || '',
      openidProvided: Boolean(input.openid),
    });

  const result = await createWechatOrder({
    order: input.order,
    pack: input.pack,
    scene,
    openid: input.openid,
    returnUrl: input.returnUrl,
    headers: input.headers,
  });

  return { ...result, mock: false };
}

/** 根据 UA 推断微信支付场景 */
export function resolveWechatScene(input: {
  userAgent: string;
  openidProvided?: boolean;
}): WechatScene {
  const ua = input.userAgent.toLowerCase();
  if (ua.includes('micromessenger')) {
    // 微信内浏览器或小程序 webview，需要 JSAPI
    return 'jsapi';
  }
  // 简单 mobile 检测
  const isMobile =
    ua.includes('mobile') ||
    ua.includes('android') ||
    ua.includes('iphone');
  if (isMobile) return 'h5';
  return 'native';
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

/** 兼容老调用方：从 NextRequest 头读取 UA 并推断场景 */
export function resolveWechatSceneFromRequest(
  request: NextRequest,
  openid?: string,
): WechatScene {
  return resolveWechatScene({
    userAgent: request.headers.get('user-agent') || '',
    openidProvided: Boolean(openid),
  });
}
