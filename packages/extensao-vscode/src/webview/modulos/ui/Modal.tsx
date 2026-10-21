import type { FC, ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  aberto: boolean;
  aoFechar: () => void;
  titulo?: ReactNode;
  children: ReactNode;
  larguraMaxima?: string;
}

export const Modal: FC<ModalProps> = ({
  aberto,
  aoFechar,
  titulo,
  children,
  larguraMaxima = '560px',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        aoFechar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  return (
    <div
      className="qa-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          aoFechar();
        }
      }}
    >
      <div
        ref={modalRef}
        className="qa-modal-card"
        style={{ maxWidth: larguraMaxima }}
        role="dialog"
        aria-modal="true"
      >
        <div className="qa-modal-header">
          <div className="qa-modal-title">{titulo}</div>
          <button
            type="button"
            className="qa-btn-icon-subtle"
            onClick={aoFechar}
            title="Fechar (Esc)"
          >
            <X size={16} />
          </button>
        </div>
        <div className="qa-modal-body">{children}</div>
      </div>
    </div>
  );
};
