/**
 * 计费存储门面：
 * - 有 DATABASE_URL → PostgreSQL（生产多实例）
 * - 否则 → data/billing-store.json（本地演示）
 */
import { isPostgresBillingEnabled } from '@/lib/db';
import * as jsonStore from '@/lib/billing/store-json';
import * as pgStore from '@/lib/billing/store-pg';

export type {
  FingerprintRecord,
  GenerationLogRecord,
  OrderRecord,
  ReserveResult,
  StoreCodeRecord,
  WalletRecord,
} from '@/lib/billing/store-types';

function api() {
  return isPostgresBillingEnabled() ? pgStore : jsonStore;
}

export const getPricingConfig = (...args: Parameters<typeof jsonStore.getPricingConfig>) =>
  api().getPricingConfig(...args);
export const updatePricingConfig = (
  ...args: Parameters<typeof jsonStore.updatePricingConfig>
) => api().updatePricingConfig(...args);
export const getOrCreateWallet = (
  ...args: Parameters<typeof jsonStore.getOrCreateWallet>
) => api().getOrCreateWallet(...args);
export const guestHasPaidOrder = (
  ...args: Parameters<typeof jsonStore.guestHasPaidOrder>
) => api().guestHasPaidOrder(...args);
export const reserveGenerationCredit = (
  ...args: Parameters<typeof jsonStore.reserveGenerationCredit>
) => api().reserveGenerationCredit(...args);
export const rollbackGenerationCredit = (
  ...args: Parameters<typeof jsonStore.rollbackGenerationCredit>
) => api().rollbackGenerationCredit(...args);
export const addCredits = (...args: Parameters<typeof jsonStore.addCredits>) =>
  api().addCredits(...args);
export const bindPhoneToWallet = (
  ...args: Parameters<typeof jsonStore.bindPhoneToWallet>
) => api().bindPhoneToWallet(...args);
export const createOrder = (...args: Parameters<typeof jsonStore.createOrder>) =>
  api().createOrder(...args);
export const getOrder = (...args: Parameters<typeof jsonStore.getOrder>) =>
  api().getOrder(...args);
export const markOrderPaid = (
  ...args: Parameters<typeof jsonStore.markOrderPaid>
) => api().markOrderPaid(...args);
export const listOrders = (...args: Parameters<typeof jsonStore.listOrders>) =>
  api().listOrders(...args);
export const appendGenerationLog = (
  ...args: Parameters<typeof jsonStore.appendGenerationLog>
) => api().appendGenerationLog(...args);
export const listGenerationLogs = (
  ...args: Parameters<typeof jsonStore.listGenerationLogs>
) => api().listGenerationLogs(...args);
export const createStoreCode = (
  ...args: Parameters<typeof jsonStore.createStoreCode>
) => api().createStoreCode(...args);
export const listStoreCodes = (
  ...args: Parameters<typeof jsonStore.listStoreCodes>
) => api().listStoreCodes(...args);
export const claimStoreCode = (
  ...args: Parameters<typeof jsonStore.claimStoreCode>
) => api().claimStoreCode(...args);
export const setStoreCodeActive = (
  ...args: Parameters<typeof jsonStore.setStoreCodeActive>
) => api().setStoreCodeActive(...args);
export const getAdminStats = (
  ...args: Parameters<typeof jsonStore.getAdminStats>
) => api().getAdminStats(...args);

export function availableCredits(
  wallet: import('@/lib/billing/store-types').WalletRecord,
): number {
  return jsonStore.availableCredits(wallet);
}

export function hashImagePayload(photoBase64: string): string {
  return jsonStore.hashImagePayload(photoBase64);
}

export function getBillingStoreBackend(): 'postgres' | 'json' {
  return isPostgresBillingEnabled() ? 'postgres' : 'json';
}
