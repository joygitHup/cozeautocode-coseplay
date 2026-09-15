import type { PricingConfig } from '@/lib/billing/config';
import type { OrderStatus } from '@/lib/db/schema';

export type WalletRecord = {
  id: string;
  guestId: string;
  phone: string | null;
  credits: number;
  freeUsed: number;
  deviceFingerprints: string[];
  createdAt: string;
  updatedAt: string;
};

export type OrderRecord = {
  id: string;
  guestId: string;
  packId: string;
  credits: number;
  amountFen: number;
  listPriceFen: number;
  discountFen: number;
  channel: string;
  status: OrderStatus;
  providerTradeNo: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GenerationLogRecord = {
  id: string;
  guestId: string;
  scenicSpotId: string | null;
  success: boolean;
  usedFree: boolean;
  creditsBefore: number;
  creditsAfter: number;
  durationMs: number | null;
  errorMessage: string | null;
  imageHash: string | null;
  createdAt: string;
};

export type FingerprintRecord = {
  fingerprint: string;
  freeUsed: number;
  guestIds: string[];
  updatedAt: string;
};

export type StoreCodeRecord = {
  code: string;
  label: string;
  credits: number;
  maxClaims: number;
  active: boolean;
  claims: Array<{
    guestId: string;
    fingerprint: string | null;
    claimedAt: string;
  }>;
  createdAt: string;
};

export type ReserveResult =
  | {
      ok: true;
      wallet: WalletRecord;
      usedFree: boolean;
      creditsBefore: number;
    }
  | { ok: false; code: 'NEED_CREDITS'; wallet: WalletRecord };

export type BillingStore = {
  getPricingConfig: () => Promise<PricingConfig>;
  updatePricingConfig: (patch: Partial<PricingConfig>) => Promise<PricingConfig>;
  getOrCreateWallet: (guestId: string) => Promise<WalletRecord>;
  guestHasPaidOrder: (guestId: string) => Promise<boolean>;
  reserveGenerationCredit: (
    guestId: string,
    deviceFingerprint?: string | null,
  ) => Promise<ReserveResult>;
  rollbackGenerationCredit: (
    guestId: string,
    usedFree: boolean,
    deviceFingerprint?: string | null,
  ) => Promise<WalletRecord>;
  addCredits: (guestId: string, credits: number) => Promise<WalletRecord>;
  bindPhoneToWallet: (
    guestId: string,
    phone: string,
  ) => Promise<{ wallet: WalletRecord; mergedFromGuestId: string | null }>;
  createOrder: (input: {
    guestId: string;
    packId: string;
    credits: number;
    amountFen: number;
    listPriceFen: number;
    discountFen: number;
    channel: string;
  }) => Promise<OrderRecord>;
  getOrder: (orderId: string) => Promise<OrderRecord | null>;
  markOrderPaid: (
    orderId: string,
    providerTradeNo?: string,
  ) => Promise<{ order: OrderRecord; alreadyPaid: boolean } | null>;
  listOrders: (limit?: number) => Promise<OrderRecord[]>;
  appendGenerationLog: (
    input: Omit<GenerationLogRecord, 'id' | 'createdAt'>,
  ) => Promise<GenerationLogRecord>;
  listGenerationLogs: (limit?: number) => Promise<GenerationLogRecord[]>;
  createStoreCode: (input: {
    label: string;
    credits?: number;
    maxClaims?: number;
    code?: string;
  }) => Promise<StoreCodeRecord>;
  listStoreCodes: () => Promise<StoreCodeRecord[]>;
  claimStoreCode: (input: {
    code: string;
    guestId: string;
    fingerprint?: string | null;
  }) => Promise<{ credits: number; alreadyClaimed: boolean }>;
  setStoreCodeActive: (
    code: string,
    active: boolean,
  ) => Promise<StoreCodeRecord | null>;
  getAdminStats: () => Promise<Record<string, unknown>>;
};
