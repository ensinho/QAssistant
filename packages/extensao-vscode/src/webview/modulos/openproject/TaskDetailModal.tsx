import type { FC } from 'react';
import { useState } from 'react';
import {
  Terminal,
  Copy,
  ExternalLink,
  User,
  Calendar,
  Send,
  MessageSquare,
  FileText,
  CheckCircle,
  Clock,
  UserCheck,
  Check,
} from 'lucide-react';
import type { TaskOpenProjectQA, UsuarioOpenProjectQA } from '../../../contratos/mensagens';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { MarkdownViewer } from '../ui/MarkdownViewer';

interface TaskDetailModalProps {
  task: TaskOpenProjectQA | null;
  usuarioAtual?: UsuarioOpenProjectQA;
  aberto: boolean;
  aoFechar: () => void;
  aoAlterarStatus: (taskId: string, statusHref: string, lockVersion: number) => void;
  aoAtribuirAMim?: (taskId: string, lockVersion: number) => void;
  aoRegistrarTempo?: (taskId: string, horas: string, comentario?: string) => void;
  aoAdicionarComentario: (taskId: string, texto: string) => void;
  aoAbrirTerminal: (task: TaskOpenProjectQA) => void;
  aoCopiarPrompt: (task: TaskOpenProjectQA) => void;
  aoAbrirNavegador: (task: TaskOpenProjectQA) => void;
}

export const TaskDetailModal: FC<TaskDetailModalProps> = ({
  task,
  usuarioAtual,
  aberto,
  aoFechar,
  aoAlterarStatus,
  aoAtribuirAMim,
  aoRegistrarTempo,
  aoAdicionarComentario,
  aoAbrirTerminal,
  aoCopiarPrompt,
  aoAbrirNavegador,
}) => {
  const [novoComentario, setNovoComentario] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [copiadoFeedback, setCopiadoFeedback] = useState(false);

  // Estado para registro de horas (Log Time)
  const [mostrarFormTempo, setMostrarFormTempo] = useState(false);
  const [horasInput, setHorasInput] = useState('1h');
  const [comentarioTempo, setComentarioTempo] = useState('');
  const [tempoFeedback, setTempoFeedback] = useState(false);

  if (!task) return null;

  const handleEnviarComentario = () => {
    if (!novoComentario.trim() || enviandoComentario) return;
    setEnviandoComentario(true);
    aoAdicionarComentario(task.id, novoComentario.trim());
    setNovoComentario('');
    setEnviandoComentario(false);
  };

  const handleCopiarPrompt = () => {
    aoCopiarPrompt(task);
    setCopiadoFeedback(true);
    setTimeout(() => setCopiadoFeedback(false), 2000);
  };

  const handleAtribuirAMim = () => {
    if (aoAtribuirAMim && task.lockVersion !== undefined) {
      aoAtribuirAMim(task.id, task.lockVersion);
    }
  };

  const handleSalvarTempo = () => {
    if (!horasInput.trim() || !aoRegistrarTempo) return;
    aoRegistrarTempo(task.id, horasInput.trim(), comentarioTempo.trim());
    setTempoFeedback(true);
    setTimeout(() => {
      setTempoFeedback(false);
      setMostrarFormTempo(false);
      setComentarioTempo('');
    }, 1500);
  };

  const ehMeuResponsavel =
    usuarioAtual?.nome &&
    task.responsavel &&
    (task.responsavel.toLowerCase() === usuarioAtual.nome.toLowerCase() ||
      task.responsavel.toLowerCase() === (usuarioAtual.login || '').toLowerCase());

  const statusesDisponiveis = task.statusesDisponiveis || [];

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      larguraMaxima="680px"
      titulo={
        <div className="qa-modal-task-title-group">
          <span className="qa-modal-task-id">#{task.id}</span>
          <span className="qa-modal-task-subject">{task.assunto}</span>
        </div>
      }
    >
      <div className="qa-task-detail-container">
        {/* Barra de Ações Rápidas */}
        <div className="qa-detail-actions-bar">
          <button
            type="button"
            className="qa-btn-action-primary"
            onClick={() => aoAbrirTerminal(task)}
            title="Cria a branch no Git e abre o terminal no VS Code"
          >
            <Terminal size={14} />
            <span>Criar Branch & Abrir Terminal</span>
          </button>

          {!ehMeuResponsavel && aoAtribuirAMim && task.lockVersion !== undefined && (
            <button
              type="button"
              className="qa-btn-action-secondary"
              onClick={handleAtribuirAMim}
              title="Atribuir esta tarefa a você no OpenProject"
            >
              <UserCheck size={14} />
              <span>Atribuir a Mim</span>
            </button>
          )}

          <button
            type="button"
            className={`qa-btn-action-secondary ${mostrarFormTempo ? 'ativo' : ''}`}
            onClick={() => setMostrarFormTempo(!mostrarFormTempo)}
            title="Registrar horas trabalhadas (Log Time) nesta tarefa"
          >
            <Clock size={14} />
            <span>Apontar Horas</span>
          </button>

          <button
            type="button"
            className="qa-btn-action-secondary"
            onClick={handleCopiarPrompt}
            title="Copia o contexto da tarefa formatado para agentes CLI"
          >
            {copiadoFeedback ? <CheckCircle size={14} color="var(--qa-success)" /> : <Copy size={14} />}
            <span>{copiadoFeedback ? 'Copiado!' : 'Copiar para Agente'}</span>
          </button>

          <button
            type="button"
            className="qa-btn-action-ghost"
            onClick={() => aoAbrirNavegador(task)}
            title="Abrir no OpenProject"
          >
            <ExternalLink size={14} />
            <span>Abrir no Browser</span>
          </button>
        </div>

        {/* Formulário Retrátil de Apontamento de Horas (Log Time) */}
        {mostrarFormTempo && (
          <div className="qa-log-time-card">
            <div className="qa-section-subtitle">
              <Clock size={13} className="qa-text-brand" />
              <span>Apontamento de Horas no OpenProject</span>
            </div>
            <div className="qa-log-time-row">
              <div className="qa-form-group" style={{ width: '100px' }}>
                <label className="qa-form-label">Horas</label>
                <input
                  type="text"
                  className="qa-form-input"
                  placeholder="ex: 1.5 ou 2h"
                  value={horasInput}
                  onChange={(e) => setHorasInput(e.target.value)}
                />
              </div>

              <div className="qa-form-group" style={{ flex: 1 }}>
                <label className="qa-form-label">Comentário da Atividade (opcional)</label>
                <input
                  type="text"
                  className="qa-form-input"
                  placeholder="ex: Validação QA e testes automatizados..."
                  value={comentarioTempo}
                  onChange={(e) => setComentarioTempo(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="qa-btn-action-primary"
                style={{ alignSelf: 'flex-end', height: '28px' }}
                onClick={handleSalvarTempo}
                disabled={tempoFeedback}
              >
                {tempoFeedback ? <Check size={13} /> : <Send size={13} />}
                <span>{tempoFeedback ? 'Registrado!' : 'Salvar'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Metadados e Alteração de Status */}
        <div className="qa-detail-meta-grid">
          <div className="qa-meta-field">
            <span className="qa-meta-label">Status</span>
            {statusesDisponiveis.length > 0 && task.lockVersion !== undefined ? (
              <select
                className="qa-select-status"
                value={task.statusHref || ''}
                onChange={(e) => {
                  const href = e.target.value;
                  if (href && task.lockVersion !== undefined) {
                    aoAlterarStatus(task.id, href, task.lockVersion);
                  }
                }}
              >
                {statusesDisponiveis.map((s) => (
                  <option key={s.id} value={s.href}>
                    {s.nome}
                  </option>
                ))}
              </select>
            ) : (
              <Badge variante="info">{task.status}</Badge>
            )}
          </div>

          <div className="qa-meta-field">
            <span className="qa-meta-label">Tipo</span>
            <span className="qa-meta-value">{task.tipo || 'Tarefa'}</span>
          </div>

          <div className="qa-meta-field">
            <span className="qa-meta-label">Responsável</span>
            <span className="qa-meta-value">
              <User size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              {task.responsavel || 'Não atribuído'}
              {ehMeuResponsavel && <span className="qa-badge-me">(Você)</span>}
            </span>
          </div>

          <div className="qa-meta-field">
            <span className="qa-meta-label">Prioridade</span>
            <span className="qa-meta-value">{task.prioridade || 'Normal'}</span>
          </div>
        </div>

        {/* Descrição */}
        <div className="qa-detail-section">
          <div className="qa-section-header">
            <FileText size={14} />
            <span>Descrição</span>
          </div>
          <div className="qa-detail-description">
            {task.descricaoMarkdown ? (
              <MarkdownViewer conteudo={task.descricaoMarkdown} />
            ) : (
              <span className="qa-empty-text">Esta tarefa não possui descrição detalhada.</span>
            )}
          </div>
        </div>

        {/* Comentários / Timeline */}
        <div className="qa-detail-section">
          <div className="qa-section-header">
            <MessageSquare size={14} />
            <span>Comentários & Histórico ({task.comentarios?.length || 0})</span>
          </div>

          <div className="qa-comments-timeline">
            {task.comentarios && task.comentarios.length > 0 ? (
              task.comentarios.map((c, i) => (
                <div key={i} className="qa-comment-card">
                  <div className="qa-comment-header">
                    <span className="qa-comment-author">{c.autor}</span>
                    <span className="qa-comment-date">{c.dataCriacao}</span>
                  </div>
                  <div className="qa-comment-body">
                    <MarkdownViewer conteudo={c.texto} />
                  </div>
                </div>
              ))
            ) : (
              <span className="qa-empty-text">Nenhum comentário registrado ainda.</span>
            )}
          </div>

          {/* Campo para Novo Comentário */}
          <div className="qa-new-comment-box">
            <textarea
              className="qa-comment-textarea"
              placeholder="Escreva um comentário (suporta Markdown)..."
              rows={3}
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
              disabled={enviandoComentario}
            />
            <div className="qa-comment-actions">
              <button
                type="button"
                className="qa-btn-action-primary"
                onClick={handleEnviarComentario}
                disabled={!novoComentario.trim() || enviandoComentario}
              >
                <Send size={13} />
                <span>{enviandoComentario ? 'Enviando...' : 'Comentar'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
