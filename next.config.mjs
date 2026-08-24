import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disables the 'X-Powered-By: Next.js' header
  poweredByHeader: false,
  // Disables Next.js build/dev indicators
  devIndicators: false,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  images: {
    unoptimized: true,
  },
  outputFileTracingRoot: __dirname,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
      };
    }
    return config;
  },
  async redirects() {
    return [
      {
        source: '/tools/:slug',
        destination: '/:slug',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/:category(image|pdf|qr|text|calculators|developer|converters|utilities)/:slug',
        destination: '/:slug',
      },
    ];
  },
};

export default nextConfig;
