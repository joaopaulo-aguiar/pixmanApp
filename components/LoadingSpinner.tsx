import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message = 'Carregando...',
  className = "",
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin border-2 border-orange-500 border-t-transparent rounded-full ${sizeClasses[size]}`}></div>
      {message && (
        <p className="text-gray-600 mt-3 text-sm">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
