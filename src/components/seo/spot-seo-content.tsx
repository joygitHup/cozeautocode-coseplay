'use client';

import Link from 'next/link';
import type { ScenicSpot } from '@/lib/types';
import { getScenicSpotSeoContent } from '@/lib/data/scenic-spot-seo-content';
import { scenicSpots } from '@/lib/data';
import {
  useI18n,
  localizeScenicSpot,
  localizeScenicSpots,
  getLocalizedSeoContent,
} from '@/lib/i18n';

type SpotSeoContentProps = {
  spot: ScenicSpot;
};

export function SpotSeoContent({ spot }: SpotSeoContentProps) {
  const { locale, t, format } = useI18n();
  const localizedSpot = localizeScenicSpot(spot, locale);
  const content = getLocalizedSeoContent(
    spot.id,
    locale,
    getScenicSpotSeoContent(spot.id),
  );
  if (!content) {
    return null;
  }

  const relatedSpots = localizeScenicSpots(
    scenicSpots.filter((item) => item.id !== spot.id).slice(0, 3),
    locale,
  );

  return (
    <section
      className="bg-white border-t border-yuebai/60"
      aria-labelledby={`${spot.id}-seo-heading`}
    >
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
        <header className="space-y-3">
          <p className="text-sm text-xiangse font-medium tracking-wide">
            {localizedSpot.province} · {localizedSpot.style}
          </p>
          <h2
            id={`${spot.id}-seo-heading`}
            className="font-serif text-2xl md:text-3xl text-daiqing"
          >
            {format(t.seo.guideTitle, { name: localizedSpot.name })}
          </h2>
          <p className="text-yanhui leading-relaxed">{content.intro}</p>
        </header>

        <article className="space-y-4">
          <h3 className="font-serif text-xl text-daiqing">{t.seo.styleGuide}</h3>
          <p className="text-yanhui leading-relaxed">{content.styleGuide}</p>
        </article>

        <article className="space-y-4">
          <h3 className="font-serif text-xl text-daiqing">{t.seo.outfitTips}</h3>
          <ul className="space-y-2 text-yanhui leading-relaxed list-disc pl-5">
            {content.outfitTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </article>

        <article className="space-y-4">
          <h3 className="font-serif text-xl text-daiqing">{t.seo.photoTips}</h3>
          <ul className="space-y-2 text-yanhui leading-relaxed list-disc pl-5">
            {content.photoTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </article>

        <article className="space-y-4">
          <h3 className="font-serif text-xl text-daiqing">{t.seo.faq}</h3>
          <dl className="space-y-4">
            {content.faq.map((item) => (
              <div key={item.question} className="rounded-xl bg-subai/80 p-4">
                <dt className="font-medium text-daiqing mb-2">
                  {item.question}
                </dt>
                <dd className="text-yanhui leading-relaxed">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </article>

        <nav aria-label={t.seo.relatedNavAria}>
          <h3 className="font-serif text-xl text-daiqing mb-4">
            {t.seo.exploreMore}
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 list-none p-0 m-0">
            {relatedSpots.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/dress-up/${item.id}`}
                  className="block rounded-xl border border-yuebai bg-subai/50 px-4 py-3 hover:border-xiangse/60 hover:bg-yuebai/40 transition-colors"
                >
                  <p className="font-medium text-daiqing">{item.name}</p>
                  <p className="text-sm text-yanhui mt-1">{item.style}</p>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
