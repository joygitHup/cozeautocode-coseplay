/**
 * 微信支付 V3 直连封装
 *
 * - 私钥从 WECHAT_PRIVATE_KEY_PATH 文件路径读取（不入仓）
 * - 公钥从私钥派生（仅用于满足 SDK 构造时的必填校验，serial_no 由 env 提供）
 * - 平台证书由 SDK 在验签时自动从 Pay.certificates 缓存查找，必要时主动 fetchCertificates
 * - 三种下单场景：Native（PC 扫码）/ H5（手机浏览器）/ JSAPI（微信内 + 小程序）
 */
import { createPublicKey, createSign, randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import Pay from 'wechatpay-node-v3';
import type { CreditPack } from '@/lib/billing/products';
import type { OrderRecord } from '@/lib/billing/store-types';
import { getSiteUrl } from '@/lib/seo';

export type WechatScene = 'native' | 'h5' | 'jsapi';

export type WechatCheckoutResult = {
  orderId: string;
  channel: 'wechat';
  scene: WechatScene;
  /** Native 场景：前端渲染二维码的 code_url */
  codeUrl?: string;
  /** H5 场景：手机跳微信 App 的 mweb_url */
  mwebUrl?: string;
  /** JSAPI 场景：前端调起支付的参数包 */
  jsapiParams?: Record<string, string>;
  /** 微信下单返回的 prepay_id，用于调试 */
  prepayId?: string;
  /** JSAPI 缺 openid 时返回，前端引导走 OAuth */
  needOAuth?: boolean;
  authorizeUrl?: string;
};

export type WechatConfig = {
  mchid: string;
  appid: string;
  apiV3Key: string;
  privateKey: string;
  certSerialNo: string;
  notifyUrl: string;
};

let cachedConfig: WechatConfig | null = null;
let cachedPay: Pay | null = null;
let privateKeyBuffer: Buffer | null = null;
let publicKeyBuffer: Buffer | null = null;

export function getWechatConfig(): WechatConfig {
  if (cachedConfig) return cachedConfig;
  const mchid = process.env.WECHAT_MCHID;
  const appid = process.env.WECHAT_APPID;
  const apiV3Key = process.env.WECHAT_API_V3_KEY;
  const privateKeyPath = process.env.WECHAT_PRIVATE_KEY_PATH;
  const certSerialNo = process.env.WECHAT_CERT_SERIAL_NO;
  const notifyUrl =
    process.env.WECHAT_NOTIFY_URL || `${getSiteUrl()}/api/billing/webhook`;

  if (!mchid || !appid || !apiV3Key || !privateKeyPath || !certSerialNo) {
    throw new Error(
      '微信支付 V3 配置不完整：需 WECHAT_MCHID / WECHAT_APPID / WECHAT_API_V3_KEY / WECHAT_PRIVATE_KEY_PATH / WECHAT_CERT_SERIAL_NO',
    );
  }

  cachedConfig = {
    mchid,
    appid,
    apiV3Key,
    privateKey: privateKeyPath,
    certSerialNo,
    notifyUrl,
  };
  return cachedConfig;
}

async function loadKeys(): Promise<{
  privateKey: Buffer;
  publicKey: Buffer;
}> {
  if (privateKeyBuffer && publicKeyBuffer) {
    return { privateKey: privateKeyBuffer, publicKey: publicKeyBuffer };
  }
  const config = getWechatConfig();
  privateKeyBuffer = await fs.readFile(config.privateKey);
  // 从私钥派生公钥，仅用于构造 SDK（serial_no 已由 env 提供，不会用公钥再算）
  const pubKeyObj = createPublicKey({
    key: privateKeyBuffer,
    format: 'pem',
  });
  publicKeyBuffer = Buffer.from(
    pubKeyObj.export({ type: 'spki', format: 'pem' }),
  );
  return { privateKey: privateKeyBuffer, publicKey: publicKeyBuffer };
}

export async function getPayClient(): Promise<Pay> {
  if (cachedPay) return cachedPay;
  const config = getWechatConfig();
  const { privateKey, publicKey } = await loadKeys();
  cachedPay = new Pay({
    appid: config.appid,
    mchid: config.mchid,
    serial_no: config.certSerialNo,
    publicKey,
    privateKey,
    key: config.apiV3Key,
  });
  return cachedPay;
}

/** 平台证书由 SDK 的 verifySign 内部自动拉取并缓存，无需主动调用 */

function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

export async function createWechatOrder(input: {
  order: OrderRecord;
  pack: CreditPack;
  scene: WechatScene;
  openid?: string;
  returnUrl?: string;
  headers: Headers;
}): Promise<WechatCheckoutResult> {
  const { order, pack, scene, openid, returnUrl, headers } = input;
  const config = getWechatConfig();
  const pay = await getPayClient();
  const description = pack.nameZh;
  const baseParams = {
    description,
    out_trade_no: order.id,
    notify_url: config.notifyUrl,
    amount: { total: order.amountFen, currency: 'CNY' },
  };

  if (scene === 'native') {
    const result = await pay.transactions_native({
      ...baseParams,
      scene_info: {
        payer_client_ip: getClientIp(headers),
      },
    });
    if (result.status !== 200 || !result.data?.code_url) {
      throw new Error(
        `微信 Native 下单失败: ${JSON.stringify(result.data ?? result)}`,
      );
    }
    return {
      orderId: order.id,
      channel: 'wechat',
      scene: 'native',
      codeUrl: result.data.code_url as string,
    };
  }

  if (scene === 'h5') {
    const siteUrl = getSiteUrl();
    const h5ReturnUrl = returnUrl
      ? returnUrl.startsWith('http')
        ? returnUrl
        : `${siteUrl}${returnUrl.startsWith('/') ? '' : '/'}${returnUrl}`
      : siteUrl;
    const result = await pay.transactions_h5({
      ...baseParams,
      scene_info: {
        payer_client_ip: getClientIp(headers),
        h5_info: { type: 'Wap', app_name: 'huashangji', app_url: h5ReturnUrl },
      },
    });
    if (result.status !== 200 || !result.data?.h5_url) {
      throw new Error(
        `微信 H5 下单失败: ${JSON.stringify(result.data ?? result)}`,
      );
    }
    return {
      orderId: order.id,
      channel: 'wechat',
      scene: 'h5',
      mwebUrl: result.data.h5_url as string,
    };
  }

  // scene === 'jsapi'
  if (!openid) {
    const siteUrl = getSiteUrl();
    const redirect = returnUrl || `${siteUrl}/`;
    const authorizeUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.appid}&redirect_uri=${encodeURIComponent(
      redirect,
    )}&response_type=code&scope=snsapi_base&state=${order.id}#wechat_redirect`;
    return {
      orderId: order.id,
      channel: 'wechat',
      scene: 'jsapi',
      needOAuth: true,
      authorizeUrl,
    };
  }

  const result = await pay.transactions_jsapi({
    ...baseParams,
    payer: { openid },
    scene_info: { payer_client_ip: getClientIp(headers) },
  });
  if (result.status !== 200 || !result.data?.prepay_id) {
    throw new Error(
      `微信 JSAPI 下单失败: ${JSON.stringify(result.data ?? result)}`,
    );
  }
  const prepayId = result.data.prepay_id as string;
  const jsapiParams = buildJsapiPayParams(prepayId);
  return {
    orderId: order.id,
    channel: 'wechat',
    scene: 'jsapi',
    prepayId,
    jsapiParams,
  };
}

/** 生成 JSAPI 调起支付的参数包（含 paySign，用商户私钥二次签名） */
export function buildJsapiPayParams(prepayId: string): Record<string, string> {
  const config = getWechatConfig();
  const timeStamp = Math.floor(Date.now() / 1000).toString();
  const nonceStr = randomBytes(16).toString('hex');
  const pkg = `prepay_id=${prepayId}`;
  const payload = `${config.appid}\n${timeStamp}\n${nonceStr}\n${pkg}\n`;
  const signer = createSign('RSA-SHA256');
  signer.update(payload);
  // loadKeys 是 async，但这里需要同步；用已缓存的 Buffer
  if (!privateKeyBuffer) {
    throw new Error('JSAPI paySign 需要先调用 getPayClient() 初始化私钥');
  }
  const paySign = signer.sign(privateKeyBuffer, 'base64');
  return {
    appId: config.appid,
    timeStamp,
    nonceStr,
    package: pkg,
    signType: 'RSA',
    paySign,
  };
}

export type WechatNotifyResult =
  | { ok: true; orderId: string; transactionId: string }
  | { ok: false; error: string };

export async function verifyAndParseWechatNotify(input: {
  headers: Headers;
  rawBody: string;
}): Promise<WechatNotifyResult> {
  const { headers, rawBody } = input;
  const timestamp = headers.get('wechatpay-timestamp') || '';
  const nonce = headers.get('wechatpay-nonce') || '';
  const serial = headers.get('wechatpay-serial') || '';
  const signature = headers.get('wechatpay-signature') || '';
  const config = getWechatConfig();
  const pay = await getPayClient();

  let bodyForVerify: string;
  let parsedBody: { resource?: { ciphertext?: string; associated_data?: string; nonce?: string } };
  try {
    parsedBody = JSON.parse(rawBody);
    bodyForVerify = rawBody;
  } catch {
    return { ok: false, error: 'invalid json body' };
  }

  if (!parsedBody.resource) {
    return { ok: false, error: 'missing resource field' };
  }

  let verified: boolean;
  try {
    verified = await pay.verifySign({
      timestamp,
      nonce,
      body: bodyForVerify,
      serial,
      signature,
      apiSecret: config.apiV3Key,
    });
  } catch (err) {
    return {
      ok: false,
      error: `verify error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
  if (!verified) {
    return { ok: false, error: 'signature mismatch' };
  }

  const { ciphertext, associated_data, nonce: resNonce } =
    parsedBody.resource;
  if (!ciphertext || !resNonce) {
    return { ok: false, error: 'incomplete resource ciphertext' };
  }

  let decrypted: { out_trade_no?: string; transaction_id?: string };
  try {
    decrypted = pay.decipher_gcm<{
      out_trade_no?: string;
      transaction_id?: string;
    }>(ciphertext, associated_data || '', resNonce, config.apiV3Key);
  } catch (err) {
    return {
      ok: false,
      error: `decipher error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  if (!decrypted.out_trade_no || !decrypted.transaction_id) {
    return { ok: false, error: 'missing out_trade_no / transaction_id' };
  }

  return {
    ok: true,
    orderId: decrypted.out_trade_no,
    transactionId: decrypted.transaction_id,
  };
}
