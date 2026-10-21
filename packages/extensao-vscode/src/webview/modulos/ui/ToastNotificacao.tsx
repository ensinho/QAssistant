import type { FC } from 'react';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import type { TaskOpenProjectQA } from '../../../contratos/mensagens';

export interface ToastNotificacaoItem {
  id: string;
  tipo: 'nova-task' | 'info' | 'erro';
  titulo: string;
  mensagem: string;
  task?: TaskOpenProjectQA;
}

interface ToastNotificacaoProps {
  toasts: ToastNotificacaoItem[];
  aoDispensar: (id: string) => void;
  aoAbrirTask?: (task: TaskOpenProjectQA) => void;
}

export const ToastNotificacaoContainer: FC<ToastNotificacaoProps> = ({
  toasts,
  aoDispensar,
  aoAbrirTask,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="qa-toast-stack">
      {toasts.map((toast) => (
        <div key={toast.id} className={`qa-toast-card qa-toast-${toast.tipo}`}>
          <div className="qa-toast-icon">
            <Sparkles size={16} />
          </div>
          <div className="qa-toast-content">
            <div className="qa-toast-title">{toast.titulo}</div>
            <div className="qa-toast-msg">{toast.mensagem}</div>
            {toast.task && aoAbrirTask && (
              <button
                type="button"
                className="qa-toast-action-btn"
                onClick={() => {
                  aoAbrirTask(toast.task!);
                  aoDispensar(toast.id);
                }}
              >
                <span>Inspecionar #{toast.task.id}</span>
                <ArrowRight size={12} />
              </button>
            )}
          </div>
          <button
            type="button"
            className="qa-toast-close-btn"
            onClick={() => aoDispensar(toast.id)}
            title="Fechar"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
