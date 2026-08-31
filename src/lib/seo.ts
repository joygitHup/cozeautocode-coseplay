import type { Metadata } from 'next';
import { scenicSpots } from '@/lib/data';
import { getScenicSpotSeoContent } from '@/lib/data/scenic-spot-seo-content';
import type { ScenicSpot } from '@/lib/types';

export const SITE_NAME = '华裳纪';
export const SITE_TAGLINE = '全国景区古装搭配';
export const SITE_DESCRIPTION =
  '华裳纪是一款 AI 古装搭配应用，在全国八大经典景区（故宫、西湖、敦煌、苏州园林、黄山、凤凰古城、丽江、武当山）选择场景，上传照片搭配汉服、首饰与妆容，一键生成专属古装效果图。';

export const OG_IMAGE = {
  url: '/og.jpg',
  width: 1200,
  height: 630,
  alt: '华裳纪 - 全国景区古装搭配',
} as const;

export const SITE_KEYWORDS = [
  '华裳纪',
  '古装搭配',
  '汉服',
  'AI换装',
  '古装写真',
  '景区拍照',
  '故宫汉服',
  '西湖汉服',
  '敦煌飞天',
  '传统文化',
  '古风摄影',
  '汉服造型',
];

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:5000';
}

export const defaultMetadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME} - ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: SITE_NAME,
    title: `${SITE_NAME} - ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
};

export function buildSpotMetadata(spot: ScenicSpot): Metadata {
  const seoContent = getScenicSpotSeoContent(spot.id);
  const title = `${spot.name}古装搭配 - ${spot.style}风格汉服造型`;
  const description =
    seoContent?.intro ??
    `在${spot.province}${spot.name}体验${spot.style}风格古装搭配。${spot.description}上传照片，选择服饰、首饰、头饰与妆容，AI 生成专属古装效果图。`;

  return {
    title,
    description,
    keywords: [
      ...SITE_KEYWORDS,
      spot.name,
      spot.province,
      spot.style,
      `${spot.name}汉服`,
      `${spot.name}古装`,
      `${spot.name}古装搭配`,
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'zh_CN',
      siteName: SITE_NAME,
      images: [
        {
          url: spot.image,
          width: 800,
          height: 1000,
          alt: `${spot.name} - ${spot.style}古装搭配`,
        },
        OG_IMAGE,
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [spot.image, OG_IMAGE.url],
    },
    alternates: {
      canonical: `/dress-up/${spot.id}`,
    },
  };
}

export function buildWebsiteJsonLd() {
  const siteUrl = getSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: 'zh-CN',
        publisher: { '@id': `${siteUrl}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: SITE_NAME,
        url: siteUrl,
        description: SITE_DESCRIPTION,
      },
      {
        '@type': 'WebApplication',
        '@id': `${siteUrl}/#webapp`,
        name: SITE_NAME,
        url: siteUrl,
        description: SITE_DESCRIPTION,
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'CNY',
        },
        featureList: [
          '全国八大景区古装场景',
          '汉服服饰搭配',
          'AI 古装效果图生成',
          '首饰头饰妆容选择',
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${siteUrl}/#scenic-spots`,
        name: '全国经典景区古装搭配场景',
        numberOfItems: scenicSpots.length,
        itemListElement: scenicSpots.map((spot, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: spot.name,
          url: `${siteUrl}/dress-up/${spot.id}`,
          description: spot.description,
        })),
      },
    ],
  };
}

export function buildSpotJsonLd(spot: ScenicSpot) {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/dress-up/${spot.id}`;
  const seoContent = getScenicSpotSeoContent(spot.id);
  const pageDescription = seoContent?.intro ?? spot.description;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}/#webpage`,
        url: pageUrl,
        name: `${spot.name}古装搭配 - ${SITE_NAME}`,
        description: pageDescription,
        inLanguage: 'zh-CN',
        isPartOf: { '@id': `${siteUrl}/#website` },
        about: { '@id': `${pageUrl}/#attraction` },
        breadcrumb: { '@id': `${pageUrl}/#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}/#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: '首页',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: spot.name,
            item: pageUrl,
          },
        ],
      },
      {
        '@type': 'TouristAttraction',
        '@id': `${pageUrl}/#attraction`,
        name: spot.name,
        description: pageDescription,
        image: spot.image,
        address: {
          '@type': 'PostalAddress',
          addressRegion: spot.province,
          addressCountry: 'CN',
        },
        touristType: '文化爱好者',
      },
      ...(seoContent
        ? [
            {
              '@type': 'FAQPage',
              '@id': `${pageUrl}/#faq`,
              mainEntity: seoContent.faq.map((item) => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: item.answer,
                },
              })),
            },
          ]
        : []),
    ],
  };
}
