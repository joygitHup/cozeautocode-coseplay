import { Costume } from '../types';

export const costumes: Costume[] = [
  // 唐代服饰
  {
    id: 'tang-court-gown',
    name: '唐制齐胸襦裙',
    dynasty: '唐',
    description: '高腰襦裙，宽袖飘逸，展现盛唐雍容华贵之美',
    image: 'https://picsum.photos/seed/tang-court-gown/400/400',
    style: '宫廷华贵',
    category: 'dress',
  },
  {
    id: 'tang-feitian',
    name: '飞天服饰',
    dynasty: '唐',
    description: '飘带飞舞，轻盈灵动，敦煌壁画中的天女形象',
    image: 'https://picsum.photos/seed/tang-feitian/400/400',
    style: '敦煌飞天',
    category: 'dress',
  },
  {
    id: 'tang-wide-sleeve',
    name: '广袖流仙裙',
    dynasty: '唐',
    description: '宽大袖口，层叠裙摆，仙气十足',
    image: 'https://picsum.photos/seed/tang-wide-sleeve/400/400',
    style: '仙山飘逸',
    category: 'dress',
  },
  {
    id: 'tang-casual',
    name: '唐制坦领',
    dynasty: '唐',
    description: '坦领半臂，轻便日常，唐代女子常服',
    image: 'https://picsum.photos/seed/tang-casual/400/400',
    style: '魏晋洒脱',
    category: 'jacket',
  },

  // 宋代服饰
  {
    id: 'song-beizi',
    name: '宋制褙子',
    dynasty: '宋',
    description: '直领对襟，长及膝下，清雅素净的文人气质',
    image: 'https://picsum.photos/seed/song-beizi/400/400',
    style: '江南婉约',
    category: 'robe',
  },
  {
    id: 'song-qixiong',
    name: '宋制抹胸',
    dynasty: '宋',
    description: '抹胸搭配百迭裙，简约优雅的宋代女子装扮',
    image: 'https://picsum.photos/seed/song-qixiong/400/400',
    style: '江南婉约',
    category: 'dress',
  },
  {
    id: 'song-dress',
    name: '宋制长衫',
    dynasty: '宋',
    description: '修长衫子，素雅配色，文人雅士的日常着装',
    image: 'https://picsum.photos/seed/song-dress/400/400',
    style: '文人雅致',
    category: 'robe',
  },

  // 明代服饰
  {
    id: 'ming-dragon-robe',
    name: '明制蟒袍',
    dynasty: '明',
    description: '织金蟒纹，庄重威严，明代贵族礼服',
    image: 'https://picsum.photos/seed/ming-dragon-robe/400/400',
    style: '宫廷华贵',
    category: 'robe',
  },
  {
    id: 'ming-beizi',
    name: '明制披风',
    dynasty: '明',
    description: '对襟披风，端庄大气，明代女子外搭',
    image: 'https://picsum.photos/seed/ming-beizi/400/400',
    style: '文人雅致',
    category: 'robe',
  },
  {
    id: 'ming-aoqun',
    name: '明制袄裙',
    dynasty: '明',
    description: '上袄下裙，经典搭配，明代女子日常着装',
    image: 'https://picsum.photos/seed/ming-aoqun/400/400',
    style: '江南婉约',
    category: 'dress',
  },
  {
    id: 'ming-hanfu',
    name: '明制立领',
    dynasty: '明',
    description: '立领对襟，精致典雅，明代特色服饰',
    image: 'https://picsum.photos/seed/ming-hanfu/400/400',
    style: '江南婉约',
    category: 'jacket',
  },
  {
    id: 'ming-skirt',
    name: '明制马面裙',
    dynasty: '明',
    description: '前后裙门，褶裥整齐，明代经典裙装',
    image: 'https://picsum.photos/seed/ming-skirt/400/400',
    style: '民族风情',
    category: 'skirt',
  },

  // 汉代服饰
  {
    id: 'han-dress',
    name: '汉制曲裾',
    dynasty: '汉',
    description: '绕襟深衣，庄重肃穆，汉代贵族礼服',
    image: 'https://picsum.photos/seed/han-dress/400/400',
    style: '敦煌飞天',
    category: 'dress',
  },
  {
    id: 'han-shenyi',
    name: '汉制直裾',
    dynasty: '汉',
    description: '直裾深衣，简洁大气，汉代文人常服',
    image: 'https://picsum.photos/seed/han-shenyi/400/400',
    style: '仙山飘逸',
    category: 'robe',
  },
  {
    id: 'han-ruqun',
    name: '汉制襦裙',
    dynasty: '汉',
    description: '上襦下裙，古朴典雅，汉代女子常服',
    image: 'https://picsum.photos/seed/han-ruqun/400/400',
    style: '魏晋洒脱',
    category: 'dress',
  },
  {
    id: 'han-jacket',
    name: '汉制半臂',
    dynasty: '汉',
    description: '短袖半臂，轻便实用，汉代日常着装',
    image: 'https://picsum.photos/seed/han-jacket/400/400',
    style: '民族风情',
    category: 'jacket',
  },

  // 魏晋服饰
  {
    id: 'wei-jin',
    name: '魏晋大袖衫',
    dynasty: '魏晋',
    description: '宽袍大袖，洒脱不羁，魏晋名士风度',
    image: 'https://picsum.photos/seed/wei-jin/400/400',
    style: '魏晋洒脱',
    category: 'robe',
  },

  // 道教服饰
  {
    id: 'daopao',
    name: '道袍',
    dynasty: '明',
    description: '交领右衽，素净淡雅，道教修行服饰',
    image: 'https://picsum.photos/seed/daopao/400/400',
    style: '道法自然',
    category: 'robe',
  },
  {
    id: 'tang-xiandao',
    name: '仙道服',
    dynasty: '唐',
    description: '飘逸出尘，仙风道骨，修道之人着装',
    image: 'https://picsum.photos/seed/tang-xiandao/400/400',
    style: '仙山飘逸',
    category: 'robe',
  },

  // 民族服饰
  {
    id: 'miao-dress',
    name: '苗族盛装',
    dynasty: '民族',
    description: '银饰华丽，刺绣精美，苗族节日盛装',
    image: 'https://picsum.photos/seed/miao-dress/400/400',
    style: '民族风情',
    category: 'dress',
  },
  {
    id: 'qing-court-dress',
    name: '清制旗装',
    dynasty: '清',
    description: '旗袍雏形，满族特色，清代贵族女装',
    image: 'https://picsum.photos/seed/qing-court-dress/400/400',
    style: '宫廷华贵',
    category: 'dress',
  },
];

export function getCostumeById(id: string): Costume | undefined {
  return costumes.find(c => c.id === id);
}

export function getCostumesByStyle(style: string): Costume[] {
  return costumes.filter(c => c.style === style);
}

export function getCostumesByDynasty(dynasty: string): Costume[] {
  return costumes.filter(c => c.dynasty === dynasty);
}
