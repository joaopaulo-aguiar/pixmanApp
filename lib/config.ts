// Configuration constants for the application
export const config = {
  aws: {
    // AWS Cognito Identity Pool (para autenticação anônima)
    identityPoolId: process.env.NEXT_PUBLIC_AWS_IDENTITY_POOL_ID!,
    region: 'sa-east-1',
  },
  api: {
    // GraphQL API (AppSync) - agora usa Cognito em vez de API Key
    graphqlUrl: process.env.NEXT_PUBLIC_GRAPHQL_API_URL!,
    graphqlApiId: process.env.NEXT_PUBLIC_GRAPHQL_API_ID!,
    // Payment API (REST)
    paymentUrl: process.env.NEXT_PUBLIC_PAYMENT_API_URL!,
  },
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Pixman',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },
  cdn: {
    cloudfront: {
      baseUrl: process.env.NEXT_PUBLIC_CLOUDFRONT_BASE_URL!,
      images: {
        cover: (slug: string) => `${process.env.NEXT_PUBLIC_CLOUDFRONT_BASE_URL}/cover_${slug}.jpg`,
        logo: (slug: string) => `${process.env.NEXT_PUBLIC_CLOUDFRONT_BASE_URL}/logo_${slug}.jpg`,
      }
    }
  },
  timeouts: {
    api: 10000, // 10 seconds
    payment: 30000, // 30 seconds
  },
  retry: {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
  },
  cache: {
    // TTL padrão para cache de queries GraphQL (em ms)
    graphqlTTL: 30000, // 30s – ajuste conforme necessidade
    enabled: true,
  },
} as const;

export default config;
