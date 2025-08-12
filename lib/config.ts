// Configuration constants for the application
export const config = {
  aws: {
    // AWS Cognito Identity Pool (para autenticação anônima)
    identityPoolId: process.env.NEXT_PUBLIC_AWS_IDENTITY_POOL_ID || 'sa-east-1:172a31b0-a1a0-44d1-94ee-6d16b1666898',
    region: 'sa-east-1',
  },
  api: {
    // GraphQL API (AppSync) - agora usa Cognito em vez de API Key
    graphqlUrl: process.env.NEXT_PUBLIC_GRAPHQL_API_URL || '',
    // Payment API (REST - ainda não migrado)
    paymentUrl: process.env.NEXT_PUBLIC_PAYMENT_API_URL || 'https://vrdyhhd33zkot366iwnapknwbu0jmbqf.lambda-url.sa-east-1.on.aws/',
  },
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Tevora Link',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },
  cdn: {
    cloudfront: {
      baseUrl: 'https://d1ha8p5njs0erj.cloudfront.net',
      images: {
        cover: (slug: string) => `https://d1ha8p5njs0erj.cloudfront.net/cover_${slug}.jpg`,
        logo: (slug: string) => `https://d1ha8p5njs0erj.cloudfront.net/logo_${slug}.jpg`,
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
} as const;

export default config;
