/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["monogate"],
  async redirects() {
    return [
      { source: "/search", destination: "/challenge/search", permanent: true },
      { source: "/leaderboard", destination: "/challenge/leaderboard", permanent: true },
      { source: "/theorems", destination: "https://monogate.org/theorems", permanent: false },
      { source: "/one-operator", destination: "https://monogate.org", permanent: false },
      { source: "/games", destination: "/lab", permanent: true },
      { source: "/play", destination: "/lab", permanent: true },
      { source: "/play/:path*", destination: "/lab/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
