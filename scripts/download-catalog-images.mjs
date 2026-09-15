/**
 * Download catalog thumbnails (costume / jewelry / headwear / makeup)
 * Prefer Wikimedia via weserv proxy + Pexels/Unsplash CDNs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const ua =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function wiki(fileName) {
  const encoded = encodeURIComponent(fileName).replace(/%20/g, '_');
  const src = `commons.wikimedia.org/wiki/Special:FilePath/${encoded}?width=900`;
  return `https://images.weserv.nl/?url=${encodeURIComponent(src)}&w=800&h=800&fit=cover&output=jpg`;
}

function pexels(id) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop`;
}

function unsplashDownload(photoId) {
  return `https://unsplash.com/photos/${photoId}/download?force=true&w=800`;
}

function unsplashImg(photoPath) {
  return `https://images.unsplash.com/${photoPath}?auto=format&fit=crop&w=800&h=800&q=80`;
}

/** @type {Record<string, string[]>} path -> url fallbacks */
const targets = {
  // —— costumes ——
  'costume/tang-court-gown.jpg': [
    pexels(37664483),
    unsplashDownload('29Mboxib9Ek'),
  ],
  'costume/tang-feitian.jpg': [
    pexels(11413715),
    pexels(36049106),
  ],
  'costume/tang-wide-sleeve.jpg': [
    pexels(31572699),
    pexels(8152128),
  ],
  'costume/tang-casual.jpg': [
    pexels(8152128),
    pexels(36049106),
  ],
  'costume/song-beizi.jpg': [
    unsplashDownload('29Mboxib9Ek'),
    pexels(31572699),
  ],
  'costume/song-qixiong.jpg': [
    pexels(36049106),
    pexels(37664483),
  ],
  'costume/song-dress.jpg': [
    pexels(31572699),
    unsplashImg('photo-1772535378530-3c2faaacd4b3'),
  ],
  'costume/ming-dragon-robe.jpg': [
    pexels(11413715),
    pexels(37664483),
  ],
  'costume/ming-beizi.jpg': [
    pexels(8152128),
    unsplashDownload('29Mboxib9Ek'),
  ],
  'costume/ming-aoqun.jpg': [
    pexels(37664483),
    pexels(36049106),
  ],
  'costume/ming-hanfu.jpg': [
    pexels(31572699),
    pexels(8152128),
  ],
  'costume/ming-skirt.jpg': [
    pexels(36049106),
    pexels(37664483),
  ],
  'costume/han-dress.jpg': [
    unsplashDownload('29Mboxib9Ek'),
    pexels(31572699),
  ],
  'costume/han-shenyi.jpg': [
    wiki('Hanfu_daopao.jpg'),
    pexels(8152128),
  ],
  'costume/han-ruqun.jpg': [
    pexels(8152128),
    pexels(31572699),
  ],
  'costume/han-jacket.jpg': [
    pexels(36049106),
    pexels(8152128),
  ],
  'costume/wei-jin.jpg': [
    pexels(31572699),
    unsplashDownload('29Mboxib9Ek'),
  ],
  'costume/daopao.jpg': [
    wiki('Hanfu_daopao.jpg'),
    pexels(8152128),
  ],
  'costume/tang-xiandao.jpg': [
    pexels(8152128),
    pexels(31572699),
  ],
  'costume/miao-dress.jpg': [
    pexels(11413715),
    pexels(37858969),
  ],
  'costume/qing-court-dress.jpg': [
    pexels(11413715),
    pexels(37664483),
  ],

  // —— jewelry ——
  'jewelry/pearl-necklace.jpg': [
    pexels(38989492),
    pexels(1454171),
  ],
  'jewelry/jade-pendant.jpg': [
    wiki('Ming_Jade_Pendant_01.jpg'),
    wiki('Mat-goc-hoa-dien-hetian-jade-pendant-kimquigems.jpg'),
  ],
  'jewelry/gold-locket.jpg': [
    pexels(1454172),
    unsplashImg('photo-1515562141207-7a88fb7ce338'),
  ],
  'jewelry/jade-bracelet.jpg': [
    wiki('Jinsha_Jade_Bracelet_4.jpg'),
    wiki('Qing_Imitation_of_Old_Jade_Bracelet_%26_Cicadas.jpg'),
  ],
  'jewelry/gold-bangle.jpg': [
    unsplashImg('photo-1611591437281-460bfbe1220a'),
    pexels(1454171),
  ],
  'jewelry/silver-bracelet.jpg': [
    unsplashImg('photo-1605100804763-247f67b3557e'),
    pexels(1454172),
  ],
  'jewelry/jade-earrings.jpg': [
    wiki('Qing_Jade_Pendant_01.jpg'),
    unsplashImg('photo-1535632066927-ab7c9ab60908'),
  ],
  'jewelry/pearl-earrings.jpg': [
    unsplashImg('photo-1535632066927-ab7c9ab60908'),
    pexels(1454171),
  ],
  'jewelry/gold-earrings.jpg': [
    unsplashImg('photo-1630019852942-f89202989a59'),
    pexels(1454172),
  ],
  'jewelry/jade-ring.jpg': [
    wiki('Warring_States_Jade_Bracelet_04.jpg'),
    unsplashImg('photo-1605100804763-247f67b3557e'),
  ],
  'jewelry/gold-ring.jpg': [
    unsplashImg('photo-1605100804763-247f67b3557e'),
    pexels(1454171),
  ],
  'jewelry/gold-hairpin-jewelry.jpg': [
    wiki('Gold_Hair_Plaque_(Pu-yao-kuan,_%E6%AD%A5%E6%90%96%E5%86%A0),_Six_Dynasties_(220~589).jpg'),
    wiki('Ming_Dynasty_phoenix_crown.jpg'),
  ],

  // —— headwear ——
  'headwear/phoenix-crown.jpg': [
    wiki('Ming_Dynasty_phoenix_crown.jpg'),
    wiki('Ming_Empress_Crown_a.jpg'),
    wiki('Empress_phoenix_crown.jpg'),
  ],
  'headwear/flower-crown.jpg': [
    pexels(35246977),
    wiki('Paeonia_lactiflora.jpg'),
  ],
  'headwear/jade-crown.jpg': [
    wiki('Ming_Empress_Crown_a.jpg'),
    wiki('Empress_phoenix_crown.jpg'),
  ],
  'headwear/gold-step-sway.jpg': [
    wiki('Gold_Hair_Plaque_(Pu-yao-kuan,_%E6%AD%A5%E6%90%96%E5%86%A0),_Six_Dynasties_(220~589).jpg'),
    wiki('Ming_Dynasty_phoenix_crown.jpg'),
  ],
  'headwear/jade-hairpin.jpg': [
    wiki('Mat-goc-hoa-dien-hetian-jade-pendant-kimquigems.jpg'),
    wiki('Ming_Jade_Pendant_01.jpg'),
  ],
  'headwear/wooden-hairpin.jpg': [
    unsplashImg('photo-1617038260897-41db9b0f0f8b'),
    pexels(1454171),
  ],
  'headwear/silver-hairpin.jpg': [
    unsplashImg('photo-1515562141207-7a88fb7ce338'),
    pexels(1454172),
  ],
  'headwear/peony-flower.jpg': [
    wiki('Paeonia_lactiflora.jpg'),
    unsplashImg('photo-1490750967868-88aa4486c946'),
  ],
  'headwear/plum-blossom.jpg': [
    wiki('Plum_blossom.jpg'),
    unsplashImg('photo-1525310072745-f49212b5ac6d'),
  ],
  'headwear/lotus-flower.jpg': [
    wiki('Nelumbo_nucifera.jpg'),
    unsplashImg('photo-1501004318641-b39e6451bec6'),
  ],
  'headwear/silk-veil.jpg': [
    unsplashImg('photo-1524504388940-b1c1722653e1'),
    pexels(8152128),
  ],
  'headwear/beaded-veil.jpg': [
    pexels(35246977),
    unsplashImg('photo-1515562141207-7a88fb7ce338'),
  ],
  'headwear/jade-comb.jpg': [
    wiki('Ming_Jade_Pendant_01.jpg'),
    wiki('Qing_Jade_Pendant_01.jpg'),
  ],
  'headwear/gold-comb.jpg': [
    wiki('Gold_Hair_Plaque_(Pu-yao-kuan,_%E6%AD%A5%E6%90%96%E5%86%A0),_Six_Dynasties_(220~589).jpg'),
    unsplashImg('photo-1611591437281-460bfbe1220a'),
  ],
  'headwear/tortoiseshell-comb.jpg': [
    unsplashImg('photo-1617038260897-41db9b0f0f8b'),
    wiki('Qing_Jade_Pendant_01.jpg'),
  ],

  // —— makeup ——
  'makeup/tang-dianya.jpg': [
    pexels(11413715),
    unsplashDownload('29Mboxib9Ek'),
  ],
  'makeup/song-qingya.jpg': [
    pexels(8152128),
    pexels(31572699),
  ],
  'makeup/ming-wanwan.jpg': [
    pexels(36049106),
    pexels(37664483),
  ],
  'makeup/han-natural.jpg': [
    pexels(31572699),
    pexels(8152128),
  ],
  'makeup/wei-jin-xiaoyao.jpg': [
    unsplashDownload('29Mboxib9Ek'),
    pexels(8152128),
  ],
  'makeup/dao-qingjing.jpg': [
    pexels(8152128),
    pexels(31572699),
  ],
  'makeup/tang-huali.jpg': [
    pexels(11413715),
    pexels(35246977),
  ],
  'makeup/feitian-xianzi.jpg': [
    pexels(11413715),
    unsplashDownload('29Mboxib9Ek'),
  ],
  'makeup/gongting-gui.jpg': [
    pexels(37664483),
    pexels(11413715),
  ],
  'makeup/xian-ethereal.jpg': [
    pexels(8152128),
    pexels(36049106),
  ],
  'makeup/huashan-xian.jpg': [
    pexels(31572699),
    unsplashDownload('29Mboxib9Ek'),
  ],
  'makeup/yue-gong.jpg': [
    pexels(36049106),
    pexels(8152128),
  ],
};

async function download(url, outFile) {
  const res = await fetch(url, {
    headers: { 'User-Agent': ua, Accept: 'image/*,*/*' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 4000) throw new Error(`too small ${buf.length}`);
  const sig = buf.subarray(0, 3).toString('hex').toUpperCase();
  if (!['FFD8FF', '89504E', '524946'].some((s) => sig.startsWith(s.slice(0, 4)) || sig === s)) {
    // jpeg / png / riff(webp)
    if (!(sig.startsWith('FFD8') || sig.startsWith('8950') || sig.startsWith('5249'))) {
      throw new Error(`bad signature ${sig}`);
    }
  }
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, buf);
  return buf.length;
}

async function main() {
  const failed = [];
  let ok = 0;
  for (const [rel, urls] of Object.entries(targets)) {
    const out = path.join(root, 'public', rel);
    let done = false;
    for (const url of urls) {
      try {
        process.stdout.write(`GET ${rel} ... `);
        const len = await download(url, out);
        console.log(`OK ${len}`);
        ok += 1;
        done = true;
        break;
      } catch (e) {
        console.log(`fail (${e.message})`);
      }
    }
    if (!done) failed.push(rel);
  }
  console.log(`\nDone: ${ok}/${Object.keys(targets).length}`);
  if (failed.length) {
    console.log('FAILED:\n' + failed.join('\n'));
    process.exitCode = 1;
  }
}

main();
