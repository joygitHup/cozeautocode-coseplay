'use client';

import Link from 'next/link';
import { scenicSpots } from '@/lib/data';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-subai">
      {/* Hero Section */}
      <section className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-daiqing/80 to-daiqing/40 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://picsum.photos/seed/hero-bg/1600/900)',
          }}
        />
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="font-serif text-5xl md:text-7xl text-white mb-6 tracking-wider">
            华裳纪
          </h1>
          <p className="font-serif text-xl md:text-2xl text-yuebai/90 mb-8 max-w-2xl">
            穿越千年的美学之旅
          </p>
          <p className="text-yuebai/70 text-lg max-w-xl">
            在全国各大景区，寻找属于你的古装风格
          </p>
          <div className="mt-12 animate-bounce">
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

      {/* Scenic Spots Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl text-daiqing mb-4">
            选择你的景区
          </h2>
          <p className="text-yanhui text-lg">
            每个景区都有独特的气质，等待与你相遇
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {scenicSpots.map((spot) => (
            <Link
              key={spot.id}
              href={`/dress-up?spot=${spot.id}`}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
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
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-serif text-3xl text-daiqing text-center mb-12">
            如何开始
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yuebai flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-daiqing"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
                选择景区
              </h3>
              <p className="text-yanhui">
                从全国八大经典景区中选择你想体验的场景
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ouhe/30 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-daiqing"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-xl text-daiqing mb-2">
                搭配装扮
              </h3>
              <p className="text-yanhui">
                选择服饰、首饰、头饰和妆容，打造专属造型
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-xiangse/30 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-daiqing"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
                保存分享
              </h3>
              <p className="text-yanhui">
                AI 生成古装效果图，保存你的专属记忆
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-daiqing text-yuebai/70 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="font-serif text-lg mb-2">华裳纪</p>
          <p className="text-sm">穿越千年的美学之旅</p>
        </div>
      </footer>
    </main>
  );
}
