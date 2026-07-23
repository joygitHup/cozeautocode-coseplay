import { Headwear } from '../types';

export const headwear: Headwear[] = [
  // 冠冕
  {
    id: 'phoenix-crown',
    name: '凤冠',
    description: '金凤展翅，珠翠环绕，皇后或新娘专用',
    image: 'https://picsum.photos/seed/phoenix-crown/400/400',
    category: 'crown',
  },
  {
    id: 'flower-crown',
    name: '花冠',
    description: '鲜花编冠，清新自然，少女或仙女造型',
    image: 'https://picsum.photos/seed/flower-crown/400/400',
    category: 'crown',
  },
  {
    id: 'jade-crown',
    name: '玉冠',
    description: '温润玉冠，文人雅士束发之用',
    image: 'https://picsum.photos/seed/jade-crown/400/400',
    category: 'crown',
  },

  // 发簪
  {
    id: 'gold-step-sway',
    name: '金步摇',
    description: '金质步摇，流苏轻摇，行走间摇曳生姿',
    image: 'https://picsum.photos/seed/gold-step-sway/400/400',
    category: 'hairpin',
  },
  {
    id: 'jade-hairpin',
    name: '玉簪',
    description: '白玉簪子，简洁素雅，日常束发',
    image: 'https://picsum.photos/seed/jade-hairpin/400/400',
    category: 'hairpin',
  },
  {
    id: 'wooden-hairpin',
    name: '木簪',
    description: '檀木发簪，质朴自然，隐士或道者佩戴',
    image: 'https://picsum.photos/seed/wooden-hairpin/400/400',
    category: 'hairpin',
  },
  {
    id: 'silver-hairpin',
    name: '银簪',
    description: '银质簪子，民族特色，苗族银饰',
    image: 'https://picsum.photos/seed/silver-hairpin/400/400',
    category: 'hairpin',
  },

  // 花饰
  {
    id: 'peony-flower',
    name: '牡丹花饰',
    description: '富贵牡丹，国色天香，唐代女子喜爱',
    image: 'https://picsum.photos/seed/peony-flower/400/400',
    category: 'flower',
  },
  {
    id: 'plum-blossom',
    name: '梅花簪',
    description: '傲雪梅花，清雅高洁，文人推崇',
    image: 'https://picsum.photos/seed/plum-blossom/400/400',
    category: 'flower',
  },
  {
    id: 'lotus-flower',
    name: '莲花饰',
    description: '出淤泥不染，佛系清雅，适合禅意造型',
    image: 'https://picsum.photos/seed/lotus-flower/400/400',
    category: 'flower',
  },

  // 面纱
  {
    id: 'silk-veil',
    name: '轻纱面纱',
    description: '薄如蝉翼，半遮面容，神秘飘逸',
    image: 'https://picsum.photos/seed/silk-veil/400/400',
    category: 'veil',
  },
  {
    id: 'beaded-veil',
    name: '珠帘面纱',
    description: '珠串垂落，叮当作响，异域风情',
    image: 'https://picsum.photos/seed/beaded-veil/400/400',
    category: 'veil',
  },

  // 梳篦
  {
    id: 'jade-comb',
    name: '玉梳',
    description: '白玉梳篦，精致典雅，束发装饰两用',
    image: 'https://picsum.photos/seed/jade-comb/400/400',
    category: 'comb',
  },
  {
    id: 'gold-comb',
    name: '金梳',
    description: '錾金梳子，华贵精致，唐代贵妇用',
    image: 'https://picsum.photos/seed/gold-comb/400/400',
    category: 'comb',
  },
  {
    id: 'tortoiseshell-comb',
    name: '玳瑁梳',
    description: '玳瑁材质，温润古朴，文人雅好',
    image: 'https://picsum.photos/seed/tortoiseshell-comb/400/400',
    category: 'comb',
  },
];

export function getHeadwearById(id: string): Headwear | undefined {
  return headwear.find(h => h.id === id);
}

export function getHeadwearByCategory(category: string): Headwear[] {
  return headwear.filter(h => h.category === category);
}
