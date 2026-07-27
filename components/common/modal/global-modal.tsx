'use client';

import { X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';

interface GlobalModalProps {
  content: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdrop?: boolean;
  onClose: () => void;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function GlobalModal({
  content,
  size = 'md',
  closeOnBackdrop = true,
  onClose,
}: GlobalModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleBackdropClick = () => {
    if (closeOnBackdrop) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center p-4"
      onMouseDown={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        className={`
          relative
          z-10
          w-full
          ${sizeClasses[size]}
          rounded-xl
          border
          border-line
          bg-gray-900
          shadow-2xl
          animate-in
          fade-in
          zoom-in-95
          duration-200
        `}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="p
            absolute
            right-4
            top-4
            z-20
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            border
            border-line
            bg-gray-900/80
            text-ink-muted
            transition-colors
            hover:border-synth
            hover:text-ink
          "
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="p-6">{content}</div>
      </div>
    </div>
  );
}
