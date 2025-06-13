/** @type {import('next').NextConfig} */
const nextConfig = {
    // For static export in packaged apps
    output: "standalone",
    trailingSlash: true,

    // Disable image optimization for static export
    images: {
        unoptimized: true,
    },

    // Disable SWC minification if causing issues
    swcMinify: false,

    // Configure for static export
    assetPrefix: "",

    // Webpack configuration for Electron
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                crypto: false,
                stream: false,
                url: false,
                zlib: false,
                http: false,
                https: false,
                assert: false,
                os: false,
                path: false,
            };
        }

        return config;
    },
};

export default nextConfig;
