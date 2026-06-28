/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'https://rajdyaan-backend.onrender.com/api/v1/:path*'
          : 'http://localhost:5000/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;