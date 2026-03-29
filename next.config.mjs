/** @type {import('next').NextConfig} */
const nextConfig = {
  // Типы игнорируем для скорости сборки
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Оптимизация изображений
  images: {
    // Включаем оптимизацию (не отключаем!)
    unoptimized: false,
    // Форматы нового поколения
    formats: ['image/avif', 'image/webp'],
    // Размеры для разных экранов
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Минимальная загрузка
    minimumCacheTTL: 60,
    // Домены для загрузки
    domains: [
      'startorigin.me',
      'kyspuuxmoeddzuvvculx.supabase.co',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
    // Кэширование изображений
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Сжатие
  compress: true,
  
  // Минификация
  swcMinify: true,
  
  // Оптимизация сборки
  reactStrictMode: true,
  
  // Удаление консольных логов в продакшене
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Экспериментальные фичи для производительности
  experimental: {
    // Оптимизация CSS
    optimizeCss: true,
    // Оптимизация пакетов
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
    ],
    // Предзагрузка данных
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
    // Турбопак для скорости
    turbo: {
      resolveAlias: {
        // Алиасы для быстрого резолвинга
      },
    },
  },
  
  // Настройки вебпака для оптимизации
  webpack: (config, { isServer }) => {
    // Оптимизация размера чанков
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 100000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          // Отдельная группа для lucide-react
          lucide: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'lucide',
            chunks: 'all',
          },
          // Отдельная группа для UI компонентов
          ui: {
            test: /[\\/]components[\\/]ui[\\/]/,
            name: 'ui',
            chunks: 'all',
          },
        },
      },
    }
    
    // Кэширование вебпака
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    }
    
    return config
  },
  
  // Заголовки для кэширования
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/:path*.jpg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*.webp',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  
  // Настройки вывода
  output: 'standalone',
  
  // Мониторинг производительности
  productionBrowserSourceMaps: false,
  
  // Мощность сборки
  poweredByHeader: false,
  
  // HTTP/2 push
  httpAgentOptions: {
    keepAlive: true,
  },
}

export default nextConfig
