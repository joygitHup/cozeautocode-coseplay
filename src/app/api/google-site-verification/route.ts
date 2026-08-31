import { getGoogleSiteVerificationHtmlContent } from '@/lib/search-console';

export async function GET() {
  const content = getGoogleSiteVerificationHtmlContent();
  if (!content) {
    return new Response('Not configured', { status: 404 });
  }

  return new Response(content, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
