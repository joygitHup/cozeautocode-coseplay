import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/seo/json-ld';
import { SpotSeoContent } from '@/components/seo/spot-seo-content';
import { DressUpContent } from '@/components/dress-up/dress-up-content';
import { getScenicSpotById, scenicSpots } from '@/lib/data';
import { buildSpotJsonLd, buildSpotMetadata } from '@/lib/seo';

type PageProps = {
  params: Promise<{ spotId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { spotId } = await params;
  const spot = getScenicSpotById(spotId);
  if (!spot) {
    return {};
  }
  return buildSpotMetadata(spot);
}

export function generateStaticParams() {
  return scenicSpots.map((spot) => ({ spotId: spot.id }));
}

export default async function DressUpSpotPage({ params }: PageProps) {
  const { spotId } = await params;
  const spot = getScenicSpotById(spotId);
  if (!spot) {
    notFound();
  }

  return (
    <>
      <JsonLd data={buildSpotJsonLd(spot)} />
      <DressUpContent spotId={spotId} />
      <SpotSeoContent spot={spot} />
    </>
  );
}
