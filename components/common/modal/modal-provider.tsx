'use client';

import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

import { GlobalModal } from './global-modal';

interface ModalOptions {
  content: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdrop?: boolean;
}

interface ModalContextType {
  openModal: (content: ReactNode, options?: Omit<ModalOptions, 'content'>) => void;
  closeModal: () => void;
  isModalOpen: boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [modal, setModal] = useState<ModalOptions | null>(null);

  const openModal = useCallback((content: ReactNode, options?: Omit<ModalOptions, 'content'>) => {
    setModal({
      content,
      size: options?.size ?? 'md',
      closeOnBackdrop: options?.closeOnBackdrop ?? true,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  return (
    <ModalContext.Provider
      value={{
        openModal,
        closeModal,
        isModalOpen: Boolean(modal),
      }}
    >
      {children}

      {modal && (
        <GlobalModal
          content={modal.content}
          size={modal.size}
          closeOnBackdrop={modal.closeOnBackdrop}
          onClose={closeModal}
        />
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error('useModal must be used inside ModalProvider');
  }

  return context;
}
