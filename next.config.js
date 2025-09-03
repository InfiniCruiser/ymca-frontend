/** @type {import('next').NextConfig} */
const nextConfig = {

  images: {
    domains: ['localhost', 's3.amazonaws.com', 's3.us-east-1.amazonaws.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://ymca-backend-c1a73b2f2522.herokuapp.com',
    NEXT_PUBLIC_APP_NAME: 'YMCA Self-Reporting Portal',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://ymca-backend-c1a73b2f2522.herokuapp.com/api/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
