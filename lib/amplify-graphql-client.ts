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
  // Cache simples em memória (por aba). Não persiste entre reloads.
  private cache = new Map<string, { data: any; expiry: number }>();

  private buildCacheKey(query: string, variables?: Record<string, any>) {
    const trimmed = query.replace(/\s+/g, ' ').trim();
    // Ordena chaves para consistência
    const stableVars = variables ? JSON.stringify(this.sortObject(variables)) : '{}';
    return `${trimmed}::${stableVars}`;
  }

  private sortObject(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(v => this.sortObject(v));
    return Object.keys(obj).sort().reduce((acc, k) => { acc[k] = this.sortObject(obj[k]); return acc; }, {} as any);
  }

  private isMutation(query: string) {
    const trimmed = query.trim().toLowerCase();
    return trimmed.startsWith('mutation');
  }

  // Apenas queries específicas devem ser cacheadas (merchant e reward programs)
  private isCacheableQuery(query: string) {
    const normalized = query.replace(/\s+/g,' ').toLowerCase();
    return normalized.includes('query getmerchant(') || normalized.includes('query listrewardprograms(');
  }

  private getFromCache<T>(key: string): T | undefined {
    if (!config.cache.enabled) return undefined;
    const hit = this.cache.get(key);
    if (!hit) return undefined;
    if (Date.now() > hit.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    return hit.data as T;
  }

  private setCache(key: string, data: any) {
    if (!config.cache.enabled) return;
    const ttl = config.cache.graphqlTTL;
    this.cache.set(key, { data, expiry: Date.now() + ttl });
  }

  private clearAllCache() {
    if (this.cache.size) this.cache.clear();
  }

  async request<T = any>(
    query: string,
    variables?: Record<string, any>
  ): Promise<T> {
    try {
  const isMutation = this.isMutation(query);
  const cacheable = !isMutation && this.isCacheableQuery(query);
  const cacheKey = cacheable ? this.buildCacheKey(query, variables) : undefined;
  if (cacheable && cacheKey) {
        const cached = this.getFromCache<T>(cacheKey);
        if (cached) {
          console.log('🟠 GraphQL cache hit');
          return cached;
        }
      }
      // Try different auth modes for debugging
      console.log('🔐 Attempting GraphQL request with identityPool auth...');
      
      const result = await this.client.graphql({
        query,
        variables: variables as any || {},
        authMode: 'identityPool', // Força uso do Identity Pool
      }) as GraphQLResult<T>;

      if (result.errors && result.errors.length > 0) {
        const error = result.errors[0];
        console.error('GraphQL Error:', error);
        throw new GraphQLError(
          error.message || 'GraphQL error',
          'API',
          error.extensions?.code
        );
      }

      console.log('✅ GraphQL request successful');
      const data = result.data as T;
  if (cacheable && cacheKey) {
        this.setCache(cacheKey, data);
      } else if (isMutation) {
        // Estratégia simples: limpa todo cache ao executar mutation para evitar dados obsoletos
        this.clearAllCache();
      }
      return data;
    } catch (error) {
      console.error('🚨 GraphQL request failed:', error);
      
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
        if (error.message.includes('Unauthorized') || error.message.includes('401')) {
          throw new GraphQLError('Authentication failed - check Cognito Identity Pool permissions', 'UNAUTHORIZED', undefined, error);
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
    // Implementa políticas simples sobre o método base com cache nativo acima
    const isMutation = this.isMutation(query);
    const cacheable = !isMutation && this.isCacheableQuery(query);
    if (!cacheable) {
      // Força comportamento network-only para queries não cacheáveis
      return this.request<T>(query, variables);
    }
    const key = this.buildCacheKey(query, variables);
    if (cachePolicy !== 'network-only') {
      const cached = this.getFromCache<T>(key);
      if (cached) {
        if (cachePolicy === 'cache-first') return cached;
        if (cachePolicy === 'cache-and-network') {
          this.request<T>(query, variables).catch(()=>{});
          return cached;
        }
      }
    }
    return this.request<T>(query, variables);
  }

  /**
   * Nova funcionalidade: Clear cache
   */
  async clearCache(): Promise<void> {
  this.clearAllCache();
  }
}

// Export singleton instance (mantém compatibilidade)
export const graphqlClient = new AmplifyGraphQLClient();

// Export também o cliente Amplify original para uso avançado
export { amplifyClient };
