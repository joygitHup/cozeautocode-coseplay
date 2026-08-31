import { redirect } from 'next/navigation';

type PageProps = {
  searchParams: Promise<{ spot?: string }>;
};

export default async function DressUpLegacyPage({ searchParams }: PageProps) {
  const { spot } = await searchParams;
  redirect(`/dress-up/${spot || 'forbidden-city'}`);
}
