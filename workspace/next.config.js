/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // This configuration is added to solve the "Cross origin request" error
  // that causes the development server to disconnect in the preview tab.
  // It explicitly tells Next.js to trust requests coming from the 
  // Firebase Studio development environment.
  allowedDevOrigins: ['https://*.cloudworkstations.dev'],
};

module.exports = nextConfig;
