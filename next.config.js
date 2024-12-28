/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three'],
  webpack: (config) => {
    // Three.jsのモジュール解決を設定
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        'three': require.resolve('three')
      },
      fallback: {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false
      }
    }

    // JSMモジュールの処理を設定
    config.module.rules.push({
      test: /three[\/\\]examples[\/\\]jsm/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel']
        }
      }
    })

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