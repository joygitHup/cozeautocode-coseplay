import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '自定义管理 | Custom Manager',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ManageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
