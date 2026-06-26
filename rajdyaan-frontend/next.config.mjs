/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {                        // ← yeh add karo
    ignoreDuringBuilds: true,      // ← yeh add karo
  },                               // ← yeh add karo
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;