import { z } from 'zod';
import {
  ConfiguracaoQAssistant,
  EstruturaWorkspaceQAssistant,
  RAIZ_CONTEXTO_PROJETO,
  RAIZ_TESTES_QASSISTANT,
} from '@qassistant/nucleo';

export const SetupWorkspaceSchema = z.object({
  nomeProjeto: z.string().min(1),
  raizCodigo: z.string().default('.'),
  frontend: z.string().optional(),
  backend: z.string().optional(),
  criarContextoProjeto: z.boolean().default(true),
  criarAssetsAgent: z.boolean().default(true),
  criarEstruturaTestesPadrao: z.boolean().default(false),
  openProjectHabilitado: z.boolean().default(true),
  openProjectUrlBase: z.string().optional(),
  openProjectProjetoId: z.string().optional(),
  intervaloPollingSegundos: z.number().int().min(15).default(60),
  commitsPadrao: z.number().int().min(1).default(10),
  padraoBranch: z.string().default('{tipo}/OP-{id}-{slug}'),
  ferramentaAgente: z.enum(['claude', 'gemini', 'aider', 'custom', 'nenhum']).default('claude'),
  comandoCustomizado: z.string().optional(),
});

export type SetupWorkspace = z.infer<typeof SetupWorkspaceSchema>;
export const CampoDiretorioSetupSchema = z.enum(['raizCodigo', 'frontend', 'backend']);
export type CampoDiretorioSetup = z.infer<typeof CampoDiretorioSetupSchema>;
export const TipoTesteAssistidoSchema = z.enum(['unitario', 'integracao', 'componente', 'ponta-a-ponta', 'usabilidade', 'acessibilidade', 'desempenho', 'carga']);
export type TipoTesteAssistido = z.infer<typeof TipoTesteAssistidoSchema>;
export const StackTesteAssistidoSchema = z.enum(['backend', 'frontend']);
export type StackTesteAssistido = z.infer<typeof StackTesteAssistidoSchema>;
export const ContextoSeletorPromptSchema = z.enum(['arquivos', 'pastas']);
export type ContextoSeletorPrompt = z.infer<typeof ContextoSeletorPromptSchema>;
export const PromptAssistidoTesteSchema = z.object({
  tipoTeste: TipoTesteAssistidoSchema,
  stack: StackTesteAssistidoSchema.optional(),
  objetivo: z.string().min(8),
  contextoAdicional: z.string().optional(),
  cenariosObservacoes: z.string().optional(),
  arquivosSelecionados: z.array(z.string().min(1)).default([]),
  pastasSelecionadas: z.array(z.string().min(1)).default([]),
  usarPacoteAtivo: z.boolean().default(false),
});
export type PromptAssistidoTeste = z.infer<typeof PromptAssistidoTesteSchema>;

export interface ProjetoOpenProjectDisponivel {
  nome: string;
  identificador: string;
}

export const MensagemWebviewParaHostSchema = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.literal('painel.carregado') }),
  z.object({ tipo: z.literal('workspace.inicializar'), setup: SetupWorkspaceSchema }),
  z.object({ tipo: z.literal('painel.atualizar') }),
  z.object({ tipo: z.literal('workspace.abrirCaminho'), caminhoRelativo: z.string().min(1) }),
  z.object({ tipo: z.literal('workspace.selecionarDiretorio'), campo: CampoDiretorioSetupSchema, caminhoAtual: z.string().optional() }),
  z.object({ tipo: z.literal('validacao.criarRascunho'), titulo: z.string().min(1).default('validacao-qa') }),
  z.object({ tipo: z.literal('validacao.criarComCommits'), titulo: z.string().min(1).default('validacao-qa'), hashes: z.array(z.string().min(7)).default([]) }),
  z.object({ tipo: z.literal('git.carregarCommits'), limite: z.number().int().min(1).max(100).default(10) }),
  z.object({ tipo: z.literal('validacao.gerarResumoIA'), rascunhoCaminho: z.string().min(1) }),
  z.object({ tipo: z.literal('validacao.sugerirBateriaTestes'), rascunhoCaminho: z.string().min(1) }),
  z.object({ tipo: z.literal('openproject.publicarTask'), rascunhoCaminho: z.string().min(1), taskId: z.string().optional() }),
  z.object({ tipo: z.literal('openproject.obterStatus'), taskId: z.string().min(1) }),
  z.object({ tipo: z.literal('openproject.listarTasks') }),
  z.object({ tipo: z.literal('openproject.obterDetalhes'), taskId: z.string().min(1) }),
  z.object({
    tipo: z.literal('openproject.validarConexao'),
    urlBase: z.string().min(1),
    projetoRef: z.string().optional(),
    token: z.string().optional(),
  }),
  z.object({ tipo: z.literal('config.salvarChaveGemini'), chave: z.string().min(1) }),
  z.object({ tipo: z.literal('config.salvarChaveOpenProject'), chave: z.string().min(1) }),
  z.object({ tipo: z.literal('validacao.selecionarPacote'), caminhoRelativo: z.string().min(1) }),
  z.object({ tipo: z.literal('validacao.excluirPacote'), caminhoRelativo: z.string().min(1) }),
  z.object({ tipo: z.literal('testes.executar'), categoria: z.string(), nomeExecucao: z.string().optional() }),
  z.object({ tipo: z.literal('testes.navegarSeletorPrompt'), contexto: ContextoSeletorPromptSchema, caminhoRelativo: z.string().default('.') }),
  z.object({ tipo: z.literal('testes.gerarPromptAssistido'), payload: PromptAssistidoTesteSchema }),
  z.object({ tipo: z.literal('testes.limparHistorico') }),
  z.object({ tipo: z.literal('testes.abrirEmAba') }),
  z.object({ tipo: z.literal('testes.fecharAba') }),
  z.object({ tipo: z.literal('testes.analisarComIA') }),
  z.object({ tipo: z.literal('testes.verRunDetalhes'), runId: z.string().min(1) }),
  z.object({ tipo: z.literal('openproject.comentarTask'), taskId: z.string().min(1), texto: z.string().min(1) }),
  z.object({ tipo: z.literal('openproject.alterarStatusTask'), taskId: z.string().min(1), statusHref: z.string().min(1), lockVersion: z.number().int() }),
  z.object({
    tipo: z.literal('openproject.criarTask'),
    assunto: z.string().min(1),
    descricao: z.string().optional(),
    tipoNome: z.string().optional(),
    prioridadeNome: z.string().optional(),
  }),
  z.object({ tipo: z.literal('openproject.abrirNoNavegador'), taskId: z.string().min(1) }),
  z.object({ tipo: z.literal('openproject.atribuirAMim'), taskId: z.string().min(1), lockVersion: z.number().int() }),
  z.object({
    tipo: z.literal('openproject.registrarTempo'),
    taskId: z.string().min(1),
    horas: z.string().min(1),
    comentario: z.string().optional(),
  }),
  z.object({
    tipo: z.literal('terminal.abrirTerminalTask'),
    taskId: z.string().min(1),
    assunto: z.string().min(1),
    tipoTask: z.string().optional(),
  }),
  z.object({ tipo: z.literal('terminal.copiarPromptAgente'), taskId: z.string().min(1) }),
  z.object({ tipo: z.literal('terminal.executarComando'), comando: z.string().min(1) }),
  z.object({
    tipo: z.literal('config.salvarTerminal'),
    padraoBranch: z.string().min(1),
    ferramentaAgente: z.enum(['claude', 'gemini', 'aider', 'custom', 'nenhum']),
    comandoCustomizado: z.string().optional(),
    comandosRapidos: z.array(z.object({ rotulo: z.string(), comando: z.string() })).optional(),
  }),
  z.object({
    tipo: z.literal('terminal.executarAgenteComTask'),
    taskId: z.string().min(1),
    ferramenta: z.enum(['claude', 'gemini', 'aider', 'custom']),
  }),
  z.object({ tipo: z.literal('testes.listarScripts'), pasta: z.string().optional() }),
  z.object({ tipo: z.literal('testes.selecionarArquivoScript') }),
  z.object({ tipo: z.literal('testes.selecionarPastaScripts') }),
  z.object({ tipo: z.literal('testes.abrirScriptNoEditor'), caminhoRelativo: z.string().min(1) }),
  z.object({
    tipo: z.literal('testes.executarScript'),
    caminhoRelativo: z.string().min(1),
    args: z.string().optional(),
    noTerminal: z.boolean().optional(),
  }),
  z.object({ tipo: z.literal('testes.criarScriptExemplo'), nome: z.string().optional() }),
]);

export type MensagemWebviewParaHost = z.infer<typeof MensagemWebviewParaHostSchema>;

export interface ScriptQAInfo {
  nome: string;
  caminhoRelativo: string;
  pasta: string;
  tamanhoBytes?: number;
  modificadoEm?: string;
  isExecutable?: boolean;
}

export interface AssetsPainel {
  logoUri: string;
}

export interface UsuarioOpenProjectQA {
  id: number;
  nome: string;
  login: string;
  href: string;
}

export interface TaskOpenProjectQA {
  id: string;
  assunto: string;
  status: string;
  tipo?: string;
  responsavel?: string;
  prioridade?: string;
  autor?: string;
  dataAtualizacao?: string;
  dataCriacao?: string;
  isNova?: boolean;
  descricaoMarkdown?: string;
  comentarios?: { autor: string; dataCriacao: string; texto: string }[];
  canUpdate?: boolean;
  lockVersion?: number;
  statusHref?: string;
  statusesDisponiveis?: { id: string; nome: string; href: string }[];
}

export interface CommitGitQAssistant {
  hash: string;
  hashCurto: string;
  autor: string;
  dataIso: string;
  assunto: string;
  repositorioId: string;
  repositorioNome: string;
  repositorioCaminho: string;
  arquivosAlterados?: string[];
  arquivosAlteradosCount?: number;
}

export interface RepositorioGitDetectado {
  id: string;
  nome: string;
  caminhoRelativo: string;
  branch: string;
}

export interface EstadoGitQAssistant {
  carregando: boolean;
  erro: string | null;
  recentes: CommitGitQAssistant[];
  carregadoEm: string | null;
  branch?: string;
  repositorios: RepositorioGitDetectado[];
}

export interface EntradaNavegadorQAssistant {
  nome: string;
  caminhoRelativo: string;
  tipo: 'arquivo' | 'pasta';
  tamanhoBytes: number | null;
  atualizadoEm: string | null;
}

export interface NavegadorQAssistant {
  caminhoRelativo: string;
  entradas: EntradaNavegadorQAssistant[];
  arquivoAberto: string | null;
}

export interface RunHistoricoTeste {
  id: string;
  categoria: string;
  status: 'sucesso' | 'erro';
  dataHora: string;
  total: number;
  erros: number;
  segundos: number;
  nomeExecucao?: string;
  sumarioCaminho?: string;
  analiseIA?: { conteudo: string; geradoEm: string };
}

export interface FalhaDetalhadaQA {
  id: string;
  nome: string;
  status: string;
  duracao: string;
  steps: string;
  findings: string[];
}

export interface ExecucaoTestes {
  categoriaAtiva: string | null;
  status: 'ocioso' | 'executando' | 'sucesso' | 'erro';
  logs: string;
  errosCount: number;
  sucessosCount: number;
  totalCount: number;
  historico: RunHistoricoTeste[];
  falhasDetalhes?: FalhaDetalhadaQA[];
  sumarioCaminhoRelativo?: string;
  sumarioConteudo?: string;
  nomeExecucao?: string;
  analiseIA?: {
    conteudo: string;
    geradoEm: string;
    runId?: string;
    carregando?: boolean;
  };
}

export interface EstadoPainel {
  produto: 'QAssistant';
  versaoExtensao: string;
  assets: AssetsPainel;
  workspaceAberto: boolean;
  workspaceInicializado: boolean;
  raizWorkspace: string;
  raizTestes: string;
  raizContexto: string;
  configuracao: ConfiguracaoQAssistant | null;
  estrutura: EstruturaWorkspaceQAssistant | null;
  git: EstadoGitQAssistant;
  navegador: NavegadorQAssistant | null;
  ultimosArquivosCriados: string[];
  ultimosArquivosPreservados: string[];
  ultimoPacoteValidacao?: {
    id: string;
    caminhoRelativo: string;
    titulo?: string;
    statusCompleto?: string;
    criadoEm?: string;
    openProjectId?: string;
    openProjectUrl?: string;
    commits?: string[];
    resumoQaConteudo?: string;
  };
  pacotesDisponiveis?: {
    id: string;
    nome: string;
    caminhoRelativo: string;
    dataCriacao: string;
  }[];
  geminiKeyPresente: boolean;
  openProjectKeyPresente: boolean;
  openprojectTasks: TaskOpenProjectQA[];
  usuarioOpenProject?: UsuarioOpenProjectQA;
  execucaoTestes?: ExecucaoTestes;
  scriptsQA?: ScriptQAInfo[];
  pastaScriptsQA?: string;
}

export type MensagemHostParaWebview =
  | { tipo: 'estado.atualizado'; estado: EstadoPainel }
  | { tipo: 'workspace.diretorioSelecionado'; campo: CampoDiretorioSetup; caminho: string }
  | { tipo: 'testes.seletorPromptAtualizado'; contexto: ContextoSeletorPrompt; navegador: NavegadorQAssistant }
  | { tipo: 'testes.promptAssistidoGerado'; caminhoRelativo: string; conteudo: string; copiado: boolean }
  | {
      tipo: 'testes.scriptsListados';
      scripts: ScriptQAInfo[];
      pastaAtual?: string;
    }
  | {
      tipo: 'testes.scriptExecutado';
      caminhoRelativo: string;
      sucesso: boolean;
      codigoSaida: number | null;
      logs: string;
    }
  | {
      tipo: 'openproject.validacaoConcluida';
      sucesso: boolean;
      mensagem: string;
      projeto?: {
        nome: string;
        identificador?: string;
      };
      projetosDisponiveis?: ProjetoOpenProjectDisponivel[];
    }
  | {
      tipo: 'openproject.tarefasAtualizadas';
      tasks: TaskOpenProjectQA[];
      novasCount: number;
      timestamp: string;
    }
  | {
      tipo: 'openproject.detalhesCarregados';
      task: TaskOpenProjectQA;
    }
  | {
      tipo: 'openproject.taskCriada';
      task: TaskOpenProjectQA;
    }
  | { tipo: 'terminal.sucesso'; mensagem: string }
  | { tipo: 'notificacao.info'; mensagem: string }
  | { tipo: 'notificacao.erro'; mensagem: string };

export function criarEstadoInicial(versaoExtensao: string): EstadoPainel {
  return {
    produto: 'QAssistant',
    versaoExtensao,
    assets: { logoUri: '' },
    workspaceAberto: false,
    workspaceInicializado: false,
    raizWorkspace: '',
    raizTestes: RAIZ_TESTES_QASSISTANT,
    raizContexto: RAIZ_CONTEXTO_PROJETO,
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
    usuarioOpenProject: undefined,
    scriptsQA: [],
    pastaScriptsQA: '',
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
}
