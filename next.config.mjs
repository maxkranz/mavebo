/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Оптимизация изображений
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    // Используем remotePatterns вместо domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
    dangerouslyAllowSVG: true,
  },
  
  // Сжатие
  compress: true,
  
  // Оптимизация сборки
  reactStrictMode: true,
  
  // Удаление консольных логов в продакшене
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Экспериментальные фичи (без устаревших)
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
    ],
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  
  // Настройки вывода
  output: 'standalone',
  
  // Безопасность
  poweredByHeader: false,
  
  // HTTP keep-alive
  httpAgentOptions: {
    keepAlive: true,
  },
}

// Убираем webpack конфигурацию (Turbopack не поддерживает webpack)
// Если нужны дополнительные оптимизации, используем turbopack

export default nextConfig
