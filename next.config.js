/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three'],
  webpack: (config) => {
    config.module.rules.push({
      test: /three[\/\\]examples[\/\\]jsm/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            presets: ['next/babel'],
          },
        },
      ],
    })

    config.resolve.alias = {
      ...config.resolve.alias,
      'three': require.resolve('three'),
    }

    config.resolve.extensions = ['.js', '.jsx', '.ts', '.tsx', '.json']

    return config
  },
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
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