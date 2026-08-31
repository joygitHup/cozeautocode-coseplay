import type { ScenicSpot, Costume, Jewelry, Headwear, Makeup } from '@/lib/types';
import type { Locale } from './types';
import type { ScenicSpotSeoContent } from '@/lib/data/scenic-spot-seo-content';

type SpotFields = Pick<ScenicSpot, 'name' | 'province' | 'description' | 'style'>;
type ItemFields = Pick<Costume, 'name' | 'description'> &
  Partial<Pick<Costume, 'dynasty' | 'style'>>;

const spotsEn: Record<string, SpotFields> = {
  'forbidden-city': {
    name: 'Forbidden City',
    province: 'Beijing',
    description:
      'Red walls and golden roofs of imperial China. Ideal for solemn, luxurious court-style costumes from Ming and Qing.',
    style: 'Imperial Court',
  },
  'west-lake': {
    name: 'West Lake',
    province: 'Zhejiang',
    description:
      'Misty willows and shimmering waters. A Jiangnan classic best paired with elegant Song-style hanfu.',
    style: 'Jiangnan Grace',
  },
  dunhuang: {
    name: 'Dunhuang Mogao Caves',
    province: 'Gansu',
    description:
      'Desert horizons and flying-apsaras murals. Silk Road mystique for flowing Tang-inspired looks.',
    style: 'Dunhuang Apsara',
  },
  'suzhou-garden': {
    name: 'Suzhou Gardens',
    province: 'Jiangsu',
    description:
      'Winding paths and pavilions of literati life. Soft Ming-style hanfu suits this refined garden mood.',
    style: 'Literati Elegance',
  },
  huangshan: {
    name: 'Mount Huang',
    province: 'Anhui',
    description:
      'Odd pines, sea of clouds, and sunrise peaks. Ethereal Daoist-inspired robes fit the immortal-mountain vibe.',
    style: 'Mountain Ethereal',
  },
  'phoenix-town': {
    name: 'Fenghuang Ancient Town',
    province: 'Hunan',
    description:
      'Stilt houses along the Tuo River and Miao heritage. Perfect for ethnic-inspired traditional looks.',
    style: 'Ethnic Charm',
  },
  lijiang: {
    name: 'Lijiang Old Town',
    province: 'Yunnan',
    description:
      'Jade Dragon Snow Mountain and Naxi charm. Light Wei-Jin style robes match this highland ease.',
    style: 'Wei-Jin Freedom',
  },
  wudang: {
    name: 'Mount Wudang',
    province: 'Hubei',
    description:
      'Daoist sanctuary of Tai Chi and quiet cultivation. Clean, muted Daoist robes suit the sacred mountain.',
    style: 'Daoist Harmony',
  },
};

const costumesEn: Record<string, ItemFields> = {
  'tang-court-gown': {
    name: 'Tang High-Waist Ruqun',
    dynasty: 'Tang',
    description: 'High-waist ruqun with flowing wide sleeves—peak Tang grandeur.',
    style: 'Court Luxury',
  },
  'tang-feitian': {
    name: 'Flying Apsara Attire',
    dynasty: 'Tang',
    description: 'Ribboned, airy silhouette inspired by Dunhuang mural deities.',
    style: 'Dunhuang Apsara',
  },
  'tang-wide-sleeve': {
    name: 'Wide-Sleeve Immortal Skirt',
    dynasty: 'Tang',
    description: 'Layered skirts and oversized sleeves with celestial flair.',
    style: 'Mountain Ethereal',
  },
  'tang-casual': {
    name: 'Tang Open-Collar Casual',
    dynasty: 'Tang',
    description: 'Open collar and half-sleeve—everyday Tang women’s wear.',
    style: 'Wei-Jin Freedom',
  },
  'song-beizi': {
    name: 'Song Beizi',
    dynasty: 'Song',
    description: 'Straight collar, knee-length overlay with literati calm.',
    style: 'Jiangnan Grace',
  },
  'song-qixiong': {
    name: 'Song Strapless Look',
    dynasty: 'Song',
    description: 'Strapless top with pleated skirt—simple Song elegance.',
    style: 'Jiangnan Grace',
  },
  'song-dress': {
    name: 'Song Long Robe',
    dynasty: 'Song',
    description: 'Slim long robe in muted tones for scholars’ daily wear.',
    style: 'Literati Elegance',
  },
  'ming-dragon-robe': {
    name: 'Ming Python Robe',
    dynasty: 'Ming',
    description: 'Gold-woven python motifs—stately Ming noble formalwear.',
    style: 'Court Luxury',
  },
  'ming-beizi': {
    name: 'Ming Cape',
    dynasty: 'Ming',
    description: 'Front-opening cape with composed Ming silhouette.',
    style: 'Literati Elegance',
  },
  'ming-aoqun': {
    name: 'Ming Jacket & Skirt',
    dynasty: 'Ming',
    description: 'Classic jacket-over-skirt set for Ming daily looks.',
    style: 'Jiangnan Grace',
  },
  'ming-hanfu': {
    name: 'Ming Standing Collar',
    dynasty: 'Ming',
    description: 'Standing collar and front panels—Ming signature detail.',
    style: 'Jiangnan Grace',
  },
  'ming-skirt': {
    name: 'Ming Mamian Skirt',
    dynasty: 'Ming',
    description: 'Front and back panels with neat pleats—Ming classic.',
    style: 'Ethnic Charm',
  },
  'han-dress': {
    name: 'Han Quju',
    dynasty: 'Han',
    description: 'Wrapped deep robe—solemn Han aristocratic formalwear.',
    style: 'Dunhuang Apsara',
  },
  'han-shenyi': {
    name: 'Han Zhiju',
    dynasty: 'Han',
    description: 'Straight deep robe—simple and dignified literati wear.',
    style: 'Mountain Ethereal',
  },
  'han-ruqun': {
    name: 'Han Ruqun',
    dynasty: 'Han',
    description: 'Short top and skirt—rustic Han women’s everyday look.',
    style: 'Wei-Jin Freedom',
  },
  'han-jacket': {
    name: 'Han Half-Sleeve',
    dynasty: 'Han',
    description: 'Short sleeves for practical Han daily wear.',
    style: 'Ethnic Charm',
  },
  'wei-jin': {
    name: 'Wei-Jin Wide Sleeve',
    dynasty: 'Wei-Jin',
    description: 'Loose robe and wide sleeves—free-spirited Wei-Jin flair.',
    style: 'Wei-Jin Freedom',
  },
  daopao: {
    name: 'Daoist Robe',
    dynasty: 'Ming',
    description: 'Cross-collar robe in muted tones for Daoist practice.',
    style: 'Daoist Harmony',
  },
  'tang-xiandao': {
    name: 'Immortal Daoist Attire',
    dynasty: 'Tang',
    description: 'Flowing, otherworldly robes for spiritual wanderers.',
    style: 'Mountain Ethereal',
  },
  'miao-dress': {
    name: 'Miao Festival Dress',
    dynasty: 'Ethnic',
    description: 'Silver ornaments and fine embroidery for Miao festivals.',
    style: 'Ethnic Charm',
  },
  'qing-court-dress': {
    name: 'Qing Banner Dress',
    dynasty: 'Qing',
    description: 'Early qipao form with Manchu court character.',
    style: 'Court Luxury',
  },
};

const jewelryEn: Record<string, Pick<Jewelry, 'name' | 'description'>> = {
  'pearl-necklace': {
    name: 'Pearl Yingluo',
    description: 'Rounded pearls in a gentle Tang noble necklace.',
  },
  'jade-pendant': {
    name: 'Jade Pendant Collar',
    description: 'Warm white jade carving for luck and grace.',
  },
  'gold-locket': {
    name: 'Gold Longevity Lock',
    description: 'Chased gold lock charm for blessings and longevity.',
  },
  'jade-bracelet': {
    name: 'Jadeite Bangle',
    description: 'Lucid green jadeite—timeless women’s essential.',
  },
  'gold-bangle': {
    name: 'Chased Gold Bangle',
    description: 'Ornate gold bracelet common in wedding attire.',
  },
  'silver-bracelet': {
    name: 'Silver Wire Armlet',
    description: 'Fine silver coils with Miao ethnic character.',
  },
  'jade-earrings': {
    name: 'Jade Drop Earrings',
    description: 'Jadeite drops with refined, airy movement.',
  },
  'pearl-earrings': {
    name: 'Pearl Drop Earrings',
    description: 'Soft pearl drops—versatile and graceful.',
  },
  'gold-earrings': {
    name: 'Gold Hoop Earrings',
    description: 'Delicate chased gold hoops popular in Tang fashion.',
  },
  'jade-ring': {
    name: 'Jade Archer Ring',
    description: 'Jadeite archer’s ring for scholars or warriors.',
  },
  'gold-ring': {
    name: 'Gem-Set Gold Ring',
    description: 'Gold with inset gems for courtly luxury.',
  },
  'gold-hairpin-jewelry': {
    name: 'Gold Buyao',
    description: 'Gold dangling hair ornament beloved by Tang ladies.',
  },
};

const headwearEn: Record<string, Pick<Headwear, 'name' | 'description'>> = {
  'phoenix-crown': {
    name: 'Phoenix Crown',
    description: 'Golden phoenix and jewels for empress or bridal looks.',
  },
  'flower-crown': {
    name: 'Flower Crown',
    description: 'Fresh floral crown for youthful or fairy styling.',
  },
  'jade-crown': {
    name: 'Jade Crown',
    description: 'Warm jade crown for literati hair binding.',
  },
  'gold-step-sway': {
    name: 'Gold Buyao',
    description: 'Gold dangling piece that sways with every step.',
  },
  'jade-hairpin': {
    name: 'Jade Hairpin',
    description: 'Simple white jade pin for everyday hair.',
  },
  'wooden-hairpin': {
    name: 'Wooden Hairpin',
    description: 'Sandalwood pin for hermits and Daoist looks.',
  },
  'silver-hairpin': {
    name: 'Silver Hairpin',
    description: 'Silver pin with Miao ethnic character.',
  },
  'peony-flower': {
    name: 'Peony Hair Ornament',
    description: 'Peony bloom—Tang favorite for luxurious styling.',
  },
  'plum-blossom': {
    name: 'Plum Blossom Pin',
    description: 'Winter plum motif for refined literati taste.',
  },
  'lotus-flower': {
    name: 'Lotus Ornament',
    description: 'Lotus purity for serene, zen-inspired looks.',
  },
  'silk-veil': {
    name: 'Silk Veil',
    description: 'Sheer silk half-covering the face with mystery.',
  },
  'beaded-veil': {
    name: 'Beaded Veil',
    description: 'Bead strands with exotic, musical movement.',
  },
  'jade-comb': {
    name: 'Jade Comb',
    description: 'White jade comb for styling and ornament.',
  },
  'gold-comb': {
    name: 'Gold Comb',
    description: 'Chased gold comb for Tang noblewomen.',
  },
  'tortoiseshell-comb': {
    name: 'Tortoiseshell Comb',
    description: 'Warm tortoiseshell comb favored by literati.',
  },
};

const makeupEn: Record<string, Pick<Makeup, 'name' | 'description' | 'style'>> = {
  'tang-dianya': {
    name: 'Tang Elegant Makeup',
    description: 'Peach flush, distant-mountain brows, and cherry lips.',
    style: 'Court Luxury',
  },
  'song-qingya': {
    name: 'Song Fresh Makeup',
    description: 'Barely-there face with soft moth brows.',
    style: 'Jiangnan Grace',
  },
  'ming-wanwan': {
    name: 'Ming Graceful Makeup',
    description: 'Painted brows and vermilion lips with poised charm.',
    style: 'Literati Elegance',
  },
  'han-natural': {
    name: 'Han Natural Makeup',
    description: 'Minimal powder—return to natural beauty.',
    style: 'Wei-Jin Freedom',
  },
  'wei-jin-xiaoyao': {
    name: 'Wei-Jin Free Makeup',
    description: 'Light wash of color with free-spirited ease.',
    style: 'Wei-Jin Freedom',
  },
  'dao-qingjing': {
    name: 'Daoist Quiet Makeup',
    description: 'Clean, subdued finish for contemplative looks.',
    style: 'Daoist Harmony',
  },
  'tang-huali': {
    name: 'High Tang Glamour',
    description: 'Huadian, forehead yellow, and lush Tang drama.',
    style: 'Court Luxury',
  },
  'feitian-xianzi': {
    name: 'Flying Apsara Makeup',
    description: 'Huadian accents and mural-inspired eye expression.',
    style: 'Dunhuang Apsara',
  },
  'gongting-gui': {
    name: 'Court Lady Makeup',
    description: 'Rich color and jeweled glow of imperial style.',
    style: 'Court Luxury',
  },
  'xian-ethereal': {
    name: 'Xianxia Cool Makeup',
    description: 'Porcelain skin and cool brows—untouched by the world.',
    style: 'Mountain Ethereal',
  },
  'huashan-xian': {
    name: 'Mount Hua Fairy Makeup',
    description: 'Icy clarity for a xianxia heroine presence.',
    style: 'Mountain Ethereal',
  },
  'yue-gong': {
    name: 'Moon Palace Makeup',
    description: 'Cool lunar glow recalling Chang’e.',
    style: 'Mountain Ethereal',
  },
};

const seoEn: Record<string, ScenicSpotSeoContent> = {
  'forbidden-city': {
    intro:
      'The Forbidden City is the Ming–Qing imperial palace, where red walls, golden roofs, and marble terraces define court aesthetics. In Huashangji, use it as your backdrop for solemn, luxurious court costume styling—from Ming dragon robes to Qing banner dress.',
    styleGuide:
      'Imperial court style favors symmetry, layered silhouettes, and gold accents. Colors lean vermilion, imperial yellow, and indigo; fabrics evoke woven gold and cloud brocade. Choose phoenix crowns, kingfisher ornaments, or refined pins; keep makeup dignified with clear brows and full lips.',
    outfitTips: [
      'Ming rank robes and mamian skirts convey official gravity; dragon motifs heighten imperial feel.',
      'Qing court looks pair standing collars and frog buttons with pearls and kingfisher jewelry.',
      'Prefer phoenix crowns or high chignons to contrast red walls and golden roofs.',
      'Use classical court makeup with layered eye depth and vermilion lips.',
    ],
    photoTips: [
      'Full-body photos show skirt volume; half-body shots highlight hair ornaments and face.',
      'Upload evenly lit photos with clean backgrounds for better AI scene blending.',
      'Upright posture with relaxed shoulders matches court etiquette imagery.',
    ],
    faq: [
      {
        question: 'Which dynasties suit the Forbidden City scene?',
        answer:
          'Ming and Qing court costumes fit best—dragon robes, rank badges, and banner dress echo the palace era.',
      },
      {
        question: 'What jewelry works for Forbidden City looks?',
        answer:
          'Pearl necklaces, kingfisher earrings, gold buyao, or phoenix crowns amplify court luxury.',
      },
    ],
  },
  'west-lake': {
    intro:
      'West Lake’s misty embankments and bridges embody Jiangnan grace. Soft Song-style hanfu pairs naturally with lake light and willow lines in Huashangji.',
    styleGuide:
      'Seek lightness, quiet color, and breathing space. Prefer Song beizi, high-waist ruqun, or Ming standing-collar sets in moon-white, pale teal, lotus, and apricot. Keep jewelry minimal—jade or floral pins—and makeup fresh with soft brows.',
    outfitTips: [
      'Song beizi with pleated skirts matches West Lake’s ink-wash mood.',
      'High-waist ruqun with silk scarves adds airy movement.',
      'Choose simple floral or jade pins over heavy crowns.',
      'Favor light makeup with soft blush and muted lips.',
    ],
    photoTips: [
      'Half-body shots emphasize Song collar lines and makeup detail.',
      'Front or slight three-quarter angles help AI keep a soft lake atmosphere.',
      'Light modern clothing in the source photo blends more naturally.',
    ],
    faq: [
      {
        question: 'Which hanfu forms suit West Lake?',
        answer:
          'Song beizi and high-waist ruqun are classics—light, elegant, and lake-friendly.',
      },
      {
        question: 'How should jewelry be styled for Jiangnan looks?',
        answer:
          'Keep it sparse: jade pins, silver pieces, and small earrings preserve the soft mood.',
      },
    ],
  },
  dunhuang: {
    intro:
      'Dunhuang’s Mogao Caves preserve mural art across centuries. Flying apsaras and Silk Road color make Tang flowing robes a natural match in Huashangji.',
    styleGuide:
      'Emphasize wide sleeves, ribbons, and mural color clashes—azurite, cinnabar, ochre, and malachite. Pair Tang high-waist or wide-sleeve sets with scarves; add floral forehead ornaments and richer eye makeup.',
    outfitTips: [
      'Tang wide sleeves are core to the flying-apsara silhouette.',
      'Scarves and long ribbons are signature Dunhuang details.',
      'High chignons with huadian accents complete the look.',
      'Makeup can be stronger to echo mural pigments.',
    ],
    photoTips: [
      'Full-body photos show sleeve and ribbon movement best.',
      'Open arm poses feel closer to apsara imagery.',
      'Clean backgrounds help AI add desert and cave elements.',
    ],
    faq: [
      {
        question: 'How is Dunhuang style different from everyday hanfu?',
        answer:
          'It leans wider sleeves, ribbons, and mural colors—more kinetic and exotic.',
      },
      {
        question: 'How do I approximate a flying-apsara look?',
        answer:
          'Choose Tang high-waist or wide-sleeve sets, add scarves/ribbons, and style a high chignon with huadian.',
      },
    ],
  },
  'suzhou-garden': {
    intro:
      'Suzhou gardens prize borrowed views and literati living. Quiet Ming hanfu mirrors pavilion restraint in Huashangji’s garden scene.',
    styleGuide:
      'Keep lines clean and colors muted—gray-blue, moon-white, moss green, soft brown. Ming bijia, jacket-and-skirt sets, or robe-like layers work well. Prefer jade or wood pins and nearly bare makeup.',
    outfitTips: [
      'Ming bijia with mamian skirts is a garden classic.',
      'Standing-collar jackets with pleated skirts feel scholarly.',
      'One jade or wood pin is enough—avoid ornate crowns.',
      'Use nude or soft bean-paste lips and natural brows.',
    ],
    photoTips: [
      'Half-body shots highlight Ming collars and composed presence.',
      'Still poses—hands lightly folded—suit garden quietude.',
      'Soft lighting preserves the garden’s understated beauty.',
    ],
    faq: [
      {
        question: 'Which styles fit Suzhou Gardens?',
        answer:
          'Ming hanfu—bijia, jacket-and-skirt, standing collar—matches literati gardens best.',
      },
      {
        question: 'How to avoid looking too plain?',
        answer:
          'Add texture, frog buttons, belt color, and a single jade accent while staying understated.',
      },
    ],
  },
  huangshan: {
    intro:
      'Mount Huang is famed for pines, rocks, and seas of cloud. Ethereal Daoist robes match its immortal-mountain aura in Huashangji.',
    styleGuide:
      'Favor long lines, cool tones, and lightness—deep robes, Daoist robes, or Tang leisure wear in gray-blue, moon-white, pine green, and soft violet. Simple wood pins or hairbands; translucent, cool makeup.',
    outfitTips: [
      'Deep robes or Daoist robes are first choice for ethereal presence.',
      'Wide sleeves amplify wind-in-cloth mountain drama.',
      'Keep headwear minimal—wood pins or soft ties.',
      'Makeup stays light with clear, cool brows.',
    ],
    photoTips: [
      'Full-body photos show robe length and sleeve proportion.',
      'A slight side stance evokes standing in mountain wind.',
      'Clear outlines help AI place cloud-sea backgrounds.',
    ],
    faq: [
      {
        question: 'Xianxia or everyday hanfu for Mount Huang?',
        answer:
          'Both work, but deep robes and Daoist cuts better match cloud-sea imagery.',
      },
      {
        question: 'How to look more otherworldly?',
        answer:
          'Reduce jewelry, choose cool fabrics, keep makeup minimal, and leave visual space.',
      },
    ],
  },
  'phoenix-town': {
    intro:
      'Fenghuang Ancient Town blends stilt houses, stone lanes, and Miao–Tujia culture. Huashangji’s scene invites ethnic-inflected traditional styling.',
    styleGuide:
      'Mix Miao embroidery and silver with hanfu bases. Cross-collar ruqun or short jackets with long skirts in indigo, black, red, and silver work well. Layer silver collars boldly; makeup can be warmer and stronger.',
    outfitTips: [
      'Embroidery or ethnic motifs make the look instantly recognizable.',
      'Layer silver necklaces, cuffs, and earrings with clear hierarchy.',
      'Silver crowns or braided silver accents fit stilt-house scenes.',
      'Slightly richer makeup echoes Xiangxi warmth.',
    ],
    photoTips: [
      'Full-body photos capture silver layers and dress length.',
      'Slight turns or over-shoulder poses add narrative.',
      'Sharp outlines help AI preserve jewelry detail.',
    ],
    faq: [
      {
        question: 'Must I wear full Miao dress?',
        answer:
          'No—hanfu with ethnic motifs, silver, and color contrast can still feel Xiangxi.',
      },
      {
        question: 'Will lots of silver look messy?',
        answer:
          'Keep one hero piece (collar/crown) and support with smaller earrings or cuffs.',
      },
    ],
  },
  lijiang: {
    intro:
      'Lijiang Old Town sits beneath Jade Dragon Snow Mountain with Naxi culture and highland ease. Wei-Jin loose robes match that free rhythm in Huashangji.',
    styleGuide:
      'Prefer loose Wei-Jin sleeves, waist-level ruqun, or straight deep robes in white, cream, soft brown, and pale teal. Simple hair ties or half-loose hair; almost bare makeup.',
    outfitTips: [
      'Wei-Jin wide sleeves with waist ruqun are the signature pairing.',
      'Tie belts loosely for an unforced silhouette.',
      'Keep hair simple—half-loose or lightly bound.',
      'Makeup should feel nearly bare.',
    ],
    photoTips: [
      'Full-body photos show sleeve width and hem movement.',
      'Relaxed posture beats rigid posing.',
      'Natural outdoor light blends well with Lijiang scenes.',
    ],
    faq: [
      {
        question: 'Wei-Jin vs Tang style?',
        answer:
          'Wei-Jin is looser, paler, and less ornate; Tang is richer in color and layering.',
      },
      {
        question: 'Why Wei-Jin for Lijiang?',
        answer:
          'The town’s easy pace and open highland views align with Wei-Jin freedom.',
      },
    ],
  },
  wudang: {
    intro:
      'Mount Wudang is a Daoist holy mountain of Tai Chi and quiet cultivation. Huashangji’s scene favors clean Daoist robes and yin–yang restraint.',
    styleGuide:
      'Seek purity, symmetry, and inner calm. Daoist robes, zhiju, or deep robes in black, white, gray, and deep blue with cotton–linen feel. Daoist crowns or wood pins; nearly no makeup.',
    outfitTips: [
      'Daoist robes are the most emblematic Wudang choice.',
      'Stay in black–white–gray with optional teal accents.',
      'Use a Daoist crown or wood pin—never heavy jewelry.',
      'Makeup remains minimal with clear, calm brows.',
    ],
    photoTips: [
      'Full-body photos show robe hang and length.',
      'Centered, composed posture fits cultivation aesthetics.',
      'Simple source backgrounds help AI add peaks and mist.',
    ],
    faq: [
      {
        question: 'Must I wear a Daoist robe?',
        answer:
          'It fits best, but muted deep robes or zhiju also work if the mood stays quiet.',
      },
      {
        question: 'How to echo Tai Chi visually?',
        answer:
          'Use black–white balance, symmetric cuts, and sparse ornaments to suggest yin–yang.',
      },
    ],
  },
};

function localizeFields<T extends { id: string }>(
  item: T,
  locale: Locale,
  table: Record<string, Partial<T>>,
): T {
  if (locale === 'zh') return item;
  const patch = table[item.id];
  return patch ? { ...item, ...patch } : item;
}

export function localizeScenicSpot(spot: ScenicSpot, locale: Locale): ScenicSpot {
  return localizeFields(spot, locale, spotsEn);
}

export function localizeCostume(item: Costume, locale: Locale): Costume {
  return localizeFields(item, locale, costumesEn);
}

export function localizeJewelry(item: Jewelry, locale: Locale): Jewelry {
  return localizeFields(item, locale, jewelryEn);
}

export function localizeHeadwear(item: Headwear, locale: Locale): Headwear {
  return localizeFields(item, locale, headwearEn);
}

export function localizeMakeup(item: Makeup, locale: Locale): Makeup {
  return localizeFields(item, locale, makeupEn);
}

export function localizeScenicSpots(
  spots: ScenicSpot[],
  locale: Locale,
): ScenicSpot[] {
  return spots.map((spot) => localizeScenicSpot(spot, locale));
}

export function localizeCostumes(items: Costume[], locale: Locale): Costume[] {
  return items.map((item) => localizeCostume(item, locale));
}

export function localizeJewelryList(
  items: Jewelry[],
  locale: Locale,
): Jewelry[] {
  return items.map((item) => localizeJewelry(item, locale));
}

export function localizeHeadwearList(
  items: Headwear[],
  locale: Locale,
): Headwear[] {
  return items.map((item) => localizeHeadwear(item, locale));
}

export function localizeMakeupList(items: Makeup[], locale: Locale): Makeup[] {
  return items.map((item) => localizeMakeup(item, locale));
}

export function getLocalizedSeoContent(
  spotId: string,
  locale: Locale,
  zhContent: ScenicSpotSeoContent | undefined,
): ScenicSpotSeoContent | undefined {
  if (locale === 'zh') return zhContent;
  return seoEn[spotId] ?? zhContent;
}
