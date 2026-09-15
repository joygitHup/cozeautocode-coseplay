import { Makeup } from '../types';

export const makeupStyles: Makeup[] = [
  // 典雅妆容
  {
    id: 'tang-dianya',
    name: '唐风典雅妆',
    description: '面若桃花，眉如远山，唇点樱红，雍容华贵',
    image: '/makeup/tang-dianya.jpg',
    style: 'elegant',
    category: 'elegant',
  },
  {
    id: 'song-qingya',
    name: '宋韵清雅妆',
    description: '素面朝天，淡扫蛾眉，清新脱俗',
    image: '/makeup/song-qingya.jpg',
    style: 'elegant',
    category: 'elegant',
  },
  {
    id: 'ming-wanwan',
    name: '明制婉约妆',
    description: '眉目如画，唇若点朱，端庄秀丽',
    image: '/makeup/ming-wanwan.jpg',
    style: 'elegant',
    category: 'elegant',
  },

  // 自然妆容
  {
    id: 'han-natural',
    name: '汉风素妆',
    description: '不施粉黛，天然去雕饰，返璞归真',
    image: '/makeup/han-natural.jpg',
    style: 'natural',
    category: 'natural',
  },
  {
    id: 'wei-jin-xiaoyao',
    name: '魏晋飘逸妆',
    description: '素颜淡妆，仙风道骨，名士风流',
    image: '/makeup/wei-jin-xiaoyao.jpg',
    style: 'natural',
    category: 'natural',
  },
  {
    id: 'dao-qingjing',
    name: '道系清静妆',
    description: '清心寡欲，素净无为，修道之人',
    image: '/makeup/dao-qingjing.jpg',
    style: 'natural',
    category: 'natural',
  },

  // 华丽妆容
  {
    id: 'tang-huali',
    name: '盛唐华丽妆',
    description: '花钿额黄，斜红面靥，极尽奢华',
    image: '/makeup/tang-huali.jpg',
    style: 'glamorous',
    category: 'glamorous',
  },
  {
    id: 'feitian-xianzi',
    name: '飞天仙子妆',
    description: '额点花钿，眼波流转，敦煌壁画风格',
    image: '/makeup/feitian-xianzi.jpg',
    style: 'glamorous',
    category: 'glamorous',
  },
  {
    id: 'gongting-gui',
    name: '宫廷贵妇妆',
    description: '浓妆艳抹，珠光宝气，皇家气派',
    image: '/makeup/gongting-gui.jpg',
    style: 'glamorous',
    category: 'glamorous',
  },

  // 仙气妆容
  {
    id: 'xian-ethereal',
    name: '仙侠清冷妆',
    description: '肤若凝脂，眉目清冷，不食人间烟火',
    image: '/makeup/xian-ethereal.jpg',
    style: 'ethereal',
    category: 'ethereal',
  },
  {
    id: 'huashan-xian',
    name: '华山仙子妆',
    description: '冰肌玉骨，超凡脱俗，仙侠女主角',
    image: '/makeup/huashan-xian.jpg',
    style: 'ethereal',
    category: 'ethereal',
  },
  {
    id: 'yue-gong',
    name: '月宫仙子妆',
    description: '清冷如月，皎洁无瑕，嫦娥奔月',
    image: '/makeup/yue-gong.jpg',
    style: 'ethereal',
    category: 'ethereal',
  },
];

export function getMakeupById(id: string): Makeup | undefined {
  return makeupStyles.find(m => m.id === id);
}

export function getMakeupByStyle(style: string): Makeup[] {
  return makeupStyles.filter(m => m.style === style);
}

export function getMakeupByCategory(category: string): Makeup[] {
  return makeupStyles.filter(m => m.category === category);
}
