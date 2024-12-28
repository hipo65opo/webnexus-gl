/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'three': require.resolve('three')
    }
    return config
  },
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig 