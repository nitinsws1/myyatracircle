import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["192.168.1.2"],
  images: { remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }] },
  async redirects() {
    return [
      {
        source: "/custom-holidays",
        destination: "/customize-holiday",
        permanent: true,
      },
      {
        source: "/customized-holidays",
        destination: "/customize-holiday",
        permanent: true,
      },
      {
        source: "/contact-us",
        destination: "/contact",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
