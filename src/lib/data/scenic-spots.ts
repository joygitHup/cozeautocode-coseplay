import { ScenicSpot } from '../types';

export const scenicSpots: ScenicSpot[] = [
  {
    id: 'forbidden-city',
    name: '故宫',
    province: '北京',
    description: '红墙黄瓦，皇家气派。明清代皇宫，适合庄重华贵的宫廷风格古装。',
    image: 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=800&q=80',
    style: '宫廷华贵',
    recommendedCostumes: ['ming-dragon-robe', 'qing-court-dress', 'tang-court-gown'],
  },
  {
    id: 'west-lake',
    name: '西湖',
    province: '浙江',
    description: '烟柳画桥，水光潋滟。江南水乡的婉约之美，适合清雅秀丽的宋制汉服。',
    image: 'https://images.unsplash.com/photo-1528164344705-4a4f25209e51?w=800&q=80',
    style: '江南婉约',
    recommendedCostumes: ['song-beizi', 'song-qixiong', 'ming-hanfu'],
  },
  {
    id: 'dunhuang',
    name: '敦煌莫高窟',
    province: '甘肃',
    description: '大漠孤烟，飞天壁画。丝路明珠的神秘韵味，适合飘逸灵动的唐风服饰。',
    image: 'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=800&q=80',
    style: '敦煌飞天',
    recommendedCostumes: ['tang-feitian', 'tang-wide-sleeve', 'han-dress'],
  },
  {
    id: 'suzhou-garden',
    name: '苏州园林',
    province: '江苏',
    description: '曲径通幽，亭台楼阁。文人雅士的精致生活，适合素雅淡然的明制汉服。',
    image: 'https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=800&q=80',
    style: '文人雅致',
    recommendedCostumes: ['ming-beizi', 'ming-aoqun', 'song-dress'],
  },
  {
    id: 'huangshan',
    name: '黄山',
    province: '安徽',
    description: '奇松怪石，云海日出。仙山琼阁的飘渺意境，适合仙气飘逸的道系风格。',
    image: 'https://images.unsplash.com/photo-1513415564515-763d91423bdd?w=800&q=80',
    style: '仙山飘逸',
    recommendedCostumes: ['han-shenyi', 'daopao', 'tang-xiandao'],
  },
  {
    id: 'phoenix-town',
    name: '凤凰古城',
    province: '湖南',
    description: '沱江吊脚，苗寨风情。湘西的神秘与浪漫，适合民族风情的古装。',
    image: 'https://images.unsplash.com/photo-1537531383496-f4749b8032cf?w=800&q=80',
    style: '民族风情',
    recommendedCostumes: ['miao-dress', 'han-jacket', 'ming-skirt'],
  },
  {
    id: 'lijiang',
    name: '丽江古城',
    province: '云南',
    description: '玉龙雪山，纳西古韵。高原水乡的悠然自在，适合轻便洒脱的魏晋风。',
    image: 'https://images.unsplash.com/photo-1542856391-010fb87dcfed?w=800&q=80',
    style: '魏晋洒脱',
    recommendedCostumes: ['wei-jin', 'han-ruqun', 'tang-casual'],
  },
  {
    id: 'wudang',
    name: '武当山',
    province: '湖北',
    description: '道法自然，太极神韵。道教圣地的清修之气，适合素净淡雅的道袍。',
    image: 'https://images.unsplash.com/photo-1516567727245-ad8c68f3ec93?w=800&q=80',
    style: '道法自然',
    recommendedCostumes: ['daopao', 'han-shenyi', 'tang-daist'],
  },
];

export function getScenicSpotById(id: string): ScenicSpot | undefined {
  return scenicSpots.find(spot => spot.id === id);
}

export function getScenicSpotsByStyle(style: string): ScenicSpot[] {
  return scenicSpots.filter(spot => spot.style.includes(style));
}
