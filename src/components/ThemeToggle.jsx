import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle({
  showLabel = false,
  className = '',
  size = 'md'
}) {
  const { isDark, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'px-3 py-2 text-sm'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4 sm:w-4.5 sm:h-4.5',
    lg: 'w-5 h-5'
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className={`
        relative inline-flex items-center gap-2 rounded-lg font-medium cursor-pointer select-none
        transition-all duration-200
        ${isDark 
          ? 'bg-[#151B27] border border-[#1C2436] text-[#FFE500] hover:border-[#FFE500]/50 hover:bg-[#1C2436]' 
          : 'bg-[#F1F5F9] border border-[#CBD5E1] text-[#D97706] hover:border-[#D97706]/50 hover:bg-[#E2E8F0] shadow-xs'
        }
        ${sizeClasses[size] || sizeClasses.md}
        ${className}
      `}
    >
      <div className="relative flex items-center justify-center">
        {isDark ? (
          <Sun className={`${iconSizes[size] || iconSizes.md} transition-transform duration-300 rotate-0 scale-100 text-[#FFE500]`} strokeWidth={2.2} />
        ) : (
          <Moon className={`${iconSizes[size] || iconSizes.md} transition-transform duration-300 rotate-0 scale-100 text-[#475569]`} strokeWidth={2.2} />
        )}
      </div>

      {showLabel && (
        <span className={`text-xs font-semibold ${isDark ? 'text-[#F1F5F9]' : 'text-[#0F172A]'}`}>
          {isDark ? 'Modo Claro' : 'Modo Oscuro'}
        </span>
      )}
    </button>
  );
}

export default ThemeToggle;
