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
    ],
  },
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: "bottom-right",
  },
};

module.exports = nextConfig;
