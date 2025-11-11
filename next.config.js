/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
    };

    config.plugins = [
      ...config.plugins,
      new (require('webpack').ProvidePlugin)({
        Buffer: ['buffer', 'Buffer'],
      }),
    ];

    return config;
  },
};

module.exports = nextConfig;