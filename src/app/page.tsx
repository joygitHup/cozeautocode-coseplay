import { HomePage } from '@/components/home/home-page';
import { JsonLd } from '@/components/seo/json-ld';
import { buildWebsiteJsonLd } from '@/lib/seo';

export default function Page() {
  return (
    <>
      <JsonLd data={buildWebsiteJsonLd()} />
      <HomePage />
    </>
  );
}
