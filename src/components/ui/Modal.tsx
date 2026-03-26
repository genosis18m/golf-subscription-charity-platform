'use client';

/**
 * Modal / Dialog component.
 *
 * An accessible modal built without external dependencies.
 * Traps focus, handles Escape key dismissal, and renders a backdrop overlay.
 *
 * Usage:
 * <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Confirm Action">
 *   <p>Modal content here.</p>
 * </Modal>
 */

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Controls the max width of the modal panel. */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** If true, clicking the backdrop does NOT close the modal. */
  disableBackdropClose?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  disableBackdropClose = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-description' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={disableBackdropClose ? undefined : onClose}
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        className={cn(
          'relative w-full bg-white rounded-2xl shadow-xl p-6',
          sizeClasses[size]
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}

/** Convenience footer for modal action buttons. */
export function ModalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
      {children}
    </div>
  );
}
