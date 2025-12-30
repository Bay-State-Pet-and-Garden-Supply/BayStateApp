'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

interface CampaignBannerProps {
  message: string;
  linkText?: string;
  linkHref?: string;
  variant?: 'info' | 'promo' | 'seasonal';
}

const variantStyles = {
  info: 'bg-zinc-900 text-white',
  promo: 'bg-amber-500 text-zinc-900',
  seasonal: 'bg-green-600 text-white',
};

/**
 * CampaignBanner - Dismissible banner for promotions and announcements.
 * Controlled via admin panel.
 */
export function CampaignBanner({
  message,
  linkText,
  linkHref,
  variant = 'info',
}: CampaignBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  return (
    <div className={`${variantStyles[variant]} py-2.5 px-4`}>
      <div className="flex items-center justify-center gap-4 text-sm font-medium">
        <p>
          {message}
          {linkText && linkHref && (
            <>
              {' '}
              <a href={linkHref} className="underline underline-offset-2 hover:no-underline">
                {linkText}
              </a>
            </>
          )}
        </p>
        <button
          onClick={() => setIsDismissed(true)}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/10"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
