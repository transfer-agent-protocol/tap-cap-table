/**
 * @type {import('next').NextConfig}
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8293';

const nextConfig = {
    reactStrictMode: true,
    compiler: {
        styledComponents: true,
    },
    turbopack: {},
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${API_URL}/:path*`,
            },
        ];
    },
    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
        };
        // Stub out optional peer dependencies from @wagmi/connectors
        config.externals = [
            ...(Array.isArray(config.externals) ? config.externals : config.externals ? [config.externals] : []),
            '@react-native-async-storage/async-storage',
        ];
        return config;
    },
};

module.exports = nextConfig;
