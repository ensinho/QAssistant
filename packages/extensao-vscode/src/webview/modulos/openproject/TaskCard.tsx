import type { FC, MouseEvent } from 'react';
import { Terminal, Copy, ExternalLink, User, Flame, Sparkles } from 'lucide-react';
import type { TaskOpenProjectQA } from '../../../contratos/mensagens';

interface TaskCardProps {
  task: TaskOpenProjectQA;
  aoSelecionar: (task: TaskOpenProjectQA) => void;
  aoAbrirTerminal: (task: TaskOpenProjectQA) => void;
  aoCopiarPrompt: (task: TaskOpenProjectQA) => void;
  aoAbrirNavegador: (task: TaskOpenProjectQA) => void;
}

function obterStatusClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('fech') || s.includes('conclu') || s.includes('resolv') || s.includes('final')) {
    return 'concluido';
  }
  if (s.includes('andamento') || s.includes('progresso') || s.includes('desenvolv')) {
    return 'andamento';
  }
  if (s.includes('bloque') || s.includes('imped') || s.includes('rejeit')) {
    return 'bloqueado';
  }
  if (s.includes('qa') || s.includes('teste') || s.includes('revis') || s.includes('aguard')) {
    return 'aguardando';
  }
  if (s.includes('novo') || s.includes('nova') || s.includes('abert')) {
    return 'novo';
  }
  return 'default';
}

function ehUrgente(prioridade?: string): boolean {
  if (!prioridade) return false;
  const p = prioridade.toLowerCase();
  return p.includes('alt') || p.includes('urgent') || p.includes('imedi');
}

export const TaskCard: FC<TaskCardProps> = ({
  task,
  aoSelecionar,
  aoAbrirTerminal,
  aoCopiarPrompt,
  aoAbrirNavegador,
}) => {
  const ehBug = task.tipo?.toLowerCase().includes('bug');
  const urgente = ehUrgente(task.prioridade);
  const statusClass = obterStatusClass(task.status);

  const handleClickAcao = (e: MouseEvent, acao: () => void) => {
    e.stopPropagation();
    acao();
  };

  return (
    <div
      className={`qa-task-card qa-task-card-${statusClass} ${task.isNova ? 'is-nova' : ''}`}
      onClick={() => aoSelecionar(task)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          aoSelecionar(task);
        }
      }}
    >
      {/* Topo do Card: ID, Tipo, Urgência e Status */}
      <div className="qa-card-top-row">
        <div className="qa-card-meta-left">
          <span className="qa-card-id">#{task.id}</span>

          {task.isNova && (
            <span className="qa-tag-nova">
              <Sparkles size={9} />
              <span>Nova</span>
            </span>
          )}

          {task.tipo && (
            <span className={`qa-card-type-tag ${ehBug ? 'is-bug' : ''}`}>
              {task.tipo}
            </span>
          )}

          {urgente && (
            <span className="qa-tag-urgente" title={`Prioridade: ${task.prioridade}`}>
              <Flame size={10} />
            </span>
          )}
        </div>

        {/* Status com Indicador Redondo e Texto */}
        <div className={`qa-status-pill qa-status-${statusClass}`} title={`Status: ${task.status}`}>
          <span className="qa-status-dot" />
          <span className="qa-status-label">{task.status}</span>
        </div>
      </div>

      {/* Título / Assunto */}
      <div className="qa-card-subject" title={task.assunto}>
        {task.assunto}
      </div>

      {/* Rodapé do Card: Responsável + Ações Rápidas em Linha Única */}
      <div className="qa-card-bottom-row">
        <div className="qa-card-assignee" title={`Responsável: ${task.responsavel || 'Não atribuído'}`}>
          <User size={11} className="qa-assignee-icon" />
          <span className={`qa-assignee-name ${!task.responsavel ? 'is-unassigned' : ''}`}>
            {task.responsavel || 'Não atribuído'}
          </span>
        </div>

        <div className="qa-card-actions-group">
          <button
            type="button"
            className="qa-card-btn-terminal"
            title="Criar branch Git e abrir terminal no VS Code"
            onClick={(e) => handleClickAcao(e, () => aoAbrirTerminal(task))}
          >
            <Terminal size={11} />
            <span className="qa-btn-label">Terminal</span>
          </button>

          <button
            type="button"
            className="qa-card-btn-icon"
            title="Copiar prompt da task para Agentes CLI"
            onClick={(e) => handleClickAcao(e, () => aoCopiarPrompt(task))}
          >
            <Copy size={11} />
          </button>

          <button
            type="button"
            className="qa-card-btn-icon"
            title="Abrir no OpenProject (navegador)"
            onClick={(e) => handleClickAcao(e, () => aoAbrirNavegador(task))}
          >
            <ExternalLink size={11} />
          </button>
        </div>
      </div>
    </div>
  );
};
