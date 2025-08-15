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
  txid: string | null;
  handleBuyReward: (reward: Reward, user: User, merchant: Merchant, rewardIndex: number) => Promise<void>;
  verifyPayment: () => Promise<string | null>; // returns status
  resetPayment: () => void;
}

/**
 * Custom hook for managing payment operations
 */
export function usePayment(): UsePaymentResult {
  const [buyingReward, setBuyingReward] = useState<Reward | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [txid, setTxid] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [error, setError] = useState("");

  // Heurística avançada para extrair txid de um código PIX copia e cola
  function extractTxid(pix: string | undefined): string | null {
    if (!pix) return null;
    const explicit = /txid=([a-z0-9\-]{6,})/i.exec(pix);
    if (explicit) return explicit[1];
    const candidate = /[a-z0-9]{25,60}/.exec(pix);
    if (candidate) return candidate[0];
    const candidate32 = /[a-z0-9]{32}/i.exec(pix);
    if (candidate32) return candidate32[0];
    return null;
  }

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
  const maybeTxid = extractTxid(payment.pixCopiaECola);
  console.log('[usePayment] Extraído txid:', maybeTxid);
  setTxid(maybeTxid);
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
    setTxid(null);
  }, []);

  const verifyPayment = useCallback(async (): Promise<string | null> => {
    if (!txid) {
      console.warn('[usePayment] verifyPayment chamado sem txid');
      return null;
    }
    try {
      const status = await paymentService.getPixPaymentStatus(txid);
      console.log('[usePayment] Status PIX:', status);
      return status.status;
    } catch (e) {
      console.warn('[usePayment] Falha ao obter status PIX', e);
      return null;
    }
  }, [txid]);

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
  txid,
    handleBuyReward,
  verifyPayment,
    resetPayment,
  };
}
