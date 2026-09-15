import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  index,
  jsonb,
} from 'drizzle-orm/pg-core';

export const wallets = pgTable(
  'wallets',
  {
    id: text('id').primaryKey(),
    guestId: text('guest_id').notNull().unique(),
    phone: text('phone'),
    credits: integer('credits').notNull().default(0),
    freeUsed: integer('free_used').notNull().default(0),
    deviceFingerprints: jsonb('device_fingerprints')
      .$type<string[]>()
      .notNull()
      .default([]),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('wallets_guest_id_idx').on(table.guestId),
    index('wallets_phone_idx').on(table.phone),
  ],
);

export const orders = pgTable(
  'orders',
  {
    id: text('id').primaryKey(),
    guestId: text('guest_id').notNull(),
    packId: text('pack_id').notNull(),
    credits: integer('credits').notNull(),
    amountFen: integer('amount_fen').notNull(),
    listPriceFen: integer('list_price_fen').notNull().default(0),
    discountFen: integer('discount_fen').notNull().default(0),
    channel: text('channel').notNull().default('mock'),
    status: text('status').notNull().default('pending'),
    providerTradeNo: text('provider_trade_no'),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('orders_guest_id_idx').on(table.guestId),
    index('orders_status_idx').on(table.status),
  ],
);

export const generationLogs = pgTable(
  'generation_logs',
  {
    id: text('id').primaryKey(),
    guestId: text('guest_id').notNull(),
    scenicSpotId: text('scenic_spot_id'),
    success: boolean('success').notNull(),
    usedFree: boolean('used_free').notNull().default(false),
    creditsBefore: integer('credits_before').notNull(),
    creditsAfter: integer('credits_after').notNull(),
    durationMs: integer('duration_ms'),
    errorMessage: text('error_message'),
    imageHash: text('image_hash'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('generation_logs_guest_id_idx').on(table.guestId)],
);

export const fingerprints = pgTable('fingerprints', {
  fingerprint: text('fingerprint').primaryKey(),
  freeUsed: integer('free_used').notNull().default(0),
  guestIds: jsonb('guest_ids').$type<string[]>().notNull().default([]),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const storeCodes = pgTable('store_codes', {
  code: text('code').primaryKey(),
  label: text('label').notNull(),
  credits: integer('credits').notNull().default(1),
  maxClaims: integer('max_claims').notNull().default(200),
  active: boolean('active').notNull().default(true),
  claims: jsonb('claims')
    .$type<
      Array<{
        guestId: string;
        fingerprint: string | null;
        claimedAt: string;
      }>
    >()
    .notNull()
    .default([]),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** key = pricing 等配置 JSON */
export const billingSettings = pgTable('billing_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Wallet = typeof wallets.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type GenerationLog = typeof generationLogs.$inferSelect;
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded';
