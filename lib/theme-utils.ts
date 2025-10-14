/**
 * Standard theme utility for consistent UI across all pages
 * Based on STYLE.md guidelines
 */

export interface ThemeClasses {
  background: string;
  text: string;
  secondaryText: string;
  mutedText: string;
  card: string;
  cardHover: string;
  button: string;
  outlineButton: string;
  accent: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  input: string;
  select: string;
}

export const getStandardThemeClasses = (theme: 'light' | 'dark'): ThemeClasses => {
  if (theme === 'light') {
    return {
      background: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
      text: 'theme-text-primary',
      secondaryText: 'theme-text-secondary',
      mutedText: 'theme-text-muted',
      card: 'theme-bg-elevated border-gray-200/50',
      cardHover: 'hover:shadow-lg transition-all duration-300',
      button: 'theme-button-primary',
      outlineButton: 'theme-button-secondary',
      accent: 'theme-brand-primary',
      error: 'theme-status-error',
      success: 'theme-status-success',
      warning: 'theme-status-warning',
      info: 'theme-status-info',
      input: 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-500',
      select: 'bg-white border-gray-200 text-gray-900',
    };
  }

  // Dark theme
  return {
    background: 'theme-gradient-hero',
    text: 'theme-text-primary',
    secondaryText: 'theme-text-secondary',
    mutedText: 'theme-text-muted',
    card: 'theme-surface-elevated border-white/20',
    cardHover: 'hover:shadow-xl transition-all duration-300',
    button: 'theme-button-primary',
    outlineButton: 'theme-button-secondary',
    accent: 'theme-brand-primary',
    error: 'theme-status-error',
    success: 'theme-status-success',
    warning: 'theme-status-warning',
    info: 'theme-status-info',
    input: 'theme-surface-elevated border-white/20 text-white placeholder:text-gray-400',
    select: 'theme-surface-elevated border-white/20 text-white',
  };
};
