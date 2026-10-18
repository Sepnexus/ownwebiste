import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      // There is no public pricing page any more; plans are described on Hosting.
      { source: "/pricing", destination: "/hosting#plans", permanent: false },
      // Short legal URLs → the shared legal pages.
      { source: "/privacy", destination: "/legal/privacy", permanent: true },
      { source: "/terms", destination: "/legal/terms", permanent: true },
      { source: "/security", destination: "/legal/security", permanent: true },
      { source: "/dpa", destination: "/legal/dpa", permanent: true },
      { source: "/work", destination: "/portfolio", permanent: true },
    ];
  },
};

export default nextConfig;
