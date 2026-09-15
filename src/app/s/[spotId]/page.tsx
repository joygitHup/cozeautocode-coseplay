import { redirect } from 'next/navigation';
import { getScenicSpotById } from '@/lib/data';

type PageProps = {
  params: Promise<{ spotId: string }>;
};

/** 短链：/s/[spotId] → 搭配页，带分享来源 */
export default async function ScenicShortLinkPage({ params }: PageProps) {
  const { spotId } = await params;
  const spot = getScenicSpotById(spotId);
  if (!spot) {
    redirect('/');
  }
  redirect(`/dress-up/${spotId}?from=share`);
}
