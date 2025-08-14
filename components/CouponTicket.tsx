import React, { useState, useEffect, useMemo } from 'react';
import type { Coupon } from '../lib/types';

interface CouponTicketProps {
  coupon: Coupon;
  programName: string;
  programRule: string;
  merchantLogo?: string;
  disabled?: boolean;
  isActivating?: boolean;
  onActivate?: (coupon: Coupon) => Promise<void>;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR');
}

function extractVerificationCode(sk: string) {
  const parts = sk.split('#');
  if (parts.length >= 5) return parts[4];
  return sk.slice(-8);
}

export const CouponTicket: React.FC<CouponTicketProps> = ({
  coupon,
  programName,
  programRule,
  merchantLogo,
  disabled = false,
  isActivating = false,
  onActivate,
}) => {
  const isActive = coupon.status === 'ACTIVE';
  const isInactive = coupon.status !== 'ACTIVE' && coupon.status !== 'AVAILABLE';
  const [presenting, setPresenting] = useState(false);
  const [showActivationBack, setShowActivationBack] = useState(false);
  const [remainingMs, setRemainingMs] = useState<number>(0);
  // Flip simplificado sem cálculo de altura (front define a altura naturalmente)

  useEffect(() => {
    if (!isActive) return;
    const update = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(23,59,59,999);
      const diff = midnight.getTime() - now.getTime();
      setRemainingMs(diff > 0 ? diff : 0);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [isActive]);

  const remaining = useMemo(() => {
    if (!remainingMs) return '00:00:00';
    const total = Math.floor(remainingMs/1000);
    const h = String(Math.floor(total/3600)).padStart(2,'0');
    const m = String(Math.floor((total%3600)/60)).padStart(2,'0');
    const s = String(total%60).padStart(2,'0');
    return `${h}:${m}:${s}`;
  }, [remainingMs]);

  const isPremium = /10|15|20|25|30/.test(programName);
  const isBlockedAvailable = !isInactive && coupon.status === 'AVAILABLE' && disabled;
  const ticketColor = isInactive
    ? 'bg-slate-700'
    : (isBlockedAvailable
        ? (isPremium ? 'bg-gradient-to-br from-slate-600 to-slate-700' : 'bg-gradient-to-br from-slate-500 to-slate-600')
        : (isPremium ? 'bg-orange-700' : 'bg-orange-600'));
  const todayFormatted = useMemo(() => new Date().toLocaleDateString('pt-BR'), []);

  function handleActivate() {
    if (disabled || isActive || !onActivate) return;
    setShowActivationBack(true);
  }
  async function confirmActivate() {
    if (!onActivate) return;
    await onActivate(coupon);
    setShowActivationBack(false);
    setPresenting(true);
  }
  function cancelActivate() {
    setShowActivationBack(false);
  }

  return (
    <div className="relative" style={{perspective: '1200px'}}>
        {/* FRONT (fica no fluxo para altura) */}
        <div
          className={`${ticketColor} rounded-2xl px-4 pt-4 pb-3 text-white shadow-sm overflow-hidden flex flex-col transition-transform duration-[900ms] [transform-style:preserve-3d]`}
          style={{transform: showActivationBack ? 'rotateY(180deg)' : 'rotateY(0deg)', backfaceVisibility: 'hidden'}}
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.15),rgba(255,255,255,0))]"></div>
          <div className="absolute inset-1 rounded-lg border-2 border-dashed border-white/70 pointer-events-none"></div>
          <div className="relative flex flex-col items-center text-center flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-semibold tracking-wide text-white/80">{isActive ? 'CUPOM ATIVO' : (isInactive ? 'CUPOM INATIVO' : 'CUPOM')}</span>
                {isActive && (
                  <span className="inline-flex items-center gap-1 bg-white/15 rounded-full px-2 py-0.5 text-[10px] font-medium">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                    Hoje
                  </span>
                )}
                {!isActive && !isInactive && isBlockedAvailable && (
                  <span className="inline-flex items-center gap-1 bg-black/25 rounded-full px-2 py-0.5 text-[10px] font-medium text-white/80">Bloqueado hoje</span>
                )}
              </div>
              <h3 className="text-[16px] font-extrabold leading-tight drop-shadow-sm max-w-[260px]">{programName}</h3>
              <p className="text-[11px] text-white/90 leading-snug max-w-[300px] mt-1">{programRule}</p>

              {isActive && presenting && (
                <div className="mt-4 bg-white/12 rounded-lg p-4 backdrop-blur-sm border border-white/20 w-full">
                  <div className="text-center mb-4">
                    <p className="text-[10px] uppercase tracking-wide text-white/70 font-semibold mb-1">Código</p>
                    <div className="bg-white/15 rounded-md px-3 py-3 border border-white/25 inline-block">
                      <span className="font-mono text-2xl font-bold tracking-widest drop-shadow-sm">{coupon.couponCode}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="inline-flex items-center gap-2 bg-black/25 rounded-full px-4 py-1 text-[11px] text-white/85">
                      <span className="font-medium">Válido hoje até 23:59</span>
                      <span className="w-px h-4 bg-white/30"></span>
                      <span className="inline-flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                        {remaining}
                      </span>
                    </div>
                    <div className="font-mono text-[10px] tracking-tight text-white/75">{extractVerificationCode(coupon.SK)}</div>
                  </div>
                </div>
              )}
            </div>
          {/* Actions */}
          <div className="relative mt-3">
              {isActive ? (
                <>
                  <button
                    onClick={() => setPresenting(p => !p)}
                    className={`w-full rounded-md font-semibold text-white text-xs py-2.5 px-3 transition-all bg-slate-700 hover:bg-slate-600 focus:ring-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent`}
                  >
                    {presenting ? 'Fechar apresentação' : 'Apresentar cupom'}
                  </button>
                  <div className="text-[10px] text-white/70 mt-2 leading-tight text-center min-h-[14px]">
                    Válido até hoje dia {todayFormatted}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <button
                    onClick={handleActivate}
                    disabled={disabled || isActivating}
                    className={`w-full ${disabled ? 'bg-slate-400 hover:bg-slate-400' : 'bg-teal-600 hover:bg-teal-700'} disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-3 rounded-md transition-all text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-0 flex items-center justify-center`}
                  >
                    {isActivating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Ativando...
                      </>
                    ) : 'Ativar cupom'}
                  </button>
                  <div className="text-[10px] text-white/70 mt-2 leading-tight text-center min-h-[14px]">
                    {disabled ? 'Você possui outro cupom ativo para hoje' : (!isInactive && coupon.status === 'AVAILABLE' ? `Válido até ${formatDate(coupon.expires)}` : '')}
                  </div>
                </div>
              )}
          </div>
        </div>
        {/* BACK (absolute sobrepõe) */}
        <div
          className={`${ticketColor} rounded-2xl px-4 pt-2 pb-10 text-white shadow-sm overflow-hidden flex flex-col absolute inset-0 transition-transform duration-[900ms] [transform-style:preserve-3d]`}
          style={{transform: showActivationBack ? 'rotateY(0deg)' : 'rotateY(-180deg)', backfaceVisibility: 'hidden'}}
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.15),rgba(255,255,255,0))]"></div>
          <div className="absolute inset-1 rounded-lg border-2 border-dashed border-white/70 pointer-events-none"></div>
          <div className="relative flex flex-col items-center text-center px-2">
            <span className="text-[10px] uppercase font-semibold tracking-wide text-white/70 mb-2">Ativar Cupom</span>
            <p className="text-[11px] leading-relaxed text-white/90">Ao ativar este cupom ele deverá ser utilizado hoje. Após 23:59 ele expira. Deseja continuar?</p>
          </div>
          <div className="relative flex gap-2 mt-2 pt-2">
            <button onClick={cancelActivate} className="flex-1 bg-white/15 hover:bg-white/25 text-white/90 text-xs font-medium rounded-md py-2 transition-colors">Cancelar</button>
            <button onClick={confirmActivate} disabled={isActivating} className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-xs font-semibold rounded-md py-2 transition-colors inline-flex items-center justify-center gap-1">
              {isActivating && <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              {isActivating ? 'Ativando...' : 'Confirmar'}
            </button>
          </div>
        </div>
  </div>
  );
};

export default CouponTicket;
