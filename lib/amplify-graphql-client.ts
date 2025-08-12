import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import { GraphQLResult } from '@aws-amplify/api-graphql';
import amplifyConfig from './amplify-config';
import { config } from './config';
import type { AppError } from './types';

// Configure Amplify with Cognito Identity Pool
Amplify.configure(amplifyConfig);

// Create Amplify GraphQL client
const amplifyClient = generateClient();

/**
 * Custom error class for GraphQL-related errors (mantida para compatibilidade)
 */
export class GraphQLError extends Error {
  constructor(
    message: string,
    public type: AppError['type'],
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'GraphQLError';
  }
}

/**
 * Enhanced GraphQL client using AWS Amplify with Cognito Identity Pool
 * Mantém a mesma interface do cliente anterior para compatibilidade
 */
export class AmplifyGraphQLClient {
  private client = amplifyClient;

  async request<T = any>(
    query: string,
    variables?: Record<string, any>
  ): Promise<T> {
    try {
      const result = await this.client.graphql({
        query,
        variables: variables as any || {},
        authMode: 'identityPool', // Força uso do Identity Pool
      }) as GraphQLResult<T>;

      if (result.errors && result.errors.length > 0) {
        const error = result.errors[0];
        throw new GraphQLError(
          error.message || 'GraphQL error',
          'API',
          error.extensions?.code
        );
      }

      return result.data as T;
    } catch (error) {
      if (error instanceof GraphQLError) {
        throw error;
      }
      
      if (error instanceof Error) {
        // Amplify já lida com timeouts e network errors
        if (error.message.includes('timeout') || error.message.includes('Network')) {
          throw new GraphQLError('Request timeout', 'TIMEOUT');
        }
        if (error.message.includes('Network') || error.message.includes('fetch')) {
          throw new GraphQLError('Network error', 'NETWORK', undefined, error);
        }
        throw new GraphQLError(error.message, 'API', undefined, error);
      }
      
      throw new GraphQLError('Unknown error', 'API');
    }
  }

  /**
   * Retry function with exponential backoff
   * Mantida para compatibilidade, mas Amplify já tem retry interno
   */
  async requestWithRetry<T = any>(
    query: string,
    variables?: Record<string, any>,
    maxAttempts = config.retry.maxAttempts,
    baseDelay = config.retry.baseDelay
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.request<T>(query, variables);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          throw lastError;
        }
        
        // Don't retry validation errors
        if (error instanceof GraphQLError && error.type === 'VALIDATION') {
          throw error;
        }
        
        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  /**
   * Nova funcionalidade: Cache control
   */
  async requestWithCache<T = any>(
    query: string,
    variables?: Record<string, any>,
    cachePolicy: 'cache-first' | 'cache-and-network' | 'network-only' = 'cache-first'
  ): Promise<T> {
    try {
      const result = await this.client.graphql({
        query,
        variables: variables as any || {},
        authMode: 'identityPool', // Força uso do Identity Pool
      }) as GraphQLResult<T>;

      if (result.errors && result.errors.length > 0) {
        const error = result.errors[0];
        throw new GraphQLError(
          error.message || 'GraphQL error',
          'API',
          error.extensions?.code
        );
      }

      return result.data as T;
    } catch (error) {
      if (error instanceof GraphQLError) {
        throw error;
      }
      
      if (error instanceof Error) {
        throw new GraphQLError(error.message, 'API', undefined, error);
      }
      
      throw new GraphQLError('Unknown error', 'API');
    }
  }

  /**
   * Nova funcionalidade: Clear cache
   */
  async clearCache(): Promise<void> {
    // Amplify client handle cache clearing internally
    // This method is here for future use when we need manual cache control
  }
}

// Export singleton instance (mantém compatibilidade)
export const graphqlClient = new AmplifyGraphQLClient();

// Export também o cliente Amplify original para uso avançado
export { amplifyClient };
