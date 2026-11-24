import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Self-contained server for Docker: node .next/standalone/server.js
	output: "standalone",
	turbopack: {
		root: process.cwd(),
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "flagcdn.com",
				pathname: "/**",
			},
		],
	},
};

export default nextConfig;
