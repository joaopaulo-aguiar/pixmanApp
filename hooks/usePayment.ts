import { useState, useCallback } from 'react';
import { sha224 } from 'js-sha256';
import { paymentService, ApiError } from '../lib/api';
import { ERROR_MESSAGES } from '../lib/constants';
import type { Reward, PaymentData, User, Merchant } from '../lib/types';

interface UsePaymentResult {
  buyingReward: Reward | null;
  paymentData: PaymentData | null;
  loading: boolean;
  error: string;
  handleBuyReward: (reward: Reward, user: User, merchant: Merchant, rewardIndex: number) => Promise<void>;
  resetPayment: () => void;
}

/**
 * Custom hook for managing payment operations
 */
export function usePayment(): UsePaymentResult {
  const [buyingReward, setBuyingReward] = useState<Reward | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBuyReward = useCallback(async (
    reward: Reward, 
    user: User, 
    merchant: Merchant,
    rewardIndex: number
  ) => {
    setError("");
    setPaymentData(null);
    setBuyingReward(reward);
    setLoading(true);

    try {
      // Use index + 1 as reward ID since we don't have SK anymore
      const rewardIdStr = (rewardIndex + 1).toString();
      const tokenStr = `${user.cpf}${merchant.slug}${rewardIdStr}`;
      const token = sha224(tokenStr);

      const paymentRequest = {
        cpf: user.cpf,
        merchant_slug: merchant.slug,
        reward_program_id: rewardIdStr,
        token,
      };

      const payment = await paymentService.createPayment(paymentRequest);
      setPaymentData(payment);
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.type) {
          case 'NETWORK':
            setError(ERROR_MESSAGES.NETWORK);
            break;
          case 'TIMEOUT':
            setError(ERROR_MESSAGES.TIMEOUT);
            break;
          case 'UNAUTHORIZED':
            setError(ERROR_MESSAGES.UNAUTHORIZED);
            break;
          default:
            setError(ERROR_MESSAGES.PAYMENT_ERROR);
        }
      } else {
        setError(ERROR_MESSAGES.PAYMENT_ERROR);
      }
      setBuyingReward(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPayment = useCallback(() => {
    setBuyingReward(null);
    setPaymentData(null);
    setLoading(false);
    setError("");
  }, []);

  return {
    buyingReward,
    paymentData,
    loading,
    error,
    handleBuyReward,
    resetPayment,
  };
}
