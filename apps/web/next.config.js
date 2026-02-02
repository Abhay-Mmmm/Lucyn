/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@lucyn/ai', '@lucyn/database', '@lucyn/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;
