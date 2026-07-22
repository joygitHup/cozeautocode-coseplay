// 景区类型
export interface ScenicSpot {
  id: string;
  name: string;
  province: string;
  description: string;
  image: string;
  style: string;
  recommendedCostumes: string[];
}

// 服饰类型
export interface Costume {
  id: string;
  name: string;
  dynasty: string;
  description: string;
  image: string;
  style: string;
  category: 'dress' | 'robe' | 'jacket' | 'skirt';
}

// 首饰类型
export interface Jewelry {
  id: string;
  name: string;
  description: string;
  image: string;
  category: 'necklace' | 'bracelet' | 'earring' | 'ring' | 'hairpin';
}

// 头饰类型
export interface Headwear {
  id: string;
  name: string;
  description: string;
  image: string;
  category: 'crown' | 'hairpin' | 'flower' | 'veil' | 'comb';
}

// 妆容类型
export interface Makeup {
  id: string;
  name: string;
  description: string;
  image: string;
  style: string;
  category: 'elegant' | 'natural' | 'glamorous' | 'ethereal';
}

// 生成请求
export interface GenerationRequest {
  photoUrl: string;
  photoType: 'full-body' | 'half-body';
  costumeId: string;
  jewelryIds: string[];
  headwearId: string;
  makeupId: string;
  scenicSpotId: string;
}

// 生成结果
export interface GenerationResult {
  id: string;
  imageUrl: string;
  prompt: string;
  createdAt: number;
  request: GenerationRequest;
}

// 搭配方案
export interface OutfitPlan {
  costume: Costume;
  jewelry: Jewelry[];
  headwear: Headwear;
  makeup: Makeup;
}
