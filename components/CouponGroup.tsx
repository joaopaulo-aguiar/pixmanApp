import React, { useState } from 'react';
import type { Coupon } from '../lib/types';

interface CouponGroupProps {
  programName: string; // e.g., "R$ 5,00 de desconto"
  programRule: string; // e.g., "Para consumo acima de R$ 35,00"
  availableCoupons: Coupon[];
  activeCoupons: Coupon[];
  merchantLogo?: string;
  onUseCoupon: (coupon: Coupon) => Promise<void>;
  onPurchaseMore?: () => void;
  isActivating?: boolean;
  className?: string;
  // Reward program info for purchase button
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
  const [showActiveCoupon, setShowActiveCoupon] = useState(false);

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

  const handleUseCoupon = async () => {
    if (availableCoupons.length > 0 && canUseToday()) {
      const couponToUse = availableCoupons[0]; // Use the first available coupon
      await onUseCoupon(couponToUse);
      setShowActiveCoupon(true);
    }
  };

  const handlePurchaseMore = () => {
    if (onPurchaseMore) {
      onPurchaseMore();
    }
  };

  const totalCoupons = availableCoupons.length + activeCoupons.length; // Count both available and active
  const hasActiveCoupon = activeCoupons.length > 0;
  const hasAnyCoupons = totalCoupons > 0;
  const canUse = canUseToday() && availableCoupons.length > 0 && !hasActiveCoupon;

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${className}`}>
      {/* Header with merchant logo */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-orange-100">
        <div className="flex items-center gap-3">
          {merchantLogo && (
            <div className="w-12 h-12 rounded-lg bg-white p-2 shadow-sm">
              <img 
                src={merchantLogo} 
                alt="Logo do estabelecimento" 
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg leading-tight">
              {programName}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{programRule}</p>
          </div>
          
          {/* Coupon counter with enhanced styling */}
          <div className="text-right">
            <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">
                {totalCoupons}
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {totalCoupons === 1 ? 'cupom' : 'cupons'}
              </div>
              <div className="text-xs text-gray-400">
                disponível{totalCoupons !== 1 ? 'is' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Show active coupon details when activated */}
        {hasActiveCoupon && (
          <div className="mb-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              {activeCoupons.map((coupon, index) => (
                <div key={coupon.SK} className="mb-3 last:mb-0">
                  {/* Coupon-like design with perforated edges effect */}
                  <div className="relative bg-white border-2 border-dashed border-green-300 rounded-lg overflow-hidden">
                    {/* Top perforation circles */}
                    <div className="absolute top-0 left-0 right-0 flex justify-between">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={`top-${i}`}
                          className="w-3 h-3 bg-green-50 rounded-full transform -translate-y-1.5"
                        />
                      ))}
                    </div>
                    
                    {/* Bottom perforation circles */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={`bottom-${i}`}
                          className="w-3 h-3 bg-green-50 rounded-full transform translate-y-1.5"
                        />
                      ))}
                    </div>
                    
                    <div className="p-6 bg-gradient-to-br from-green-50 via-white to-emerald-50">
                      {/* Coupon header */}
                      <div className="text-center mb-4">
                        <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full text-sm font-bold text-green-800 mb-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          CUPOM ATIVO
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">{programName}</h4>
                        <p className="text-sm text-gray-600">{programRule}</p>
                      </div>
                      
                      {/* Coupon Code */}
                      <div className="text-center mb-4 bg-white border border-green-200 rounded-lg p-4 shadow-sm">
                        <p className="text-sm text-gray-600 mb-2 font-medium">Código do Cupom</p>
                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3">
                          <p className="text-3xl font-bold text-gray-900 font-mono tracking-widest">
                            {coupon.couponCode}
                          </p>
                        </div>
                      </div>
                      
                      {/* Expiration with enhanced styling */}
                      <div className="text-center mb-3">
                        <div className="inline-flex items-center gap-2 bg-orange-100 px-3 py-2 rounded-lg">
                          <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <p className="text-xs text-orange-800 font-medium">
                            Válido {formatValidityDate(coupon.activatedAt || coupon.createdAt || new Date().toISOString())}
                          </p>
                        </div>
                      </div>
                      
                      {/* Verification Code - smaller and at the bottom */}
                      <div className="text-center">
                        <p className="text-xs font-mono text-gray-500 break-all">
                          {extractVerificationCode(coupon.SK)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Simplified daily usage info */}
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-600">
                  Você pode utilizar um cupom por dia deste programa de desconto.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action button */}
        <div className="space-y-3">
          {canUse && (
            <button
              onClick={handleUseCoupon}
              disabled={isActivating}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-base min-h-[48px] flex items-center justify-center"
            >
              {isActivating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Ativando...
                </>
              ) : (
                'Utilizar Cupom'
              )}
            </button>
          )}

          {!hasAnyCoupons && (
            <button
              onClick={handlePurchaseMore}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-base min-h-[48px] flex items-center justify-center"
            >
              {rewardProgram ? (
                `Comprar ${rewardProgram.quantity} ${rewardProgram.quantity === '1' ? 'cupom' : 'cupons'} por R$ ${formatPrice(rewardProgram.price)}`
              ) : (
                'Comprar Cupom'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponGroup;
