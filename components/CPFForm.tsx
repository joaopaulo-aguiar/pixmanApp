import React, { useState } from 'react';
import { maskCPF, isCpfValid } from '../lib/validation';

interface CPFFormProps {
  onSubmit: (cpf: string) => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

export const CPFForm: React.FC<CPFFormProps> = ({
  onSubmit,
  loading = false,
  error = "",
  className = "",
}) => {
  const [cpf, setCpf] = useState("");
  const [touched, setTouched] = useState(false);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Mantém apenas dígitos
    const raw = e.target.value.replace(/\D/g, '');
    const maskedValue = maskCPF(raw);
    setCpf(maskedValue);
    if (!touched) setTouched(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCpfValid(cpf)) {
      onSubmit(cpf);
    }
  };

  const rawDigits = cpf.replace(/\D/g, '');
  const hasFullLength = rawDigits.length === 11; // CPF completo
  const isValidFull = hasFullLength && isCpfValid(cpf);
  const showError = hasFullLength && !isValidFull; // só mostra erro quando completou e é inválido

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Informe seu CPF
          </h1>
        </div>

        {/* CPF Input */}
        <div className="space-y-2">
          {/* Texto adicional removido por solicitação */}
          <input
            id="cpf"
            type="tel" /* mantém teclado numérico em mobile */
            inputMode="numeric" /* sugere teclado numérico em navegadores modernos */
            /* Removido pattern="[0-9]*" pois a máscara adiciona '.' e '-' e causava pattern mismatch */
            /* Se quiser validar via pattern com máscara, usar: pattern="\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}" */
            autoComplete="off"
            value={cpf}
            onChange={handleCpfChange}
            onKeyDown={(e) => {
              // Bloqueia caracteres não numéricos (exceto controle)
              if (!/[0-9]/.test(e.key) && !['Backspace','Tab','ArrowLeft','ArrowRight','Delete','Home','End'].includes(e.key)) {
                e.preventDefault();
              }
            }}
            placeholder="000.000.000-00"
            maxLength={14}
            className={`w-full px-4 py-4 text-lg text-center tracking-wider border-2 rounded-lg focus:outline-none transition-all duration-200 bg-white placeholder-gray-500 ${
              showError
                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500'
                : isValidFull
                ? 'border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500'
                : 'border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500'
            }`}
            aria-label="Campo de CPF"
            aria-describedby={showError ? "cpf-error" : undefined}
            required
          />
          
          {/* Validation feedback */}
          {showError && (
            <p id="cpf-error" className="text-sm text-red-600" role="alert">
              CPF inválido. Verifique os dígitos informados.
            </p>
          )}
          
          {isValidFull && (
            <p className="text-sm text-green-600">
              ✓ CPF válido
            </p>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm" role="alert">
              {error}
            </p>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading || !isValidFull}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-base min-h-[48px] flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-2"></div>
              Verificando...
            </>
          ) : (
            'Continuar'
          )}
        </button>
      </form>
    </div>
  );
};

export default CPFForm;
