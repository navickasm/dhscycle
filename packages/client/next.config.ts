import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'export',
    distDir: 'dist',
    basePath: "/dhscycle",
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
