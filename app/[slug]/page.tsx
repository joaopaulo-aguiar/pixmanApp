"use client";

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import Head from 'next/head';
import { useMerchant } from '../../hooks/useMerchant';
import { useUser } from '../../hooks/useUser';
import { usePayment } from '../../hooks/usePayment';
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

export default function SlugPage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  // Custom hooks for state management
  const { merchant, rewards, loading: merchantLoading, error: merchantError } = useMerchant(slug);
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
    resetPayment 
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
    if (!user || !merchant) {
      setStep("cpf");
      return;
    }
    await handleBuyReward(reward, user, merchant, index);
  }

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
        merchantName={step === "cpf" ? undefined : merchant?.displayName} // Remove nome na tela inicial
        userEmail={user?.email}
        showBackButton={step !== "cpf"}
        onBack={() => {
          if (step === "email") setStep("cpf");
          if (step === "result") resetUser();
        }}
        className={step === "cpf" ? "bg-transparent border-0 absolute top-0 left-0 right-0 z-10 text-white" : ""}
      />

      {/* Hero Section - Only show on CPF step */}
      {step === "cpf" && merchant && (
        <MerchantHero merchant={merchant} />
      )}

      <main className={`flex-1 px-4 py-6 ${step === "cpf" ? "bg-slate-50" : ""}`}>
        <div className="max-w-md mx-auto space-y-8">
          
          {/* CPF Form Step - New Welcome Section */}
          {step === "cpf" && merchant && (
            <WelcomeSection
              merchant={merchant}
              onCPFSubmit={handleCPFSubmit}
              loading={userLoading}
              error={userError}
            />
          )}

          {/* Email Form Step */}
          {step === "email" && (
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
          {step === "result" && user && (
            <div className="space-y-6">
              {/* Welcome section */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-semibold text-slate-900 mb-2">
                    Olá! 👋
                  </h1>
                  <p className="text-slate-600">
                    {user.email}
                  </p>
                </div>
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
                />
              </div>

              {/* Quick action to consult another CPF */}
              <div className="text-center">
                <Button
                  variant="secondary"
                  onClick={resetUser}
                  className="w-full"
                >
                  Consultar outro CPF
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Payment Modal */}
      {paymentData && buyingReward && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                  Pagamento PIX
                </h2>
                <p className="text-slate-600 mb-2">
                  {buyingReward.programName}
                </p>
                <div className="text-2xl font-bold text-orange-600">
                  R$ {formatPrice(buyingReward.price)}
                </div>
              </div>

              {paymentError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-700 text-sm">
                    {paymentError}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  <div className="bg-slate-50 rounded-lg p-4 text-center">
                    <h3 className="font-semibold text-slate-900 mb-4">QR Code PIX</h3>
                    <div className="flex justify-center">
                      <QRCodeComponent 
                        value={paymentData.pixCopiaECola}
                        size={200}
                        alt="QR Code PIX"
                        className="max-w-xs w-full h-auto"
                      />
                    </div>
                    <p className="text-sm text-slate-600 mt-2">
                      Escaneie o código com seu app do banco
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">PIX Copia e Cola</h3>
                    <div className="text-xs font-mono text-slate-700 break-all bg-white p-3 rounded border relative">
                      {paymentData.pixCopiaECola}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(paymentData.pixCopiaECola);
                          // Você pode adicionar um toast aqui se quiser
                        }}
                        className="absolute top-2 right-2 text-slate-500 hover:text-slate-700 p-1 rounded"
                        title="Copiar código PIX"
                      >
                        📋
                      </button>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">
                      Ou copie e cole o código no seu app do banco
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={resetPayment}
                  variant="secondary"
                  className="flex-1"
                >
                  Fechar
                </Button>
                {!paymentError && (
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(paymentData.pixCopiaECola);
                      // TODO: Show toast notification
                    }}
                    className="flex-1"
                  >
                    Copiar PIX
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <FooterBar />
    </div>
  );
}
