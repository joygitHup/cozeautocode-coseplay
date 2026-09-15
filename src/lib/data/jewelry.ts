import { Jewelry } from '../types';

export const jewelry: Jewelry[] = [
  // 项链
  {
    id: 'pearl-necklace',
    name: '珍珠璎珞',
    description: '圆润珍珠串联，温婉典雅，唐代贵族饰品',
    image: '/jewelry/pearl-necklace.jpg',
    category: 'necklace',
  },
  {
    id: 'jade-pendant',
    name: '玉佩项圈',
    description: '温润白玉，雕刻精美，寓意吉祥如意',
    image: '/jewelry/jade-pendant.jpg',
    category: 'necklace',
  },
  {
    id: 'gold-locket',
    name: '金锁长命链',
    description: '錾金锁片，长命百岁，儿童或女子佩戴',
    image: '/jewelry/gold-locket.jpg',
    category: 'necklace',
  },

  // 手镯
  {
    id: 'jade-bracelet',
    name: '翡翠玉镯',
    description: '通透翠绿，温润如水，女子必备饰品',
    image: '/jewelry/jade-bracelet.jpg',
    category: 'bracelet',
  },
  {
    id: 'gold-bangle',
    name: '錾金手镯',
    description: '錾花金镯，富贵华美，婚嫁常见',
    image: '/jewelry/gold-bangle.jpg',
    category: 'bracelet',
  },
  {
    id: 'silver-bracelet',
    name: '银丝缠臂',
    description: '细银丝缠绕，民族风情，苗族特色',
    image: '/jewelry/silver-bracelet.jpg',
    category: 'bracelet',
  },

  // 耳饰
  {
    id: 'jade-earrings',
    name: '玉坠耳珰',
    description: '翡翠耳坠，摇曳生姿，清雅脱俗',
    image: '/jewelry/jade-earrings.jpg',
    category: 'earring',
  },
  {
    id: 'pearl-earrings',
    name: '珍珠耳坠',
    description: '圆润珍珠，温婉大方，百搭之选',
    image: '/jewelry/pearl-earrings.jpg',
    category: 'earring',
  },
  {
    id: 'gold-earrings',
    name: '金环耳饰',
    description: '錾金花环，精致小巧，唐代流行',
    image: '/jewelry/gold-earrings.jpg',
    category: 'earring',
  },

  // 戒指
  {
    id: 'jade-ring',
    name: '玉扳指',
    description: '翡翠扳指，文人雅士或武将佩戴',
    image: '/jewelry/jade-ring.jpg',
    category: 'ring',
  },
  {
    id: 'gold-ring',
    name: '金镶宝戒',
    description: '黄金镶嵌宝石，华贵典雅',
    image: '/jewelry/gold-ring.jpg',
    category: 'ring',
  },

  // 发簪（也作首饰）
  {
    id: 'gold-hairpin-jewelry',
    name: '金步摇',
    description: '金质步摇，流苏摇曳，唐代贵妇饰品',
    image: '/jewelry/gold-hairpin-jewelry.jpg',
    category: 'hairpin',
  },
];

export function getJewelryById(id: string): Jewelry | undefined {
  return jewelry.find(j => j.id === id);
}

export function getJewelryByCategory(category: string): Jewelry[] {
  return jewelry.filter(j => j.category === category);
}
