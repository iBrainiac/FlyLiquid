/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Keep server-side packages out of the client bundle
  serverExternalPackages: ['pino', 'pino-pretty'],

  webpack: (config) => {
    // 2. Fix for standard Node.js modules missing in the browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      process: false,
    };

    // 3. THE CRITICAL FIX: Ignore React Native & WalletConnect optional deps
    // This stops the "Can't resolve @react-native-async-storage" error
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
      '@react-native-async-storage/async-storage': 'commonjs @react-native-async-storage/async-storage',
    });

    return config;
  },
};

export default nextConfig;