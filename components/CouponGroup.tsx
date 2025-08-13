import React, { useState, useEffect, useMemo } from 'react';
import type { Coupon } from '../lib/types';

interface CouponGroupProps {
  programName: string;
  programRule: string;
  availableCoupons: Coupon[]; // status AVAILABLE
  activeCoupons: Coupon[]; // status ACTIVE (should be at most 1 for the day)
  merchantLogo?: string;
  onUseCoupon: (coupon: Coupon) => Promise<void>; // activation handler
  onPurchaseMore?: () => void;
  isActivating?: boolean;
  className?: string;
  rewardProgram?: {
    quantity: string;
    reward: string;
    price: string | number;
  };
}

export const CouponGroup: React.FC<CouponGroupProps> = ({
  programName,
  programRule,
  availableCoupons,
  activeCoupons,
  merchantLogo,
  onUseCoupon,
  onPurchaseMore,
  isActivating = false,
  className = "",
  rewardProgram,
}) => {
  const [presenting, setPresenting] = useState(false); // show enlarged ACTIVE coupon for presentation
  const activeCoupon = activeCoupons[0];
  const hasActive = !!activeCoupon;

  // Countdown to midnight (same-day expiry)
  const [remainingMs, setRemainingMs] = useState<number>(() => {
    if (!activeCoupon) return 0;
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(23, 59, 59, 999);
    return midnight.getTime() - now.getTime();
  });

  useEffect(() => {
    if (!activeCoupon) return;
    const interval = setInterval(() => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      const diff = midnight.getTime() - now.getTime();
      setRemainingMs(diff > 0 ? diff : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeCoupon]);

  const remainingTime = useMemo(() => {
    if (!remainingMs) return "";
    const totalSeconds = Math.floor(remainingMs / 1000);
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }, [remainingMs]);

  const formatValidityDate = (activatedAt: string) => {
    try {
      const date = new Date(activatedAt);
      // Cupom é válido apenas no dia da ativação
      const formattedDate = date.toLocaleDateString('pt-BR');
      return `${formattedDate} até às 23:59:59`;
    } catch {
      // Fallback para hoje se não conseguir parsear
      const today = new Date().toLocaleDateString('pt-BR');
      return `${today} até às 23:59:59`;
    }
  };

  const extractVerificationCode = (sk: string) => {
    // Extract UUID from SK format: U#CPF#RP#ID#UUID
    const parts = sk.split('#');
    if (parts.length >= 5) {
      return parts[4]; // Return the UUID part
    }
    // Fallback: return last part after last #
    const lastPart = sk.substring(sk.lastIndexOf('#') + 1);
    return lastPart || sk.slice(-8);
  };

  const formatPrice = (price: string | number): string => {
    if (price === null || price === undefined || price === '') {
      return '0,00';
    }
    
    if (typeof price === 'number' && !isNaN(price)) {
      return price.toFixed(2).replace('.', ',');
    }
    
    if (typeof price === 'string') {
      const cleanPrice = price.replace(/[^\d.,]/g, '');
      const normalizedPrice = cleanPrice.replace(',', '.');
      const parsed = parseFloat(normalizedPrice);
      
      if (!isNaN(parsed)) {
        return parsed.toFixed(2).replace('.', ',');
      }
    }
    
    return '0,00';
  };

  const canUseToday = () => {
    // Check if user has already activated a coupon from this program today
    const today = new Date().toDateString();
    
    const hasUsedToday = activeCoupons.some(coupon => {
      if (!coupon.createdAt) return false;
      const couponDate = new Date(coupon.createdAt).toDateString();
      return couponDate === today;
    });

    return !hasUsedToday;
  };

  const getNextAvailableTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    return tomorrow.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleActivate = async () => {
    if (!availableCoupons.length || !canUseToday() || hasActive) return;
    const couponToUse = availableCoupons[0];
    const confirmed = window.confirm(
      'Ao ativar este cupom ele deverá ser utilizado hoje. Após o dia de hoje ele expira. Deseja continuar?'
    );
    if (!confirmed) return;
    await onUseCoupon(couponToUse);
    setPresenting(true);
  };

  const handlePurchaseMore = () => {
    if (onPurchaseMore) {
      onPurchaseMore();
    }
  };

  const totalCoupons = availableCoupons.length + activeCoupons.length;
  const hasAnyCoupons = totalCoupons > 0;
  const canActivate = canUseToday() && availableCoupons.length > 0 && !hasActive;

  // Ticket color logic (basic vs premium) reuse simplified rule: premium if programName includes '10', '15', '20' etc.
  const isPremium = /10|15|20|25|30/.test(programName);
  const ticketColor = isPremium ? 'bg-orange-700' : 'bg-orange-600';

  const formatCurrency = (price: string | number | undefined) => {
    if (price === undefined || price === null || price === '') return '0,00';
    const n = typeof price === 'number' ? price : parseFloat(String(price).replace(/[^0-9.,]/g, '').replace(',', '.'));
    if (isNaN(n)) return '0,00';
    return n.toFixed(2).replace('.', ',');
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm transition-all overflow-hidden ${className}`}>      
      <div className="p-4 flex flex-col gap-4">
        {/* Ticket */}
        <div className="relative">
          <div className={`relative ${ticketColor} rounded-xl px-5 py-5 text-white shadow-sm overflow-hidden`}>
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.15),rgba(255,255,255,0))]"></div>
            <div className="absolute inset-1 rounded-lg border-2 border-dashed border-white/70 pointer-events-none"></div>
            <div className="flex items-start gap-4">
              {merchantLogo && (
                <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center p-1 shrink-0">
                  <img src={merchantLogo} alt="Logo" className="w-full h-full object-contain" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-semibold tracking-wide text-white/80">CUPOM</span>
                  {hasActive && (
                    <span className="inline-flex items-center gap-1 bg-white/15 rounded-full px-2 py-0.5 text-[10px] font-medium">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                      Ativo hoje
                    </span>
                  )}
                </div>
                <h3 className="text-[18px] font-extrabold leading-tight drop-shadow-sm truncate">{programName}</h3>
                <p className="text-[11px] text-white/90 leading-snug max-w-[320px] mt-1">{programRule}</p>
              </div>
              {/* Counter */}
              <div className="text-right">
                <div className="bg-white/15 rounded-lg px-3 py-2 text-center leading-tight">
                  <div className="text-[22px] font-bold drop-shadow-sm">{totalCoupons}</div>
                  <div className="text-[10px] font-medium text-white/80">{totalCoupons === 1 ? 'cupom' : 'cupons'}</div>
                </div>
              </div>
            </div>
            {/* Active presentation area */}
            {hasActive && presenting && activeCoupon && (
              <div className="mt-5 bg-white/12 rounded-lg p-4 backdrop-blur-sm border border-white/20">
                <div className="text-center mb-3">
                  <p className="text-[10px] uppercase tracking-wide text-white/70 font-semibold mb-1">Código do cupom</p>
                  <div className="bg-white/20 rounded-md px-3 py-4 border border-white/30">
                    <span className="font-mono text-3xl font-bold tracking-widest drop-shadow-sm">{activeCoupon.couponCode}</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-white/80">
                  <div className="inline-flex items-center gap-1 bg-black/20 rounded-full px-3 py-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                    <span>{remainingTime || '00:00:00'}</span>
                  </div>
                  <div className="inline-flex items-center gap-1 bg-black/20 rounded-full px-3 py-1">
                    <span className="font-mono text-[10px] tracking-tight">{extractVerificationCode(activeCoupon.SK)}</span>
                  </div>
                  <div className="inline-flex items-center gap-1 bg-black/20 rounded-full px-3 py-1">
                    <span className="font-medium">Válido hoje até 23:59</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {hasActive && (
            <button
              onClick={() => setPresenting(p => !p)}
              className={`w-full rounded-md font-semibold text-white text-sm py-3 px-4 transition-all ${presenting ? 'bg-slate-700 hover:bg-slate-600' : 'bg-teal-600 hover:bg-teal-700'} focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-white`}
            >
              {presenting ? 'Fechar apresentação' : 'Apresentar Cupom'}
            </button>
          )}

            {!hasActive && hasAnyCoupons && (
              <button
                onClick={handleActivate}
                disabled={!canActivate || isActivating}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-md transition-all text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-white flex items-center justify-center"
              >
                {isActivating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Ativando...
                  </>
                ) : 'Ativar Cupom'}
              </button>
            )}

            {!hasAnyCoupons && (
              <button
                onClick={onPurchaseMore}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-md transition-all text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 focus:ring-offset-white"
              >
                {rewardProgram ? (
                  `Comprar ${rewardProgram.quantity} ${rewardProgram.quantity === '1' ? 'cupom' : 'cupons'} por R$ ${formatCurrency(rewardProgram.price)}`
                ) : 'Comprar Cupom'}
              </button>
            )}

            {!hasActive && hasAnyCoupons && (
              <p className="text-[11px] text-slate-500 text-center leading-snug">Você pode ativar 1 cupom por dia deste programa. {availableCoupons.length > 1 ? `(${availableCoupons.length} ainda disponíveis)` : ''}</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default CouponGroup;
