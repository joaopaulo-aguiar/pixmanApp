import { useState, useEffect } from 'react';
import { merchantService, ApiError } from '../lib/api';
import { ERROR_MESSAGES } from '../lib/constants';
import type { Merchant, Reward } from '../lib/types';

interface UseMerchantResult {
  merchant: Merchant | null;
  rewards: Reward[];
  loading: boolean;
  rewardsLoading: boolean;
  error: string;
  refetch: () => void;
}

/**
 * Custom hook for managing merchant data and reward programs
 */
export function useMerchant(slug: string | undefined): UseMerchantResult {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [rewardsLoading, setRewardsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMerchantData = async () => {
    if (!slug) {
      setError(ERROR_MESSAGES.PAGE_NOT_FOUND);
      setLoading(false);
      setRewardsLoading(false);
      return;
    }

    setLoading(true);
    setRewardsLoading(true);
    setError("");

    try {
      // Usar cache para melhor performance com Amplify
      const [merchantData, rewardsData] = await Promise.all([
        merchantService.getMerchantCached(slug),
        merchantService.getRewardProgramsCached(slug),
      ]);

      setMerchant(merchantData);
      
      // Ensure rewards have valid numeric prices and handle backward compatibility
      const validatedRewards = rewardsData.map(reward => ({
        ...reward,
        // Convert string price to number for compatibility
        price: typeof reward.price === 'string' ? parseFloat(reward.price) : reward.price,
        // Map fields for component compatibility
        id: reward.SK,
        title: reward.programName,
        description: reward.programRule,
        isActive: true,
        merchantSlug: slug
      }));
      
      setRewards(validatedRewards);
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.type) {
          case 'NETWORK':
            setError(ERROR_MESSAGES.NETWORK);
            break;
          case 'TIMEOUT':
            setError(ERROR_MESSAGES.TIMEOUT);
            break;
          case 'API':
            if (err.code === '404') {
              setError(ERROR_MESSAGES.PAGE_NOT_FOUND);
            } else {
              setError(ERROR_MESSAGES.API_ERROR);
            }
            break;
          default:
            setError(ERROR_MESSAGES.UNKNOWN_ERROR);
        }
      } else {
        setError(ERROR_MESSAGES.UNKNOWN_ERROR);
      }
    } finally {
      setLoading(false);
      setRewardsLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchantData();
  }, [slug]);

  return {
    merchant,
    rewards,
    loading,
    rewardsLoading,
    error,
    refetch: fetchMerchantData,
  };
}
