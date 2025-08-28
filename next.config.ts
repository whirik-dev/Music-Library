import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    images: {
        domains: ['asset.changhyun.me'],
    },
    reactStrictMode: false,
    
    experimental: {
        turbo: {
            rules: {
                '*.css': {
                    loaders: ['@tailwindcss/postcss'],
                },
            },
        },
    },
};

export default nextConfig;
