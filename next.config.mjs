/** @type {import('next').NextConfig} */
import pkg from './package.json' with { type: 'json' }

const nextConfig = {
  env: {
    VERSION: pkg.version
  }
}

export default nextConfig
