/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdf-parse wraps pdf.js and must run in the Node.js runtime, not bundled
  serverExternalPackages: ['pdf-parse'],
}

module.exports = nextConfig
