'use client';

import { useI18n } from '@/lib/i18n/provider';
import type { Locale } from '@/lib/i18n/types';
import { cn } from '@/lib/utils';

type LanguageSwitcherProps = {
  className?: string;
};

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();

  const options: Array<{ value: Locale; label: string }> = [
    { value: 'zh', label: t.common.switchToZh },
    { value: 'en', label: t.common.switchToEn },
  ];

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-[60] flex items-center gap-1 rounded-full border border-daiqing/15 bg-white/95 p-1 shadow-md backdrop-blur-md',
        className,
      )}
      role="group"
      aria-label={t.common.language}
    >
      {options.map((option) => {
        const active = locale === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setLocale(option.value)}
            aria-pressed={active}
            className={cn(
              'min-w-10 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              active
                ? 'bg-daiqing text-white'
                : 'text-daiqing/70 hover:bg-daiqing/8 hover:text-daiqing',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
