/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mysql2']
  },
  env: {
    TIDB_HOST: process.env.TIDB_HOST,
    TIDB_PORT: process.env.TIDB_PORT,
    TIDB_USER: process.env.TIDB_USER,
    TIDB_PASSWORD: process.env.TIDB_PASSWORD,
    TIDB_DATABASE: process.env.TIDB_DATABASE,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
  },
  images: {
    domains: [],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
  staticPageGenerationTimeout: 120,
  output: 'standalone'
}

module.exports = nextConfig