import React, { useMemo } from 'react';
import type { Coupon, Reward } from '../lib/types';
import CouponTicket from './CouponTicket';
import RewardProgramCard from './RewardProgramCard';

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

interface GroupedProgram {
  id: string;
  programName: string;
  programRule: string;
  coupons: Coupon[]; // all coupons for that program (ACTIVE + AVAILABLE)
  rewardProgram?: Reward; // merchant reward definition
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
  // Group coupons per program (ACTIVE + AVAILABLE)
  const groupedPrograms: GroupedProgram[] = useMemo(() => {
    const map: Record<string, GroupedProgram> = {};
    coupons.forEach(coupon => {
      const programName = typeof coupon.reward === 'object'
        ? (coupon.reward.title || coupon.reward.programName || coupon.reward.reward || 'Programa de Desconto')
        : (coupon.reward || 'Programa de Desconto');
      const programRule = typeof coupon.reward === 'object'
        ? (coupon.reward.description || coupon.reward.programRule || 'Desconto disponível')
        : (coupon.programRule || 'Desconto disponível');
      const id = `${programName}-${programRule}`.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      if (!map[id]) {
        map[id] = { id, programName, programRule, coupons: [] };
      }
      map[id].coupons.push(coupon);
    });
    // attach reward program metadata
    rewardPrograms.forEach(r => {
      const programName = r.reward || r.title || r.programName || 'Programa de Desconto';
      const programRule = r.programRule || r.description || 'Desconto disponível';
      const id = `${programName}-${programRule}`.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      if (!map[id]) {
        // user has no coupons for this program -> we'll show purchase card later
        map[id] = { id, programName, programRule, coupons: [], rewardProgram: r };
      } else {
        map[id].rewardProgram = r;
      }
    });
    return Object.values(map);
  }, [coupons, rewardPrograms]);

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

  const anyCoupons = groupedPrograms.some(p => p.coupons.length > 0);

  // Determine which programs user can still purchase (no coupons of that program at all)
  const purchasablePrograms = rewardPrograms.filter(r => {
    const found = groupedPrograms.find(g => g.rewardProgram?.SK === r.SK || g.programName === (r.reward || r.programName));
    if (!found) return true; // not present -> can buy
    return found.coupons.length === 0; // only if user has none
  });

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-gray-900">Seus cupons</h2>
      </div>

      {/* List all coupons individually grouped visually by program (program title separators) */}
      {groupedPrograms.length === 0 || !anyCoupons ? (
        <div className="text-center text-sm text-slate-600">Você ainda não possui cupons.</div>
      ) : (
        <div className="space-y-8">
      {groupedPrograms.filter(g => g.coupons.length > 0).map(program => {
            // Determine if there is an ACTIVE for this program
            const active = program.coupons.find(c => c.status === 'ACTIVE');
            return (
              <div key={program.id} className="space-y-3">
                <div className="grid gap-4 md:grid-cols-2">
                  {program.coupons
                    .sort((a,b) => {
                      // Active first, then by created desc
                      if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
                      if (b.status === 'ACTIVE' && a.status !== 'ACTIVE') return 1;
                      const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                      const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                      return bt - at;
                    })
                    .map(coupon => (
                      <CouponTicket
                        key={coupon.SK}
                        coupon={coupon}
                        programName={program.programName}
                        programRule={program.programRule}
                        merchantLogo={merchantLogo}
                        disabled={!!active && active.SK !== coupon.SK && coupon.status === 'AVAILABLE'}
                        isActivating={activatingCouponSK === coupon.SK}
                        onActivate={async (c) => { if (onActivateCoupon) await onActivateCoupon(c); }}
                      />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Purchase cards only for programs the user has zero coupons */}
      {purchasablePrograms.length > 0 && onPurchaseMore && (
        <div className="pt-4 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Outros cupons disponíveis</h4>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {purchasablePrograms.map((reward, idx) => (
              <RewardProgramCard
                key={reward.SK}
                reward={reward}
                index={idx}
                total={purchasablePrograms.length}
                onSelect={(r) => {
                  // Prevent purchase if user already holds coupons (should not happen due to filter) or has active/available for same program
                  const existingProgram = groupedPrograms.find(g => g.rewardProgram?.SK === r.SK || g.programName === (r.reward || r.programName));
                  if (existingProgram && existingProgram.coupons.length > 0) return; // safety
                  onPurchaseMore(r);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponList;
