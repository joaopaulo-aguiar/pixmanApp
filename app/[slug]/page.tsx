"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useMerchant } from '../../hooks/useMerchant';
import useDynamicFavicon from '../../hooks/useDynamicFavicon';
import { useUser } from '../../hooks/useUser';
import { usePayment } from '../../hooks/usePayment';
import { config } from '../../lib/config';
import HeaderBar from '../../components/HeaderBar';
import FooterBar from '../../components/FooterBar';
import CPFForm from '../../components/CPFForm';
import EmailForm from '../../components/EmailForm';
import CouponList from '../../components/CouponList';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import QRCodeComponent from '../../components/QRCodeComponent';
import MerchantHero from '../../components/MerchantHero';
import WelcomeSection from '../../components/WelcomeSection';

// Contador regressivo simples
function Countdown({ target, className = '' }: { target: number; className?: string }) {
  const [remaining, setRemaining] = useState(target - Date.now());
  useEffect(() => {
    const id = setInterval(() => setRemaining(target - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  if (remaining <= 0) return <span className={className + ' text-red-600'}>Expirado</span>;
  const totalSec = Math.floor(remaining / 1000);
  const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return <span className={className}>Expira em {m}:{s}</span>;
}

function CopyPixButton({ code, className = '' }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      onClick={() => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }}
      className={`bg-teal-600 hover:bg-teal-700 focus:ring-teal-600 ${className}`}
    >
      {copied ? 'Copiado!' : 'Copiar código PIX'}
    </Button>
  );
}

export default function SlugPage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  // Custom hooks for state management
  const { merchant, rewards, loading: merchantLoading, error: merchantError } = useMerchant(slug);
  const [pendingRewardIndex, setPendingRewardIndex] = useState<number | null>(null);
  
  // Dynamic favicon based on merchant logo - using hook that worked before
  useDynamicFavicon(merchant ? slug : undefined);
  
  const { 
    user, 
    coupons, 
    step, 
    loading: userLoading, 
    error: userError,
    activatingCouponSK,
    handleCPFSubmit,
    handleEmailSubmit,
    fetchUserCoupons,
    activateCoupon,
    setStep,
    resetUser
  } = useUser();
  const { 
    buyingReward, 
    paymentData, 
    loading: paymentLoading, 
    error: paymentError,
    handleBuyReward,
  resetPayment,
  expiresAt
  } = usePayment();

  // Utility function to safely format price
  const formatPrice = (price: any): string => {
    // Handle null, undefined, or empty values
    if (price === null || price === undefined || price === '') {
      return '0,00';
    }
    
    // If it's already a number, use it directly
    if (typeof price === 'number' && !isNaN(price)) {
      return price.toFixed(2).replace('.', ',');
    }
    
    // If it's a string, try to parse it
    if (typeof price === 'string') {
      // Remove any non-numeric characters except dots and commas
      const cleanPrice = price.replace(/[^\d.,]/g, '');
      // Replace comma with dot for parsing
      const normalizedPrice = cleanPrice.replace(',', '.');
      const parsed = parseFloat(normalizedPrice);
      
      if (!isNaN(parsed)) {
        return parsed.toFixed(2).replace('.', ',');
      }
    }
    
    // Fallback to 0 if nothing works
    return '0,00';
  };

  // Fetch user coupons when user and merchant are available
  useEffect(() => {
    if (user && merchant && step === "result") {
      fetchUserCoupons(user.cpf, merchant.slug);
    }
  }, [user, merchant, step, fetchUserCoupons]);

  // Update page title when merchant is loaded
  useEffect(() => {
    if (merchant?.displayName) {
      document.title = merchant.displayName;
    }
  }, [merchant]);

  async function handleRewardPurchase(reward: any, index: number) {
    if (!merchant) return;
    if (!user) {
      setPendingRewardIndex(index);
      setStep("cpf");
      return;
    }
    await handleBuyReward(reward, user, merchant, index);
  }

  // Após usuário avançar para resultado (email cadastrado) e existir reward pendente inicia compra
  useEffect(() => {
    if (user && merchant && pendingRewardIndex !== null && step === 'result') {
      const reward = rewards[pendingRewardIndex];
      if (reward) {
        handleBuyReward(reward, user, merchant, pendingRewardIndex);
        setPendingRewardIndex(null);
      }
    }
  }, [user, merchant, pendingRewardIndex, step, rewards, handleBuyReward]);

  async function handleActivateCoupon(coupon: any) {
    if (!merchant) {
      console.error('Merchant not found');
      return;
    }
    
    try {
      await activateCoupon(coupon, merchant.slug);
    } catch (error) {
      console.error('Error activating coupon:', error);
    }
  }

  // Error page
  if (merchantError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <HeaderBar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 mb-3">
              Página não encontrada
            </h1>
            <p className="text-slate-600 mb-6">
              {merchantError}
            </p>
            <Button 
              onClick={() => window.location.reload()}
              variant="primary"
            >
              Tentar Novamente
            </Button>
          </div>
        </main>
        <FooterBar />
      </div>
    );
  }

  // Loading page
  if (merchantLoading && !merchant) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <HeaderBar />
        <main className="flex-1 flex items-center justify-center px-4">
          <LoadingSpinner size="lg" message="Carregando..." />
        </main>
        <FooterBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header - Simplified for hero section */}
      <HeaderBar 
        merchantName={(step === "cpf" || step === 'result') ? undefined : merchant?.displayName}
        userEmail={(step === "cpf" || step === 'result') ? undefined : user?.email}
        showBackButton={step !== "cpf" && step !== 'result'}
        onBack={() => {
          if (step === "email") setStep("cpf");
          if (step === "result") resetUser();
        }}
        className={(step === "cpf" || step === 'result') ? "bg-transparent border-0 absolute top-0 left-0 right-0 z-10 text-white" : ""}
      />

      {/* Hero Section - Only show on CPF step */}
  {(step === "cpf" || step === 'result') && merchant && (
        <MerchantHero merchant={merchant} />
      )}

      <main className={`flex-1 px-4 py-6 ${step === "cpf" ? "bg-slate-50" : ""}`}>
        <div className="max-w-md mx-auto space-y-8">
          {/* Payment Section Inline */}
          {paymentData && buyingReward && (
            <div className="bg-white rounded-2xl shadow-sm border border-teal-200 p-6 space-y-6 animate-fade-in">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-teal-100 rounded-2xl flex items-center justify-center ring-4 ring-teal-50">
                  <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Pagamento PIX</h2>
                <p className="text-sm text-slate-600 leading-snug">{buyingReward.programName}</p>
                <div className="text-3xl font-extrabold text-teal-600 drop-shadow-sm">R$ {formatPrice(buyingReward.price)}</div>
                <p className="text-xs text-slate-500">Valor único. Após confirmação seu(s) cupom(ns) serão liberados.</p>
                {expiresAt && (
                  <Countdown target={expiresAt} className="text-xs font-medium text-teal-700" />
                )}
              </div>

              {paymentError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm" role="alert">{paymentError}</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100/60 border border-teal-200 rounded-xl p-4 text-center">
                    <h3 className="font-semibold text-teal-800 mb-3 text-sm">QR Code PIX</h3>
                    <div className="flex justify-center mb-2">
                      <div className="p-2 rounded-xl bg-white shadow-inner animate-pulse-slow">
                        <QRCodeComponent
                        value={paymentData.pixCopiaECola}
                        size={180}
                        alt="QR Code PIX"
                        className="w-full h-auto max-w-[180px]"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-teal-700">Escaneie com o app do seu banco</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-800 text-sm">PIX Copia e Cola</h3>
                      <button
                        onClick={() => navigator.clipboard.writeText(paymentData.pixCopiaECola)}
                        className="text-teal-600 hover:text-teal-700 text-xs font-medium"
                        type="button"
                      >Copiar</button>
                    </div>
                    <div className="text-[10px] font-mono text-slate-700 break-all bg-white p-3 rounded-lg border border-slate-200 max-h-32 overflow-y-auto">
                      {paymentData.pixCopiaECola}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">Copie e cole no app do banco se preferir.</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <CopyPixButton code={paymentData.pixCopiaECola} className="flex-1" />
                <Button
                  onClick={() => {
                    resetPayment();
                    setPendingRewardIndex(null);
                    setStep(user ? 'result' : 'cpf');
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Voltar
                </Button>
              </div>
            </div>
          )}
          
          {/* CPF Form Step - New Welcome Section */}
          {!paymentData && step === "cpf" && merchant && (
            <WelcomeSection
              merchant={merchant}
              rewards={rewards}
              onCPFSubmit={handleCPFSubmit}
              loading={userLoading}
              error={userError}
              onSelectReward={(reward, index) => handleRewardPurchase(reward, index)}
            />
          )}

          {/* Email Form Step */}
          {!paymentData && step === "email" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <EmailForm
                cpf={user?.cpf || ""}
                onSubmit={(email) => handleEmailSubmit(email)}
                onBack={() => setStep("cpf")}
                loading={userLoading}
                error={userError}
              />
            </div>
          )}

          {/* Results Step - User Coupons */}
          {!paymentData && step === "result" && user && (
            <div className="space-y-6 pt-4">
              {/* Welcome inline banner */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 text-center">
                <h2 className="text-base font-semibold text-slate-800 mb-1">Olá, <span className="text-orange-600 break-all">{user.email}</span>!</h2>
                <p className="text-xs text-slate-500">Veja e gerencie seus cupons abaixo.</p>
              </div>

              {/* Coupons list */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <CouponList
                  coupons={coupons}
                  rewardPrograms={rewards}
                  loading={userLoading}
                  merchantName={merchant?.displayName}
                  activatingCouponSK={activatingCouponSK}
                  onActivateCoupon={handleActivateCoupon}
                  onPresentCoupon={(coupon) => {
                    // TODO: Implement coupon presentation
                    console.log('Presenting coupon:', coupon);
                  }}
                  onPurchaseMore={(rewardProgram) => {
                    // Use the specific reward program or find it in the rewards array
                    if (user && merchant) {
                      if (rewardProgram) {
                        // Find the index of this reward program in the rewards array
                        const rewardIndex = rewards.findIndex(r => 
                          r.reward === rewardProgram.reward && 
                          r.programRule === rewardProgram.programRule
                        );
                        if (rewardIndex >= 0) {
                          handleRewardPurchase(rewards[rewardIndex], rewardIndex);
                        }
                      } else if (rewards.length > 0) {
                        // Fallback to first reward
                        handleRewardPurchase(rewards[0], 0);
                      }
                    } else {
                      alert('Para comprar cupons, faça login primeiro.');
                    }
                  }}
                  onRefresh={() => { if (user && merchant) fetchUserCoupons(user.cpf, merchant.slug); }}
                />
              </div>

        {/* Exit */}
              <div className="text-center">
                <Button
                  variant="secondary"
                  onClick={resetUser}
                  className="w-full"
                >
          Sair
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

  {/* (Modal removido - agora seção inline) */}

      <FooterBar />
    </div>
  );
}
