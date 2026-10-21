import type { FC } from 'react';
import { useState, useMemo } from 'react';
import {
  Play,
  CheckCircle,
  XCircle,
  RotateCcw,
  Terminal,
  FileCheck,
  Send,
  FileCode,
  FolderOpen,
  RefreshCw,
  Plus,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles,
  Sliders,
} from 'lucide-react';
import type {
  ExecucaoTestes,
  ScriptQAInfo,
  TaskOpenProjectQA,
} from '../../../contratos/mensagens';

interface TestesRunnerViewProps {
  execucao?: ExecucaoTestes;
  scripts?: ScriptQAInfo[];
  pastaScripts?: string;
  tasks: TaskOpenProjectQA[];
  aoExecutarTeste: (categoria: string) => void;
  aoExecutarScript: (caminhoRelativo: string, args?: string, noTerminal?: boolean) => void;
  aoAbrirScriptNoEditor: (caminhoRelativo: string) => void;
  aoListarScripts: (pasta?: string) => void;
  aoSelecionarArquivoScript: () => void;
  aoSelecionarPastaScripts: () => void;
  aoCriarScriptExemplo: (nome?: string) => void;
  aoLimparHistorico: () => void;
  aoPublicarNoOpenProject: (taskId: string, texto: string) => void;
}

export const TestesRunnerView: FC<TestesRunnerViewProps> = ({
  execucao,
  scripts = [],
  pastaScripts = '',
  tasks,
  aoExecutarTeste,
  aoExecutarScript,
  aoAbrirScriptNoEditor,
  aoListarScripts,
  aoSelecionarArquivoScript,
  aoSelecionarPastaScripts,
  aoCriarScriptExemplo,
  aoLimparHistorico,
  aoPublicarNoOpenProject,
}) => {
  const [modo, setModo] = useState<'scripts' | 'suite'>('scripts');
  const [categoria, setCategoria] = useState('unidade');
  const [taskIdParaPublicar, setTaskIdParaPublicar] = useState(tasks[0]?.id || '');
  const [feedbackPublicado, setFeedbackPublicado] = useState(false);
  const [scriptArgs, setScriptArgs] = useState<Record<string, string>>({});
  const [scriptAtivo, setScriptAtivo] = useState<string>('');

  const status = execucao?.status || 'ocioso';
  const executando = status === 'executando';

  const handleArgChange = (caminho: string, valor: string) => {
    setScriptArgs((prev) => ({ ...prev, [caminho]: valor }));
  };

  const handleExecutarScript = (caminhoRelativo: string, noTerminal: boolean = false) => {
    setScriptAtivo(caminhoRelativo);
    aoExecutarScript(caminhoRelativo, scriptArgs[caminhoRelativo] || '', noTerminal);
  };

  const handlePublicarResultado = () => {
    if (!taskIdParaPublicar || !execucao) return;
    const alvo = execucao.nomeExecucao || execucao.categoriaAtiva || 'QA Runner';
    const iconeResultado = execucao.errosCount === 0 && execucao.status === 'sucesso' ? '✅ Aprovado' : '❌ Falhou';
    const trechoLog = execucao.logs ? execucao.logs.slice(-800) : 'Sem logs disponíveis.';

    const texto = `### Relatório de Execução QA (${alvo})\n- **Status**: ${iconeResultado}\n- **Métricas**: ${execucao.sucessosCount} sucessos, ${execucao.errosCount} erros (total: ${execucao.totalCount})\n\n\`\`\`bash\n${trechoLog}\n\`\`\``;

    aoPublicarNoOpenProject(taskIdParaPublicar, texto);
    setFeedbackPublicado(true);
    setTimeout(() => setFeedbackPublicado(false), 3000);
  };

  return (
    <div className="qa-testes-panel">
      {/* Cabeçalho */}
      <div className="qa-panel-intro">
        <div className="qa-panel-intro-header">
          <FileCheck size={18} className="qa-text-brand" />
          <h2 className="qa-panel-title">QA Runner & Scripts de Validação</h2>
        </div>
        <p className="qa-panel-desc">
          Descubra e execute scripts do repositório (ex: <code>verify.sh</code>, <code>test.sh</code>)
          ou suítes de teste, com logs em tempo real e publicação direta em tarefas do OpenProject.
        </p>
      </div>

      {/* Seletor de Modo / Sub-abas */}
      <div className="qa-testes-subtabs">
        <button
          type="button"
          className={`qa-testes-subtab-btn ${modo === 'scripts' ? 'ativo' : ''}`}
          onClick={() => setModo('scripts')}
        >
          <FileCode size={13} />
          <span>Scripts Shell (.sh / verify)</span>
          {scripts.length > 0 && <span className="qa-tab-badge">{scripts.length}</span>}
        </button>

        <button
          type="button"
          className={`qa-testes-subtab-btn ${modo === 'suite' ? 'ativo' : ''}`}
          onClick={() => setModo('suite')}
        >
          <Layers size={13} />
          <span>Suíte de Testes (npm)</span>
        </button>
      </div>

      {/* ABA: SCRIPTS (.sh / verify) */}
      {modo === 'scripts' && (
        <div className="qa-card-section">
          {/* Barra de Ferramentas dos Scripts */}
          <div className="qa-scripts-toolbar">
            <div className="qa-scripts-path-info" title={`Pasta atual: ${pastaScripts || './'}`}>
              <FolderOpen size={13} className="qa-text-muted" />
              <span className="qa-scripts-path-label">
                Pasta: <strong>{pastaScripts ? `./${pastaScripts}` : './'}</strong>
              </span>
            </div>

            <div className="qa-scripts-actions">
              <button
                type="button"
                className="qa-btn-icon-subtle"
                onClick={() => aoListarScripts(pastaScripts)}
                title="Reescanear scripts na pasta"
              >
                <RefreshCw size={12} />
              </button>
              <button
                type="button"
                className="qa-btn-chip-action"
                onClick={aoSelecionarPastaScripts}
                title="Mudar pasta de busca de scripts"
              >
                <FolderOpen size={11} />
                <span>Mudar Pasta</span>
              </button>
              <button
                type="button"
                className="qa-btn-chip-action"
                onClick={aoSelecionarArquivoScript}
                title="Vincular script .sh específico de qualquer local"
              >
                <Plus size={11} />
                <span>Vincular .sh</span>
              </button>
            </div>
          </div>

          {/* Lista de Scripts Detectados */}
          {scripts.length === 0 ? (
            <div className="qa-empty-scripts-card">
              <FileCode size={24} className="qa-text-muted" style={{ opacity: 0.6 }} />
              <div className="qa-empty-scripts-text">
                <strong>Nenhum script .sh encontrado</strong>
                <p>
                  Não encontramos arquivos <code>.sh</code> na raiz ou pastas escaneadas. Você pode
                  vincular um arquivo existente ou gerar um <code>verify.sh</code> inicial com um clique.
                </p>
              </div>
              <div className="qa-empty-scripts-btn-row">
                <button
                  type="button"
                  className="qa-btn-action-primary"
                  onClick={() => aoCriarScriptExemplo('verify.sh')}
                >
                  <Plus size={12} />
                  <span>Criar verify.sh Inicial</span>
                </button>
                <button
                  type="button"
                  className="qa-btn-action-secondary"
                  onClick={aoSelecionarArquivoScript}
                >
                  <FolderOpen size={12} />
                  <span>Selecionar Arquivo .sh</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="qa-scripts-list">
              {scripts.map((s) => {
                const emExecucao = executando && (scriptAtivo === s.caminhoRelativo || execucao?.nomeExecucao === s.caminhoRelativo);
                const argsAtual = scriptArgs[s.caminhoRelativo] || '';

                return (
                  <div key={s.caminhoRelativo} className="qa-script-card">
                    <div className="qa-script-card-header">
                      <div className="qa-script-info">
                        <div className="qa-script-name-row">
                          <Terminal size={13} className="qa-text-brand" />
                          <span className="qa-script-name">{s.nome}</span>
                          {s.isExecutable && <span className="qa-badge-executable">executável</span>}
                        </div>
                        <div className="qa-script-path-row">
                          <span className="qa-script-path">{s.caminhoRelativo}</span>
                          <button
                            type="button"
                            className="qa-btn-link-action"
                            onClick={() => aoAbrirScriptNoEditor(s.caminhoRelativo)}
                            title="Abrir script no editor do VS Code"
                          >
                            <ExternalLink size={10} />
                            <span>Abrir código</span>
                          </button>
                        </div>
                      </div>

                      <div className="qa-script-main-actions">
                        <button
                          type="button"
                          className="qa-btn-action-primary"
                          onClick={() => handleExecutarScript(s.caminhoRelativo, false)}
                          disabled={executando}
                          title="Executar script e acompanhar logs em tempo real aqui"
                        >
                          <Play size={12} />
                          <span>{emExecucao ? 'Rodando...' : 'Executar'}</span>
                        </button>
                        <button
                          type="button"
                          className="qa-btn-icon-subtle"
                          onClick={() => handleExecutarScript(s.caminhoRelativo, true)}
                          title="Executar no Terminal Integrado do VS Code"
                          disabled={executando}
                        >
                          <Terminal size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Argumentos rápidos para o script */}
                    <div className="qa-script-args-row">
                      <Sliders size={11} className="qa-text-muted" />
                      <input
                        type="text"
                        className="qa-script-args-input"
                        placeholder="Argumentos/flags (ex: --quick, --all, -v)..."
                        value={argsAtual}
                        onChange={(e) => handleArgChange(s.caminhoRelativo, e.target.value)}
                        disabled={executando}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ABA: SUÍTE DE TESTES (npm test) */}
      {modo === 'suite' && (
        <div className="qa-card-section">
          <div className="qa-testes-controls-row">
            <div className="qa-form-group" style={{ flex: 1 }}>
              <label className="qa-form-label" htmlFor="select-test-cat">
                Categoria de Testes do Projeto
              </label>
              <select
                id="select-test-cat"
                className="qa-form-select"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                disabled={executando}
              >
                <option value="unidade">Testes Unitários (unit)</option>
                <option value="integracao">Testes de Integração (integration)</option>
                <option value="e2e">Ponta a Ponta (Playwright / Cypress)</option>
                <option value="tudo">Suíte Completa (All tests)</option>
              </select>
            </div>

            <div style={{ alignSelf: 'flex-end' }}>
              <button
                type="button"
                className="qa-btn-action-primary"
                onClick={() => aoExecutarTeste(categoria)}
                disabled={executando}
              >
                <Play size={13} />
                <span>{executando ? 'Executando...' : 'Rodar Testes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resumo da Execução Atual */}
      <div className="qa-card-section">
        <div className="qa-testes-metrics-bar">
          <div className="qa-metric-chip">
            <span className="qa-metric-label">Status:</span>
            <span className={`qa-metric-value qa-metric-${status}`}>
              {status.toUpperCase()}
            </span>
          </div>

          <div className="qa-metric-chip">
            <CheckCircle size={13} color="var(--qa-success)" />
            <span>{execucao?.sucessosCount || 0} passaram</span>
          </div>

          <div className="qa-metric-chip">
            <XCircle size={13} color="var(--qa-error)" />
            <span>{execucao?.errosCount || 0} falharam</span>
          </div>

          {execucao?.categoriaAtiva && (
            <div className="qa-metric-chip" title="Alvo executado">
              <span className="qa-metric-label">Alvo:</span>
              <span className="qa-metric-value" style={{ fontFamily: 'monospace' }}>
                {execucao.categoriaAtiva}
              </span>
            </div>
          )}

          <button
            type="button"
            className="qa-btn-icon-subtle"
            onClick={aoLimparHistorico}
            title="Limpar console de logs"
          >
            <RotateCcw size={12} />
          </button>
        </div>

        {/* Console de Logs em Tempo Real */}
        <div className="qa-section-subtitle" style={{ marginTop: '4px' }}>
          <Terminal size={14} />
          <span>Console de Saída</span>
          {executando && <span className="qa-badge-pulsing">em tempo real</span>}
        </div>
        <pre className="qa-logs-console">
          {execucao?.logs || '// Nenhum log de execução registrado ainda. Selecione um script ou teste para rodar.'}
        </pre>
      </div>

      {/* Publicação de Resultados no OpenProject */}
      {execucao && execucao.logs && (
        <div className="qa-card-section">
          <div className="qa-section-subtitle">
            <Send size={14} />
            <span>Publicar Resultado no OpenProject</span>
          </div>

          {tasks.length === 0 ? (
            <p className="qa-empty-text">Nenhuma task do OpenProject disponível para publicação.</p>
          ) : (
            <div className="qa-publish-row">
              <select
                className="qa-form-select"
                value={taskIdParaPublicar}
                onChange={(e) => setTaskIdParaPublicar(e.target.value)}
                style={{ flex: 1 }}
              >
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    #{t.id} - {t.assunto}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="qa-btn-action-secondary"
                onClick={handlePublicarResultado}
                disabled={feedbackPublicado || !taskIdParaPublicar}
              >
                <Send size={13} />
                <span>{feedbackPublicado ? 'Publicado na Task!' : 'Publicar na Task'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
