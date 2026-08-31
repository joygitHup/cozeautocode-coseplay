'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';
import { scenicSpots } from '@/lib/data';
import { useCustomScenicSpots, useMergedData } from '@/hooks/use-custom-data';
import { localizeScenicSpots, useI18n } from '@/lib/i18n';

export function HomePage() {
  const { locale, t, format } = useI18n();
  const { customSpots, isLoaded } = useCustomScenicSpots();
  const allSpots = localizeScenicSpots(
    useMergedData(scenicSpots, customSpots, isLoaded),
    locale,
  );

  return (
    <>
      <Link
        href="/manage"
        className="fixed bottom-6 right-6 z-50 p-4 bg-[#4A5859] text-white rounded-full shadow-lg hover:bg-[#3A4849] transition-all hover:scale-110"
        title={t.home.manageTitle}
        aria-label={t.home.manageAria}
      >
        <Settings className="w-6 h-6" aria-hidden="true" />
      </Link>

      <main className="min-h-screen bg-subai">
        <section
          className="relative h-[60vh] overflow-hidden"
          aria-labelledby="hero-heading"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-daiqing/80 to-daiqing/40 z-10" />
          <div
            className="absolute inset-0 bg-cover bg-center"
            role="img"
            aria-label={t.home.heroAria}
            style={{
              backgroundImage:
                'url(https://picsum.photos/seed/hero-bg/1600/900)',
            }}
          />
          <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-4">
            <h1
              id="hero-heading"
              className="font-serif text-5xl md:text-7xl text-white mb-6 tracking-wider"
            >
              {t.common.brand}
            </h1>
            <p className="font-serif text-xl md:text-2xl text-yuebai/90 mb-8 max-w-2xl">
              {t.home.heroTagline}
            </p>
            <p className="text-yuebai/70 text-lg max-w-xl">
              {t.home.heroSubtitle}
            </p>
            <div className="mt-12 animate-bounce" aria-hidden="true">
              <svg
                className="w-8 h-8 text-yuebai/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>
        </section>

        <section
          className="max-w-7xl mx-auto px-4 py-16"
          aria-labelledby="spots-heading"
        >
          <div className="text-center mb-12">
            <h2
              id="spots-heading"
              className="font-serif text-3xl md:text-4xl text-daiqing mb-4"
            >
              {t.home.spotsHeading}
            </h2>
            <p className="text-yanhui text-lg">{t.home.spotsSubtitle}</p>
          </div>

          <nav aria-label={t.home.spotsNavAria}>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 list-none p-0 m-0">
              {allSpots.map((spot) => (
                <li key={spot.id}>
                  <Link
                    href={`/dress-up/${spot.id}`}
                    className="group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-500 block"
                    aria-label={format(t.home.spotAria, {
                      name: spot.name,
                      style: spot.style,
                    })}
                  >
                    <div className="aspect-[4/5] overflow-hidden">
                      <div
                        className="w-full h-full bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
                        role="img"
                        aria-label={format(t.home.spotImageAria, {
                          province: spot.province,
                          name: spot.name,
                        })}
                        style={{ backgroundImage: `url(${spot.image})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-daiqing/80 via-daiqing/20 to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-yuebai/80 bg-daiqing/40 px-2 py-1 rounded-full backdrop-blur-sm">
                          {spot.province}
                        </span>
                        <span className="text-xs text-xiangse bg-daiqing/40 px-2 py-1 rounded-full backdrop-blur-sm">
                          {spot.style}
                        </span>
                      </div>
                      <h3 className="font-serif text-2xl text-white mb-2">
                        {spot.name}
                      </h3>
                      <p className="text-yuebai/80 text-sm line-clamp-2">
                        {spot.description}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </section>

        <section
          className="bg-white py-16"
          aria-labelledby="features-heading"
        >
          <div className="max-w-5xl mx-auto px-4">
            <h2
              id="features-heading"
              className="font-serif text-3xl text-daiqing text-center mb-12"
            >
              {t.home.howHeading}
            </h2>
            <ol className="grid grid-cols-1 md:grid-cols-3 gap-8 list-none p-0 m-0">
              <li className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yuebai flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-daiqing"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-daiqing mb-2">
                  {t.home.step1Title}
                </h3>
                <p className="text-yanhui">{t.home.step1Desc}</p>
              </li>
              <li className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ouhe/30 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-daiqing"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-daiqing mb-2">
                  {t.home.step2Title}
                </h3>
                <p className="text-yanhui">{t.home.step2Desc}</p>
              </li>
              <li className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-xiangse/30 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-daiqing"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-daiqing mb-2">
                  {t.home.step3Title}
                </h3>
                <p className="text-yanhui">{t.home.step3Desc}</p>
              </li>
            </ol>
          </div>
        </section>

        <footer className="bg-daiqing text-yuebai/70 py-8">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <p className="font-serif text-lg mb-2">{t.common.brand}</p>
            <p className="text-sm">{t.home.footerTagline}</p>
          </div>
        </footer>
      </main>
    </>
  );
}
