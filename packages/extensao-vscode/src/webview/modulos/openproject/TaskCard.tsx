import type { FC, MouseEvent } from 'react';
import { Terminal, Copy, ExternalLink, User, AlertCircle, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import type { TaskOpenProjectQA } from '../../../contratos/mensagens';
import { Badge, type VarianteBadge } from '../ui/Badge';

interface TaskCardProps {
  task: TaskOpenProjectQA;
  aoSelecionar: (task: TaskOpenProjectQA) => void;
  aoAbrirTerminal: (task: TaskOpenProjectQA) => void;
  aoCopiarPrompt: (task: TaskOpenProjectQA) => void;
  aoAbrirNavegador: (task: TaskOpenProjectQA) => void;
}

function obterVarianteStatus(status: string): VarianteBadge {
  const s = status.toLowerCase();
  if (s.includes('fech') || s.includes('conclu') || s.includes('resolv') || s.includes('final')) {
    return 'sucesso';
  }
  if (s.includes('andamento') || s.includes('progresso') || s.includes('desenvolv')) {
    return 'info';
  }
  if (s.includes('bloque') || s.includes('imped') || s.includes('rejeit')) {
    return 'erro';
  }
  if (s.includes('qa') || s.includes('teste') || s.includes('revis') || s.includes('aguard')) {
    return 'aviso';
  }
  if (s.includes('novo') || s.includes('nova') || s.includes('abert')) {
    return 'roxo';
  }
  return 'default';
}

function obterVariantePrioridade(prioridade?: string): VarianteBadge {
  if (!prioridade) return 'default';
  const p = prioridade.toLowerCase();
  if (p.includes('alt') || p.includes('urgent') || p.includes('imedi')) return 'erro';
  if (p.includes('baix')) return 'default';
  return 'aviso';
}

export const TaskCard: FC<TaskCardProps> = ({
  task,
  aoSelecionar,
  aoAbrirTerminal,
  aoCopiarPrompt,
  aoAbrirNavegador,
}) => {
  const ehBug = task.tipo?.toLowerCase().includes('bug');
  const statusVariante = obterVarianteStatus(task.status);
  const prioridadeVariante = obterVariantePrioridade(task.prioridade);

  const handleClickAcao = (e: MouseEvent, acao: () => void) => {
    e.stopPropagation();
    acao();
  };

  return (
    <div
      className={`qa-task-card ${task.isNova ? 'qa-task-card-nova' : ''}`}
      onClick={() => aoSelecionar(task)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          aoSelecionar(task);
        }
      }}
    >
      <div className="qa-task-card-header">
        <div className="qa-task-card-ids">
          <span className="qa-task-id">#{task.id}</span>
          {task.isNova && (
            <Badge variante="nova" icone={<Sparkles size={10} />}>
              NOVA
            </Badge>
          )}
          {task.tipo && (
            <Badge variante={ehBug ? 'erro' : 'default'}>
              {task.tipo}
            </Badge>
          )}
        </div>

        <div className="qa-task-card-badges">
          <Badge variante={statusVariante}>
            {task.status}
          </Badge>
          {task.prioridade && task.prioridade !== 'Normal' && (
            <Badge variante={prioridadeVariante}>
              {task.prioridade}
            </Badge>
          )}
        </div>
      </div>

      <div className="qa-task-subject" title={task.assunto}>
        {task.assunto}
      </div>

      <div className="qa-task-card-footer">
        <div className="qa-task-meta">
          {task.responsavel ? (
            <span className="qa-task-meta-item" title={`Responsável: ${task.responsavel}`}>
              <User size={12} />
              <span>{task.responsavel}</span>
            </span>
          ) : (
            <span className="qa-task-meta-item qa-task-meta-unassigned">
              <User size={12} />
              <span>Não atribuído</span>
            </span>
          )}
        </div>

        <div className="qa-task-quick-actions">
          <button
            type="button"
            className="qa-btn-action-pill"
            title="Criar branch e abrir terminal no VS Code"
            onClick={(e) => handleClickAcao(e, () => aoAbrirTerminal(task))}
          >
            <Terminal size={12} />
            <span>Terminal</span>
          </button>

          <button
            type="button"
            className="qa-btn-action-icon"
            title="Copiar prompt da task para Agente CLI (Claude, Gemini, etc)"
            onClick={(e) => handleClickAcao(e, () => aoCopiarPrompt(task))}
          >
            <Copy size={12} />
          </button>

          <button
            type="button"
            className="qa-btn-action-icon"
            title="Abrir no OpenProject (navegador)"
            onClick={(e) => handleClickAcao(e, () => aoAbrirNavegador(task))}
          >
            <ExternalLink size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
