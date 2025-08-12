// GraphQL queries and mutations for AWS AppSync

// Queries
export const GET_MERCHANT = `
  query getMerchant($slug: String!) {
    getMerchant(slug: $slug) {
      slug
      displayName
      status
      address {
        street
        city
        state
        zipCode
      }
      createdAt
    }
  }
`;

export const LIST_REWARD_PROGRAMS = `
  query listRewardPrograms($slug: String!) {
    listRewardPrograms(slug: $slug) {
      SK
      programName
      programRule
      quantity
      reward
      price
    }
  }
`;

export const GET_USER = `
  query getUser($cpf: String!) {
    getUser(cpf: $cpf) {
      cpf
      email
    }
  }
`;

export const LIST_USER_COUPONS = `
  query listUserCoupons($cpf: String!, $slug: String!, $statuses: [String!]!) {
    listUserCoupons(input: {
      cpf: $cpf,
      slug: $slug,
      statuses: $statuses
    }) {
      SK
      couponCode
      status
      expires
      createdAt
      activatedAt
      redeemedAt
      programRule
      reward
    }
  }
`;

// Mutations
export const CREATE_USER = `
  mutation createUser($input: CreateUserInput!) {
    createUser(input: $input) {
      cpf
      email
    }
  }
`;

export const ACTIVATE_COUPON = `
  mutation activateCoupon($input: ActivateCouponInput!) {
    activateCoupon(input: $input) {
      success
      message
    }
  }
`;

// Input types for TypeScript
export interface ListUserCouponsInput {
  cpf: string;
  slug: string;
  statuses?: string[];
  status?: string;
}

export interface CreateUserInput {
  cpf: string;
  email: string;
}

export interface ActivateCouponInput {
  cpf: string;
  slug: string;
  SK: string;
}

// Response types
export interface ActivateCouponResponse {
  success: boolean;
  message: string;
}
