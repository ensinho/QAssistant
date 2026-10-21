import type { FC } from 'react';
import { useState, useMemo } from 'react';
import {
  Terminal,
  Copy,
  GitBranch,
  Bot,
  Play,
  CheckCircle,
  Sparkles,
  Command,
  Save,
  Rocket,
  Sliders,
  Settings2,
} from 'lucide-react';
import type { ConfiguracaoTerminalAgentes } from '@qassistant/nucleo';
import type { TaskOpenProjectQA } from '../../../contratos/mensagens';

export type FerramentaAgenteTipo = 'claude' | 'gemini' | 'aider' | 'custom' | 'nenhum';

interface TerminalAgentesAbaProps {
  tasks: TaskOpenProjectQA[];
  branchAtual?: string;
  configTerminal?: ConfiguracaoTerminalAgentes;
  aoAbrirTerminal: (task: TaskOpenProjectQA) => void;
  aoCopiarPrompt: (task: TaskOpenProjectQA) => void;
  aoExecutarComando: (comando: string) => void;
  aoSalvarConfigTerminal: (config: {
    padraoBranch: string;
    ferramentaAgente: FerramentaAgenteTipo;
    comandoCustomizado?: string;
  }) => void;
  aoExecutarAgenteComTask: (taskId: string, ferramenta: 'claude' | 'gemini' | 'aider' | 'custom') => void;
}

function sanitizarSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'tarefa';
}

function calcularNomeBranch(padrao: string, task?: TaskOpenProjectQA): string {
  if (!task) return 'feat/OP-123-exemplo-tarefa';
  const ehBug = task.tipo?.toLowerCase().includes('bug');
  const prefixoTipo = ehBug ? 'fix' : 'feat';
  const tipoBruto = task.tipo ? sanitizarSlug(task.tipo) : 'task';
  const slug = sanitizarSlug(task.assunto);
  const idLimpo = task.id.replace(/^#/, '');

  let branch = padrao
    .replace(/\{id\}/gi, idLimpo)
    .replace(/\{slug\}/gi, slug)
    .replace(/\{tipo\}/gi, prefixoTipo)
    .replace(/\{tipoBruto\}/gi, tipoBruto);

  branch = branch
    .replace(/[^a-zA-Z0-9_\-\.\/]/g, '-')
    .replace(/\/{2,}/g, '/')
    .replace(/^-+|-+$/g, '')
    .replace(/\/+$/g, '');

  return branch || `task/OP-${idLimpo}`;
}

export const TerminalAgentesAba: FC<TerminalAgentesAbaProps> = ({
  tasks,
  branchAtual,
  configTerminal,
  aoAbrirTerminal,
  aoCopiarPrompt,
  aoExecutarComando,
  aoSalvarConfigTerminal,
  aoExecutarAgenteComTask,
}) => {
  const [taskIdSelecionada, setTaskIdSelecionada] = useState<string>(tasks[0]?.id || '');
  const [padraoBranch, setPadraoBranch] = useState(
    configTerminal?.padraoBranch || '{tipo}/OP-{id}-{slug}'
  );
  const [ferramenta, setFerramenta] = useState<FerramentaAgenteTipo>(
    (configTerminal?.ferramentaAgente as FerramentaAgenteTipo) || 'claude'
  );
  const [comandoCustom, setComandoCustom] = useState(configTerminal?.comandoCustomizado || '');
  const [comandoAvulso, setComandoAvulso] = useState('');
  const [copiadoFeedback, setCopiadoFeedback] = useState(false);
  const [salvoFeedback, setSalvoFeedback] = useState(false);
  const [mostrarConfigAvancada, setMostrarConfigAvancada] = useState(false);

  const taskAtual = tasks.find((t) => t.id === taskIdSelecionada) || tasks[0];

  const branchPreview = useMemo(() => {
    return calcularNomeBranch(padraoBranch, taskAtual);
  }, [padraoBranch, taskAtual]);

  const handleCopiarPrompt = () => {
    if (!taskAtual) return;
    aoCopiarPrompt(taskAtual);
    setCopiadoFeedback(true);
    setTimeout(() => setCopiadoFeedback(false), 2000);
  };

  const handleSalvarConfiguracoes = () => {
    aoSalvarConfigTerminal({
      padraoBranch: padraoBranch.trim() || '{tipo}/OP-{id}-{slug}',
      ferramentaAgente: ferramenta,
      comandoCustomizado: comandoCustom.trim() || undefined,
    });
    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 2200);
  };

  const handleIniciarAgente = () => {
    if (!taskAtual) return;
    if (ferramenta === 'nenhum') {
      aoAbrirTerminal(taskAtual);
    } else {
      aoExecutarAgenteComTask(taskAtual.id, ferramenta);
    }
  };

  return (
    <div className="qa-terminal-panel">
      {/* Cabeçalho da Aba */}
      <div className="qa-panel-intro">
        <div className="qa-panel-intro-header">
          <Terminal size={18} className="qa-text-brand" />
          <h2 className="qa-panel-title">Terminal & Agentes de IA</h2>
        </div>
        <p className="qa-panel-desc">
          Orquestre branches Git automáticas e conecte tarefas do OpenProject ao seu agente CLI preferido
          (Claude Code, Gemini CLI, Aider ou terminal nativo).
        </p>
      </div>

      {/* Seleção de Tarefa em Foco */}
      <div className="qa-card-section">
        <label className="qa-section-label" htmlFor="select-task-agent">
          Tarefa Ativa no OpenProject
        </label>
        {tasks.length > 0 ? (
          <select
            id="select-task-agent"
            className="qa-form-select"
            value={taskAtual?.id || ''}
            onChange={(e) => setTaskIdSelecionada(e.target.value)}
          >
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                #{t.id} - {t.assunto} ({t.status})
              </option>
            ))}
          </select>
        ) : (
          <div className="qa-empty-text">Nenhuma tarefa encontrada no projeto atual.</div>
        )}

        {taskAtual && (
          <div className="qa-task-focus-card">
            <div className="qa-focus-title">
              <span className="qa-focus-id">#{taskAtual.id}</span>
              <span className="qa-focus-subject">{taskAtual.assunto}</span>
            </div>
            <div className="qa-focus-meta">
              <span>Status: <strong>{taskAtual.status}</strong></span>
              <span>Tipo: <strong>{taskAtual.tipo || 'Tarefa'}</strong></span>
              {taskAtual.responsavel && (
                <span>Resp: <strong>{taskAtual.responsavel}</strong></span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ação Principal: Agente em 1 Clique */}
      {taskAtual && (
        <div className="qa-card-section" style={{ borderLeft: '3px solid var(--qa-brand)' }}>
          <div className="qa-section-subtitle">
            <Rocket size={15} color="var(--qa-brand)" />
            <span>Executar com 1 Clique</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              className="qa-btn-action-primary"
              style={{ justifyContent: 'center', padding: '10px 14px', fontSize: '13px' }}
              onClick={handleIniciarAgente}
            >
              <Rocket size={15} />
              <span>
                {ferramenta === 'claude' && `Iniciar Claude Code com #${taskAtual.id}`}
                {ferramenta === 'gemini' && `Iniciar Gemini CLI com #${taskAtual.id}`}
                {ferramenta === 'aider' && `Iniciar Aider com #${taskAtual.id}`}
                {ferramenta === 'custom' && `Executar Agente Customizado com #${taskAtual.id}`}
                {ferramenta === 'nenhum' && `Criar Branch e Abrir Terminal`}
              </span>
            </button>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="qa-btn-action-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleCopiarPrompt}
              >
                {copiadoFeedback ? <CheckCircle size={13} color="var(--qa-success)" /> : <Copy size={13} />}
                <span>{copiadoFeedback ? 'Prompt Copiado!' : 'Copiar Contexto'}</span>
              </button>

              <button
                type="button"
                className="qa-btn-action-ghost"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => aoAbrirTerminal(taskAtual)}
                title="Apenas cria a branch e abre o terminal sem chamar o agente"
              >
                <GitBranch size={13} />
                <span>Apenas Branch Git</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Painel de Configurações de UX (Qual ferramenta você usa & Padrão de Branch) */}
      <div className="qa-card-section">
        <div
          className="qa-section-subtitle"
          style={{ cursor: 'pointer', justifyContent: 'space-between' }}
          onClick={() => setMostrarConfigAvancada(!mostrarConfigAvancada)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sliders size={15} />
            <span>Configurar Ferramenta & Padrão de Branch</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--qa-brand)' }}>
            {mostrarConfigAvancada ? 'Ocultar ▲' : 'Personalizar ▼'}
          </span>
        </div>

        {/* Pré-visualização da Branch gerada */}
        <div className="qa-branch-preview-row">
          <span className="qa-branch-preview-label">Branch a ser criada:</span>
          <code className="qa-branch-preview-code">
            git checkout -B {branchPreview}
          </code>
        </div>

        {mostrarConfigAvancada && (
          <div className="qa-config-terminal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
            {/* 1. Escolher Agente CLI */}
            <div className="qa-form-group">
              <label className="qa-form-label">
                <Bot size={13} />
                <span>Qual ferramenta de agente você utiliza?</span>
              </label>

              <div className="qa-agent-selector-grid">
                <button
                  type="button"
                  className={`qa-agent-option-card ${ferramenta === 'claude' ? 'qa-agent-option-active' : ''}`}
                  onClick={() => setFerramenta('claude')}
                >
                  <Bot size={16} color="#c084fc" />
                  <div className="qa-agent-opt-text">
                    <span className="qa-agent-opt-title">Claude Code</span>
                    <span className="qa-agent-opt-desc">Executa <code>claude</code> no terminal</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`qa-agent-option-card ${ferramenta === 'gemini' ? 'qa-agent-option-active' : ''}`}
                  onClick={() => setFerramenta('gemini')}
                >
                  <Sparkles size={16} color="#58e6e6" />
                  <div className="qa-agent-opt-text">
                    <span className="qa-agent-opt-title">Gemini CLI</span>
                    <span className="qa-agent-opt-desc">Executa <code>gemini</code> no terminal</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`qa-agent-option-card ${ferramenta === 'aider' ? 'qa-agent-option-active' : ''}`}
                  onClick={() => setFerramenta('aider')}
                >
                  <Terminal size={16} color="#4ec982" />
                  <div className="qa-agent-opt-text">
                    <span className="qa-agent-opt-title">Aider</span>
                    <span className="qa-agent-opt-desc">Executa <code>aider</code> no terminal</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`qa-agent-option-card ${ferramenta === 'custom' ? 'qa-agent-option-active' : ''}`}
                  onClick={() => setFerramenta('custom')}
                >
                  <Command size={16} color="#f0b85a" />
                  <div className="qa-agent-opt-text">
                    <span className="qa-agent-opt-title">Comando Custom</span>
                    <span className="qa-agent-opt-desc">Script ou comando CLI próprio</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`qa-agent-option-card ${ferramenta === 'nenhum' ? 'qa-agent-option-active' : ''}`}
                  onClick={() => setFerramenta('nenhum')}
                >
                  <GitBranch size={16} color="var(--qa-muted)" />
                  <div className="qa-agent-opt-text">
                    <span className="qa-agent-opt-title">Apenas Git</span>
                    <span className="qa-agent-opt-desc">Abre terminal só com branch</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Comando Customizado (se selecionado) */}
            {ferramenta === 'custom' && (
              <div className="qa-form-group">
                <label className="qa-form-label" htmlFor="custom-agent-cmd">
                  Template de Comando Customizado
                </label>
                <input
                  id="custom-agent-cmd"
                  type="text"
                  className="qa-form-input"
                  placeholder='Ex: my-agent run --task {id} "{prompt}"'
                  value={comandoCustom}
                  onChange={(e) => setComandoCustom(e.target.value)}
                />
                <span className="qa-subtle-hint">
                  Placeholders disponíveis: <code>&#123;id&#125;</code>, <code>&#123;assunto&#125;</code>, <code>&#123;branch&#125;</code>, <code>&#123;prompt&#125;</code>
                </span>
              </div>
            )}

            {/* 2. Padrão de Nome da Branch */}
            <div className="qa-form-group">
              <label className="qa-form-label" htmlFor="branch-pattern-input">
                <GitBranch size={13} />
                <span>Padrão de Nome da Branch Git</span>
              </label>
              <input
                id="branch-pattern-input"
                type="text"
                className="qa-form-input"
                placeholder="{tipo}/OP-{id}-{slug}"
                value={padraoBranch}
                onChange={(e) => setPadraoBranch(e.target.value)}
              />

              {/* Presets Rápidos */}
              <div className="qa-pattern-presets">
                <span style={{ fontSize: '10px', color: 'var(--qa-muted)' }}>Exemplos prontos:</span>
                <button
                  type="button"
                  className="qa-btn-preset-pill"
                  onClick={() => setPadraoBranch('{tipo}/OP-{id}-{slug}')}
                >
                  {'{tipo}/OP-{id}-{slug}'}
                </button>
                <button
                  type="button"
                  className="qa-btn-preset-pill"
                  onClick={() => setPadraoBranch('feature/{id}-{slug}')}
                >
                  {'feature/{id}-{slug}'}
                </button>
                <button
                  type="button"
                  className="qa-btn-preset-pill"
                  onClick={() => setPadraoBranch('task/OP-{id}')}
                >
                  {'task/OP-{id}'}
                </button>
                <button
                  type="button"
                  className="qa-btn-preset-pill"
                  onClick={() => setPadraoBranch('OP-{id}')}
                >
                  {'OP-{id}'}
                </button>
              </div>
            </div>

            {/* Botão de Salvar Preferências */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <button
                type="button"
                className="qa-btn-action-primary"
                onClick={handleSalvarConfiguracoes}
              >
                {salvoFeedback ? <CheckCircle size={13} /> : <Save size={13} />}
                <span>{salvoFeedback ? 'Preferências Salvas!' : 'Salvar Preferências'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comandos Rápidos no Terminal */}
      <div className="qa-card-section">
        <div className="qa-section-subtitle">
          <Command size={15} />
          <span>Atalhos Rápidos no Terminal</span>
        </div>

        <div className="qa-quick-commands-list">
          <button
            type="button"
            className="qa-btn-quick-cmd"
            onClick={() => aoExecutarComando('git status')}
          >
            <code>git status</code>
            <span>Verificar alterações</span>
          </button>

          <button
            type="button"
            className="qa-btn-quick-cmd"
            onClick={() => aoExecutarComando('npm test')}
          >
            <code>npm test</code>
            <span>Executar testes</span>
          </button>

          {taskAtual && (
            <button
              type="button"
              className="qa-btn-quick-cmd"
              onClick={() =>
                aoExecutarComando(
                  `git commit -m "${taskAtual.tipo?.toLowerCase().includes('bug') ? 'fix' : 'feat'}(#${taskAtual.id}): ${taskAtual.assunto.replace(/"/g, '\\"')}"`
                )
              }
            >
              <code>git commit -m &quot;...(#${taskAtual.id})&quot;</code>
              <span>Commit com ID</span>
            </button>
          )}
        </div>

        {/* Input de Comando Manual */}
        <div className="qa-custom-cmd-row">
          <input
            type="text"
            className="qa-form-input"
            placeholder="Digite qualquer comando bash para rodar no terminal..."
            value={comandoAvulso}
            onChange={(e) => setComandoAvulso(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && comandoAvulso.trim()) {
                aoExecutarComando(comandoAvulso.trim());
                setComandoAvulso('');
              }
            }}
          />
          <button
            type="button"
            className="qa-btn-action-primary"
            disabled={!comandoAvulso.trim()}
            onClick={() => {
              if (comandoAvulso.trim()) {
                aoExecutarComando(comandoAvulso.trim());
                setComandoAvulso('');
              }
            }}
          >
            <Play size={13} />
            <span>Executar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
