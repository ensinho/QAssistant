import type { FC } from 'react';
import { useEffect, useState, useMemo } from 'react';
import {
  ListTodo,
  Terminal,
  FileCheck,
  Settings,
  Sparkles,
  RefreshCw,
  FolderGit2,
} from 'lucide-react';
import type {
  EstadoPainel,
  MensagemHostParaWebview,
  MensagemWebviewParaHost,
  ProjetoOpenProjectDisponivel,
  SetupWorkspace,
  TaskOpenProjectQA,
} from '../../contratos/mensagens';
import vsCodeApi from '../vscodeApi';
import { OpenProjectFeed } from './openproject/OpenProjectFeed';
import { TerminalAgentesAba } from './terminal-agentes/TerminalAgentesAba';
import { TestesRunnerView } from './testes/TestesRunnerView';
import { SetupSimples } from './setup/SetupSimples';
import {
  ToastNotificacaoContainer,
  type ToastNotificacaoItem,
} from './ui/ToastNotificacao';

const vscode = vsCodeApi;
type AbaPrincipal = 'openproject' | 'terminal' | 'testes' | 'configuracao';

const estadoBase: EstadoPainel = {
  produto: 'QAssistant',
  versaoExtensao: '2.0.0',
  assets: { logoUri: '' },
  workspaceAberto: false,
  workspaceInicializado: false,
  raizWorkspace: '',
  raizTestes: 'Qassistant-testes',
  raizContexto: 'docs/contexto',
  configuracao: null,
  estrutura: null,
  git: {
    carregando: false,
    erro: null,
    recentes: [],
    carregadoEm: null,
    branch: '',
    repositorios: [],
  },
  navegador: null,
  ultimosArquivosCriados: [],
  ultimosArquivosPreservados: [],
  ultimoPacoteValidacao: undefined,
  pacotesDisponiveis: [],
  geminiKeyPresente: false,
  openProjectKeyPresente: false,
  openprojectTasks: [],
  execucaoTestes: {
    categoriaAtiva: null,
    status: 'ocioso',
    logs: '',
    errosCount: 0,
    sucessosCount: 0,
    totalCount: 0,
    historico: [],
  },
};

export const App: FC = () => {
  const [estado, setEstado] = useState<EstadoPainel>(estadoBase);
  const [abaAtiva, setAbaAtiva] = useState<AbaPrincipal>('openproject');
  const [toasts, setToasts] = useState<ToastNotificacaoItem[]>([]);
  const [ultimaSincronizacao, setUltimaSincronizacao] = useState<string | null>(null);
  const [carregandoSync, setCarregandoSync] = useState(false);
  const [projetosDisponiveis, setProjetosDisponiveis] = useState<ProjetoOpenProjectDisponivel[]>([]);

  // Disparar toast utilitário
  const adicionarToast = (tipo: 'nova-task' | 'info' | 'erro', titulo: string, mensagem: string, task?: TaskOpenProjectQA) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((anteriores) => [...anteriores.slice(-4), { id, tipo, titulo, mensagem, task }]);
    setTimeout(() => {
      setToasts((atuais) => atuais.filter((t) => t.id !== id));
    }, 6000);
  };

  const dispensarToast = (id: string) => {
    setToasts((anteriores) => anteriores.filter((t) => t.id !== id));
  };

  // Enviar mensagem ao Host
  const postMessage = (msg: MensagemWebviewParaHost) => {
    vscode.postMessage(msg);
  };

  // Listener de eventos do Host em tempo real
  useEffect(() => {
    postMessage({ tipo: 'painel.carregado' });
    postMessage({ tipo: 'openproject.listarTasks' });

    const handleMessage = (event: MessageEvent<MensagemHostParaWebview>) => {
      const msg = event.data;
      if (!msg) return;

      switch (msg.tipo) {
        case 'estado.atualizado':
          setEstado(msg.estado);
          break;

        case 'openproject.tarefasAtualizadas':
          setEstado((ant: EstadoPainel) => ({
            ...ant,
            openprojectTasks: msg.tasks,
          }));
          setUltimaSincronizacao(msg.timestamp);
          setCarregandoSync(false);

          if (msg.novasCount > 0) {
            adicionarToast(
              'nova-task',
              'Tarefas Novas no OpenProject',
              `${msg.novasCount} nova(s) tarefa(s) sincronizada(s) em tempo real!`
            );
          }
          break;

        case 'openproject.validacaoConcluida':
          setCarregandoSync(false);
          if (msg.projetosDisponiveis) {
            setProjetosDisponiveis(msg.projetosDisponiveis);
          }
          if (msg.sucesso) {
            adicionarToast('info', 'OpenProject Conectado', msg.mensagem);
          } else {
            adicionarToast('erro', 'Falha na Conexão', msg.mensagem);
          }
          break;

        case 'terminal.sucesso':
          adicionarToast('info', 'Terminal & Git', msg.mensagem);
          break;

        case 'notificacao.info':
          adicionarToast('info', 'Notificação', msg.mensagem);
          break;

        case 'notificacao.erro':
          setCarregandoSync(false);
          adicionarToast('erro', 'Aviso', msg.mensagem);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Handlers para o OpenProject
  const handleSincronizarOpenProject = () => {
    setCarregandoSync(true);
    postMessage({ tipo: 'openproject.listarTasks' });
  };

  const handleCriarTask = (params: { assunto: string; descricao?: string; tipoNome?: string }) => {
    postMessage({
      tipo: 'openproject.criarTask',
      assunto: params.assunto,
      descricao: params.descricao,
      tipoNome: params.tipoNome,
    });
  };

  const handleAlterarStatus = (taskId: string, statusHref: string, lockVersion: number) => {
    postMessage({
      tipo: 'openproject.alterarStatusTask',
      taskId,
      statusHref,
      lockVersion,
    });
  };

  const handleAdicionarComentario = (taskId: string, texto: string) => {
    postMessage({
      tipo: 'openproject.comentarTask',
      taskId,
      texto,
    });
  };

  const handleObterDetalhes = (taskId: string) => {
    postMessage({
      tipo: 'openproject.obterDetalhes',
      taskId,
    });
  };

  const handleAbrirNavegador = (task: TaskOpenProjectQA) => {
    postMessage({
      tipo: 'openproject.abrirNoNavegador',
      taskId: task.id,
    });
  };

  const handleAtribuirAMim = (taskId: string, lockVersion: number) => {
    postMessage({
      tipo: 'openproject.atribuirAMim',
      taskId,
      lockVersion,
    });
  };

  const handleRegistrarTempo = (taskId: string, horas: string, comentario?: string) => {
    postMessage({
      tipo: 'openproject.registrarTempo',
      taskId,
      horas,
      comentario,
    });
  };

  // Handlers para o Terminal & Agentes
  const handleAbrirTerminal = (task: TaskOpenProjectQA) => {
    postMessage({
      tipo: 'terminal.abrirTerminalTask',
      taskId: task.id,
      assunto: task.assunto,
      tipoTask: task.tipo,
    });
  };

  const handleCopiarPrompt = (task: TaskOpenProjectQA) => {
    postMessage({
      tipo: 'terminal.copiarPromptAgente',
      taskId: task.id,
    });
  };

  const handleExecutarComando = (comando: string) => {
    postMessage({
      tipo: 'terminal.executarComando',
      comando,
    });
  };

  const handleSalvarConfigTerminal = (config: {
    padraoBranch: string;
    ferramentaAgente: 'claude' | 'gemini' | 'aider' | 'custom' | 'nenhum';
    comandoCustomizado?: string;
  }) => {
    postMessage({
      tipo: 'config.salvarTerminal',
      padraoBranch: config.padraoBranch,
      ferramentaAgente: config.ferramentaAgente,
      comandoCustomizado: config.comandoCustomizado,
    });
  };

  const handleExecutarAgenteComTask = (taskId: string, ferramenta: 'claude' | 'gemini' | 'aider' | 'custom') => {
    postMessage({
      tipo: 'terminal.executarAgenteComTask',
      taskId,
      ferramenta,
    });
  };

  // Handlers para Testes
  const handleExecutarTeste = (categoria: string) => {
    postMessage({
      tipo: 'testes.executar',
      categoria,
    });
  };

  const handleExecutarScript = (caminhoRelativo: string, args?: string, noTerminal?: boolean) => {
    postMessage({
      tipo: 'testes.executarScript',
      caminhoRelativo,
      args,
      noTerminal,
    });
  };

  const handleAbrirScriptNoEditor = (caminhoRelativo: string) => {
    postMessage({
      tipo: 'testes.abrirScriptNoEditor',
      caminhoRelativo,
    });
  };

  const handleListarScripts = (pasta?: string) => {
    postMessage({
      tipo: 'testes.listarScripts',
      pasta,
    });
  };

  const handleSelecionarArquivoScript = () => {
    postMessage({
      tipo: 'testes.selecionarArquivoScript',
    });
  };

  const handleSelecionarPastaScripts = () => {
    postMessage({
      tipo: 'testes.selecionarPastaScripts',
    });
  };

  const handleCriarScriptExemplo = (nome?: string) => {
    postMessage({
      tipo: 'testes.criarScriptExemplo',
      nome,
    });
  };

  const handleLimparHistoricoTestes = () => {
    postMessage({ tipo: 'testes.limparHistorico' });
  };

  const handlePublicarNoOpenProject = (taskId: string, texto: string) => {
    postMessage({
      tipo: 'openproject.comentarTask',
      taskId,
      texto,
    });
  };

  // Handlers para Setup
  const handleValidarConexao = (urlBase: string, token?: string) => {
    postMessage({
      tipo: 'openproject.validarConexao',
      urlBase,
      token,
    });
  };

  const handleSalvarToken = (token: string) => {
    postMessage({
      tipo: 'config.salvarChaveOpenProject',
      chave: token,
    });
  };

  const handleConcluirSetup = (setup: SetupWorkspace) => {
    postMessage({
      tipo: 'workspace.inicializar',
      setup,
    });
    setAbaAtiva('openproject');
    setTimeout(() => {
      postMessage({ tipo: 'openproject.listarTasks' });
    }, 800);
  };

  const novasTarefasCount = useMemo(() => {
    return estado.openprojectTasks.filter((t: TaskOpenProjectQA) => t.isNova).length;
  }, [estado.openprojectTasks]);

  const setupAtual: SetupWorkspace = {
    nomeProjeto: estado.configuracao?.projeto?.nome || 'Meu Projeto',
    raizCodigo: estado.configuracao?.caminhos?.raizCodigo || '.',
    criarContextoProjeto: false,
    criarAssetsAgent: true,
    criarEstruturaTestesPadrao: false,
    openProjectHabilitado: true,
    openProjectUrlBase: estado.configuracao?.openProject?.urlBase || 'https://openproject.ormel.com.br',
    openProjectProjetoId: estado.configuracao?.openProject?.projetoId || '28',
    intervaloPollingSegundos: estado.configuracao?.openProject?.intervaloPollingSegundos || 30,
    commitsPadrao: 10,
    padraoBranch: estado.configuracao?.terminal?.padraoBranch || '{tipo}/OP-{id}-{slug}',
    ferramentaAgente: (estado.configuracao?.terminal?.ferramentaAgente as any) || 'claude',
    comandoCustomizado: estado.configuracao?.terminal?.comandoCustomizado,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Header Fixo e Clean */}
      <header className="sticky-header">
        <div className="brand-mini-row" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--qa-foreground)' }}>
              QAssistant
            </span>
            <span className="version-small">v{estado.versaoExtensao}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              className="qa-sync-badge"
              title={
                estado.openProjectKeyPresente
                  ? 'OpenProject conectado e monitorando em tempo real'
                  : 'OpenProject não configurado'
              }
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: estado.openProjectKeyPresente ? '#4ec982' : '#f0b85a',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--qa-muted)' }}>
                {estado.openProjectKeyPresente ? 'Conectado' : 'Setup pendente'}
              </span>
            </span>
          </div>
        </div>

        {/* Abas de Navegação Estilo GitHub / Linear */}
        <nav className="tabs-navigation-clean" aria-label="Navegação Principal">
          <button
            type="button"
            className={`tab-btn-clean ${abaAtiva === 'openproject' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('openproject')}
          >
            <ListTodo size={13} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
            <span>Tarefas</span>
            {novasTarefasCount > 0 && (
              <span className="qa-badge qa-badge-nova qa-badge-sm" style={{ marginLeft: 4 }}>
                {novasTarefasCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`tab-btn-clean ${abaAtiva === 'terminal' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('terminal')}
          >
            <Terminal size={13} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
            <span>Terminal & Agentes</span>
          </button>

          <button
            type="button"
            className={`tab-btn-clean ${abaAtiva === 'testes' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('testes')}
          >
            <FileCheck size={13} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
            <span>QA Runner</span>
          </button>

          <button
            type="button"
            className={`tab-btn-clean ${abaAtiva === 'configuracao' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('configuracao')}
          >
            <Settings size={13} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
            <span>Configuração</span>
          </button>
        </nav>
      </header>

      {/* Conteúdo Rolável da Aba */}
      <main className="scrollable-body">
        {abaAtiva === 'openproject' && (
          <OpenProjectFeed
            tasks={estado.openprojectTasks}
            usuarioAtual={estado.usuarioOpenProject}
            carregando={carregandoSync}
            ultimaSincronizacao={ultimaSincronizacao}
            projetoNome={estado.configuracao?.openProject?.projetoId}
            openProjectConectado={estado.openProjectKeyPresente}
            aoIrParaConfig={() => setAbaAtiva('configuracao')}
            aoSincronizar={handleSincronizarOpenProject}
            aoCriarTask={handleCriarTask}
            aoAlterarStatus={handleAlterarStatus}
            aoAtribuirAMim={handleAtribuirAMim}
            aoRegistrarTempo={handleRegistrarTempo}
            aoAdicionarComentario={handleAdicionarComentario}
            aoAbrirTerminal={handleAbrirTerminal}
            aoCopiarPrompt={handleCopiarPrompt}
            aoAbrirNavegador={handleAbrirNavegador}
            aoObterDetalhes={handleObterDetalhes}
          />
        )}

        {abaAtiva === 'terminal' && (
          <TerminalAgentesAba
            tasks={estado.openprojectTasks}
            branchAtual={estado.git.branch}
            configTerminal={estado.configuracao?.terminal}
            aoAbrirTerminal={handleAbrirTerminal}
            aoCopiarPrompt={handleCopiarPrompt}
            aoExecutarComando={handleExecutarComando}
            aoSalvarConfigTerminal={handleSalvarConfigTerminal}
            aoExecutarAgenteComTask={handleExecutarAgenteComTask}
          />
        )}

        {abaAtiva === 'testes' && (
          <TestesRunnerView
            execucao={estado.execucaoTestes}
            scripts={estado.scriptsQA}
            pastaScripts={estado.pastaScriptsQA}
            tasks={estado.openprojectTasks}
            aoExecutarTeste={handleExecutarTeste}
            aoExecutarScript={handleExecutarScript}
            aoAbrirScriptNoEditor={handleAbrirScriptNoEditor}
            aoListarScripts={handleListarScripts}
            aoSelecionarArquivoScript={handleSelecionarArquivoScript}
            aoSelecionarPastaScripts={handleSelecionarPastaScripts}
            aoCriarScriptExemplo={handleCriarScriptExemplo}
            aoLimparHistorico={handleLimparHistoricoTestes}
            aoPublicarNoOpenProject={handlePublicarNoOpenProject}
          />
        )}

        {abaAtiva === 'configuracao' && (
          <SetupSimples
            setupAtual={setupAtual}
            openProjectKeyPresente={estado.openProjectKeyPresente}
            projetosDisponiveis={projetosDisponiveis}
            aoValidarConexao={handleValidarConexao}
            aoSalvarToken={handleSalvarToken}
            aoConcluirSetup={handleConcluirSetup}
          />
        )}
      </main>

      {/* Notificações Flutuantes (Toasts em tempo real) */}
      <ToastNotificacaoContainer
        toasts={toasts}
        aoDispensar={dispensarToast}
        aoAbrirTask={(task) => {
          setAbaAtiva('openproject');
          handleObterDetalhes(task.id);
        }}
      />
    </div>
  );
};
