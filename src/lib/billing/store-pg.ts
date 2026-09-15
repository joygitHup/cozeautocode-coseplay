import { randomUUID } from 'crypto';
import { and, desc, eq } from 'drizzle-orm';
import {
  DEFAULT_PRICING_CONFIG,
  mergePricingConfig,
  type PricingConfig,
} from '@/lib/billing/config';
import { FREE_GENERATIONS_PER_GUEST } from '@/lib/billing/products';
import { createDb, type AppDb } from '@/lib/db';
import {
  billingSettings,
  fingerprints,
  generationLogs,
  orders,
  storeCodes,
  wallets,
  type OrderStatus,
} from '@/lib/db/schema';
import type {
  GenerationLogRecord,
  OrderRecord,
  ReserveResult,
  StoreCodeRecord,
  WalletRecord,
} from '@/lib/billing/store-types';

function requireDb(): AppDb {
  const db = createDb();
  if (!db) {
    throw new Error('DATABASE_URL is not configured');
  }
  return db;
}

function now() {
  return new Date();
}

function toIso(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return value;
}

function mapWallet(row: typeof wallets.$inferSelect): WalletRecord {
  return {
    id: row.id,
    guestId: row.guestId,
    phone: row.phone,
    credits: row.credits,
    freeUsed: row.freeUsed,
    deviceFingerprints: row.deviceFingerprints ?? [],
    createdAt: toIso(row.createdAt)!,
    updatedAt: toIso(row.updatedAt)!,
  };
}

function mapOrder(row: typeof orders.$inferSelect): OrderRecord {
  return {
    id: row.id,
    guestId: row.guestId,
    packId: row.packId,
    credits: row.credits,
    amountFen: row.amountFen,
    listPriceFen: row.listPriceFen,
    discountFen: row.discountFen,
    channel: row.channel,
    status: row.status as OrderStatus,
    providerTradeNo: row.providerTradeNo,
    paidAt: toIso(row.paidAt),
    createdAt: toIso(row.createdAt)!,
    updatedAt: toIso(row.updatedAt)!,
  };
}

function mapLog(row: typeof generationLogs.$inferSelect): GenerationLogRecord {
  return {
    id: row.id,
    guestId: row.guestId,
    scenicSpotId: row.scenicSpotId,
    success: row.success,
    usedFree: row.usedFree,
    creditsBefore: row.creditsBefore,
    creditsAfter: row.creditsAfter,
    durationMs: row.durationMs,
    errorMessage: row.errorMessage,
    imageHash: row.imageHash,
    createdAt: toIso(row.createdAt)!,
  };
}

function mapStoreCode(row: typeof storeCodes.$inferSelect): StoreCodeRecord {
  return {
    code: row.code,
    label: row.label,
    credits: row.credits,
    maxClaims: row.maxClaims,
    active: row.active,
    claims: row.claims ?? [],
    createdAt: toIso(row.createdAt)!,
  };
}

async function ensureWalletRow(db: AppDb, guestId: string) {
  const existing = await db
    .select()
    .from(wallets)
    .where(eq(wallets.guestId, guestId))
    .limit(1);
  if (existing[0]) return existing[0];

  const stamp = now();
  const row = {
    id: randomUUID(),
    guestId,
    phone: null as string | null,
    credits: 0,
    freeUsed: 0,
    deviceFingerprints: [] as string[],
    createdAt: stamp,
    updatedAt: stamp,
  };
  await db.insert(wallets).values(row);
  return row;
}

export async function getPricingConfig(): Promise<PricingConfig> {
  const db = requireDb();
  const rows = await db
    .select()
    .from(billingSettings)
    .where(eq(billingSettings.key, 'pricing'))
    .limit(1);
  if (!rows[0]) return mergePricingConfig(DEFAULT_PRICING_CONFIG);
  return mergePricingConfig(rows[0].value as Partial<PricingConfig>);
}

export async function updatePricingConfig(
  patch: Partial<PricingConfig>,
): Promise<PricingConfig> {
  const db = requireDb();
  const current = await getPricingConfig();
  const next = mergePricingConfig({ ...current, ...patch });
  await db
    .insert(billingSettings)
    .values({
      key: 'pricing',
      value: next,
      updatedAt: now(),
    })
    .onConflictDoUpdate({
      target: billingSettings.key,
      set: { value: next, updatedAt: now() },
    });
  return next;
}

export async function getOrCreateWallet(guestId: string): Promise<WalletRecord> {
  const db = requireDb();
  const row = await ensureWalletRow(db, guestId);
  return mapWallet(row as typeof wallets.$inferSelect);
}

export async function guestHasPaidOrder(guestId: string): Promise<boolean> {
  const db = requireDb();
  const rows = await db
    .select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.guestId, guestId), eq(orders.status, 'paid')))
    .limit(1);
  return rows.length > 0;
}

export async function reserveGenerationCredit(
  guestId: string,
  deviceFingerprint?: string | null,
): Promise<ReserveResult> {
  const db = requireDb();

  return db.transaction(async (tx) => {
    let wallet =
      (
        await tx
          .select()
          .from(wallets)
          .where(eq(wallets.guestId, guestId))
          .limit(1)
      )[0] ?? null;

    const stamp = now();
    if (!wallet) {
      const created = {
        id: randomUUID(),
        guestId,
        phone: null as string | null,
        credits: 0,
        freeUsed: 0,
        deviceFingerprints: [] as string[],
        createdAt: stamp,
        updatedAt: stamp,
      };
      await tx.insert(wallets).values(created);
      wallet = created as typeof wallets.$inferSelect;
    }

    const fingerprintsList = [...(wallet.deviceFingerprints ?? [])];
    if (deviceFingerprint && !fingerprintsList.includes(deviceFingerprint)) {
      fingerprintsList.push(deviceFingerprint);
    }

    const creditsBefore = wallet.credits;

    if (wallet.credits > 0) {
      const nextCredits = wallet.credits - 1;
      await tx
        .update(wallets)
        .set({
          credits: nextCredits,
          deviceFingerprints: fingerprintsList,
          updatedAt: stamp,
        })
        .where(eq(wallets.guestId, guestId));
      return {
        ok: true as const,
        usedFree: false,
        creditsBefore,
        wallet: mapWallet({
          ...wallet,
          credits: nextCredits,
          deviceFingerprints: fingerprintsList,
          updatedAt: stamp,
        }),
      };
    }

    let fp =
      deviceFingerprint
        ? (
            await tx
              .select()
              .from(fingerprints)
              .where(eq(fingerprints.fingerprint, deviceFingerprint))
              .limit(1)
          )[0]
        : null;

    if (deviceFingerprint && !fp) {
      const createdFp = {
        fingerprint: deviceFingerprint,
        freeUsed: 0,
        guestIds: [guestId],
        updatedAt: stamp,
      };
      await tx.insert(fingerprints).values(createdFp);
      fp = createdFp;
    } else if (fp && deviceFingerprint && !fp.guestIds.includes(guestId)) {
      const guestIds = [...fp.guestIds, guestId];
      await tx
        .update(fingerprints)
        .set({ guestIds, updatedAt: stamp })
        .where(eq(fingerprints.fingerprint, deviceFingerprint));
      fp = { ...fp, guestIds };
    }

    const guestFreeOk = wallet.freeUsed < FREE_GENERATIONS_PER_GUEST;
    const fpFreeOk =
      !fp || fp.freeUsed < FREE_GENERATIONS_PER_GUEST;

    if (guestFreeOk && fpFreeOk) {
      const nextFree = wallet.freeUsed + 1;
      await tx
        .update(wallets)
        .set({
          freeUsed: nextFree,
          deviceFingerprints: fingerprintsList,
          updatedAt: stamp,
        })
        .where(eq(wallets.guestId, guestId));
      if (fp && deviceFingerprint) {
        await tx
          .update(fingerprints)
          .set({ freeUsed: fp.freeUsed + 1, updatedAt: stamp })
          .where(eq(fingerprints.fingerprint, deviceFingerprint));
      }
      return {
        ok: true as const,
        usedFree: true,
        creditsBefore,
        wallet: mapWallet({
          ...wallet,
          freeUsed: nextFree,
          deviceFingerprints: fingerprintsList,
          updatedAt: stamp,
        }),
      };
    }

    return {
      ok: false as const,
      code: 'NEED_CREDITS' as const,
      wallet: mapWallet({
        ...wallet,
        deviceFingerprints: fingerprintsList,
      }),
    };
  });
}

export async function rollbackGenerationCredit(
  guestId: string,
  usedFree: boolean,
  deviceFingerprint?: string | null,
): Promise<WalletRecord> {
  const db = requireDb();
  return db.transaction(async (tx) => {
    const wallet = await ensureWalletRow(tx as unknown as AppDb, guestId);
    const stamp = now();
    if (usedFree) {
      await tx
        .update(wallets)
        .set({
          freeUsed: Math.max(0, wallet.freeUsed - 1),
          updatedAt: stamp,
        })
        .where(eq(wallets.guestId, guestId));
      if (deviceFingerprint) {
        const fp = (
          await tx
            .select()
            .from(fingerprints)
            .where(eq(fingerprints.fingerprint, deviceFingerprint))
            .limit(1)
        )[0];
        if (fp) {
          await tx
            .update(fingerprints)
            .set({
              freeUsed: Math.max(0, fp.freeUsed - 1),
              updatedAt: stamp,
            })
            .where(eq(fingerprints.fingerprint, deviceFingerprint));
        }
      }
    } else {
      await tx
        .update(wallets)
        .set({
          credits: wallet.credits + 1,
          updatedAt: stamp,
        })
        .where(eq(wallets.guestId, guestId));
    }

    const refreshed = (
      await tx
        .select()
        .from(wallets)
        .where(eq(wallets.guestId, guestId))
        .limit(1)
    )[0];
    return mapWallet(refreshed);
  });
}

export async function addCredits(
  guestId: string,
  credits: number,
): Promise<WalletRecord> {
  const db = requireDb();
  const wallet = await ensureWalletRow(db, guestId);
  const stamp = now();
  await db
    .update(wallets)
    .set({ credits: wallet.credits + credits, updatedAt: stamp })
    .where(eq(wallets.guestId, guestId));
  return mapWallet({
    ...wallet,
    credits: wallet.credits + credits,
    updatedAt: stamp,
  } as typeof wallets.$inferSelect);
}

export async function bindPhoneToWallet(
  guestId: string,
  phone: string,
): Promise<{ wallet: WalletRecord; mergedFromGuestId: string | null }> {
  const normalized = phone.replace(/\s+/g, '');
  if (!/^1\d{10}$/.test(normalized)) {
    throw new Error('手机号格式不正确');
  }
  const db = requireDb();

  return db.transaction(async (tx) => {
    const current = await ensureWalletRow(tx as unknown as AppDb, guestId);
    const stamp = now();
    const other = (
      await tx
        .select()
        .from(wallets)
        .where(eq(wallets.phone, normalized))
        .limit(1)
    ).find((w) => w.guestId !== guestId);

    if (other) {
      const mergedCredits = current.credits + other.credits;
      const mergedFree = Math.max(current.freeUsed, other.freeUsed);
      const mergedFp = Array.from(
        new Set([
          ...(current.deviceFingerprints ?? []),
          ...(other.deviceFingerprints ?? []),
        ]),
      );
      await tx
        .update(wallets)
        .set({
          credits: mergedCredits,
          freeUsed: mergedFree,
          deviceFingerprints: mergedFp,
          phone: normalized,
          updatedAt: stamp,
        })
        .where(eq(wallets.guestId, guestId));
      await tx
        .update(orders)
        .set({ guestId })
        .where(eq(orders.guestId, other.guestId));
      await tx
        .update(generationLogs)
        .set({ guestId })
        .where(eq(generationLogs.guestId, other.guestId));
      await tx.delete(wallets).where(eq(wallets.guestId, other.guestId));
      return {
        mergedFromGuestId: other.guestId,
        wallet: mapWallet({
          ...current,
          credits: mergedCredits,
          freeUsed: mergedFree,
          deviceFingerprints: mergedFp,
          phone: normalized,
          updatedAt: stamp,
        }),
      };
    }

    await tx
      .update(wallets)
      .set({ phone: normalized, updatedAt: stamp })
      .where(eq(wallets.guestId, guestId));
    return {
      mergedFromGuestId: null,
      wallet: mapWallet({
        ...current,
        phone: normalized,
        updatedAt: stamp,
      }),
    };
  });
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
  const db = requireDb();
  const stamp = now();
  const order = {
    id: `ord_${randomUUID().replace(/-/g, '').slice(0, 20)}`,
    guestId: input.guestId,
    packId: input.packId,
    credits: input.credits,
    amountFen: input.amountFen,
    listPriceFen: input.listPriceFen,
    discountFen: input.discountFen,
    channel: input.channel,
    status: 'pending',
    providerTradeNo: null as string | null,
    paidAt: null as Date | null,
    createdAt: stamp,
    updatedAt: stamp,
  };
  await db.insert(orders).values(order);
  return mapOrder(order as typeof orders.$inferSelect);
}

export async function getOrder(orderId: string): Promise<OrderRecord | null> {
  const db = requireDb();
  const row = (
    await db.select().from(orders).where(eq(orders.id, orderId)).limit(1)
  )[0];
  return row ? mapOrder(row) : null;
}

export async function markOrderPaid(
  orderId: string,
  providerTradeNo?: string,
): Promise<{ order: OrderRecord; alreadyPaid: boolean } | null> {
  const db = requireDb();
  return db.transaction(async (tx) => {
    const order = (
      await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1)
    )[0];
    if (!order) return null;
    if (order.status === 'paid') {
      return { order: mapOrder(order), alreadyPaid: true };
    }
    const stamp = now();
    await tx
      .update(orders)
      .set({
        status: 'paid',
        providerTradeNo: providerTradeNo ?? order.providerTradeNo,
        paidAt: stamp,
        updatedAt: stamp,
      })
      .where(eq(orders.id, orderId));

    const wallet = await ensureWalletRow(tx as unknown as AppDb, order.guestId);
    await tx
      .update(wallets)
      .set({
        credits: wallet.credits + order.credits,
        updatedAt: stamp,
      })
      .where(eq(wallets.guestId, order.guestId));

    return {
      alreadyPaid: false,
      order: mapOrder({
        ...order,
        status: 'paid',
        providerTradeNo: providerTradeNo ?? order.providerTradeNo,
        paidAt: stamp,
        updatedAt: stamp,
      }),
    };
  });
}

export async function listOrders(limit = 100): Promise<OrderRecord[]> {
  const db = requireDb();
  const rows = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(limit);
  return rows.map(mapOrder);
}

export async function appendGenerationLog(
  input: Omit<GenerationLogRecord, 'id' | 'createdAt'>,
): Promise<GenerationLogRecord> {
  const db = requireDb();
  const stamp = now();
  const row = {
    id: randomUUID(),
    ...input,
    createdAt: stamp,
  };
  await db.insert(generationLogs).values(row);
  return mapLog(row as typeof generationLogs.$inferSelect);
}

export async function listGenerationLogs(
  limit = 100,
): Promise<GenerationLogRecord[]> {
  const db = requireDb();
  const rows = await db
    .select()
    .from(generationLogs)
    .orderBy(desc(generationLogs.createdAt))
    .limit(limit);
  return rows.map(mapLog);
}

export async function createStoreCode(input: {
  label: string;
  credits?: number;
  maxClaims?: number;
  code?: string;
}): Promise<StoreCodeRecord> {
  const db = requireDb();
  const code =
    input.code?.trim().toUpperCase() ||
    `STORE${randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
  const existing = (
    await db.select().from(storeCodes).where(eq(storeCodes.code, code)).limit(1)
  )[0];
  if (existing) throw new Error('门店码已存在');

  const row = {
    code,
    label: input.label.trim() || code,
    credits: input.credits ?? 1,
    maxClaims: input.maxClaims ?? 200,
    active: true,
    claims: [] as StoreCodeRecord['claims'],
    createdAt: now(),
  };
  await db.insert(storeCodes).values(row);
  return mapStoreCode(row as typeof storeCodes.$inferSelect);
}

export async function listStoreCodes(): Promise<StoreCodeRecord[]> {
  const db = requireDb();
  const rows = await db
    .select()
    .from(storeCodes)
    .orderBy(desc(storeCodes.createdAt));
  return rows.map(mapStoreCode);
}

export async function claimStoreCode(input: {
  code: string;
  guestId: string;
  fingerprint?: string | null;
}): Promise<{ credits: number; alreadyClaimed: boolean }> {
  const db = requireDb();
  const code = input.code.trim().toUpperCase();

  return db.transaction(async (tx) => {
    const store = (
      await tx.select().from(storeCodes).where(eq(storeCodes.code, code)).limit(1)
    )[0];
    if (!store || !store.active) throw new Error('门店码无效或已停用');

    const claims = store.claims ?? [];
    const claimed = claims.some(
      (c) =>
        c.guestId === input.guestId ||
        (input.fingerprint && c.fingerprint === input.fingerprint),
    );
    if (claimed) return { credits: 0, alreadyClaimed: true };
    if (claims.length >= store.maxClaims) throw new Error('门店码领取已满');

    const wallet = await ensureWalletRow(tx as unknown as AppDb, input.guestId);
    const stamp = now();
    await tx
      .update(wallets)
      .set({
        credits: wallet.credits + store.credits,
        updatedAt: stamp,
      })
      .where(eq(wallets.guestId, input.guestId));
    await tx
      .update(storeCodes)
      .set({
        claims: [
          ...claims,
          {
            guestId: input.guestId,
            fingerprint: input.fingerprint ?? null,
            claimedAt: stamp.toISOString(),
          },
        ],
      })
      .where(eq(storeCodes.code, code));
    return { credits: store.credits, alreadyClaimed: false };
  });
}

export async function setStoreCodeActive(
  code: string,
  active: boolean,
): Promise<StoreCodeRecord | null> {
  const db = requireDb();
  const normalized = code.toUpperCase();
  const existing = (
    await db
      .select()
      .from(storeCodes)
      .where(eq(storeCodes.code, normalized))
      .limit(1)
  )[0];
  if (!existing) return null;
  await db
    .update(storeCodes)
    .set({ active })
    .where(eq(storeCodes.code, normalized));
  return mapStoreCode({ ...existing, active });
}

export async function getAdminStats() {
  const db = requireDb();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const allOrders = await db.select().from(orders);
  const allGens = await db.select().from(generationLogs);
  const allWallets = await db.select().from(wallets);
  const pricing = await getPricingConfig();

  const dayIso = startOfDay.toISOString();
  const weekIso = weekAgo.toISOString();

  const todayOrders = allOrders.filter(
    (o) => toIso(o.createdAt)! >= dayIso,
  );
  const todayPaid = todayOrders.filter((o) => o.status === 'paid');
  const todayRevenueFen = todayPaid.reduce((sum, o) => sum + o.amountFen, 0);
  const todayGens = allGens.filter((g) => toIso(g.createdAt)! >= dayIso);
  const todaySuccess = todayGens.filter((g) => g.success).length;
  const todayFailed = todayGens.filter((g) => !g.success).length;

  const weekOrders = allOrders.filter((o) => toIso(o.createdAt)! >= weekIso);
  const weekPaid = weekOrders.filter((o) => o.status === 'paid');
  const weekRevenueFen = weekPaid.reduce((sum, o) => sum + o.amountFen, 0);
  const weekGens = allGens.filter((g) => toIso(g.createdAt)! >= weekIso);
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
    totalWallets: allWallets.length,
    totalPaidOrders: allOrders.filter((o) => o.status === 'paid').length,
    totalRevenueFen: allOrders
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
      trialToPaidRate:
        weekFreeUsers.size === 0
          ? 0
          : Math.round((converted / weekFreeUsers.size) * 1000) / 10,
      aovFen:
        weekPaid.length === 0
          ? 0
          : Math.round(weekRevenueFen / weekPaid.length),
      targetTrialToPaidMin: 3,
      targetTrialToPaidMax: 8,
      targetAovFen: 1500,
    },
    pricing,
  };
}
