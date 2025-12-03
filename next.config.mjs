import nextra from 'nextra'

const withNextra = nextra({
  contentDirBasePath: '/docs',
  mdxOptions: {
    rehypePlugins: [],
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    instrumentationHook: true,
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'vchatlife.s3.us-east-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'zenithsas.s3.us-east-2.amazonaws.com',
      },
    ],
  },
}

export default withNextra(nextConfig)
