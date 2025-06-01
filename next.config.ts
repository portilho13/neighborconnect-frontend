import type { NextConfig } from "next";

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
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
// import type { NextConfig } from "next";

// const nextConfig = {
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: '158.220.93.168',
//         port: '80',
//         pathname: '/api/v1/uploads/listing/**',
//       },
//       {
//         protocol: 'https',
//         hostname: '158.220.93.168',
//         port: '80',
//         pathname: '/api/v1/uploads/events/**',
//       },
//       {
//         protocol: 'https',
//         hostname: '158.220.93.168',
//         port: '80',
//         pathname: '/api/v1/uploads/users/**',
//       },
//     ],
//   },
// };

// export default nextConfig;