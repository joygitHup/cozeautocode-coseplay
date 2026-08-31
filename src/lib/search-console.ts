import type { Metadata } from 'next';
import { defaultMetadata, getSiteUrl, OG_IMAGE } from '@/lib/seo';

function buildVerificationMetadata(): Metadata['verification'] {
  const verification: NonNullable<Metadata['verification']> = {};

  if (process.env.GOOGLE_SITE_VERIFICATION) {
    verification.google = process.env.GOOGLE_SITE_VERIFICATION;
  }

  if (process.env.BING_SITE_VERIFICATION) {
    verification.other = {
      ...(verification.other ?? {}),
      'msvalidate.01': process.env.BING_SITE_VERIFICATION,
    };
  }

  return Object.keys(verification).length > 0 ? verification : undefined;
}

export function buildRootMetadata(): Metadata {
  const verification = buildVerificationMetadata();

  return {
    ...defaultMetadata,
    openGraph: {
      ...defaultMetadata.openGraph,
      images: [OG_IMAGE],
    },
    twitter: {
      ...defaultMetadata.twitter,
      images: [OG_IMAGE.url],
    },
    ...(verification ? { verification } : {}),
  };
}

export function getGoogleSiteVerificationHtmlContent(): string | undefined {
  const filename = process.env.GOOGLE_SITE_VERIFICATION_HTML;
  if (!filename) {
    return undefined;
  }
  const normalized = filename.replace(/^\//, '');
  return `google-site-verification: ${normalized}`;
}

export function getSearchConsoleSitemapUrl(): string {
  return `${getSiteUrl()}/sitemap.xml`;
}
