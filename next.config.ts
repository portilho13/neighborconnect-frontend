import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '1234',
        pathname: '/api/v1/uploads/listing/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '1234',
        pathname: '/api/v1/uploads/events/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '1234',
        pathname: '/api/v1/uploads/users/**',
      },
    ],
  },
};

export default nextConfig;
