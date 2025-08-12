import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = '',
    children, 
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500 text-white',
      secondary: 'bg-gray-100 hover:bg-gray-200 focus:ring-gray-300 text-gray-900',
      outline: 'border-2 border-gray-300 hover:border-gray-400 focus:ring-gray-300 text-gray-700 bg-white',
      ghost: 'hover:bg-gray-100 focus:ring-gray-300 text-gray-700'
    };

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm min-h-[36px]',
      md: 'px-6 py-4 text-base min-h-[48px]',
      lg: 'px-8 py-5 text-lg min-h-[56px]'
    };

    const widthClass = fullWidth ? 'w-full' : '';

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;

    return (
      <button
        ref={ref}
        className={classes}
        disabled={loading || disabled}
        {...props}
      >
        {loading && (
          <div className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-2"></div>
        )}
        {!loading && leftIcon && (
          <span className="mr-2">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
