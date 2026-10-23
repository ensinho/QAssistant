import type { FC } from 'react';
import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  RefreshCw,
  Sparkles,
  Inbox,
  Flame,
} from 'lucide-react';
import type { TaskOpenProjectQA, UsuarioOpenProjectQA } from '../../../contratos/mensagens';
import { TaskCard } from './TaskCard';
import { TaskDetailModal } from './TaskDetailModal';
import { QuickCreateModal } from './QuickCreateModal';

type FiltroChip = 'todas' | 'minhas' | 'qa' | 'bugs' | 'andamento' | 'urgentes' | 'novas';

interface OpenProjectFeedProps {
  tasks: TaskOpenProjectQA[];
  usuarioAtual?: UsuarioOpenProjectQA;
  carregando: boolean;
  ultimaSincronizacao: string | null;
  projetoNome?: string;
  openProjectConectado?: boolean;
  aoIrParaConfig?: () => void;
  aoSincronizar: () => void;
  aoCriarTask: (params: { assunto: string; descricao?: string; tipoNome?: string }) => void;
  aoAlterarStatus: (taskId: string, statusHref: string, lockVersion: number) => void;
  aoAtribuirAMim: (taskId: string, lockVersion: number) => void;
  aoRegistrarTempo: (taskId: string, horas: string, comentario?: string) => void;
  aoAdicionarComentario: (taskId: string, texto: string) => void;
  aoAbrirTerminal: (task: TaskOpenProjectQA) => void;
  aoCopiarPrompt: (task: TaskOpenProjectQA) => void;
  aoAbrirNavegador: (task: TaskOpenProjectQA) => void;
  aoObterDetalhes: (taskId: string) => void;
}

export const OpenProjectFeed: FC<OpenProjectFeedProps> = ({
  tasks,
  usuarioAtual,
  carregando,
  ultimaSincronizacao,
  projetoNome,
  openProjectConectado = false,
  aoIrParaConfig,
  aoSincronizar,
  aoCriarTask,
  aoAlterarStatus,
  aoAtribuirAMim,
  aoRegistrarTempo,
  aoAdicionarComentario,
  aoAbrirTerminal,
  aoCopiarPrompt,
  aoAbrirNavegador,
  aoObterDetalhes,
}) => {
  const [busca, setBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroChip>('todas');
  const [taskSelecionada, setTaskSelecionada] = useState<TaskOpenProjectQA | null>(null);
  const [modalCriarAberto, setModalCriarAberto] = useState(false);

  // Contagens dos filtros
  const counts = useMemo(() => {
    let novas = 0;
    let minhas = 0;
    let qa = 0;
    let bugs = 0;
    let andamento = 0;
    let urgentes = 0;

    const nomeU = usuarioAtual?.nome?.toLowerCase();
    const loginU = usuarioAtual?.login?.toLowerCase();

    for (const t of tasks) {
      if (t.isNova) novas++;

      if (nomeU) {
        const resp = (t.responsavel || '').toLowerCase();
        if (resp === nomeU || resp === loginU || (resp.includes(nomeU) && nomeU.length > 2)) {
          minhas++;
        }
      } else if (t.responsavel) {
        minhas++;
      }

      if (t.tipo?.toLowerCase().includes('bug')) bugs++;

      const s = t.status.toLowerCase();
      if (s.includes('qa') || s.includes('teste') || s.includes('revis')) qa++;
      if (s.includes('andamento') || s.includes('progresso') || s.includes('desenvolv')) andamento++;

      const p = (t.prioridade || '').toLowerCase();
      if (p.includes('alt') || p.includes('urgent') || p.includes('imedi')) urgentes++;
    }

    return { novas, minhas, qa, bugs, andamento, urgentes };
  }, [tasks, usuarioAtual]);

  // Filtragem reativa
  const tasksFiltradas = useMemo(() => {
    return tasks.filter((task) => {
      if (busca.trim()) {
        const termo = busca.toLowerCase().trim();
        const bateuId = task.id.toLowerCase().includes(termo.replace('#', ''));
        const bateuAssunto = task.assunto.toLowerCase().includes(termo);
        const bateuResp = task.responsavel?.toLowerCase().includes(termo);
        if (!bateuId && !bateuAssunto && !bateuResp) return false;
      }

      if (filtroAtivo === 'novas') return !!task.isNova;
      if (filtroAtivo === 'bugs') return task.tipo?.toLowerCase().includes('bug');
      if (filtroAtivo === 'qa') {
        const s = task.status.toLowerCase();
        return s.includes('qa') || s.includes('teste') || s.includes('revis');
      }
      if (filtroAtivo === 'andamento') {
        const s = task.status.toLowerCase();
        return s.includes('andamento') || s.includes('progresso') || s.includes('desenvolv');
      }
      if (filtroAtivo === 'urgentes') {
        const p = (task.prioridade || '').toLowerCase();
        return p.includes('alt') || p.includes('urgent') || p.includes('imedi');
      }
      if (filtroAtivo === 'minhas') {
        if (usuarioAtual?.nome) {
          const nomeU = usuarioAtual.nome.toLowerCase();
          const loginU = (usuarioAtual.login || '').toLowerCase();
          const resp = (task.responsavel || '').toLowerCase();
          return resp === nomeU || resp === loginU || (resp.includes(nomeU) && nomeU.length > 2);
        }
        return !!task.responsavel;
      }

      return true;
    });
  }, [tasks, busca, filtroAtivo, usuarioAtual]);

  const handleSelecionarTask = (task: TaskOpenProjectQA) => {
    setTaskSelecionada(task);
    aoObterDetalhes(task.id);
  };

  const taskAtiva = useMemo(() => {
    if (!taskSelecionada) return null;
    return tasks.find((t) => t.id === taskSelecionada.id) || taskSelecionada;
  }, [tasks, taskSelecionada]);

  return (
    <div className="qa-feed-wrapper">
      {/* Barra de Busca + Ações Rápidas (Linha Única & Ultra Clean) */}
      <div className="qa-feed-toolbar">
        <div className="qa-feed-search-box">
          <Search size={13} className="qa-search-icon" />
          <input
            type="text"
            className="qa-search-input"
            placeholder="Buscar tarefas (#id, título, pessoa)..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          {busca && (
            <button
              type="button"
              className="qa-btn-clear-search"
              onClick={() => setBusca('')}
              title="Limpar busca"
            >
              ×
            </button>
          )}
        </div>

        <button
          type="button"
          className="qa-btn-nova-task"
          onClick={() => setModalCriarAberto(true)}
          title="Criar nova tarefa no OpenProject"
        >
          <Plus size={13} />
          <span className="qa-btn-nova-text">Nova</span>
        </button>

        <button
          type="button"
          className={`qa-btn-icon-subtle ${carregando ? 'qa-spin' : ''}`}
          onClick={aoSincronizar}
          title="Sincronizar agora com OpenProject"
          disabled={carregando}
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Chips de Filtros Rápidos com Scroll Suave Invisível */}
      <div className="qa-feed-filter-chips">
        <button
          type="button"
          className={`qa-chip ${filtroAtivo === 'todas' ? 'qa-chip-active' : ''}`}
          onClick={() => setFiltroAtivo('todas')}
        >
          Todas <span className="qa-chip-num">{tasks.length}</span>
        </button>

        {counts.novas > 0 && (
          <button
            type="button"
            className={`qa-chip qa-chip-novas ${filtroAtivo === 'novas' ? 'qa-chip-active' : ''}`}
            onClick={() => setFiltroAtivo('novas')}
          >
            <Sparkles size={11} />
            <span>Novas</span>
            <span className="qa-chip-num">{counts.novas}</span>
          </button>
        )}

        <button
          type="button"
          className={`qa-chip ${filtroAtivo === 'minhas' ? 'qa-chip-active' : ''}`}
          onClick={() => setFiltroAtivo('minhas')}
          title={usuarioAtual?.nome ? `Atribuídas a ${usuarioAtual.nome}` : 'Minhas tarefas'}
        >
          Minhas <span className="qa-chip-num">{counts.minhas}</span>
        </button>

        <button
          type="button"
          className={`qa-chip ${filtroAtivo === 'qa' ? 'qa-chip-active' : ''}`}
          onClick={() => setFiltroAtivo('qa')}
        >
          Para QA <span className="qa-chip-num">{counts.qa}</span>
        </button>

        <button
          type="button"
          className={`qa-chip ${filtroAtivo === 'bugs' ? 'qa-chip-active' : ''}`}
          onClick={() => setFiltroAtivo('bugs')}
        >
          Bugs <span className="qa-chip-num">{counts.bugs}</span>
        </button>

        <button
          type="button"
          className={`qa-chip ${filtroAtivo === 'andamento' ? 'qa-chip-active' : ''}`}
          onClick={() => setFiltroAtivo('andamento')}
        >
          Em Andamento <span className="qa-chip-num">{counts.andamento}</span>
        </button>

        {counts.urgentes > 0 && (
          <button
            type="button"
            className={`qa-chip qa-chip-urgente ${filtroAtivo === 'urgentes' ? 'qa-chip-active' : ''}`}
            onClick={() => setFiltroAtivo('urgentes')}
          >
            <Flame size={11} color="var(--qa-error)" />
            <span>Urgentes</span>
            <span className="qa-chip-num">{counts.urgentes}</span>
          </button>
        )}
      </div>

      {/* Banner Sutil de Novas Tarefas em Tempo Real */}
      {counts.novas > 0 && filtroAtivo !== 'novas' && (
        <div className="qa-live-banner" onClick={() => setFiltroAtivo('novas')}>
          <div className="qa-live-banner-left">
            <span className="qa-pulse-dot" />
            <span>
              <strong>{counts.novas}</strong> nova(s) tarefa(s) detectada(s)
            </span>
          </div>
          <span className="qa-live-banner-action">Ver novas →</span>
        </div>
      )}

      {/* Lista de Tarefas / Cards */}
      <div className="qa-task-list">
        {tasksFiltradas.length > 0 ? (
          tasksFiltradas.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              aoSelecionar={handleSelecionarTask}
              aoAbrirTerminal={aoAbrirTerminal}
              aoCopiarPrompt={aoCopiarPrompt}
              aoAbrirNavegador={aoAbrirNavegador}
            />
          ))
        ) : (
          <div className="qa-empty-state">
            <Inbox size={28} className="qa-empty-icon" />
            <h3 className="qa-empty-title">Nenhuma tarefa encontrada</h3>
            <p className="qa-empty-desc">
              {busca
                ? `Nenhum resultado para "${busca}".`
                : filtroAtivo !== 'todas'
                ? `Não há tarefas na categoria selecionada.`
                : !openProjectConectado
                ? 'Conecte sua conta do OpenProject para visualizar tarefas.'
                : 'Não há tarefas abertas no projeto selecionado.'}
            </p>
            {!openProjectConectado && aoIrParaConfig ? (
              <button
                type="button"
                className="qa-btn-action-primary"
                onClick={aoIrParaConfig}
                style={{ marginTop: 10 }}
              >
                Configurar Conexão
              </button>
            ) : (
              (busca || filtroAtivo !== 'todas') && (
                <button
                  type="button"
                  className="qa-btn-action-secondary"
                  onClick={() => {
                    setBusca('');
                    setFiltroAtivo('todas');
                  }}
                  style={{ marginTop: 10 }}
                >
                  Limpar Filtros
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* Rodapé informativo discreto */}
      <div className="qa-feed-footer-info">
        <span className="qa-sync-badge">
          <span className="qa-green-dot" />
          <span>LiveSync {projetoNome ? `(${projetoNome})` : ''}</span>
        </span>
        {ultimaSincronizacao && (
          <span className="qa-sync-time">
            {new Date(ultimaSincronizacao).toLocaleTimeString('pt-BR')}
          </span>
        )}
      </div>

      {/* Modais */}
      <TaskDetailModal
        task={taskAtiva}
        usuarioAtual={usuarioAtual}
        aberto={!!taskSelecionada}
        aoFechar={() => setTaskSelecionada(null)}
        aoAlterarStatus={aoAlterarStatus}
        aoAtribuirAMim={aoAtribuirAMim}
        aoRegistrarTempo={aoRegistrarTempo}
        aoAdicionarComentario={aoAdicionarComentario}
        aoAbrirTerminal={aoAbrirTerminal}
        aoCopiarPrompt={aoCopiarPrompt}
        aoAbrirNavegador={aoAbrirNavegador}
      />

      <QuickCreateModal
        aberto={modalCriarAberto}
        aoFechar={() => setModalCriarAberto(false)}
        aoCriar={aoCriarTask}
      />
    </div>
  );
};
