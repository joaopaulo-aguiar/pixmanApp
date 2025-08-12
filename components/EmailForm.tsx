import React, { useState } from 'react';
import { validateEmail } from '../lib/validation';

interface EmailFormProps {
  cpf: string;
  onSubmit: (email: string) => void;
  onBack: () => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

export const EmailForm: React.FC<EmailFormProps> = ({
  cpf,
  onSubmit,
  onBack,
  loading = false,
  error = "",
  className = "",
}) => {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (!touched) setTouched(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmail(email)) {
      onSubmit(email);
    }
  };

  const isValid = validateEmail(email);
  const showError = touched && !isValid && email.length > 0;

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Informe seu e-mail
          </h1>
          <p className="text-gray-600 mb-4">
            Para criar sua conta e acessar os cupons
          </p>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              <span className="font-medium">CPF:</span> {cpf}
            </p>
          </div>
        </div>

        {/* Email Input */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="seu@email.com"
            className={`w-full px-4 py-4 text-base border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 bg-white placeholder-gray-500 ${
              showError 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : isValid && touched
                ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                : 'border-gray-300 focus:border-orange-500'
            }`}
            aria-label="Campo de e-mail"
            aria-describedby={showError ? "email-error" : undefined}
            required
          />
          
          {/* Validation feedback */}
          {showError && (
            <p id="email-error" className="text-sm text-red-600" role="alert">
              E-mail inválido. Verifique o formato informado.
            </p>
          )}
          
          {isValid && touched && (
            <p className="text-sm text-green-600">
              ✓ E-mail válido
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

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-4 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 text-base min-h-[48px] flex items-center justify-center"
          >
            Voltar
          </button>
          
          <button
            type="submit"
            disabled={loading || !isValid}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-base min-h-[48px] flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                Criando...
              </>
            ) : (
              'Criar Conta'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmailForm;
