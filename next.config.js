/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: [
      "billstacks.com",
      "zinoapartments.com",
      "devicegalaxy.com",
      "dev.topbuildersbest.com",
      "images.unsplash.com",
      "via.placeholder.com"
    ],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_PLATFORM_NAME: process.env.NEXT_PUBLIC_PLATFORM_NAME || "Zino One",
  },
};

module.exports = nextConfig;
