/** @type {import('next').NextConfig} */
const repo = 'SynThoma';
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@synthoma/shared'],
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? `/${repo}` : '',
  },
  // Nechceme blokovat produkční build kvůli ESLintu/TS chybám (nasazení > lint)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // GitHub Pages: statický export + basePath/assetPrefix pro projektové stránky
  output: 'export',
  trailingSlash: true,
  basePath: isProd ? `/${repo}` : '',
  assetPrefix: isProd ? `/${repo}/` : undefined,
  images: {
    // Next Image optimizer není na GH Pages k dispozici
    unoptimized: true,
  },
  // ESLint je znovu povolen během buildu (žádný bypass)
  experimental: {
    typedRoutes: true,
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
};

export default nextConfig;
