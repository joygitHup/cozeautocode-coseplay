import { createHash, randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import {
  DEFAULT_PRICING_CONFIG,
  mergePricingConfig,
  type PricingConfig,
} from '@/lib/billing/config';
import { FREE_GENERATIONS_PER_GUEST } from '@/lib/billing/products';
import type {
  FingerprintRecord,
  GenerationLogRecord,
  OrderRecord,
  ReserveResult,
  StoreCodeRecord,
  WalletRecord,
} from '@/lib/billing/store-types';
import type { OrderStatus } from '@/lib/db/schema';

export type {
  FingerprintRecord,
  GenerationLogRecord,
  OrderRecord,
  ReserveResult,
  StoreCodeRecord,
  WalletRecord,
} from '@/lib/billing/store-types';

type StoreData = {
  wallets: WalletRecord[];
  orders: OrderRecord[];
  generationLogs: GenerationLogRecord[];
  fingerprints: FingerprintRecord[];
  storeCodes: StoreCodeRecord[];
  pricing: PricingConfig;
};

const EMPTY_STORE: StoreData = {
  wallets: [],
  orders: [],
  generationLogs: [],
  fingerprints: [],
  storeCodes: [],
  pricing: { ...DEFAULT_PRICING_CONFIG },
};

function storePath(): string {
  return path.join(process.cwd(), 'data', 'billing-store.json');
}

let writeQueue: Promise<void> = Promise.resolve();

function normalizeWallet(raw: Partial<WalletRecord> & { guestId: string }): WalletRecord {
  const stamp = nowIso();
  return {
    id: raw.id ?? randomUUID(),
    guestId: raw.guestId,
    phone: raw.phone ?? null,
    credits: raw.credits ?? 0,
    freeUsed: raw.freeUsed ?? 0,
    deviceFingerprints: raw.deviceFingerprints ?? [],
    createdAt: raw.createdAt ?? stamp,
    updatedAt: raw.updatedAt ?? stamp,
  };
}

function normalizeOrder(raw: Partial<OrderRecord> & { id: string; guestId: string }): OrderRecord {
  const stamp = nowIso();
  return {
    id: raw.id,
    guestId: raw.guestId,
    packId: raw.packId ?? 'trial',
    credits: raw.credits ?? 0,
    amountFen: raw.amountFen ?? 0,
    listPriceFen: raw.listPriceFen ?? raw.amountFen ?? 0,
    discountFen: raw.discountFen ?? 0,
    channel: raw.channel ?? 'mock',
    status: (raw.status as OrderStatus) ?? 'pending',
    providerTradeNo: raw.providerTradeNo ?? null,
    paidAt: raw.paidAt ?? null,
    createdAt: raw.createdAt ?? stamp,
    updatedAt: raw.updatedAt ?? stamp,
  };
}

async function readStore(): Promise<StoreData> {
  try {
    const raw = await fs.readFile(storePath(), 'utf8');
    const parsed = JSON.parse(raw) as Partial<StoreData>;
    return {
      wallets: (parsed.wallets ?? []).map((w) =>
        normalizeWallet(w as WalletRecord),
      ),
      orders: (parsed.orders ?? []).map((o) =>
        normalizeOrder(o as OrderRecord),
      ),
      generationLogs: (parsed.generationLogs ?? []).map((g) => ({
        ...g,
        imageHash: g.imageHash ?? null,
      })),
      fingerprints: parsed.fingerprints ?? [],
      storeCodes: parsed.storeCodes ?? [],
      pricing: mergePricingConfig(parsed.pricing),
    };
  } catch {
    return structuredClone(EMPTY_STORE);
  }
}

async function writeStore(data: StoreData): Promise<void> {
  const dir = path.dirname(storePath());
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(storePath(), JSON.stringify(data, null, 2), 'utf8');
}

function enqueueWrite(mutator: (data: StoreData) => void | Promise<void>) {
  writeQueue = writeQueue.then(async () => {
    const data = await readStore();
    await mutator(data);
    await writeStore(data);
  });
  return writeQueue;
}

function nowIso(): string {
  return new Date().toISOString();
}

function ensureWallet(data: StoreData, guestId: string): WalletRecord {
  let wallet = data.wallets.find((item) => item.guestId === guestId);
  const stamp = nowIso();
  if (!wallet) {
    wallet = normalizeWallet({ guestId, createdAt: stamp, updatedAt: stamp });
    data.wallets.push(wallet);
  }
  return wallet;
}

export async function getPricingConfig(): Promise<PricingConfig> {
  const data = await readStore();
  return mergePricingConfig(data.pricing);
}

export async function updatePricingConfig(
  patch: Partial<PricingConfig>,
): Promise<PricingConfig> {
  let next: PricingConfig = DEFAULT_PRICING_CONFIG;
  await enqueueWrite((data) => {
    data.pricing = mergePricingConfig({ ...data.pricing, ...patch });
    next = data.pricing;
  });
  return next;
}

export async function getOrCreateWallet(guestId: string): Promise<WalletRecord> {
  let wallet: WalletRecord | undefined;
  await enqueueWrite((data) => {
    wallet = { ...ensureWallet(data, guestId) };
  });
  if (!wallet) throw new Error('Failed to create wallet');
  return wallet;
}

export async function guestHasPaidOrder(guestId: string): Promise<boolean> {
  const data = await readStore();
  return data.orders.some((o) => o.guestId === guestId && o.status === 'paid');
}

function fingerprintFreeLeft(fp: FingerprintRecord | undefined): number {
  if (!fp) return FREE_GENERATIONS_PER_GUEST;
  return Math.max(0, FREE_GENERATIONS_PER_GUEST - fp.freeUsed);
}

/** 原子预扣：优先付费次数，其次免费（guest + 设备指纹双限） */
export async function reserveGenerationCredit(
  guestId: string,
  deviceFingerprint?: string | null,
): Promise<ReserveResult> {
  let result: ReserveResult | undefined;
  await enqueueWrite((data) => {
    const wallet = ensureWallet(data, guestId);
    const stamp = nowIso();
    const creditsBefore = wallet.credits;

    if (deviceFingerprint) {
      if (!wallet.deviceFingerprints.includes(deviceFingerprint)) {
        wallet.deviceFingerprints.push(deviceFingerprint);
      }
    }

    if (wallet.credits > 0) {
      wallet.credits -= 1;
      wallet.updatedAt = stamp;
      result = {
        ok: true,
        wallet: { ...wallet, deviceFingerprints: [...wallet.deviceFingerprints] },
        usedFree: false,
        creditsBefore,
      };
      return;
    }

    let fp: FingerprintRecord | undefined;
    if (deviceFingerprint) {
      fp = data.fingerprints.find((item) => item.fingerprint === deviceFingerprint);
      if (!fp) {
        fp = {
          fingerprint: deviceFingerprint,
          freeUsed: 0,
          guestIds: [guestId],
          updatedAt: stamp,
        };
        data.fingerprints.push(fp);
      } else if (!fp.guestIds.includes(guestId)) {
        fp.guestIds.push(guestId);
      }
    }

    const guestFreeOk = wallet.freeUsed < FREE_GENERATIONS_PER_GUEST;
    const fpFreeOk = fingerprintFreeLeft(fp) > 0;

    if (guestFreeOk && fpFreeOk) {
      wallet.freeUsed += 1;
      wallet.updatedAt = stamp;
      if (fp) {
        fp.freeUsed += 1;
        fp.updatedAt = stamp;
      }
      result = {
        ok: true,
        wallet: { ...wallet, deviceFingerprints: [...wallet.deviceFingerprints] },
        usedFree: true,
        creditsBefore,
      };
      return;
    }

    result = {
      ok: false,
      code: 'NEED_CREDITS',
      wallet: { ...wallet, deviceFingerprints: [...wallet.deviceFingerprints] },
    };
  });

  if (!result) throw new Error('Reserve failed');
  return result;
}

export async function rollbackGenerationCredit(
  guestId: string,
  usedFree: boolean,
  deviceFingerprint?: string | null,
): Promise<WalletRecord> {
  let wallet: WalletRecord | undefined;
  await enqueueWrite((data) => {
    wallet = ensureWallet(data, guestId);
    if (usedFree) {
      wallet.freeUsed = Math.max(0, wallet.freeUsed - 1);
      if (deviceFingerprint) {
        const fp = data.fingerprints.find(
          (item) => item.fingerprint === deviceFingerprint,
        );
        if (fp) {
          fp.freeUsed = Math.max(0, fp.freeUsed - 1);
          fp.updatedAt = nowIso();
        }
      }
    } else {
      wallet.credits += 1;
    }
    wallet.updatedAt = nowIso();
  });
  if (!wallet) throw new Error('Wallet not found for rollback');
  return wallet;
}

export async function addCredits(
  guestId: string,
  credits: number,
): Promise<WalletRecord> {
  let wallet: WalletRecord | undefined;
  await enqueueWrite((data) => {
    wallet = ensureWallet(data, guestId);
    wallet.credits += credits;
    wallet.updatedAt = nowIso();
  });
  if (!wallet) throw new Error('Failed to add credits');
  return wallet;
}

export async function bindPhoneToWallet(
  guestId: string,
  phone: string,
): Promise<{ wallet: WalletRecord; mergedFromGuestId: string | null }> {
  const normalized = phone.replace(/\s+/g, '');
  if (!/^1\d{10}$/.test(normalized)) {
    throw new Error('手机号格式不正确');
  }

  let outcome: { wallet: WalletRecord; mergedFromGuestId: string | null } | undefined;
  await enqueueWrite((data) => {
    const current = ensureWallet(data, guestId);
    const stamp = nowIso();
    const other = data.wallets.find(
      (w) => w.phone === normalized && w.guestId !== guestId,
    );

    if (other) {
      current.credits += other.credits;
      current.freeUsed = Math.max(current.freeUsed, other.freeUsed);
      current.deviceFingerprints = Array.from(
        new Set([...current.deviceFingerprints, ...other.deviceFingerprints]),
      );
      current.phone = normalized;
      current.updatedAt = stamp;

      for (const order of data.orders) {
        if (order.guestId === other.guestId) order.guestId = guestId;
      }
      for (const log of data.generationLogs) {
        if (log.guestId === other.guestId) log.guestId = guestId;
      }
      data.wallets = data.wallets.filter((w) => w.guestId !== other.guestId);
      outcome = {
        wallet: { ...current },
        mergedFromGuestId: other.guestId,
      };
      return;
    }

    current.phone = normalized;
    current.updatedAt = stamp;
    outcome = { wallet: { ...current }, mergedFromGuestId: null };
  });

  if (!outcome) throw new Error('绑定失败');
  return outcome;
}

export async function createOrder(input: {
  guestId: string;
  packId: string;
  credits: number;
  amountFen: number;
  listPriceFen: number;
  discountFen: number;
  channel: string;
}): Promise<OrderRecord> {
  const stamp = nowIso();
  const order: OrderRecord = {
    id: `ord_${randomUUID().replace(/-/g, '').slice(0, 20)}`,
    guestId: input.guestId,
    packId: input.packId,
    credits: input.credits,
    amountFen: input.amountFen,
    listPriceFen: input.listPriceFen,
    discountFen: input.discountFen,
    channel: input.channel,
    status: 'pending',
    providerTradeNo: null,
    paidAt: null,
    createdAt: stamp,
    updatedAt: stamp,
  };
  await enqueueWrite((data) => {
    data.orders.push(order);
  });
  return order;
}

export async function getOrder(orderId: string): Promise<OrderRecord | null> {
  const data = await readStore();
  return data.orders.find((item) => item.id === orderId) ?? null;
}

export async function markOrderPaid(
  orderId: string,
  providerTradeNo?: string,
): Promise<{ order: OrderRecord; alreadyPaid: boolean } | null> {
  let outcome: { order: OrderRecord; alreadyPaid: boolean } | null = null;
  await enqueueWrite((data) => {
    const order = data.orders.find((item) => item.id === orderId);
    if (!order) {
      outcome = null;
      return;
    }
    if (order.status === 'paid') {
      outcome = { order: { ...order }, alreadyPaid: true };
      return;
    }
    const stamp = nowIso();
    order.status = 'paid';
    order.providerTradeNo = providerTradeNo ?? order.providerTradeNo;
    order.paidAt = stamp;
    order.updatedAt = stamp;

    const wallet = ensureWallet(data, order.guestId);
    wallet.credits += order.credits;
    wallet.updatedAt = stamp;

    outcome = { order: { ...order }, alreadyPaid: false };
  });
  return outcome;
}

export async function listOrders(limit = 100): Promise<OrderRecord[]> {
  const data = await readStore();
  return [...data.orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export async function appendGenerationLog(
  input: Omit<GenerationLogRecord, 'id' | 'createdAt'>,
): Promise<GenerationLogRecord> {
  const log: GenerationLogRecord = {
    ...input,
    id: randomUUID(),
    createdAt: nowIso(),
  };
  await enqueueWrite((data) => {
    data.generationLogs.push(log);
  });
  return log;
}

export async function listGenerationLogs(
  limit = 100,
): Promise<GenerationLogRecord[]> {
  const data = await readStore();
  return [...data.generationLogs]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export function availableCredits(wallet: WalletRecord): number {
  const freeLeft = Math.max(0, FREE_GENERATIONS_PER_GUEST - wallet.freeUsed);
  return wallet.credits + freeLeft;
}

export function hashImagePayload(photoBase64: string): string {
  const sample =
    photoBase64.length > 12000
      ? `${photoBase64.slice(0, 6000)}${photoBase64.slice(-6000)}${photoBase64.length}`
      : photoBase64;
  return createHash('sha256').update(sample).digest('hex').slice(0, 32);
}

export async function createStoreCode(input: {
  label: string;
  credits?: number;
  maxClaims?: number;
  code?: string;
}): Promise<StoreCodeRecord> {
  const code =
    input.code?.trim().toUpperCase() ||
    `STORE${randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
  const record: StoreCodeRecord = {
    code,
    label: input.label.trim() || code,
    credits: input.credits ?? 1,
    maxClaims: input.maxClaims ?? 200,
    active: true,
    claims: [],
    createdAt: nowIso(),
  };
  let errorMsg: string | null = null;
  await enqueueWrite((data) => {
    if (data.storeCodes.some((item) => item.code === code)) {
      errorMsg = '门店码已存在';
      return;
    }
    data.storeCodes.push(record);
  });
  if (errorMsg) throw new Error(errorMsg);
  return record;
}

export async function listStoreCodes(): Promise<StoreCodeRecord[]> {
  const data = await readStore();
  return [...data.storeCodes].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export async function claimStoreCode(input: {
  code: string;
  guestId: string;
  fingerprint?: string | null;
}): Promise<{ credits: number; alreadyClaimed: boolean }> {
  const code = input.code.trim().toUpperCase();
  let outcome: { credits: number; alreadyClaimed: boolean } | undefined;
  let errorMsg: string | null = null;

  await enqueueWrite((data) => {
    const store = data.storeCodes.find((item) => item.code === code);
    if (!store || !store.active) {
      errorMsg = '门店码无效或已停用';
      return;
    }
    const claimed = store.claims.some(
      (c) =>
        c.guestId === input.guestId ||
        (input.fingerprint && c.fingerprint === input.fingerprint),
    );
    if (claimed) {
      outcome = { credits: 0, alreadyClaimed: true };
      return;
    }
    if (store.claims.length >= store.maxClaims) {
      errorMsg = '门店码领取已满';
      return;
    }

    const wallet = ensureWallet(data, input.guestId);
    wallet.credits += store.credits;
    wallet.updatedAt = nowIso();
    store.claims.push({
      guestId: input.guestId,
      fingerprint: input.fingerprint ?? null,
      claimedAt: nowIso(),
    });
    outcome = { credits: store.credits, alreadyClaimed: false };
  });

  if (errorMsg) throw new Error(errorMsg);
  if (!outcome) throw new Error('领取失败');
  return outcome;
}

export async function setStoreCodeActive(
  code: string,
  active: boolean,
): Promise<StoreCodeRecord | null> {
  let updated: StoreCodeRecord | null = null;
  await enqueueWrite((data) => {
    const store = data.storeCodes.find(
      (item) => item.code === code.toUpperCase(),
    );
    if (!store) return;
    store.active = active;
    updated = { ...store, claims: [...store.claims] };
  });
  return updated;
}

export async function getAdminStats() {
  const data = await readStore();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const dayIso = startOfDay.toISOString();

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekIso = weekAgo.toISOString();

  const todayOrders = data.orders.filter((o) => o.createdAt >= dayIso);
  const todayPaid = todayOrders.filter((o) => o.status === 'paid');
  const todayRevenueFen = todayPaid.reduce((sum, o) => sum + o.amountFen, 0);
  const todayGens = data.generationLogs.filter((g) => g.createdAt >= dayIso);
  const todaySuccess = todayGens.filter((g) => g.success).length;
  const todayFailed = todayGens.filter((g) => !g.success).length;

  const weekOrders = data.orders.filter((o) => o.createdAt >= weekIso);
  const weekPaid = weekOrders.filter((o) => o.status === 'paid');
  const weekRevenueFen = weekPaid.reduce((sum, o) => sum + o.amountFen, 0);
  const weekGens = data.generationLogs.filter((g) => g.createdAt >= weekIso);
  const weekFailed = weekGens.filter((g) => !g.success).length;

  const weekGenGuests = new Set(
    weekGens.filter((g) => g.success).map((g) => g.guestId),
  );
  const weekPaidGuests = new Set(weekPaid.map((o) => o.guestId));
  const weekFreeUsers = new Set(
    weekGens.filter((g) => g.usedFree && g.success).map((g) => g.guestId),
  );
  let converted = 0;
  for (const guestId of weekFreeUsers) {
    if (weekPaidGuests.has(guestId)) converted += 1;
  }

  const trialToPaidRate =
    weekFreeUsers.size === 0
      ? 0
      : Math.round((converted / weekFreeUsers.size) * 1000) / 10;

  const aovFen =
    weekPaid.length === 0
      ? 0
      : Math.round(weekRevenueFen / weekPaid.length);

  return {
    todayOrderCount: todayOrders.length,
    todayPaidCount: todayPaid.length,
    todayRevenueFen,
    paySuccessRate:
      todayOrders.length === 0
        ? 0
        : Math.round((todayPaid.length / todayOrders.length) * 1000) / 10,
    todayGenerations: todayGens.length,
    todaySuccess,
    todayFailed,
    generationFailRate:
      todayGens.length === 0
        ? 0
        : Math.round((todayFailed / todayGens.length) * 1000) / 10,
    totalWallets: data.wallets.length,
    totalPaidOrders: data.orders.filter((o) => o.status === 'paid').length,
    totalRevenueFen: data.orders
      .filter((o) => o.status === 'paid')
      .reduce((sum, o) => sum + o.amountFen, 0),
    last7Days: {
      revenueFen: weekRevenueFen,
      paidOrders: weekPaid.length,
      orderCount: weekOrders.length,
      paySuccessRate:
        weekOrders.length === 0
          ? 0
          : Math.round((weekPaid.length / weekOrders.length) * 1000) / 10,
      generations: weekGens.length,
      generationFailRate:
        weekGens.length === 0
          ? 0
          : Math.round((weekFailed / weekGens.length) * 1000) / 10,
      uniqueGenerators: weekGenGuests.size,
      uniquePayers: weekPaidGuests.size,
      freeUsers: weekFreeUsers.size,
      convertedFreeUsers: converted,
      trialToPaidRate,
      aovFen,
      targetTrialToPaidMin: 3,
      targetTrialToPaidMax: 8,
      targetAovFen: 1500,
    },
    pricing: mergePricingConfig(data.pricing),
  };
}
