import type { NextConfig } from 'next';

/**
 * Configuração do front-end (Next.js App Router) do KaukaMed.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Origens liberadas para acesso em desenvolvimento (containers e previews remotos).
  allowedDevOrigins: ['*.e2b.app', 'localhost', '127.0.0.1'],
};

export default nextConfig;
