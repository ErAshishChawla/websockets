/* global process */
/** @type {import('next').NextConfig} */
const SERVER_URL = process.env.SERVER_URL ?? "http://localhost:8000";

const nextConfig = {
  // Proxy REST calls to the Express server so the browser stays same-origin
  // (no CORS setup needed). WebSockets connect directly to the server.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${SERVER_URL}/:path*` }];
  },
};

export default nextConfig;
