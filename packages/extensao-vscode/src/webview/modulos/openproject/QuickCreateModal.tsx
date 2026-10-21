import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { PlusCircle, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';

interface QuickCreateModalProps {
  aberto: boolean;
  aoFechar: () => void;
  aoCriar: (params: { assunto: string; descricao?: string; tipoNome?: string }) => void;
}

export const QuickCreateModal: FC<QuickCreateModalProps> = ({
  aberto,
  aoFechar,
  aoCriar,
}) => {
  const [assunto, setAssunto] = useState('');
  const [tipoNome, setTipoNome] = useState('Task');
  const [descricao, setDescricao] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!assunto.trim()) {
      setErro('Informe o assunto da tarefa.');
      return;
    }

    aoCriar({
      assunto: assunto.trim(),
      tipoNome,
      descricao: descricao.trim() || undefined,
    });

    setAssunto('');
    setDescricao('');
    setErro(null);
    aoFechar();
  };

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      larguraMaxima="540px"
      titulo={
        <div className="qa-modal-title-with-icon">
          <PlusCircle size={16} />
          <span>Nova Tarefa no OpenProject</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="qa-quick-create-form">
        {erro && (
          <div className="qa-form-error-banner">
            <AlertCircle size={14} />
            <span>{erro}</span>
          </div>
        )}

        <div className="qa-form-group">
          <label className="qa-form-label" htmlFor="task-subject">
            Assunto / Título *
          </label>
          <input
            id="task-subject"
            type="text"
            className="qa-form-input"
            placeholder="Ex: Corrigir validação de e-mail no checkout"
            value={assunto}
            onChange={(e) => {
              setAssunto(e.target.value);
              if (erro) setErro(null);
            }}
            autoFocus
          />
        </div>

        <div className="qa-form-group">
          <label className="qa-form-label" htmlFor="task-type">
            Tipo de Item
          </label>
          <select
            id="task-type"
            className="qa-form-select"
            value={tipoNome}
            onChange={(e) => setTipoNome(e.target.value)}
          >
            <option value="Task">Tarefa (Task)</option>
            <option value="Bug">Bug / Defeito</option>
            <option value="Feature">Funcionalidade (Feature)</option>
            <option value="User story">User Story</option>
          </select>
        </div>

        <div className="qa-form-group">
          <label className="qa-form-label" htmlFor="task-desc">
            Descrição (opcional)
          </label>
          <textarea
            id="task-desc"
            className="qa-form-textarea"
            placeholder="Descreva detalhes, passos para reproduzir ou critérios de aceite..."
            rows={4}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>

        <div className="qa-form-actions">
          <button type="button" className="qa-btn-action-ghost" onClick={aoFechar}>
            Cancelar
          </button>
          <button type="submit" className="qa-btn-action-primary">
            <span>Criar no OpenProject</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
