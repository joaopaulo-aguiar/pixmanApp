import { useState, useCallback, useEffect } from 'react';
import { sha224 } from 'js-sha256';
import { paymentService, ApiError } from '../lib/api';
import { ERROR_MESSAGES } from '../lib/constants';
import type { Reward, PaymentData, User, Merchant } from '../lib/types';

interface UsePaymentResult {
  buyingReward: Reward | null;
  paymentData: PaymentData | null;
  expiresAt: number | null; // epoch ms
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
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
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

      // Verificar cache local antes de criar nova cobrança
      const cacheKey = `pix_payment_${merchant.slug}_${rewardIdStr}_${user.cpf}`;
      const cachedRaw = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null;
      if (cachedRaw) {
        try {
          const cached = JSON.parse(cachedRaw);
          if (cached.payment && cached.expiresAt && Date.now() < cached.expiresAt) {
            setPaymentData(cached.payment);
            setExpiresAt(cached.expiresAt);
            setLoading(false);
            return;
          } else {
            localStorage.removeItem(cacheKey);
          }
        } catch {}
      }

      const payment = await paymentService.createPayment(paymentRequest);
      const ttlMinutes = 30;
      const exp = Date.now() + ttlMinutes * 60 * 1000;
      setPaymentData(payment);
      setExpiresAt(exp);
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ payment, expiresAt: exp }));
      } catch {}
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
    setExpiresAt(null);
    setLoading(false);
    setError("");
  }, []);

  // Limpa cache expirado periodicamente
  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => {
      if (expiresAt && Date.now() >= expiresAt) {
        resetPayment();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt, resetPayment]);

  return {
    buyingReward,
    paymentData,
  loading,
  expiresAt,
    error,
    handleBuyReward,
    resetPayment,
  };
}
