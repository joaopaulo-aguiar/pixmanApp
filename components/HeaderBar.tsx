import React from 'react';

interface HeaderBarProps {
  merchantName?: string;
  userEmail?: string;
  onBack?: () => void;
  showBackButton?: boolean;
  className?: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  merchantName,
  userEmail,
  onBack,
  showBackButton = false,
  className = "",
}) => {
  const isTransparent = className.includes('bg-transparent');
  const textColor = className.includes('text-white') ? 'text-white' : 'text-gray-900';
  const buttonHover = className.includes('text-white') ? 'hover:bg-white/10' : 'hover:bg-gray-100';
  
  return (
    <header className={`${isTransparent ? 'bg-transparent' : 'bg-white border-b border-gray-200 shadow-sm'} ${className}`}>
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center gap-3">
            {showBackButton && onBack && (
              <button
                onClick={onBack}
                className={`p-2 -ml-2 rounded-lg ${buttonHover} transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500`}
                aria-label="Voltar"
              >
                <svg className={`w-5 h-5 ${className.includes('text-white') ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            <div>
              {merchantName && (
                <h1 className={`text-lg font-semibold ${textColor} leading-tight`}>
                  {merchantName}
                </h1>
              )}
              {userEmail && (
                <p className={`text-sm ${className.includes('text-white') ? 'text-white/80' : 'text-gray-600'}`}>
                  {userEmail}
                </p>
              )}
              {!merchantName && !userEmail && (
                <div className="w-4 h-4"></div> // Espaço vazio, sem texto
              )}
            </div>
          </div>

          {/* Right section - Could be used for notifications or menu */}
          <div className="flex items-center gap-2">
            {/* Placeholder for future features like notifications */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;
