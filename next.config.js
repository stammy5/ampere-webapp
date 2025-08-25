/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration options for Next.js 14+
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has TypeScript errors (only for development)
    ignoreBuildErrors: false,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors (only for development)
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig