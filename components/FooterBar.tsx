import React from 'react';

interface FooterBarProps {
  className?: string;
}

export const FooterBar: React.FC<FooterBarProps> = ({
  className = "",
}) => {
  return (
    <footer className={`bg-white border-t border-gray-200 mt-auto ${className}`}>
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">
            Powered by Pixman
          </p>
          <p className="text-xs text-gray-400">
            © 2025 - Sistema de cupons digitais
          </p>
        </div>

        {/* Support links */}
        <div className="flex justify-center gap-6 mt-4">
          <button className="text-xs text-gray-500 hover:text-orange-500 transition-colors duration-200">
            Ajuda
          </button>
          <button className="text-xs text-gray-500 hover:text-orange-500 transition-colors duration-200">
            Termos de Uso
          </button>
          <button className="text-xs text-gray-500 hover:text-orange-500 transition-colors duration-200">
            Privacidade
          </button>
        </div>
      </div>
    </footer>
  );
};

export default FooterBar;
