import { useState, useCallback } from 'react';
import { userService, ApiError } from '../lib/api';
import { ERROR_MESSAGES } from '../lib/constants';
import { isCpfValid, validateEmail, sanitizeCPF } from '../lib/validation';
import type { User, Coupon, Step } from '../lib/types';

interface UseUserResult {
  user: User | null;
  coupons: Coupon[];
  step: Step;
  loading: boolean;
  error: string;
  activatingCouponSK: string | null;
  handleCPFSubmit: (cpf: string) => Promise<void>;
  handleEmailSubmit: (email: string) => Promise<void>;
  fetchUserCoupons: (cpf: string, merchantSlug: string) => Promise<void>;
  activateCoupon: (coupon: Coupon, merchantSlug: string) => Promise<void>;
  resetUser: () => void;
  setStep: (step: Step) => void;
}

/**
 * Custom hook for managing user authentication and data
 */
export function useUser(): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [tempCpf, setTempCpf] = useState<string>(""); // Store CPF for new user creation
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [step, setStep] = useState<Step>("cpf");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activatingCouponSK, setActivatingCouponSK] = useState<string | null>(null);

  const handleCPFSubmit = useCallback(async (cpf: string) => {
    setError("");
    
    // Frontend CPF validation
    if (!isCpfValid(cpf)) {
      setError(ERROR_MESSAGES.CPF_INVALID);
      return;
    }

    const sanitizedCpf = sanitizeCPF(cpf);
    setLoading(true);

    try {
      const userData = await userService.getUserByCPF(sanitizedCpf);
      
      if (userData) {
        setUser(userData);
        setTempCpf(""); // Clear temp CPF since user exists
        setStep("result");
      } else {
        setTempCpf(sanitizedCpf); // Store CPF for user creation
        setStep("email");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.type) {
          case 'NETWORK':
            setError(ERROR_MESSAGES.NETWORK);
            break;
          case 'TIMEOUT':
            setError(ERROR_MESSAGES.TIMEOUT);
            break;
          default:
            setError(ERROR_MESSAGES.USER_NOT_FOUND);
        }
      } else {
        setError(ERROR_MESSAGES.USER_NOT_FOUND);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEmailSubmit = useCallback(async (email: string) => {
    setError("");
    
    if (!tempCpf) {
      setError("CPF não encontrado. Reinicie o processo.");
      return;
    }

    if (!validateEmail(email)) {
      setError(ERROR_MESSAGES.EMAIL_INVALID);
      return;
    }

    setLoading(true);

    try {
      const userData = await userService.createUser(tempCpf, email);
      setUser(userData);
      setTempCpf(""); // Clear temp CPF after successful creation
      setStep("result");
      setCoupons([]); // New user won't have coupons
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.type) {
          case 'NETWORK':
            setError(ERROR_MESSAGES.NETWORK);
            break;
          case 'TIMEOUT':
            setError(ERROR_MESSAGES.TIMEOUT);
            break;
          case 'VALIDATION':
            setError(err.message);
            break;
          default:
            setError(ERROR_MESSAGES.USER_CREATE_FAILED);
        }
      } else {
        setError(ERROR_MESSAGES.USER_CREATE_FAILED);
      }
    } finally {
      setLoading(false);
    }
  }, [tempCpf]);

  const fetchUserCoupons = useCallback(async (cpf: string, merchantSlug: string) => {
    setLoading(true);
    setError("");

    try {
      const userCoupons = await userService.getUserCoupons(cpf, merchantSlug);
      setCoupons(userCoupons);
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.type) {
          case 'NETWORK':
            setError(ERROR_MESSAGES.NETWORK);
            break;
          case 'TIMEOUT':
            setError(ERROR_MESSAGES.TIMEOUT);
            break;
          default:
            setError(ERROR_MESSAGES.COUPONS_FETCH_ERROR);
        }
      } else {
        setError(ERROR_MESSAGES.COUPONS_FETCH_ERROR);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const activateCoupon = useCallback(async (coupon: Coupon, merchantSlug: string) => {
    if (!user?.cpf) {
      setError("Usuário não encontrado");
      return;
    }

    setActivatingCouponSK(coupon.SK);
    setError("");

    try {
      const success = await userService.activateCoupon(user.cpf, merchantSlug, coupon.SK);
      
      if (success) {
        // Refresh the coupons list after activation
        await fetchUserCoupons(user.cpf, merchantSlug);
      } else {
        setError("Falha ao ativar o cupom. Tente novamente.");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.type) {
          case 'NETWORK':
            setError(ERROR_MESSAGES.NETWORK);
            break;
          case 'TIMEOUT':
            setError(ERROR_MESSAGES.TIMEOUT);
            break;
          default:
            setError("Erro ao ativar cupom. Tente novamente.");
        }
      } else {
        setError("Erro ao ativar cupom. Tente novamente.");
      }
    } finally {
      setActivatingCouponSK(null);
    }
  }, [user, fetchUserCoupons]);

  const resetUser = useCallback(() => {
    setUser(null);
    setTempCpf(""); // Clear temp CPF
    setCoupons([]);
    setStep("cpf");
    setError("");
    setLoading(false);
    setActivatingCouponSK(null);
  }, []);

  return {
    user,
    coupons,
    step,
    loading,
    error,
    activatingCouponSK,
    handleCPFSubmit,
    handleEmailSubmit,
    fetchUserCoupons,
    activateCoupon,
    resetUser,
    setStep,
  };
}
