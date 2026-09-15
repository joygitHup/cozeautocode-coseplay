/**
 * 华裳纪计费商品与单位经济配置
 *
 * 真实成本请用 Coze 账单测算后写入环境变量：
 * ESTIMATED_COST_CNY_PER_GENERATION=0.48
 *
 * | SKU        | 售价 | 次数 | 单次售价 | 预估成本 | 粗毛利/次 |
 * | trial      | 9.9  | 5    | 1.98     | C        | …         |
 * | standard*  | 19.9 | 12   | 1.66     | C        | …         |
 * | travel     | 49.9 | 35   | 1.43     | C        | …         |
 * *主推包
 */

/** 每访客免费生成次数 */
export const FREE_GENERATIONS_PER_GUEST = 1;

export function getEstimatedCostCnyPerGeneration(): number {
  const raw = process.env.ESTIMATED_COST_CNY_PER_GENERATION;
  if (raw != null && raw !== '') {
    const parsed = Number.parseFloat(raw);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }
  return 0.5;
}

/** @deprecated 请用 getEstimatedCostCnyPerGeneration() */
export const ESTIMATED_COST_CNY_PER_GENERATION =
  getEstimatedCostCnyPerGeneration();

export type CreditPackId = 'trial' | 'standard' | 'travel';

export type CreditPack = {
  id: CreditPackId;
  nameZh: string;
  nameEn: string;
  credits: number;
  /** 分（人民币） */
  priceFen: number;
  featured?: boolean;
  descriptionZh: string;
  descriptionEn: string;
};

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: 'trial',
    nameZh: '体验包',
    nameEn: 'Starter Pack',
    credits: 5,
    priceFen: 990,
    descriptionZh: '5 次 AI 古装生成，适合尝鲜',
    descriptionEn: '5 AI costume generations to try it out',
  },
  {
    id: 'standard',
    nameZh: '畅玩包',
    nameEn: 'Play Pack',
    credits: 12,
    priceFen: 1990,
    featured: true,
    descriptionZh: '12 次生成，出行拍照最划算',
    descriptionEn: '12 generations — best value for trips',
  },
  {
    id: 'travel',
    nameZh: '旅行包',
    nameEn: 'Travel Pack',
    credits: 35,
    priceFen: 4990,
    descriptionZh: '35 次生成，多景区畅玩',
    descriptionEn: '35 generations for multi-spot adventures',
  },
];

export function getCreditPack(id: string): CreditPack | undefined {
  return CREDIT_PACKS.find((pack) => pack.id === id);
}

export function formatYuanFromFen(fen: number): string {
  return (fen / 100).toFixed(fen % 100 === 0 ? 0 : 2);
}

export function unitPriceFen(pack: CreditPack): number {
  return Math.round(pack.priceFen / pack.credits);
}

export function estimatedMarginFenPerCredit(pack: CreditPack): number {
  const costFen = Math.round(getEstimatedCostCnyPerGeneration() * 100);
  return unitPriceFen(pack) - costFen;
}
