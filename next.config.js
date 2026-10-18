/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: process.env.GITHUB_ACTIONS === 'true' ? '/Retail_Tracker' : '',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
