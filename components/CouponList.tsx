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
  onRefresh?: () => void;
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
  onRefresh,
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

  const anyCoupons = coupons.length > 0;

  // Flatten and sort coupons across programs for global priority
  // Build a flat list with program references
  const flat = groupedPrograms.flatMap(g => g.coupons.map(c => ({ coupon: c, program: g })));
  const order = (c: Coupon, program: GroupedProgram) => {
    const active = program.coupons.find(x => x.status === 'ACTIVE');
    const blocked = c.status === 'AVAILABLE' && active && active.SK !== c.SK;
    if (c.status === 'ACTIVE') return 0;
    if (c.status === 'AVAILABLE' && !blocked) return 1;
    if (blocked) return 2;
    return 3; // inactive
  };
  flat.sort((a,b) => {
    const diff = order(a.coupon, a.program) - order(b.coupon, b.program);
    if (diff !== 0) return diff;
    const at = a.coupon.createdAt ? new Date(a.coupon.createdAt).getTime() : 0;
    const bt = b.coupon.createdAt ? new Date(b.coupon.createdAt).getTime() : 0;
    return bt - at;
  });
  // Build a quick lookup for active coupons per program for disabled logic after flattening
  const activeByProgram: Record<string, string | undefined> = {};
  groupedPrograms.forEach(g => {
    const active = g.coupons.find(c => c.status === 'ACTIVE');
    if (active) activeByProgram[g.id] = active.SK;
  });

  // Determine which programs user can still purchase (no coupons of that program at all)
  const purchasablePrograms = rewardPrograms.filter(r => {
    const found = groupedPrograms.find(g => g.rewardProgram?.SK === r.SK || g.programName === (r.reward || r.programName));
    if (!found) return true; // not present -> can buy
    return found.coupons.length === 0; // only if user has none
  });

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="mb-2 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Seus cupons</h2>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md px-3 py-1 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M5 19A9 9 0 0119 5M5 5a9 9 0 0114 14" /></svg>
            Atualizar
          </button>
        )}
      </div>

      {/* Flat globally ordered list of coupons */}
      {!anyCoupons ? (
        <div className="text-center text-sm text-slate-600">Você ainda não possui cupons.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {flat.map(({ coupon, program }) => (
            <CouponTicket
              key={coupon.SK}
              coupon={coupon}
              programName={program.programName}
              programRule={program.programRule}
              merchantLogo={merchantLogo}
              disabled={!!activeByProgram[program.id] && activeByProgram[program.id] !== coupon.SK && coupon.status === 'AVAILABLE'}
              isActivating={activatingCouponSK === coupon.SK}
              onActivate={async (c) => { if (onActivateCoupon) await onActivateCoupon(c); }}
            />
          ))}
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
