import React from 'react';
import CouponGroup from './CouponGroup';
import type { Coupon, Reward } from '../lib/types';

interface CouponListProps {
  coupons: Coupon[];
  rewardPrograms?: Reward[]; // Add available reward programs
  loading?: boolean;
  merchantName?: string;
  merchantLogo?: string;
  onActivateCoupon?: (coupon: Coupon) => Promise<void>;
  onPresentCoupon?: (coupon: Coupon) => void;
  onPurchaseMore?: (rewardProgram?: Reward) => void;
  activatingCouponSK?: string | null;
  className?: string;
}

interface CouponProgram {
  id: string;
  programName: string;
  programRule: string;
  availableCoupons: Coupon[];
  activeCoupons: Coupon[];
  rewardProgram?: Reward;
}

export const CouponList: React.FC<CouponListProps> = ({
  coupons,
  rewardPrograms = [],
  loading = false,
  merchantName,
  merchantLogo,
  onActivateCoupon,
  onPurchaseMore,
  activatingCouponSK,
  className = "",
}) => {
  // Group coupons by discount program and include all merchant reward programs
  const groupCouponsByProgram = (coupons: Coupon[], rewardPrograms: Reward[]): CouponProgram[] => {
    const programs: Record<string, CouponProgram> = {};

    // First, create program entries from user's coupons
    coupons.forEach(coupon => {
      const programName = typeof coupon.reward === 'object' 
        ? (coupon.reward.title || coupon.reward.programName || coupon.reward.reward || 'Programa de Desconto')
        : (coupon.reward || 'Programa de Desconto');
      
      const programRule = typeof coupon.reward === 'object'
        ? (coupon.reward.description || coupon.reward.programRule || 'Desconto disponível')
        : (coupon.programRule || 'Desconto disponível');

      // Create unique ID based on program name and rule
      const programId = `${programName}-${programRule}`.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

      if (!programs[programId]) {
        programs[programId] = {
          id: programId,
          programName,
          programRule,
          availableCoupons: [],
          activeCoupons: [],
        };
      }

      if (coupon.status === 'AVAILABLE') {
        programs[programId].availableCoupons.push(coupon);
      } else if (coupon.status === 'ACTIVE') {
        programs[programId].activeCoupons.push(coupon);
      }
    });

    // Then, add all merchant reward programs (even if user has no coupons for them)
    rewardPrograms.forEach(reward => {
      const programName = reward.reward || reward.title || reward.programName || 'Programa de Desconto';
      const programRule = reward.programRule || reward.description || 'Desconto disponível';
      const programId = `${programName}-${programRule}`.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

      if (!programs[programId]) {
        programs[programId] = {
          id: programId,
          programName,
          programRule,
          availableCoupons: [],
          activeCoupons: [],
          rewardProgram: reward,
        };
      } else {
        // If program already exists from user coupons, add the reward info
        programs[programId].rewardProgram = reward;
      }
    });

    return Object.values(programs);
  };

  // Loading state
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin inline-block w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600">Carregando seus cupons...</p>
        </div>
      </div>
    );
  }

  const couponPrograms = groupCouponsByProgram(coupons, rewardPrograms || []);

  // Empty state
  if (couponPrograms.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          {/* Empty state illustration */}
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Nenhum cupom disponível
          </h3>
          
          <p className="text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">
            Você ainda não possui cupons disponíveis{merchantName ? ` para ${merchantName}` : ''}. 
            Que tal adquirir um?
          </p>

          {onPurchaseMore && (
            <button
              onClick={() => onPurchaseMore()}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-base min-h-[48px] flex items-center justify-center mx-auto"
            >
              Ver Ofertas Disponíveis
            </button>
          )}
        </div>
      </div>
    );
  }

  // Calculate total coupons
  const totalAvailable = couponPrograms.reduce((sum, program) => sum + program.availableCoupons.length, 0);
  const totalActive = couponPrograms.reduce((sum, program) => sum + program.activeCoupons.length, 0);
  const totalCoupons = totalAvailable + totalActive;

  // Coupon programs list
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Seus cupons {merchantName ? `- ${merchantName}` : ''}
        </h2>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>
            {totalCoupons} {totalCoupons === 1 ? 'cupom' : 'cupons'} no total
          </span>
          {totalAvailable > 0 && (
            <span className="text-orange-600">
              • {totalAvailable} disponível{totalAvailable !== 1 ? 'eis' : ''}
            </span>
          )}
          {totalActive > 0 && (
            <span className="text-green-600">
              • {totalActive} ativo{totalActive !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {couponPrograms.map((program) => {
          // Find if any coupon from this program is being activated
          const isActivating = program.availableCoupons.some(coupon => 
            activatingCouponSK === coupon.SK
          );

          return (
            <CouponGroup
              key={program.id}
              programName={program.programName}
              programRule={program.programRule}
              availableCoupons={program.availableCoupons}
              activeCoupons={program.activeCoupons}
              merchantLogo={merchantLogo}
              onUseCoupon={async (coupon) => {
                if (onActivateCoupon) {
                  await onActivateCoupon(coupon);
                }
              }}
              onPurchaseMore={onPurchaseMore ? () => onPurchaseMore(program.rewardProgram) : undefined}
              isActivating={isActivating}
              rewardProgram={program.rewardProgram ? {
                quantity: program.rewardProgram.quantity,
                reward: program.rewardProgram.reward,
                price: program.rewardProgram.price
              } : undefined}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CouponList;
