// Core application types and interfaces

export interface Merchant {
  slug: string;
  displayName: string;
  status?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt?: string;
  // Legacy fields for backward compatibility
  id?: string;
  name?: string;
  description?: string;
  logo?: string;
  logoImage?: string; // Deprecated but kept for compatibility
  coverImage?: string; // Deprecated but kept for compatibility
  legalName?: string; // Deprecated but kept for compatibility
  contactEmail?: string; // Deprecated but kept for compatibility
  colors?: {
    primary: string;
    secondary: string;
  };
  updatedAt?: string;
}

export interface User {
  cpf: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Coupon {
  SK: string;
  couponCode: string;
  status: 'AVAILABLE' | 'ACTIVE' | 'EXPIRED' | 'REDEEMED' | 'USED' | 'CANCELLED';
  expires: string;
  createdAt?: string;
  activatedAt?: string;
  redeemedAt?: string;
  // Legacy/optional fields for backward compatibility
  PK?: string;
  GSI1PK?: string;
  GSI1SK?: string;
  rewardId?: string;
  expirationDate?: string;
  qrCodeUrl?: string;
  verificationCode?: string;
  activationDate?: string;
  redemptionDate?: string;
  updatedAt?: string;
  reward?: string | Reward; // Can be a string or Reward object
  programRule?: string;
}

export interface Reward {
  SK: string;
  programName: string;
  programRule: string;
  quantity: string;
  reward: string;
  price: string | number; // Allow both string and number
  // New fields for GraphQL compatibility
  id?: string;
  title?: string;
  description?: string;
  discount?: number;
  originalPrice?: number;
  savings?: number;
  imageUrl?: string;
  isActive?: boolean;
  merchantSlug?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentData {
  pixCopiaECola: string; // Agora apenas o string PIX é retornado pelo backend
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  found?: boolean;
  data?: T;
  error?: string;
}

export interface CouponsApiResponse {
  success: boolean;
  count: number;
  data: Coupon[];
}

// DynamoDB response for coupons (direct from AWS)
export interface DynamoDBCouponsResponse {
  Count: number;
  Items: Array<{
    code: { S: string };
    programRule: { S: string };
    expires: { S: string };
    reward: { S: string };
    status: { S: string };
    slug: { S: string };
    createdAt: { S: string };
    SK: { S: string };
  }>;
  ScannedCount: number;
}

// Application state types
export type Step = "cpf" | "email" | "result";

export type ErrorType = 'NETWORK' | 'VALIDATION' | 'API' | 'UNAUTHORIZED' | 'TIMEOUT';

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
}

// Loading states
export interface LoadingState {
  page: boolean;
  coupons: boolean;
  rewards: boolean;
  payment: boolean;
  user: boolean;
}

// Error states
export interface ErrorState {
  merchant: string;
  user: string;
  coupons: string;
  payment: string;
  general: string;
}

// Form data types
export interface CPFFormData {
  cpf: string;
}

export interface EmailFormData {
  email: string;
}

// Payment request payload
export interface PaymentRequest {
  cpf: string;
  merchant_slug: string;
  reward_program_id: string;
  token: string;
}
