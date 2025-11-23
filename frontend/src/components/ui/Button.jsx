import Spinner from './Spinner';

export default function Button({
  children,
  onClick,
  variant = 'primary', // primary, secondary, danger, ghost
  className = '',
  disabled = false,
  isLoading = false,
  type = 'button',
}) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-900/20 border border-blue-400/20',
    secondary:
      'bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-sm',
    danger:
      'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20',
    ghost: 'bg-transparent hover:bg-white/5 text-gray-400 hover:text-white',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {isLoading && <Spinner className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
}