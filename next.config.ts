import type { NextConfig } from 'next';

function getGoogleVerificationRewrites() {
  const filename = process.env.GOOGLE_SITE_VERIFICATION_HTML;
  if (!filename) {
    return [];
  }

  const path = filename.replace(/^\//, '');
  return [
    {
      source: `/${path}`,
      destination: '/api/google-site-verification',
    },
  ];
}

const nextConfig: NextConfig = {
  // outputFileTracingRoot: path.resolve(__dirname, '../../'),  // Uncomment and add 'import path from "path"' if needed
  /* config options here */
  allowedDevOrigins: ['*.dev.coze.site'],
  // 微信支付 V3 SDK 依赖 superagent/formidable，动态 import 与 turbopack 不兼容，故外置
  serverExternalPackages: ['wechatpay-node-v3', 'superagent', 'formidable'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return getGoogleVerificationRewrites();
  },
};

export default nextConfig;
