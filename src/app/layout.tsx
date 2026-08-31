import { Inspector } from 'react-dev-inspector';
import { I18nProvider } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/i18n/language-switcher';
import { buildRootMetadata } from '@/lib/search-console';
import './globals.css';

export const metadata = buildRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`antialiased`}>
        <I18nProvider>
          {isDev && <Inspector />}
          <LanguageSwitcher />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
