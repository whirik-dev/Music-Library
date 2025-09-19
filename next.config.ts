import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [process.env.NEXT_PUBLIC_ASSET_SERVER || 'asset.probgm.com'],
  },
  reactStrictMode: false
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
