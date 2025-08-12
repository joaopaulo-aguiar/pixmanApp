import { Merchant } from '../lib/types';
import CPFForm from './CPFForm';

interface WelcomeSectionProps {
  merchant: Merchant;
  onCPFSubmit: (cpf: string) => void;
  loading?: boolean;
  error?: string;
}

export default function WelcomeSection({ merchant, onCPFSubmit, loading, error }: WelcomeSectionProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        {/* CPF Form */}
        <div className="max-w-sm mx-auto">
          <CPFForm
            onSubmit={onCPFSubmit}
            loading={loading}
            error={error}
          />
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Benefits Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-green-900 mb-1">Cupons Exclusivos</h3>
              <p className="text-green-700 text-sm">
                Descontos especiais e ofertas únicas disponíveis apenas para nossos clientes.
              </p>
            </div>
          </div>
        </div>

        {/* Easy Access Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Acesso Rápido</h3>
              <p className="text-blue-700 text-sm">
                Use seu CPF para acessar rapidamente todos os seus cupons ativos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      {merchant.status && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Estabelecimento ativo
          </div>
        </div>
      )}
    </div>
  );
}
