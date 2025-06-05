/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "static.cx.metamask.io",
      "placehold.co",
      "assets.coingecko.com",
      "tokens.pancakeswap.finance",
      "cdn.moralis.io",
      "logo.moralis.io",
      "imageplaceholder.net",
      "raw.githubusercontent.com",
      "lcw.nyc3.cdn.digitaloceanspaces.com",
      "stellar.myfilebase.com",
      "s3.ap-southeast-1.amazonaws.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.ap-southeast-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
    unoptimized: process.env.NODE_ENV === "production",
  },
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: "bottom-right",
  },
};

module.exports = nextConfig;
