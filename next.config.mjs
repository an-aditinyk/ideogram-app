/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Ideogram serves generated images from its CDN. Allow remote loading so
    // next/image can render them. URLs are ephemeral, so we mostly persist
    // them to local history and download promptly.
    remotePatterns: [
      { protocol: "https", hostname: "ideogram.ai" },
      { protocol: "https", hostname: "*.ideogram.ai" },
      { protocol: "https", hostname: "*.amazonaws.com" },
    ],
  },
};

export default nextConfig;
