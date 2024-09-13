/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["https://cloud.appwrite.io"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
