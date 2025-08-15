import { config } from './config';
import { graphqlClient, GraphQLError } from './amplify-graphql-client';
import {
  GET_MERCHANT,
  LIST_REWARD_PROGRAMS,
  GET_USER,
  CREATE_USER,
  LIST_USER_COUPONS,
  ACTIVATE_COUPON,
  GET_PIX_PAYMENT_STATUS,
  type PixPaymentStatusResponse,
  type ListUserCouponsInput,
  type CreateUserInput,
  type ActivateCouponInput,
  type ActivateCouponResponse
} from './graphql';
import type { 
  ApiResponse, 
  CouponsApiResponse,
  DynamoDBCouponsResponse,
  Merchant, 
  User, 
  Coupon, 
  Reward, 
  PaymentData, 
  PaymentRequest,
  AppError 
} from './types';

/**
 * Custom error class for API-related errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public type: AppError['type'],
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Merchant API service (GraphQL with Amplify)
 */
export const merchantService = {
  /**
   * Get merchant by slug
   */
  async getMerchant(slug: string): Promise<Merchant> {
    try {
      const result = await graphqlClient.requestWithRetry(GET_MERCHANT, { slug });
      
      if (!result.getMerchant) {
        throw new ApiError('Merchant not found', 'API', '404');
      }
      
      return result.getMerchant;
    } catch (error) {
      if (error instanceof GraphQLError) {
        throw new ApiError(error.message, error.type, error.code, error.details);
      }
      throw error;
    }
  },

  /**
   * Get merchant by slug with cache (Nova funcionalidade)
   */
  async getMerchantCached(slug: string): Promise<Merchant> {
    try {
      const result = await graphqlClient.requestWithCache(GET_MERCHANT, { slug }, 'cache-first');
      
      if (!result.getMerchant) {
        throw new ApiError('Merchant not found', 'API', '404');
      }
      
      return result.getMerchant;
    } catch (error) {
      if (error instanceof GraphQLError) {
        throw new ApiError(error.message, error.type, error.code, error.details);
      }
      throw error;
    }
  },

  /**
   * Get reward programs for merchant
   */
  async getRewardPrograms(slug: string): Promise<Reward[]> {
    try {
      const result = await graphqlClient.requestWithRetry(LIST_REWARD_PROGRAMS, { slug });
      
      return result.listRewardPrograms || [];
    } catch (error) {
      if (error instanceof GraphQLError) {
        throw new ApiError(error.message, error.type, error.code, error.details);
      }
      throw error;
    }
  },

  /**
   * Get reward programs with cache (Nova funcionalidade)
   */
  async getRewardProgramsCached(slug: string): Promise<Reward[]> {
    try {
      const result = await graphqlClient.requestWithCache(LIST_REWARD_PROGRAMS, { slug }, 'cache-first');
      
      return result.listRewardPrograms || [];
    } catch (error) {
      if (error instanceof GraphQLError) {
        throw new ApiError(error.message, error.type, error.code, error.details);
      }
      throw error;
    }
  },
};

/**
 * User API service (GraphQL)
 */
export const userService = {
  /**
   * Get user by CPF
   */
  async getUserByCPF(cpf: string): Promise<User | null> {
    try {
      const result = await graphqlClient.requestWithRetry(GET_USER, { cpf });
      
      return result.getUser || null;
    } catch (error) {
      if (error instanceof GraphQLError) {
        throw new ApiError(error.message, error.type, error.code, error.details);
      }
      throw error;
    }
  },

  /**
   * Create new user
   */
  async createUser(cpf: string, email: string): Promise<User> {
    try {
      const result = await graphqlClient.requestWithRetry(CREATE_USER, { 
        input: { cpf, email } 
      });
      
      if (!result.createUser) {
        throw new ApiError('Failed to create user', 'API', '500');
      }
      
      return result.createUser;
    } catch (error) {
      if (error instanceof GraphQLError) {
        throw new ApiError(error.message, error.type, error.code, error.details);
      }
      throw error;
    }
  },

  /**
   * Get user coupons for specific merchant with multiple statuses
   */
  async getUserCoupons(cpf: string, merchantSlug: string): Promise<Coupon[]> {
    try {
      const result = await graphqlClient.requestWithRetry(LIST_USER_COUPONS, { 
        cpf, 
        slug: merchantSlug,
        statuses: ['ACTIVE', 'AVAILABLE']
      });
      
      const coupons = result.listUserCoupons || [];

      // Sort coupons: ACTIVE first, then AVAILABLE
      return coupons.sort((a: Coupon, b: Coupon) => {
        if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
        if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
        if (a.status === 'AVAILABLE' && b.status !== 'AVAILABLE' && b.status !== 'ACTIVE') return -1;
        if (a.status !== 'AVAILABLE' && b.status === 'AVAILABLE' && a.status !== 'ACTIVE') return 1;
        
        // If same status, sort by creation date (newest first)
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    } catch (error) {
      if (error instanceof GraphQLError) {
        throw new ApiError(error.message, error.type, error.code, error.details);
      }
      throw error;
    }
  },

  /**
   * Activate a coupon (change status from AVAILABLE to ACTIVE)
   */
  async activateCoupon(cpf: string, merchantSlug: string, SK: string): Promise<boolean> {
    try {
      const result = await graphqlClient.requestWithRetry(ACTIVATE_COUPON, {
        input: {
          slug: merchantSlug,
          SK,
          cpf
        }
      });
      
      return result.activateCoupon?.success || false;
    } catch (error) {
      if (error instanceof GraphQLError) {
        throw new ApiError(error.message, error.type, error.code, error.details);
      }
      throw error;
    }
  },
};

/**
 * Payment API service (REST - mantido por enquanto)
 */
export const paymentService = {
  /**
   * Create payment for reward
   */
  async createPayment(paymentData: PaymentRequest): Promise<PaymentData> {
    const timeoutMs = config.timeouts.payment;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(config.api.paymentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(
          `Payment API error! status: ${response.status}`,
          'API',
          response.status.toString()
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Payment request timeout', 'TIMEOUT');
        }
        throw new ApiError('Payment network error', 'NETWORK', undefined, error);
      }
      
      throw new ApiError('Payment unknown error', 'API');
    }
  },
  /**
   * Check PIX payment status by txid (GraphQL)
   */
  async getPixPaymentStatus(txid: string): Promise<PixPaymentStatusResponse['getPixPaymentStatus']> {
    try {
      const result = await graphqlClient.requestWithRetry<PixPaymentStatusResponse>(GET_PIX_PAYMENT_STATUS, { txid });
      if (!result.getPixPaymentStatus) {
        throw new ApiError('Payment status not found', 'API', '404');
      }
      return result.getPixPaymentStatus;
    } catch (error) {
      if (error instanceof GraphQLError) {
        throw new ApiError(error.message, error.type, error.code, error.details);
      }
      throw error;
    }
  },
};
