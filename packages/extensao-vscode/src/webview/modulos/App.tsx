import type { FC, ReactElement } from 'react';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import type {
  CampoDiretorioSetup,
  CommitGitQAssistant,
  ContextoSeletorPrompt,
  EstadoPainel,
  MensagemHostParaWebview,
  MensagemWebviewParaHost,
  NavegadorQAssistant,
  ProjetoOpenProjectDisponivel,
  PromptAssistidoTeste,
  SetupWorkspace,
  StackTesteAssistido,
  TaskOpenProjectQA,
  TipoTesteAssistido,
} from '../../contratos/mensagens';
import vsCodeApi from '../vscodeApi';

const vscode = vsCodeApi;
const OPENPROJECT_URL_PADRAO = 'http://openproject.ormel.com.br/';

const estadoInicial: EstadoPainel = {
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

const setupInicial: SetupWorkspace = {
  nomeProjeto: '',
  raizCodigo: '.',
  frontend: '',
  backend: '',
  criarContextoProjeto: true,
  criarAssetsAgent: true,
  openProjectHabilitado: true,
  openProjectUrlBase: OPENPROJECT_URL_PADRAO,
  openProjectProjetoId: '',
  intervaloPollingSegundos: 60,
  commitsPadrao: 10,
};

type EtapaOnboarding = 'boas-vindas' | 'openproject' | 'workspace' | 'concluir';

interface EstadoValidacaoOpenProject {
  status: 'ocioso' | 'carregando' | 'sucesso' | 'erro';
  mensagem: string;
  projetoNome?: string;
}

type EtapaCriadorPrompt = 'parametros' | 'contexto' | 'resultado';

interface SeletorPromptAssistidoState {
  contexto: ContextoSeletorPrompt;
  navegador: NavegadorQAssistant;
}

interface ResultadoPromptAssistido {
  caminhoRelativo: string;
  conteudo: string;
  copiado: boolean;
}

interface TipoPromptAssistidoMeta {
  id: TipoTesteAssistido;
  titulo: string;
  descricao: string;
  exigeStack: boolean;
}

const PROMPT_ASSISTIDO_INICIAL: PromptAssistidoTeste = {
  tipoTeste: 'unitario',
  stack: 'backend',
  objetivo: '',
  contextoAdicional: '',
  cenariosObservacoes: '',
  arquivosSelecionados: [],
  pastasSelecionadas: [],
  usarPacoteAtivo: false,
};

const TIPOS_PROMPT_ASSISTIDO: TipoPromptAssistidoMeta[] = [
  { id: 'unitario', titulo: 'Unitario', descricao: 'Cobertura focada em funcoes, hooks, servicos ou componentes isolados.', exigeStack: true },
  { id: 'integracao', titulo: 'Integracao', descricao: 'Fluxos entre camadas, APIs, persistencia ou composicao de modulos.', exigeStack: true },
  { id: 'componente', titulo: 'Componente', descricao: 'Comportamento de componentes React e estados de interface.', exigeStack: false },
  { id: 'ponta-a-ponta', titulo: 'Ponta a ponta', descricao: 'Jornadas completas do usuario e navegacao do sistema.', exigeStack: false },
  { id: 'usabilidade', titulo: 'Usabilidade', descricao: 'Fluxos guiados por clareza, feedback, ergonomia e compreensao.', exigeStack: false },
  { id: 'acessibilidade', titulo: 'Acessibilidade', descricao: 'Navegacao por teclado, semantica, labels e feedback assistivo.', exigeStack: false },
  { id: 'desempenho', titulo: 'Desempenho', descricao: 'Medições, gargalos e comportamento sob carga moderada.', exigeStack: false },
  { id: 'carga', titulo: 'Carga', descricao: 'Cenarios de volume, concorrencia e saturacao controlada.', exigeStack: false },
];

// Ícone: Voltar
const IconArrowLeft: FC = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
    <path d="M19 12H5" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

// Ícone: Pasta (Diretório)
const IconFolder: FC = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

// Ícone: Raio (Ações / IA)
const IconLightning: FC<{ size?: number; style?: object }> = ({ size = 11, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

// Ícone: Lente (Buscar / Focar)
const IconSearch: FC<{ style?: object }> = ({ style }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// Ícone: Documento (Artefato/File)
const IconFile: FC = () => (
  <svg width="10" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
    <path d="M14 2H6a2 2 0 0 0-2 2 v16a2 2 0 0 0 2 2 h12a2 2 0 0 0 2-2 V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

// Ícone: Chat de Discussão
const IconChat: FC = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

// Ícone: Fechar (x)
const IconClose: FC = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Ícone: Indicador lateral / Próximo (->)
const IconChevronRight: FC = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// Ícone: Expandir / Recolher
const IconChevronUp: FC = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const IconChevronDown: FC = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Ícone: Atenção
const IconWarning: FC<{ style?: object }> = ({ style }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px', ...style }}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// Ícone: Configurações (Engrenagem)
const IconSettings: FC<{ style?: object }> = ({ style }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

// Ícone: Recarregar (Sincronizar)
const IconRefresh: FC<{ style?: object }> = ({ style }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <polyline points="23 4 23 10 18 10" />
    <polyline points="1 20 1 14 6 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

// Ícone: Adicionar (+)
const IconPlus: FC = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// Ícone: Database/Estrutura (Matriz)
const IconDatabase: FC = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5V19A9 3 0 0 0 21 19V5" />
    <path d="M3 12A9 3 0 0 0 21 12" />
  </svg>
);

// Ícone: Lixeira (Deletar)
const IconTrash: FC<{ style?: object }> = ({ style }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <polyline points="3 6 5 3 19 3 21 6" stroke="currentColor" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" />
    <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" />
    <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" />
  </svg>
);

// Ícone: Olho (Visualizar)
const IconEye: FC<{ style?: object }> = ({ style }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" />
  </svg>
);

// Ícone: Estrelas (Sparkles/IA)
const IconSparkles: FC<{ style?: object }> = ({ style }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <path d="M12 3v1M12 20v1M21 12h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" stroke="currentColor" />
  </svg>
);

// Ícone: Link Externo
const IconExternalLink: FC<{ style?: object }> = ({ style }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" />
    <polyline points="15 3 21 3 21 9" stroke="currentColor" />
    <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" />
  </svg>
);

// Ícone: Play (Executar)
const IconPlay: FC<{ style?: object }> = ({ style }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <polygon points="5 3 19 12 5 21 5 3" stroke="currentColor" />
  </svg>
);

// Ícone: Stop (Cancelar)
const IconStop: FC<{ style?: object }> = ({ style }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" />
  </svg>
);

// Ícone: Checkbox/Check (Sucesso)
const IconCheck: FC<{ style?: object }> = ({ style }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <polyline points="20 6 9 17 4 12" stroke="currentColor" />
  </svg>
);

// Ícone: Histórico (Relógio)
const IconHistory: FC<{ style?: object }> = ({ style }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" />
    <polyline points="3 3 3 8 8 8" stroke="currentColor" />
    <line x1="12" y1="7" x2="12" y2="12" stroke="currentColor" />
    <line x1="12" y1="12" x2="16" y2="14" stroke="currentColor" />
  </svg>
);

// Ícone: Prancheta com Check (Sugerir Testes)
const IconClipboardCheck: FC<{ style?: object }> = ({ style }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" />
    <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" />
    <polyline points="9 13 11 15 15 11" stroke="currentColor" />
  </svg>
);

// Ícone: Relógio / Duração
const IconClock: FC<{ style?: object }> = ({ style }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 16 14" />
  </svg>
);

// Ícone: Microscópio / Analisar (lente + barra)
const IconAnalyze: FC<{ style?: object }> = ({ style }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <circle cx="11" cy="11" r="6" stroke="currentColor" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" />
    <line x1="11" y1="8" x2="11" y2="14" stroke="currentColor" />
    <line x1="8" y1="11" x2="14" y2="11" stroke="currentColor" />
  </svg>
);

// Spinner reutilizável (usa a animação .inline-spinner do design system)
const Spinner: FC<{ size?: number; style?: object }> = ({ size = 10, style }) => (
  <span className="inline-spinner" style={{ width: `${size}px`, height: `${size}px`, ...style }} />
);

// Linhas de esqueleto para listas carregando (pulso via .skeleton-line)
const SkeletonLista: FC<{ linhas?: number }> = ({ linhas = 3 }) => (
  <div className="qa-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} aria-hidden="true">
    {Array.from({ length: linhas }).map((_, i) => (
      <div key={i} className="skeleton-line" style={{ height: '34px', borderRadius: 'var(--qa-radius-sm)' }} />
    ))}
  </div>
);

export function App(): ReactElement {
  const [estado, setEstado] = useState<EstadoPainel>(estadoInicial);
  const [mensagem, setMensagem] = useState('');
  const [setup, setSetup] = useState<SetupWorkspace>(setupInicial);
  const [hashesSelecionados, setHashesSelecionados] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'resumos' | 'openproject' | 'testes' | 'validacoes' | 'config'>('resumos');
  const [criandoNovoPacote, setCriandoNovoPacote] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskOpenProjectQA | null>(null);
  const [carregandoDetalhesTaskId, setCarregandoDetalhesTaskId] = useState<string | null>(null);
  const [abaValidacoesFoco, setAbaValidacoesFoco] = useState<'lista' | 'detalhes'>('lista');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('todos');
  const [nomeExecucaoTeste, setNomeExecucaoTeste] = useState('');
  const [falhaExpandida, setFalhaExpandida] = useState<Record<string, boolean>>({});
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<string | null>(null);
  const [modalPublicarOP, setModalPublicarOP] = useState<{ aberto: boolean; taskId: string; tipoTask: string } | null>(null);
  const [relatorioColapsado, setRelatorioColapsado] = useState(false);
  const [novoComentario, setNovoComentario] = useState('');
  const [novoStatusHref, setNovoStatusHref] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [descricaoColapsada, setDescricaoColapsada] = useState(false);
  const [etapaOnboarding, setEtapaOnboarding] = useState<EtapaOnboarding>('boas-vindas');
  const [tokenOpenProject, setTokenOpenProject] = useState('');
  const [validacaoOpenProject, setValidacaoOpenProject] = useState<EstadoValidacaoOpenProject>({ status: 'ocioso', mensagem: '' });
  const [projetosOpenProjectDisponiveis, setProjetosOpenProjectDisponiveis] = useState<ProjetoOpenProjectDisponivel[]>([]);
  const [modalCriadorPromptAberto, setModalCriadorPromptAberto] = useState(false);
  const [etapaCriadorPrompt, setEtapaCriadorPrompt] = useState<EtapaCriadorPrompt>('parametros');
  const [formCriadorPrompt, setFormCriadorPrompt] = useState<PromptAssistidoTeste>(PROMPT_ASSISTIDO_INICIAL);
  const [seletorPromptAssistido, setSeletorPromptAssistido] = useState<SeletorPromptAssistidoState | null>(null);
  const [resultadoPromptAssistido, setResultadoPromptAssistido] = useState<ResultadoPromptAssistido | null>(null);
  const [busyCriadorPrompt, setBusyCriadorPrompt] = useState({ contexto: false, artefato: false });
  const [logoQuebrado, setLogoQuebrado] = useState(false);
  const [repoFiltro, setRepoFiltro] = useState<string>('todos');
  const [taskIdWizard, setTaskIdWizard] = useState('');
  // Mapa genérico de ações assíncronas em curso (chave -> em andamento).
  // O host não confirma cada ação individualmente, então limpamos tudo no
  // próximo estado.atualizado ou notificacao.* (ver listener de mensagens).
  const [acoesEmCurso, setAcoesEmCurso] = useState<Record<string, boolean>>({});
  const acaoAtiva = (chave: string): boolean => Boolean(acoesEmCurso[chave]);
  const iniciarAcao = (chave: string): void => setAcoesEmCurso((atual) => ({ ...atual, [chave]: true }));

  const taskAtiva = useMemo(() => {
    if (!selectedTask) return null;
    return estado.openprojectTasks.find((t) => t.id === selectedTask.id) || selectedTask;
  }, [selectedTask, estado.openprojectTasks]);

  const projetoOpenProjectSelecionado = useMemo(
    () => projetosOpenProjectDisponiveis.find((item) => item.identificador === setup.openProjectProjetoId),
    [projetosOpenProjectDisponiveis, setup.openProjectProjetoId],
  );

  const metaTipoPromptAssistido = useMemo(
    () => obterMetaTipoPromptAssistido(formCriadorPrompt.tipoTeste),
    [formCriadorPrompt.tipoTeste],
  );

  const arquivosSugeridosPacoteAtivo = useMemo(
    () => extrairArquivosSugeridosPacote(estado),
    [estado.git.recentes, estado.ultimoPacoteValidacao],
  );

  const podeAvancarCriadorPrompt = useMemo(
    () => formCriadorPrompt.objetivo.trim().length >= 8 && (!metaTipoPromptAssistido.exigeStack || Boolean(formCriadorPrompt.stack)),
    [formCriadorPrompt.objetivo, formCriadorPrompt.stack, metaTipoPromptAssistido.exigeStack],
  );

  const podeGerarPromptAssistido = useMemo(
    () => formCriadorPrompt.objetivo.trim().length >= 8 && (!metaTipoPromptAssistido.exigeStack || Boolean(formCriadorPrompt.stack)),
    [formCriadorPrompt.objetivo, formCriadorPrompt.stack, metaTipoPromptAssistido.exigeStack],
  );

  // Reabilita o logo se a URI do asset mudar (ex.: recarga do webview)
  useEffect(() => {
    setLogoQuebrado(false);
  }, [estado.assets.logoUri]);

  // Limpar formulário de comentário ao trocar/fechar tarefa
  useEffect(() => {
    setNovoComentario('');
    setNovoStatusHref('');
    setEnviandoComentario(false);
    setDescricaoColapsada(false);
  }, [selectedTask?.id]);

  useEffect(() => {
    if (estado.ultimoPacoteValidacao) {
      setAbaValidacoesFoco('detalhes');
    } else {
      setAbaValidacoesFoco('lista');
    }
  }, [estado.ultimoPacoteValidacao?.id]);

  useEffect(() => {
    if (carregandoDetalhesTaskId && estado.openprojectTasks) {
      const t = estado.openprojectTasks.find((item) => item.id === carregandoDetalhesTaskId);
      if (t && (t.descricaoMarkdown !== undefined || t.comentarios !== undefined)) {
        setCarregandoDetalhesTaskId(null);
      }
    }
  }, [estado.openprojectTasks, carregandoDetalhesTaskId]);

  const [wizardStep, setWizardStep] = useState<'selecionar' | 'revisar' | 'sucesso'>('selecionar');
  const [editApiKey, setEditApiKey] = useState('');
  const [editOpApiKey, setEditOpApiKey] = useState('');
  const [apiKeySalva, setApiKeySalva] = useState(false);
  const [opApiKeySalva, setOpOpApiKeySalva] = useState(false);
  const [processandoIA, setProcessandoIA] = useState<'resumo' | 'bateria' | 'openproject' | null>(null);

  useEffect(() => {
    const escutarMensagem = (evento: MessageEvent<MensagemHostParaWebview>) => {
      const mensagemRecebida = evento.data;
      if (mensagemRecebida.tipo === 'estado.atualizado') {
        setEstado(mensagemRecebida.estado);
        setSetup((atual) => preencherSetupComEstado(atual, mensagemRecebida.estado));
        // Estado fresco do host = ações assíncronas concluídas.
        setAcoesEmCurso({});
        return;
      }
      if (mensagemRecebida.tipo === 'workspace.diretorioSelecionado') {
        setSetup((atual) => ({ ...atual, [mensagemRecebida.campo]: mensagemRecebida.caminho }));
        return;
      }
      if (mensagemRecebida.tipo === 'testes.seletorPromptAtualizado') {
        setBusyCriadorPrompt((atual) => ({ ...atual, contexto: false }));
        setSeletorPromptAssistido({ contexto: mensagemRecebida.contexto, navegador: mensagemRecebida.navegador });
        return;
      }
      if (mensagemRecebida.tipo === 'testes.promptAssistidoGerado') {
        setBusyCriadorPrompt((atual) => ({ ...atual, artefato: false }));
        setResultadoPromptAssistido({
          caminhoRelativo: mensagemRecebida.caminhoRelativo,
          conteudo: mensagemRecebida.conteudo,
          copiado: mensagemRecebida.copiado,
        });
        setEtapaCriadorPrompt('resultado');
        return;
      }
      if (mensagemRecebida.tipo === 'openproject.validacaoConcluida') {
        const projetos = mensagemRecebida.projetosDisponiveis || [];
        setProjetosOpenProjectDisponiveis(projetos);
        setValidacaoOpenProject({
          status: mensagemRecebida.sucesso ? 'sucesso' : 'erro',
          mensagem: mensagemRecebida.mensagem,
          projetoNome: mensagemRecebida.projeto?.nome,
        });
        if (mensagemRecebida.sucesso) {
          setSetup((atual) => {
            let projetoSelecionado = atual.openProjectProjetoId;
            if (mensagemRecebida.projeto?.identificador) {
              projetoSelecionado = mensagemRecebida.projeto.identificador;
            } else if ((!projetoSelecionado || !projetos.some((item) => item.identificador === projetoSelecionado)) && projetos.length > 0) {
              projetoSelecionado = projetos[0].identificador;
            }

            return { ...atual, openProjectProjetoId: projetoSelecionado };
          });
        }
        if (mensagemRecebida.sucesso) {
          setTokenOpenProject('');
        }
        return;
      }
      if (mensagemRecebida.tipo === 'notificacao.info' || mensagemRecebida.tipo === 'notificacao.erro') {
        setProcessandoIA(null);
        setEnviandoComentario(false);
        setBusyCriadorPrompt({ contexto: false, artefato: false });
        setAcoesEmCurso({});
        setMensagem(mensagemRecebida.mensagem);
        return;
      }
    };

    window.addEventListener('message', escutarMensagem);
    enviar({ tipo: 'painel.carregado' });
    return () => window.removeEventListener('message', escutarMensagem);
  }, []);

  useEffect(() => {
    if (!estado.workspaceInicializado || estado.git.carregando || estado.git.carregadoEm || estado.git.erro) return;
    enviar({ tipo: 'git.carregarCommits', limite: setup.commitsPadrao });
  }, [estado.git.carregando, estado.git.carregadoEm, estado.git.erro, estado.workspaceInicializado, setup.commitsPadrao]);

  // Carrega as Atividades do OpenProject automaticamente uma vez, após o
  // workspace e o git estarem prontos (o "ambiente" totalmente carregado).
  // Assim o usuário já vê suas tarefas sem precisar clicar em "Sincronizar".
  const tasksAutoCarregadas = useRef(false);
  useEffect(() => {
    if (tasksAutoCarregadas.current) return;
    const opAtivo = estado.configuracao?.openProject.habilitado && estado.openProjectKeyPresente;
    const ambientePronto = estado.workspaceInicializado && (estado.git.carregadoEm || estado.git.erro);
    if (!opAtivo || !ambientePronto) return;
    if (estado.openprojectTasks.length > 0) {
      tasksAutoCarregadas.current = true;
      return;
    }
    tasksAutoCarregadas.current = true;
    iniciarAcao('op:listar');
    enviar({ tipo: 'openproject.listarTasks' });
  }, [
    estado.workspaceInicializado,
    estado.configuracao?.openProject.habilitado,
    estado.openProjectKeyPresente,
    estado.git.carregadoEm,
    estado.git.erro,
    estado.openprojectTasks.length,
  ]);

  useEffect(() => {
    if (estado.git.recentes.length === 0) {
      setHashesSelecionados([]);
      return;
    }

    setHashesSelecionados((atuais) => {
      const hashesDisponiveis = new Set(estado.git.recentes.map((commit) => commit.hash));
      const preservados = atuais.filter((hash) => hashesDisponiveis.has(hash));
      if (preservados.length > 0) return { preservados }.preservados;
      return estado.git.recentes.slice(0, Math.min(3, estado.git.recentes.length)).map((commit) => commit.hash);
    });
  }, [estado.git.recentes]);

  useEffect(() => {
    if (estado.ultimoPacoteValidacao) {
      setWizardStep('sucesso');
    } else {
      setWizardStep('selecionar');
    }
  }, [estado.ultimoPacoteValidacao]);

  useEffect(() => {
    if (estado.workspaceInicializado) {
      return;
    }
    if (!setup.openProjectHabilitado) {
      setValidacaoOpenProject({ status: 'ocioso', mensagem: '' });
      setProjetosOpenProjectDisponiveis([]);
    }
  }, [estado.workspaceInicializado, setup.openProjectHabilitado]);

  const status = useMemo(() => {
    if (!estado.workspaceAberto) return 'Abra um workspace para começar.';
    if (!estado.workspaceInicializado) return 'Workspace ainda não inicializado.';
    return 'Ferramenta iniciada e pronta para operar dentro do VS Code.';
  }, [estado.workspaceAberto, estado.workspaceInicializado]);

  const resumoEstrutura = useMemo(() => {
    const estrutura = estado.estrutura;
    if (!estrutura) return [];
    return [
      ['Configuração', estrutura.configuracaoPresente, '.qassistant/config.json'],
      ['Qassistant-testes', estrutura.qassistantTestesPresente, estado.raizTestes],
      ['docs/contexto', estrutura.contextoPresente, estado.raizContexto],
      ['instructions', estrutura.instructionsPresentes, '.github/instructions'],
      ['skills', estrutura.skillsPresentes, '.github/skills'],
    ] as const;
  }, [estado.estrutura, estado.raizContexto, estado.raizTestes]);

  const progressoSetup = useMemo(() => {
    if (!resumoEstrutura.length) return 0;
    const prontos = resumoEstrutura.filter(([, presente]) => Boolean(presente)).length;
    return Math.round((prontos / resumoEstrutura.length) * 100);
  }, [resumoEstrutura]);

  const commitsSelecionados = useMemo(
    () => estado.git.recentes.filter((commit) => hashesSelecionados.includes(commit.hash)),
    [estado.git.recentes, hashesSelecionados],
  );

  const modulos = [
    {
      titulo: 'OpenProject',
      descricao: 'Preparar vínculo, validar conexão e salvar snapshots de tasks.',
      estado: estado.configuracao?.openProject.habilitado ? 'Preparado' : 'Configurar',
      acao: 'Configurar',
      executar: () => focarSetupOpenProject(atualizarSetup),
      habilitado: true,
    },
    {
      titulo: 'Resumos por commits',
      descricao: 'Criar um pacote com os commits selecionados e abrir o resumo QA no editor.',
      estado: estado.workspaceInicializado ? `${hashesSelecionados.length} selecionado(s)` : 'Aguardando setup',
      acao: 'Criar com commits',
      executar: criarPacoteComCommits,
      habilitado: estado.workspaceInicializado && hashesSelecionados.length > 0,
    },
    {
      titulo: 'Validações',
      descricao: 'Navegar pelos pacotes de validação sem abrir pastas do sistema.',
      estado: estado.ultimoPacoteValidacao ? 'Pacote recente' : 'Pronto para usar',
      acao: estado.ultimoPacoteValidacao ? 'Ver último' : 'Ver validações',
      executar: () => enviar({ tipo: 'workspace.abrirCaminho', caminhoRelativo: estado.ultimoPacoteValidacao?.caminhoRelativo || 'Qassistant-testes/validacoes' }),
      habilitado: estado.workspaceInicializado,
    },
    {
      titulo: 'Testes',
      descricao: 'Abrir a área operacional de testes no navegador interno do painel.',
      estado: estado.estrutura?.qassistantTestesPresente ? 'Estrutura pronta' : 'Criar estrutura',
      acao: 'Ver testes',
      executar: () => enviar({ tipo: 'workspace.abrirCaminho', caminhoRelativo: estado.raizTestes }),
      habilitado: estado.workspaceInicializado,
    },
    {
      titulo: 'IA complementar',
      descricao: 'Abrir o prompt base para sugerir cenários, lacunas e evidências.',
      estado: 'Prompt-first',
      acao: 'Abrir prompt',
      executar: () => enviar({ tipo: 'workspace.abrirCaminho', caminhoRelativo: 'Qassistant-testes/prompts/sugerir-cenarios-qa.prompt.md' }),
      habilitado: estado.workspaceInicializado,
    },
  ];

  function atualizarSetup<K extends keyof SetupWorkspace>(campo: K, valor: SetupWorkspace[K]): void {
    setSetup((atual) => ({ ...atual, [campo]: valor }));
  }

  function inicializarWorkspace(): void {
    enviar({ tipo: 'workspace.inicializar', setup });
  }

  function carregarProjetosOpenProject(): void {
    setValidacaoOpenProject({ status: 'carregando', mensagem: 'Validando conexão com o OpenProject...' });
    enviar({
      tipo: 'openproject.validarConexao',
      urlBase: setup.openProjectUrlBase || OPENPROJECT_URL_PADRAO,
      token: tokenOpenProject.trim() || undefined,
    });
  }

  function selecionarDiretorioSetup(campo: CampoDiretorioSetup): void {
    const caminhoAtual = setup[campo] || '.';
    enviar({ tipo: 'workspace.selecionarDiretorio', campo, caminhoAtual });
  }

  function renderCampoDiretorio(label: string, campo: CampoDiretorioSetup, placeholder?: string): ReactElement {
    return (
      <label>
        {label}
        <div className="setup-path-picker">
          <input
            placeholder={placeholder}
            value={setup[campo] || ''}
            onChange={(evento) => atualizarSetup(campo, evento.target.value)}
          />
          <button
            type="button"
            className="secondary setup-picker-button"
            onClick={() => selecionarDiretorioSetup(campo)}
            title="Selecionar pasta"
            aria-label="Selecionar pasta"
          >
            <IconFolder />
          </button>
        </div>
      </label>
    );
  }

  function abrirCriadorPromptAssistido(): void {
    const stackInferida = inferirStackPromptAssistido(arquivosSugeridosPacoteAtivo, setup);
    setFormCriadorPrompt({
      ...PROMPT_ASSISTIDO_INICIAL,
      stack: stackInferida || PROMPT_ASSISTIDO_INICIAL.stack,
      objetivo: estado.ultimoPacoteValidacao?.titulo ? `Criar prompt de teste para ${estado.ultimoPacoteValidacao.titulo}` : '',
      contextoAdicional: criarResumoContextoPacote(estado.ultimoPacoteValidacao?.resumoQaConteudo),
      cenariosObservacoes: criarResumoObservacoesPacote(estado.ultimoPacoteValidacao?.commits || []),
      arquivosSelecionados: arquivosSugeridosPacoteAtivo,
      usarPacoteAtivo: Boolean(estado.ultimoPacoteValidacao),
    });
    setSeletorPromptAssistido(null);
    setResultadoPromptAssistido(null);
    setBusyCriadorPrompt({ contexto: false, artefato: false });
    setEtapaCriadorPrompt('parametros');
    setModalCriadorPromptAberto(true);
  }

  function fecharCriadorPromptAssistido(): void {
    setModalCriadorPromptAberto(false);
    setSeletorPromptAssistido(null);
    setResultadoPromptAssistido(null);
    setBusyCriadorPrompt({ contexto: false, artefato: false });
    setEtapaCriadorPrompt('parametros');
  }

  function atualizarCriadorPrompt<K extends keyof PromptAssistidoTeste>(campo: K, valor: PromptAssistidoTeste[K]): void {
    setResultadoPromptAssistido(null);
    setFormCriadorPrompt((atual) => {
      const proximo: PromptAssistidoTeste = { ...atual, [campo]: valor };
      if (campo === 'tipoTeste') {
        const meta = obterMetaTipoPromptAssistido(valor as TipoTesteAssistido);
        proximo.stack = meta.exigeStack ? (proximo.stack || inferirStackPromptAssistido(proximo.arquivosSelecionados, setup) || 'backend') : undefined;
      }
      return proximo;
    });
  }

  function abrirSeletorPromptAssistido(contexto: ContextoSeletorPrompt, caminhoRelativo?: string): void {
    setBusyCriadorPrompt((atual) => ({ ...atual, contexto: true }));
    enviar({
      tipo: 'testes.navegarSeletorPrompt',
      contexto,
      caminhoRelativo: caminhoRelativo || sugerirCaminhoInicialSeletorPrompt(contexto, formCriadorPrompt, setup, seletorPromptAssistido),
    });
  }

  function alternarSelecaoPromptAssistido(contexto: ContextoSeletorPrompt, caminhoRelativo: string): void {
    setResultadoPromptAssistido(null);
    setFormCriadorPrompt((atual) => {
      const campo = contexto === 'arquivos' ? 'arquivosSelecionados' : 'pastasSelecionadas';
      const listaAtual = atual[campo] || [];
      const proximaLista = listaAtual.includes(caminhoRelativo)
        ? listaAtual.filter((item) => item !== caminhoRelativo)
        : [...listaAtual, caminhoRelativo].sort((a, b) => a.localeCompare(b, 'pt-BR'));
      return { ...atual, [campo]: proximaLista };
    });
  }

  function removerSelecaoPromptAssistido(contexto: ContextoSeletorPrompt, caminhoRelativo: string): void {
    setResultadoPromptAssistido(null);
    setFormCriadorPrompt((atual) => {
      const campo = contexto === 'arquivos' ? 'arquivosSelecionados' : 'pastasSelecionadas';
      return { ...atual, [campo]: (atual[campo] || []).filter((item) => item !== caminhoRelativo) };
    });
  }

  function avancarCriadorPrompt(): void {
    if (etapaCriadorPrompt === 'parametros') {
      setEtapaCriadorPrompt('contexto');
      return;
    }
    if (etapaCriadorPrompt === 'contexto') {
      setEtapaCriadorPrompt('resultado');
    }
  }

  function voltarCriadorPrompt(): void {
    if (etapaCriadorPrompt === 'resultado') {
      setEtapaCriadorPrompt('contexto');
      return;
    }
    if (etapaCriadorPrompt === 'contexto') {
      setEtapaCriadorPrompt('parametros');
    }
  }

  function gerarPromptAssistido(): void {
    setBusyCriadorPrompt((atual) => ({ ...atual, artefato: true }));
    setResultadoPromptAssistido(null);
    enviar({
      tipo: 'testes.gerarPromptAssistido',
      payload: {
        ...formCriadorPrompt,
        stack: metaTipoPromptAssistido.exigeStack ? formCriadorPrompt.stack : undefined,
      },
    });
  }

  function recarregarCommits(): void {
    enviar({ tipo: 'git.carregarCommits', limite: setup.commitsPadrao });
  }

  function criarPacoteComCommits(): void {
    enviar({ tipo: 'validacao.criarComCommits', titulo: `validacao-${setup.nomeProjeto || 'qa'}`, hashes: hashesSelecionados });
    setCriandoNovoPacote(false);
    setActiveTab('validacoes');
  }

  function criarPacoteRascunho(): void {
    enviar({ tipo: 'validacao.criarRascunho', titulo: `validacao-${setup.nomeProjeto || 'qa'}` });
    setCriandoNovoPacote(false);
    setActiveTab('validacoes');
  }

  function alternarCommit(hash: string): void {
    setHashesSelecionados((atuais) => (
      atuais.includes(hash) ? atuais.filter((item) => item !== hash) : [...atuais, hash]
    ));
  }

  return (
    <main className="app-shell">
      {/* Header fixa, visual polido, logo png oficial à esquerda do título */}
      <header className="sticky-header">
        <div className="brand-mini-row">
          {estado.assets.logoUri && !logoQuebrado ? (
            <img
              className="mini-logo"
              src={estado.assets.logoUri}
              alt="QAssistant"
              width={20}
              height={20}
              decoding="async"
              draggable={false}
              onError={() => setLogoQuebrado(true)}
            />
          ) : (
            <div className="brand-mark" aria-label="QAssistant" style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--qa-brand)', color: 'var(--qa-brand-foreground)', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', flexShrink: 0 }}>Q</div>
          )}
          <h1>{estado.produto}</h1>
          <span className="version-small">v{estado.versaoExtensao}</span>
          <button
            type="button"
            className="secondary"
            aria-label="Configuração"
            title="Configuração"
            style={{
              marginLeft: 'auto',
              minHeight: '22px',
              width: '22px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              border: activeTab === 'config' ? '1px solid var(--qa-brand)' : '1px solid var(--qa-border)',
              color: activeTab === 'config' ? 'var(--qa-brand)' : 'var(--qa-muted)',
              flexShrink: 0,
            }}
            onClick={() => setActiveTab(activeTab === 'config' ? 'resumos' : 'config')}
          >
            <IconSettings />
          </button>
        </div>

        {/* Abas de Navegação Compactas (GitHub-like) */}
        {estado.workspaceInicializado ? (
          <nav className="tabs-navigation-clean" aria-label="Módulos de Navegação">
            <button
              type="button"
              className={`tab-btn-clean ${activeTab === 'resumos' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('resumos');
                setCriandoNovoPacote(false);
              }}
            >
              Visão Geral
            </button>
            <button
              type="button"
              className={`tab-btn-clean ${activeTab === 'openproject' ? 'active' : ''}`}
              onClick={() => setActiveTab('openproject')}
            >
              OpenProject
            </button>
            <button
              type="button"
              className={`tab-btn-clean ${activeTab === 'validacoes' ? 'active' : ''}`}
              onClick={() => setActiveTab('validacoes')}
            >
              Validações {estado.pacotesDisponiveis && estado.pacotesDisponiveis.length > 0 ? `(${estado.pacotesDisponiveis.length})` : ''}
            </button>
            <button
              type="button"
              className={`tab-btn-clean ${activeTab === 'testes' ? 'active' : ''}`}
              onClick={() => setActiveTab('testes')}
            >
              Testes & Artefatos
            </button>
          </nav>
        ) : (
          <nav className="tabs-navigation-clean">
            <button type="button" className="tab-btn-clean active">Setup Obrigatório</button>
          </nav>
        )}
      </header>

      {mensagem ? (
        <div className="notice" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 'var(--qa-space-2) var(--qa-space-4) 0' }}>
          <span>{mensagem}</span>
          <button
            type="button"
            className="secondary"
            onClick={() => setMensagem('')}
            style={{ minHeight: '20px', border: 'none', padding: '0 var(--qa-space-2)', fontSize: '10px' }}
          >
            Dispensar
          </button>
        </div>
      ) : null}

      <div className="scrollable-body">
        {/* PAINEL: WORKSPACE NÃO INICIALIZADO (FORÇA SETUP) */}
        {!estado.workspaceInicializado ? (
          <div className="tab-panel-content">
            <section className="panel status-panel" aria-labelledby="status-title">
              <div>
                <h2 id="status-title" style={{ fontSize: '13px', fontWeight: 600 }}>Primeiro uso do QAssistant</h2>
                <p style={{ margin: '4px 0', fontSize: '11px', color: 'var(--qa-muted)' }}>Configure só o essencial. O restante pode ser ajustado depois na aba de configuração.</p>
                <div className="progress-block" aria-label={`Progresso estrutural do setup: ${progressoSetup}%`} style={{ marginTop: 'var(--qa-space-2)' }}>
                  <div className="progress-track">
                    <span style={{ width: `${progressoSetup}%` }} />
                  </div>
                  <strong>{progressoSetup}% da estrutura atual detectada</strong>
                </div>
              </div>
              <div className="actions" style={{ marginTop: 'var(--qa-space-2)' }}>
                <button type="button" className="secondary" style={{ fontSize: '11px' }} onClick={() => enviar({ tipo: 'painel.atualizar' })}>
                  Atualizar leitura do workspace
                </button>
              </div>
            </section>

            <section className="panel setup-panel" aria-labelledby="setup-title">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Onboarding guiado</p>
                  <h2 id="setup-title" style={{ fontSize: '13px' }}>Inicializar workspace</h2>
                </div>
                <span className="badge">Etapa {['boas-vindas', 'openproject', 'workspace', 'concluir'].indexOf(etapaOnboarding) + 1} de 4</span>
              </div>

              <div className="setup-wizard-steps" role="tablist" aria-label="Etapas do onboarding">
                <button type="button" className={`setup-step-pill ${etapaOnboarding === 'boas-vindas' ? 'active' : ''}`} onClick={() => setEtapaOnboarding('boas-vindas')}>1. Visão geral</button>
                <button type="button" className={`setup-step-pill ${etapaOnboarding === 'openproject' ? 'active' : ''}`} onClick={() => setEtapaOnboarding('openproject')}>2. OpenProject</button>
                <button type="button" className={`setup-step-pill ${etapaOnboarding === 'workspace' ? 'active' : ''}`} onClick={() => setEtapaOnboarding('workspace')}>3. Projeto</button>
                <button type="button" className={`setup-step-pill ${etapaOnboarding === 'concluir' ? 'active' : ''}`} onClick={() => setEtapaOnboarding('concluir')}>4. Concluir</button>
              </div>

              {etapaOnboarding === 'boas-vindas' && (
                <div className="setup-wizard-panel">
                  <div className="setup-hero-grid">
                    <article className="surface-subtle setup-hero-card">
                      <span className="badge">QA operacional</span>
                      <h3>O que o QAssistant faz</h3>
                      <p>Organiza estrutura de testes, pacotes de validação por commits, prompts revisáveis e navegação operacional sem sair do VS Code.</p>
                    </article>
                    <article className="surface-subtle setup-hero-card">
                      <span className="badge">Integrações</span>
                      <h3>O que pode ser preparado agora</h3>
                      <p>Contexto do projeto, instructions, skills, OpenProject e pastas padrão para agentes em Cursor e Copilot seguirem o fluxo certo.</p>
                    </article>
                  </div>
                  <div className="setup-callout-grid">
                    <div className="surface-subtle setup-callout-box">
                      <strong>Sem configuração enorme</strong>
                      <span>Você informa o projeto, decide se quer contexto/skills e pode validar o OpenProject sem sair do painel.</span>
                    </div>
                    <div className="surface-subtle setup-callout-box">
                      <strong>Pode pular o OpenProject</strong>
                      <span>A integração é opcional. O setup principal continua funcionando e a conexão pode ser concluída depois.</span>
                    </div>
                  </div>
                  <div className="actions-row">
                    <button type="button" onClick={() => setEtapaOnboarding('openproject')}>Começar setup</button>
                  </div>
                </div>
              )}

              {etapaOnboarding === 'openproject' && (
                <div className="setup-wizard-panel">
                  <div className="setup-callout-grid single-column">
                    <div className="surface-subtle setup-callout-box">
                      <strong>Integração ativa por padrão</strong>
                      <span>Configure primeiro o token do OpenProject. Depois o QAssistant busca os projetos disponíveis para você apenas escolher.</span>
                    </div>
                  </div>

                  <label className="check-row setup-primary-toggle">
                    <input type="checkbox" checked={setup.openProjectHabilitado} onChange={(evento) => atualizarSetup('openProjectHabilitado', evento.target.checked)} />
                    Preparar integração com OpenProject neste workspace
                  </label>

                  {setup.openProjectHabilitado && (
                    <>
                      <div className="form-grid compact">
                        <label>
                          URL do OpenProject
                          <input value={setup.openProjectUrlBase || ''} onChange={(evento) => atualizarSetup('openProjectUrlBase', evento.target.value)} />
                        </label>
                        <label>
                          Token de acesso
                          <input
                            type="password"
                            placeholder={estado.openProjectKeyPresente ? 'Token já salvo; digite só se quiser substituir' : 'Cole o token para validar e listar projetos'}
                            value={tokenOpenProject}
                            onChange={(evento) => setTokenOpenProject(evento.target.value)}
                          />
                        </label>
                      </div>

                      <div className="setup-inline-help">
                        <span>Depois de validar o token, o QAssistant carrega os projetos que este acesso consegue enxergar.</span>
                        <a href={`${OPENPROJECT_URL_PADRAO}my/access_token`} target="_blank" rel="noreferrer">Ainda não tem um token?</a>
                      </div>

                      {validacaoOpenProject.status !== 'ocioso' && (
                        <div className={`inline-alert ${validacaoOpenProject.status === 'sucesso' ? 'success' : validacaoOpenProject.status === 'erro' ? 'danger' : 'info'}`}>
                          <span>{validacaoOpenProject.status === 'carregando' ? 'Validando...' : validacaoOpenProject.mensagem}</span>
                          {validacaoOpenProject.projetoNome ? <strong>{validacaoOpenProject.projetoNome}</strong> : null}
                        </div>
                      )}

                      {projetosOpenProjectDisponiveis.length > 0 && (
                        <label>
                          Projeto no OpenProject
                          <select
                            value={setup.openProjectProjetoId || ''}
                            onChange={(evento) => atualizarSetup('openProjectProjetoId', evento.target.value)}
                          >
                            {projetosOpenProjectDisponiveis.map((projeto) => (
                              <option key={projeto.identificador} value={projeto.identificador}>
                                {projeto.nome}{projeto.identificador !== projeto.nome ? ` (${projeto.identificador})` : ''}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}

                      <div className="actions-row split wrap-mobile">
                        <button type="button" className="secondary" onClick={carregarProjetosOpenProject}>
                          Conectar e listar projetos
                        </button>
                        <button type="button" className="secondary" onClick={() => {
                          atualizarSetup('openProjectHabilitado', false);
                          atualizarSetup('openProjectProjetoId', '');
                          setValidacaoOpenProject({ status: 'ocioso', mensagem: '' });
                          setProjetosOpenProjectDisponiveis([]);
                        }}>
                          Pular por agora
                        </button>
                      </div>
                    </>
                  )}

                  <div className="actions-row split">
                    <button type="button" className="secondary" onClick={() => setEtapaOnboarding('boas-vindas')}>Voltar</button>
                    <button
                      type="button"
                      onClick={() => setEtapaOnboarding('workspace')}
                      disabled={setup.openProjectHabilitado && !(validacaoOpenProject.status === 'sucesso' && setup.openProjectProjetoId)}
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {etapaOnboarding === 'workspace' && (
                <div className="setup-wizard-panel">
                  <div className="form-grid">
                    <label>
                      Nome do projeto
                      <input value={setup.nomeProjeto} onChange={(evento) => atualizarSetup('nomeProjeto', evento.target.value)} placeholder="Ex.: MedSystem" />
                    </label>
                    {renderCampoDiretorio('Pasta principal do código', 'raizCodigo')}
                    {renderCampoDiretorio('Frontend', 'frontend', 'Opcional')}
                    {renderCampoDiretorio('Backend', 'backend', 'Opcional')}
                    <label>
                      Commits sugeridos por rodada
                      <input type="number" min={1} value={setup.commitsPadrao} onChange={(evento) => atualizarSetup('commitsPadrao', numero(evento.target.value, 10))} />
                    </label>
                  </div>

                  <div className="setup-option-stack">
                    <label className="check-row">
                      <input type="checkbox" checked={setup.criarContextoProjeto} onChange={(evento) => atualizarSetup('criarContextoProjeto', evento.target.checked)} />
                      Criar `docs/contexto` para registrar arquitetura, regras e riscos do projeto.
                    </label>
                    <label className="check-row">
                      <input type="checkbox" checked={setup.criarAssetsAgent} onChange={(evento) => atualizarSetup('criarAssetsAgent', evento.target.checked)} />
                      Criar `.github/instructions` e `.github/skills` para orientar agentes automaticamente.
                    </label>
                  </div>

                  <div className="actions-row split">
                    <button type="button" className="secondary" onClick={() => setEtapaOnboarding('openproject')}>Voltar</button>
                    <button type="button" onClick={() => setEtapaOnboarding('concluir')} disabled={!setup.nomeProjeto.trim()}>Revisar setup</button>
                  </div>
                </div>
              )}

              {etapaOnboarding === 'concluir' && (
                <div className="setup-wizard-panel">
                  <div className="setup-summary-grid">
                    <div className="surface-subtle setup-summary-card">
                      <span className="summary-card__label">Projeto</span>
                      <strong className="summary-card__value text-truncate">{setup.nomeProjeto || 'Sem nome definido'}</strong>
                      <span className="summary-card__meta text-truncate">Código em {setup.raizCodigo || '.'}</span>
                    </div>
                    <div className="surface-subtle setup-summary-card">
                      <span className="summary-card__label">OpenProject</span>
                      <strong className="summary-card__value">{setup.openProjectHabilitado ? 'Preparado' : 'Pulado'}</strong>
                      <span className="summary-card__meta text-truncate">
                        {setup.openProjectHabilitado
                          ? validacaoOpenProject.status === 'sucesso'
                            ? projetoOpenProjectSelecionado?.nome || validacaoOpenProject.projetoNome || 'Conexão validada'
                            : 'Você pode validar depois na configuração'
                          : 'Sem bloquear o primeiro uso'}
                      </span>
                    </div>
                    <div className="surface-subtle setup-summary-card">
                      <span className="summary-card__label">Assets para agentes</span>
                      <strong className="summary-card__value">{setup.criarAssetsAgent ? 'Ativados' : 'Desativados'}</strong>
                      <span className="summary-card__meta text-truncate">Instructions, skills e regras de QA</span>
                    </div>
                  </div>

                  <div className="setup-checklist-grid">
                    {resumoEstrutura.map(([titulo, presente, caminho]) => (
                      <div key={titulo} className={`setup-check-item ${presente ? 'ready' : ''}`}>
                        <strong>{titulo}</strong>
                        <span>{caminho}</span>
                        <em>{presente ? 'já detectado' : 'será preparado no setup'}</em>
                      </div>
                    ))}
                  </div>

                  <div className="actions-row split">
                    <button type="button" className="secondary" onClick={() => setEtapaOnboarding('workspace')}>Voltar</button>
                    <button type="button" onClick={inicializarWorkspace} disabled={!estado.workspaceAberto || !setup.nomeProjeto.trim()}>
                      Criar estrutura do QAssistant
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="tab-panel-content">
            {/* Acesso Rápido — sempre visível abaixo das abas */}
            <div style={{ display: 'flex', gap: '5px', padding: '6px 0', borderBottom: '1px solid var(--qa-border)', marginBottom: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: 'var(--qa-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', marginRight: '4px' }}>Atalhos:</span>
              
              <button
                type="button"
                className="secondary"
                style={{ fontSize: '11px', minHeight: '22px', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => {
                  setActiveTab('resumos');
                  setCriandoNovoPacote(true);
                  setWizardStep('selecionar');
                }}
              >
                <IconLightning style={{ color: 'var(--qa-link)' }} />
                <span>Nova Validação</span>
              </button>

              <button
                type="button"
                className="secondary"
                style={{ fontSize: '11px', minHeight: '22px', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => {
                  setAbaValidacoesFoco('lista');
                  setActiveTab('validacoes');
                }}
              >
                <IconSearch />
                <span>Validações</span>
              </button>

              <button
                type="button"
                className="secondary"
                style={{ fontSize: '11px', minHeight: '22px', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setActiveTab('testes')}
              >
                <IconFile />
                <span>Testes</span>
              </button>

              <button
                type="button"
                className="secondary"
                style={{ fontSize: '11px', minHeight: '22px', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setActiveTab('openproject')}
              >
                <IconChat />
                <span>OpenProject</span>
              </button>

              <button
                type="button"
                className="secondary"
                style={{ fontSize: '11px', minHeight: '22px', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setActiveTab('config')}
              >
                <IconSettings />
                <span>Configuração</span>
              </button>
            </div>
            <div key={activeTab} className="qa-tab-body">
            {activeTab === 'resumos' && !criandoNovoPacote && (
              <div className="visao-geral" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* 1. KPI Cards Row (Grid) */}
                <div className="dashboard-summary-grid">
                  <div className="summary-card">
                    <span className="summary-card__label">Ambiente</span>
                    <strong className="summary-card__value text-truncate">
                      {setup.nomeProjeto || 'QAssistant'}
                    </strong>
                    <span className="summary-card__meta success">
                      <span className="dot-indicator"></span>
                      {estado.git.branch || 'main'}
                    </span>
                  </div>

                  <div className="summary-card">
                    <span className="summary-card__label">Última validação</span>
                    <strong className="summary-card__value link text-truncate" title={estado.ultimoPacoteValidacao?.id}>
                      {estado.ultimoPacoteValidacao ? formatarNomePacote(estado.ultimoPacoteValidacao.id) : 'Nenhuma ainda'}
                    </strong>
                    <span className="summary-card__meta text-truncate">
                      {estado.ultimoPacoteValidacao ? 'Pronta para IA e publicação' : 'Crie sua primeira validação'}
                    </span>
                  </div>

                  <div className="summary-card">
                    <span className="summary-card__label">OpenProject</span>
                    <strong className="summary-card__value">
                      {estado.configuracao?.openProject.habilitado ? `${estado.openprojectTasks.length} Atividades` : 'Inativo'}
                    </strong>
                    <span className="summary-card__meta">
                      {estado.configuracao?.openProject.habilitado ? 'Consulta sob demanda' : 'Integração opcional'}
                    </span>
                  </div>
                </div>

                {/* 2. Status de Integracoes & Pendencias */}
                <div className="telemetry-grid">
                  
                  {/* Esquerda: Telemetria de Integracoes */}
                  <div className="op-card" style={{ background: 'var(--qa-surface)' }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--qa-muted)', letterSpacing: '0.3px' }}>
                      Status de Telemetria
                    </h3>
                    <div className="telemetry-list">
                      <div className="telemetry-row">
                        <span>Motor QAssistant Core:</span>
                        <span className="badge success" style={{ padding: '2px 6px', fontSize: '9.5px' }}>v{estado.versaoExtensao} Ativo</span>
                      </div>
                      <div className="telemetry-row">
                        <span>Integração Git Local:</span>
                        <span style={{ color: 'var(--qa-success)', fontWeight: 500 }}>{estado.git.recentes.length} Commits lidos</span>
                      </div>
                      <div className="telemetry-row">
                        <span>Gemini AI API Key:</span>
                        {estado.geminiKeyPresente ? (
                          <span style={{ color: 'var(--qa-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span className="dot-indicator" /> Disponível
                          </span>
                        ) : (
                          <span style={{ color: 'var(--qa-error)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span className="dot-indicator" /> Não configurada
                          </span>
                        )}
                      </div>
                      <div className="telemetry-row">
                        <span>OpenProject API:</span>
                        {estado.openProjectKeyPresente ? (
                          <span style={{ color: 'var(--qa-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span className="dot-indicator" /> Autenticado
                          </span>
                        ) : (
                          <span style={{ color: 'var(--qa-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span className="dot-indicator" /> Off-line / Bypass
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Direita: Pendencias & Atalhos Rápidos */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="op-card action-callout" style={{ background: 'var(--qa-surface)', flex: 1 }}>
                      <div>
                        <h3 style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--qa-muted)' }}>
                          Ações Recomendadas
                        </h3>
                        <p style={{ fontSize: '10px', color: 'var(--qa-muted)', margin: '0 0 8px', lineHeight: '1.3' }}>
                          Inicie um pacote de validação compilando seus commits locais.
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <button
                          type="button"
                          style={{ width: '100%', minHeight: '26px', fontSize: '11.5px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          onClick={() => {
                            setHashesSelecionados([]);
                            setCriandoNovoPacote(true);
                            setWizardStep('selecionar');
                          }}
                        >
                          <IconPlus />
                          <span>Nova Validação</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Pendencias / Avisos Importantes */}
                {!estado.geminiKeyPresente && (
                  <div className="inline-alert warning" style={{ fontSize: '10.5px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <IconWarning style={{ color: 'var(--qa-warning)', marginRight: '4px' }} />
                    <span><strong>IA Offline:</strong> Insira uma API Key do Gemini nas Configurações para habilitar relatórios automáticos de impacto clínico.</span>
                  </div>
                )}

                {/* 4. Tarefas OpenProject Recentes */}
                <div className="op-card" style={{ background: 'var(--qa-surface)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '11.5px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--qa-muted)' }}>
                      Atividades Recentes no OpenProject
                    </h3>
                    {estado.configuracao?.openProject.habilitado && (
                      <button
                        type="button"
                        className="secondary"
                        style={{ fontSize: '9px', minHeight: '18px', padding: '1px 6px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        disabled={acaoAtiva('op:listar')}
                        onClick={() => { iniciarAcao('op:listar'); enviar({ tipo: 'openproject.listarTasks' }); }}
                      >
                        {acaoAtiva('op:listar') && <Spinner size={8} />}
                        <span>{acaoAtiva('op:listar') ? 'Sincronizando...' : 'Sincronizar'}</span>
                      </button>
                    )}
                  </div>
                  {acaoAtiva('op:listar') && estado.openprojectTasks.length === 0 ? (
                    <SkeletonLista linhas={3} />
                  ) : estado.openprojectTasks.length === 0 ? (
                    <div className="empty-dashed-panel">
                      <p style={{ fontSize: '11px', color: 'var(--qa-muted)', margin: 0 }}>
                        Nenhuma tarefa pendente ou conexão as síncronas com OpenProject estão desativadas.
                      </p>
                    </div>
                  ) : (
                    <div className="scroll-region compact qa-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px' }}>
                      {estado.openprojectTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className="op-task-summary-row"
                          onClick={() => {
                            setSelectedTask(task);
                            if (!task.descricaoMarkdown) {
                              setCarregandoDetalhesTaskId(String(task.id));
                              enviar({ tipo: 'openproject.obterDetalhes', taskId: task.id });
                            }
                          }}
                        >
                          <span style={{ fontWeight: 600, color: 'var(--qa-link)', marginRight: '6px' }}>#{task.id}</span>
                          <span className="text-truncate" style={{ flex: 1 }}>{task.assunto}</span>
                          <span className="badge-small" style={{ marginLeft: '6px' }}>{task.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'resumos' && criandoNovoPacote && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <button
                    type="button"
                    className="secondary"
                    style={{ fontSize: '11px', minHeight: '24px', padding: '2px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => setCriandoNovoPacote(false)}
                  >
                    <IconArrowLeft />
                    <span>Voltar para Visão Geral</span>
                  </button>
                </div>

                {/* Indicador de Passos do Wizard — stepper premium com badges numeradas */}
                {(() => {
                  const ordem = ['selecionar', 'revisar', 'sucesso'] as const;
                  const atualIdx = ordem.indexOf(wizardStep);
                  const passos = [
                    { rotulo: 'Commits', extra: hashesSelecionados.length > 0 ? `(${hashesSelecionados.length})` : '' },
                    { rotulo: 'Revisar', extra: '' },
                    { rotulo: 'Concluir', extra: '' },
                  ];
                  return (
                    <div className="steps-indicator" role="list" aria-label="Etapas">
                      {passos.map((passo, i) => {
                        const estadoPasso = i < atualIdx ? 'completed' : i === atualIdx ? 'active' : 'pending';
                        return (
                          <Fragment key={passo.rotulo}>
                            {i > 0 && <div className={`steps-divider ${i <= atualIdx ? 'filled' : ''}`} />}
                            <span className={`step-item ${estadoPasso}`} role="listitem" aria-current={estadoPasso === 'active' ? 'step' : undefined}>
                              <span className="step-badge">{estadoPasso === 'completed' ? <IconCheck /> : i + 1}</span>
                              <span className="step-label">{passo.rotulo}{passo.extra ? ` ${passo.extra}` : ''}</span>
                            </span>
                          </Fragment>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* PASSO 1: SELECIONAR COMMITS */}
                {wizardStep === 'selecionar' && (
                  <section className="panel commits-panel" aria-labelledby="commits-title">
                    <div className="section-heading">
                      <h2 id="commits-title" style={{ fontSize: '13px', margin: 0 }}>Selecione os commits</h2>
                      <span className="badge">{estado.git.carregando ? 'Carregando...' : `${estado.git.recentes.length} commits`}</span>
                    </div>

                    {estado.git.erro ? <div className="inline-alert danger" style={{ fontSize: '11px' }}>{estado.git.erro}</div> : null}

                    {!estado.git.erro && (
                      <>
                        {/* Filtro compacto por Repositorios */}
                        {estado.git.repositorios && estado.git.repositorios.length > 0 && (
                          <div style={{ margin: 'var(--qa-space-1) 0', display: 'flex', gap: 'var(--qa-space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ fontSize: '10px', color: 'var(--qa-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Repositório:</span>
                            <button
                              type="button"
                              className={`secondary ${repoFiltro === 'todos' ? 'active-filter' : ''}`}
                              style={{ minHeight: '20px', padding: '2px 8px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px', border: repoFiltro === 'todos' ? '1px solid var(--qa-link)' : '1px solid var(--qa-border)' }}
                              onClick={() => setRepoFiltro('todos')}
                            >
                              Todos <span className="badge-small">{estado.git.recentes.length}</span>
                            </button>
                            {estado.git.repositorios.map((repo) => {
                              const count = estado.git.recentes.filter(c => c.repositorioId === repo.id).length;
                              return (
                                <button
                                  key={repo.id}
                                  type="button"
                                  className={`secondary ${repoFiltro === repo.id ? 'active-filter' : ''}`}
                                  style={{
                                    minHeight: '20px',
                                    padding: '2px 8px',
                                    fontSize: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    border: repoFiltro === repo.id ? '1px solid var(--qa-link)' : '1px solid var(--qa-border)'
                                  }}
                                  onClick={() => setRepoFiltro(repo.id)}
                                >
                                  {repo.nome} <span className="badge-small">{count}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        <div className="commit-toolbar" style={{ display: 'flex', gap: '6px', margin: '6px 0', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="secondary"
                            style={{ fontSize: '11px', minHeight: '22px' }}
                            onClick={() => {
                              const filtrados = estado.git.recentes.filter(c => repoFiltro === 'todos' || c.repositorioId === repoFiltro);
                              setHashesSelecionados(filtrados.map((commit) => commit.hash));
                            }}
                            disabled={estado.git.recentes.length === 0 || estado.git.carregando}
                          >
                            Selecionar todos
                          </button>
                          <button type="button" className="secondary" style={{ fontSize: '11px', minHeight: '22px' }} onClick={() => setHashesSelecionados([])} disabled={hashesSelecionados.length === 0}>
                            Limpar
                          </button>
                          <button
                            type="button"
                            className="secondary"
                            style={{ fontSize: '11px', minHeight: '22px', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}
                            onClick={recarregarCommits}
                            disabled={estado.git.carregando}
                          >
                            {estado.git.carregando ? <Spinner size={9} /> : <IconRefresh />}
                            <span>{estado.git.carregando ? 'Recarregando...' : 'Recarregar'}</span>
                          </button>
                        </div>

                        {estado.git.carregando && estado.git.recentes.length === 0 ? (
                          <SkeletonLista linhas={4} />
                        ) : estado.git.recentes.length === 0 ? (
                          <EmptyState texto="Nenhum commit recente encontrado nos subdiretórios monitorados." />
                        ) : (
                          <div
                            className="commit-list commit-list-shell scroll-region qa-fade-in"
                            style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '340px', opacity: estado.git.carregando ? 0.55 : 1, transition: 'opacity 0.15s ease', pointerEvents: estado.git.carregando ? 'none' : 'auto' }}
                          >
                            {estado.git.recentes
                              .filter((commit) => repoFiltro === 'todos' || commit.repositorioId === repoFiltro)
                              .map((commit) => (
                                <CommitItem
                                  commit={commit}
                                  key={commit.hash}
                                  selecionado={hashesSelecionados.includes(commit.hash)}
                                  onToggle={() => alternarCommit(commit.hash)}
                                />
                              ))}
                          </div>
                        )}

                        {hashesSelecionados.length > 0 && (
                          <div className="actions-row" style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              type="button"
                              style={{ fontSize: '11px', minHeight: '26px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => setWizardStep('revisar')}
                            >
                              <span>Avançar para Revisão</span>
                              <IconChevronRight />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </section>
                )}

                {/* PASSO 2: REVISAR PACOTE */}
                {wizardStep === 'revisar' && (
                  <section className="panel">
                    <div className="section-heading">
                      <div>
                        <p className="eyebrow">Ajustes finais</p>
                        <h2 style={{ fontSize: '13px' }}>Revisar composição do pacote</h2>
                      </div>
                    </div>

                    <div className="preview-grid-summary">
                      <div className="preview-block">
                        <h4>Projeto</h4>
                        <p>{setup.nomeProjeto}</p>
                      </div>
                      <div className="preview-block">
                        <h4>Branch</h4>
                        <p>{estado.git.branch || 'main'}</p>
                      </div>
                      <div className="preview-block">
                        <h4>Commits Selecionados</h4>
                        <p>{hashesSelecionados.length} selecionado(s)</p>
                      </div>
                    </div>

                    <div style={{ marginTop: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--qa-muted)', display: 'block', marginBottom: '4px' }}>Assunto dos Commits:</span>
                      <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '100px', overflowY: 'auto', overflowWrap: 'anywhere' }}>
                        {commitsSelecionados.map(c => (
                          <li key={c.hash} style={{ lineHeight: 1.4 }}>
                            <code>{c.hashCurto}</code> - {c.assunto} <span style={{ fontSize: '9px', color: 'var(--qa-muted)' }}>({c.repositorioNome})</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="revisar-footer">
                      <button
                        type="button"
                        className="secondary revisar-footer__back"
                        title="Voltar para a seleção de commits"
                        onClick={() => setWizardStep('selecionar')}
                      >
                        <IconArrowLeft />
                        <span>Voltar</span>
                      </button>

                      <div className="revisar-footer__primary">
                        <button
                          type="button"
                          className="secondary"
                          title="Criar um pacote vazio, sem vincular commits (você adiciona depois)"
                          onClick={criarPacoteRascunho}
                        >
                          Criar rascunho
                        </button>
                        <button
                          type="button"
                          title="Gera o pacote com os commits selecionados e abre as ações de IA"
                          style={{ fontWeight: 600 }}
                          onClick={() => {
                            criarPacoteComCommits();
                            setWizardStep('sucesso');
                          }}
                        >
                          <IconCheck />
                          <span>Gerar pacote ({hashesSelecionados.length})</span>
                        </button>
                      </div>
                    </div>
                  </section>
                )}

                {/* PASSO 3: SUCESSO & IA */}
                {wizardStep === 'sucesso' && estado.ultimoPacoteValidacao && (
                  <section className="panel" style={{ border: '1px solid var(--qa-success)', background: 'var(--qa-surface-subtle)', padding: '12px' }}>
                    <div className="section-heading" style={{ padding: 0, marginBottom: '6px' }}>
                      <div>
                        <p className="eyebrow" style={{ color: 'var(--qa-success)' }}>Pacote Operacional Ativo</p>
                        <h2 style={{ fontSize: '13px', margin: 0 }}>{formatarNomePacote(estado.ultimoPacoteValidacao.id)}</h2>
                      </div>
                      <span className="badge success">Pronto</span>
                    </div>

                    <p style={{ fontSize: '11px', margin: '4px 0 10px', color: 'var(--qa-muted)' }}>
                      Seu pacote de validação e o arquivo <code>resumo-qa.md</code> foram gerados! Escolha uma das ações de inteligência e automação abaixo para expandir e documentar o impacto das suas alterações.
                    </p>

                    <div className="sucesso-ia-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ border: '1px solid var(--qa-border)', padding: '8px', borderRadius: '4px', background: 'var(--qa-surface)' }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 600 }}>Resumo de Impacto IA</h4>
                        <p style={{ fontSize: '10px', color: 'var(--qa-muted)', margin: '0 0 6px', lineHeight: '1.3' }}>
                          Analisa as modificações do seu pacote contra o histórico e preenche um relatório de impacto.
                        </p>
                        <button
                          type="button"
                          style={{ width: '100%', minHeight: '22px', fontSize: '10px', padding: '2px 4px' }}
                          disabled={processandoIA !== null}
                          onClick={() => {
                            setProcessandoIA('resumo');
                            enviar({ tipo: 'validacao.gerarResumoIA', rascunhoCaminho: estado.ultimoPacoteValidacao!.caminhoRelativo });
                          }}
                        >
                          {processandoIA === 'resumo' ? 'Gerando resumo...' : 'Gerar Resumo IA'}
                        </button>
                      </div>

                      <div style={{ border: '1px solid var(--qa-border)', padding: '8px', borderRadius: '4px', background: 'var(--qa-surface)' }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 600 }}>Sugerir Testes IA</h4>
                        <p style={{ fontSize: '10px', color: 'var(--qa-muted)', margin: '0 0 6px', lineHeight: '1.3' }}>
                          Gera uma especificação completa de baterias de testes automatizados E2E / manuais recomendados.
                        </p>
                        <button
                          type="button"
                          style={{ width: '100%', minHeight: '22px', fontSize: '10px', padding: '2px 4px' }}
                          disabled={processandoIA !== null}
                          onClick={() => {
                            setProcessandoIA('bateria');
                            enviar({ tipo: 'validacao.sugerirBateriaTestes', rascunhoCaminho: estado.ultimoPacoteValidacao!.caminhoRelativo });
                          }}
                        >
                          {processandoIA === 'bateria' ? 'Sugerindo testes...' : 'Sugerir Bateria'}
                        </button>
                      </div>
                    </div>

                    {/* Vínculo de Work Package no próprio painel de sucesso de geração */}
                    <div style={{ border: '1px solid var(--qa-border)', padding: '8px', borderRadius: '4px', background: 'var(--qa-surface)', marginBottom: '8px' }}>
                      <h4 style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 600 }}>Publicar Relatório no OpenProject</h4>
                      <p style={{ fontSize: '10px', color: 'var(--qa-muted)', margin: '0 0 8px', lineHeight: '1.3' }}>
                        Publique/atualize a descrição e o progresso da task no OpenProject usando o arquivo <code>resumo-qa.md</code> gerado no editor principal.
                      </p>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input
                          placeholder="Task ID (vazio se criar nova)"
                          value={taskIdWizard}
                          onChange={(evento) => setTaskIdWizard(evento.target.value)}
                          style={{ fontSize: '10px', height: '22px', flex: 1, padding: '2px 6px', borderRadius: '3px', border: '1px solid var(--qa-border)' }}
                        />
                        <button
                          type="button"
                          disabled={processandoIA !== null}
                          style={{ minHeight: '22px', fontSize: '10px', padding: '2px 8px' }}
                          onClick={() => {
                            const idVal = taskIdWizard.trim();
                            setProcessandoIA('openproject');
                            enviar({
                              tipo: 'openproject.publicarTask',
                              rascunhoCaminho: estado.ultimoPacoteValidacao!.caminhoRelativo,
                              taskId: idVal || undefined
                            });
                          }}
                        >
                          {processandoIA === 'openproject' ? 'Enviando...' : 'Publicar'}
                        </button>
                      </div>
                    </div>

                    <div className="actions-row" style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', borderTop: '1px solid var(--qa-border)', paddingTop: '8px' }}>
                      <button
                        type="button"
                        className="secondary"
                        style={{ fontSize: '10px', minHeight: '22px' }}
                        onClick={() => {
                          setHashesSelecionados([]);
                          setWizardStep('selecionar');
                        }}
                      >
                        Recriar Pacote
                      </button>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="secondary"
                          style={{ fontSize: '10px', minHeight: '22px' }}
                          onClick={() => {
                            if (estado.ultimoPacoteValidacao) {
                              enviar({ tipo: 'workspace.abrirCaminho', caminhoRelativo: `${estado.ultimoPacoteValidacao.caminhoRelativo}/resumo-qa.md` });
                            }
                          }}
                        >
                          Visualizar Resumo QA
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          style={{ fontSize: '10px', minHeight: '22px' }}
                          onClick={() => {
                            if (estado.ultimoPacoteValidacao) {
                              enviar({ tipo: 'workspace.abrirCaminho', caminhoRelativo: `${estado.ultimoPacoteValidacao.caminhoRelativo}/pacote.yaml` });
                            }
                          }}
                        >
                          Ver YAML
                        </button>
                      </div>
                    </div>
                  </section>
                )}
              </>
            )}

            {/* ABA: OPENPROJECT */}
            {activeTab === 'openproject' && (
              <section className="panel" style={{ padding: 'var(--qa-space-4)' }}>
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Integração Externa</p>
                    <h2 style={{ fontSize: '13px' }}>Gerenciamento no OpenProject</h2>
                  </div>
                  <span className={`badge ${estado.configuracao?.openProject.habilitado ? 'success' : ''}`}>
                    {estado.configuracao?.openProject.habilitado ? 'Habilitado' : 'Desativado'}
                  </span>
                </div>

                {!estado.configuracao?.openProject.habilitado ? (
                  <div style={{ marginTop: 'var(--qa-space-2)' }}>
                    <p className="hero-text" style={{ fontSize: '11px' }}>
                      O vínculo com o OpenProject do MedSystem não está ativado nas configurações do QAssistant.
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--qa-muted)' }}>
                      Ao habilitá-lo, o QAssistant permite monitorar o status do Work Package, capturar snapshots e associar os pacotes de validação gerados diretamente com as tarefas de QA.
                    </p>
                    <button type="button" onClick={() => { setActiveTab('config'); }} style={{ marginTop: 'var(--qa-space-2)', fontSize: '11px' }}>
                      Habilitar OpenProject
                    </button>
                  </div>
                ) : (
                  <div className="tab-panel-content" style={{ marginTop: 'var(--qa-space-2)' }}>
                    
                  {/* 1. Card menor de conexão ativa com servidor */}
                    <div className="op-card" style={{ padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--qa-surface-subtle)', border: '1px solid var(--qa-border)', borderRadius: '6px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: estado.openProjectKeyPresente ? 'var(--qa-success)' : 'var(--qa-muted)' }} />
                        <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--qa-muted)' }}>
                          URL/Projeto: <strong style={{ color: 'var(--qa-foreground)' }}>{estado.configuracao.openProject.urlBase ? estado.configuracao.openProject.urlBase.replace('https://', '') : 'openproject.ormel.com.br'} / {estado.configuracao.openProject.projetoId || 'medsystem'}</strong>
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="secondary"
                          style={{ fontSize: '10px', minHeight: '18px', padding: '1px 6px', display: 'flex', alignItems: 'center', gap: '3px' }}
                          onClick={() => { setActiveTab('config'); }}
                        >
                          <IconSettings />
                          <span>Configurar</span>
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          style={{ fontSize: '10px', minHeight: '18px', padding: '1px 6px', display: 'flex', alignItems: 'center', gap: '3px' }}
                          disabled={acaoAtiva('op:listar')}
                          onClick={() => { iniciarAcao('op:listar'); enviar({ tipo: 'openproject.listarTasks' }); }}
                        >
                          {acaoAtiva('op:listar') ? <Spinner size={8} /> : <IconSearch />}
                          <span>Testar</span>
                        </button>
                      </div>
                    </div>

                    {/* 2. Tasks abertas como o primeiro elemento relevante da aba */}
                    <div className="op-card" style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '12px', fontWeight: 600 }}>Tarefas em Aberto (Work Packages)</h3>
                          <p style={{ margin: '2px 0 0', fontSize: '10px', color: 'var(--qa-muted)' }}>Histórico sincronizado do projeto orquestrador externo.</p>
                        </div>
                        <button
                          type="button"
                          className="secondary"
                          style={{ fontSize: '10px', minHeight: '20px', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '3px' }}
                          disabled={acaoAtiva('op:listar')}
                          onClick={() => { iniciarAcao('op:listar'); enviar({ tipo: 'openproject.listarTasks' }); }}
                        >
                          {acaoAtiva('op:listar') ? <Spinner size={8} /> : <IconSearch />}
                          <span>{acaoAtiva('op:listar') ? 'Atualizando...' : 'Atualizar'}</span>
                        </button>
                      </div>

                      {acaoAtiva('op:listar') && estado.openprojectTasks.length === 0 ? (
                        <SkeletonLista linhas={4} />
                      ) : estado.openprojectTasks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '24px 0', border: '1px dashed var(--qa-border)', borderRadius: '6px' }}>
                          <p style={{ fontSize: '11px', color: 'var(--qa-muted)', margin: '0 0 10px' }}>
                            Nenhuma tarefa carregada na lista local.
                          </p>
                          <button
                            type="button"
                            style={{ fontSize: '11px', minHeight: '24px', margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            disabled={acaoAtiva('op:listar')}
                            onClick={() => { iniciarAcao('op:listar'); enviar({ tipo: 'openproject.listarTasks' }); }}
                          >
                            {acaoAtiva('op:listar') ? <Spinner size={10} /> : <IconSearch />}
                            <span>{acaoAtiva('op:listar') ? 'Sincronizando...' : 'Sincronizar Tarefas'}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="qa-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '550px', overflowY: 'auto', paddingRight: '4px' }}>
                          {estado.openprojectTasks.map((task) => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              onEnviar={enviar}
                              onSelect={(t) => {
                                setSelectedTask(t);
                                if (!t.descricaoMarkdown) {
                                  setCarregandoDetalhesTaskId(String(t.id));
                                  enviar({ tipo: 'openproject.obterDetalhes', taskId: t.id });
                                }
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Atalho para publicar: leva o usuário ao fluxo de criação → publicação */}
                    <div className="op-card" style={{ borderStyle: 'dashed', display: 'flex', flexDirection: 'column', gap: 'var(--qa-space-2)' }}>
                      <h3 style={{ margin: 0, fontSize: '11px' }}>Publicar uma validação</h3>
                      <p className="hero-text" style={{ fontSize: '11px', margin: 0, color: 'var(--qa-muted)' }}>
                        A publicação no OpenProject acontece a partir de uma validação. Abra uma validação existente ou crie uma nova para enviar o relatório <code>resumo-qa.md</code>.
                      </p>
                      <div className="actions-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          style={{ fontSize: '11px', minHeight: '24px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => {
                            setHashesSelecionados([]);
                            setCriandoNovoPacote(true);
                            setWizardStep('selecionar');
                            setActiveTab('resumos');
                          }}
                        >
                          <IconPlus />
                          <span>Criar validação</span>
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          style={{ fontSize: '11px', minHeight: '24px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => { setAbaValidacoesFoco('lista'); setActiveTab('validacoes'); }}
                        >
                          <IconSearch />
                          <span>Ver validações</span>
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </section>
            )}

            {/* ABA: TESTES & ARTEFATOS */}
            {activeTab === 'testes' && (
              <>
                {/* CONTROLE & ESPECIFICAÇÕES DE TESTE */}
                <section className="panel" style={{ border: '1px solid var(--qa-border)', borderRadius: '4px', padding: '12px', marginBottom: '12px' }}>
                  <div className="section-heading" style={{ padding: 0, marginBottom: '8px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '12px', fontWeight: 600 }}>Preparar testes</h3>
                      <p style={{ margin: '2px 0 0', fontSize: '10.5px', color: 'var(--qa-muted)' }}>Arquivos-guia do projeto e o criador de prompts de teste com IA.</p>
                    </div>
                  </div>

                  <div className="resource-card-grid">

                    <div className="op-card resource-card">
                      <div className="resource-card__header">
                        <IconSparkles />
                        <strong>Criar prompt de teste</strong>
                      </div>
                      <p className="hero-text" style={{ fontSize: '10px', margin: 0, color: 'var(--qa-muted)' }}>
                        Monta, com a IA, um prompt pronto (arquivos, contexto e observações) para gerar testes no seu agente.
                      </p>
                      <button
                        type="button"
                        className="secondary resource-card__action"
                        onClick={abrirCriadorPromptAssistido}
                        disabled={!estado.workspaceInicializado}
                      >
                        <IconSparkles />
                        <span>Montar prompt</span>
                      </button>
                    </div>
                    
                    {/* Card Mapa de Testes */}
                    <div className="op-card resource-card">
                      <div className="resource-card__header">
                        <IconDatabase />
                        <strong>Mapa de Testes</strong>
                      </div>
                      <p className="hero-text" style={{ fontSize: '10px', margin: 0, color: 'var(--qa-muted)' }}>
                        Lista os cenários e fluxos que o projeto cobre (arquivo do workspace).
                      </p>
                      <button
                        type="button"
                        className="secondary resource-card__action"
                        onClick={() => enviar({ tipo: 'workspace.abrirCaminho', caminhoRelativo: 'testes/mapa-de-testes.yaml' })}
                      >
                        <IconFile />
                        <span>Abrir Mapa</span>
                      </button>
                    </div>

                    {/* Card Regras de Teste */}
                    <div className="op-card resource-card">
                      <div className="resource-card__header">
                        <IconLightning />
                        <strong>Diretrizes de QA</strong>
                      </div>
                      <p className="hero-text" style={{ fontSize: '10px', margin: 0, color: 'var(--qa-muted)' }}>
                        Como escrever e padronizar os testes deste projeto.
                      </p>
                      <button
                        type="button"
                        className="secondary resource-card__action"
                        onClick={() => enviar({ tipo: 'workspace.abrirCaminho', caminhoRelativo: 'testes/regras-de-teste.md' })}
                      >
                        <IconFile />
                        <span>Ver Regras</span>
                      </button>
                    </div>

                    {/* Card Relatórios & Histórico */}
                    <div className="op-card resource-card">
                      <div className="resource-card__header">
                        <IconSearch />
                        <strong>Relatórios & evidências</strong>
                      </div>
                      <p className="hero-text" style={{ fontSize: '10px', margin: 0, color: 'var(--qa-muted)' }}>
                        Resultados, logs e evidências gerados a cada execução.
                      </p>
                      <button
                        type="button"
                        className="secondary resource-card__action"
                        onClick={() => enviar({ tipo: 'workspace.abrirCaminho', caminhoRelativo: 'testes/relatorios/' })}
                      >
                        <IconSearch />
                        <span>Abrir na Navegação</span>
                      </button>
                    </div>

                  </div>
                </section>

                {/* EXECUTADOR DE TESTES INTERATIVO */}
                <section className="panel qa-inline-runner" style={{ border: '1px solid var(--qa-border)', borderRadius: '4px', padding: '12px', marginBottom: '12px' }}>
                  <div className="section-heading" style={{ padding: 0, marginBottom: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: '12px', fontWeight: 600 }}>Executar testes (QA Runner)</h3>
                      <p style={{ margin: '2px 0 0', fontSize: '10.5px', color: 'var(--qa-muted)' }}>Escolha uma categoria, rode os testes e acompanhe os logs e resultados aqui mesmo.</p>
                    </div>
                    <button
                      type="button"
                      className="secondary qa-runner__compact-button"
                      onClick={() => enviar({ tipo: 'testes.abrirEmAba' })}
                      title="Abrir QA Runner em aba dedicada"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                      </svg>
                      Maximizar
                    </button>
                  </div>

                  <div className="qa-inline-runner__control-row">
                    <div className="field-stack">
                      <label htmlFor="categoria-teste" className="field-label">Categoria de Teste:</label>
                      <select
                        id="categoria-teste"
                        className="qa-runner__control"
                        value={categoriaSelecionada}
                        onChange={(e) => setCategoriaSelecionada(e.target.value)}
                        disabled={estado.execucaoTestes?.status === 'executando'}
                      >
                        <option value="todos">Todos os Testes de QA</option>
                        <optgroup label="── Ponta a Ponta (Playwright)">
                          <option value="PONTAPONTA">Todos os Fluxos Ponta a Ponta</option>
                          <option value="VALIDACAO_BASICA">Validação Básica (Smoke Tests)</option>
                          <option value="CAMINHO_FELIZ">Caminho Feliz (Gold Flows)</option>
                          <option value="EXCECOES">Exceções e Casos Limite</option>
                          <option value="ADMIN">Área Administrativa</option>
                          <option value="MOBILE">Mobile e Regressão</option>
                        </optgroup>
                        <optgroup label="── Outros">
                          <option value="UNITARIO">Testes Unitários</option>
                          <option value="COMPONENTE">Testes de Componentes</option>
                          <option value="INTEGRACAO">Testes de Integração</option>
                          <option value="USABILIDADE">Testes de Usabilidade</option>
                          <option value="ACESSIBILIDADE">Testes de Acessibilidade</option>
                        </optgroup>
                      </select>
                    </div>

                    <div className="field-stack">
                      <label htmlFor="nome-execucao-teste" className="field-label">Nome da execução (opcional):</label>
                      <input
                        id="nome-execucao-teste"
                        className="qa-runner__control"
                        type="text"
                        value={nomeExecucaoTeste}
                        onChange={(e) => setNomeExecucaoTeste(e.target.value)}
                        placeholder="ex: sprint-42, pré-release..."
                        disabled={estado.execucaoTestes?.status === 'executando'}
                      />
                    </div>

                    <button
                      type="button"
                      className="qa-runner__run-button qa-inline-runner__launch"
                      disabled={estado.execucaoTestes?.status === 'executando'}
                      onClick={() => enviar({ tipo: 'testes.executar', categoria: categoriaSelecionada, nomeExecucao: nomeExecucaoTeste.trim() || undefined })}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: estado.execucaoTestes?.status === 'executando' ? 'var(--qa-border)' : 'var(--qa-link)', color: 'var(--qa-brand-foreground)', border: 'none' }}
                    >
                      {estado.execucaoTestes?.status === 'executando' ? (
                        <>
                          <span className="inline-spinner" style={{ width: '10px', height: '10px', color: 'var(--qa-brand-foreground)' }}></span>
                          <span>Executando...</span>
                        </>
                      ) : (
                        <>
                          <IconLightning />
                          <span>Rodar Testes</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* EXECUTION LOGS AND METRICS */}
                  {estado.execucaoTestes && (estado.execucaoTestes.status !== 'ocioso' || estado.execucaoTestes.logs) && (
                    <div className="qa-inline-runner__panel">
                      {/* Mini pipeline indicator */}
                      {(() => {
                        const st = estado.execucaoTestes.status;
                        const stages = ['PREP', 'EXEC', 'ANÁLISE', 'FIM'];
                        const doneIdx = st === 'ocioso' ? -1 : st === 'executando' ? 0 : 3;
                        const activeIdx = st === 'executando' ? 1 : -1;
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '6px' }}>
                            {stages.map((s, i) => {
                              const done = i <= doneIdx || (st === 'sucesso' || st === 'erro');
                              const active = i === activeIdx;
                              const isError = st === 'erro' && i === 3;
                              const color = isError ? 'var(--qa-error)' : done ? 'var(--qa-success)' : active ? 'var(--qa-info)' : 'var(--qa-border)';
                              return (
                                <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < stages.length - 1 ? 1 : 'none' }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '9px', fontWeight: 700, color, padding: '1px 4px', borderRadius: '3px', border: `1px solid ${color}33`, background: `${color}11`, whiteSpace: 'nowrap' }}>
                                    {active ? <span className="inline-spinner" style={{ width: '8px', height: '8px', color }} /> : null}{s}
                                  </span>
                                  {i < stages.length - 1 && <div style={{ flex: 1, height: '1px', background: done ? 'var(--qa-success)' : 'var(--qa-border)', margin: '0 2px' }} />}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                      <div className="qa-inline-runner__metrics">
                        <span className="qa-inline-runner__metrics-title">Métricas em Tempo Real</span>
                        <div className="qa-runner__summary">
                          <span className="info">Total: <strong>{estado.execucaoTestes.totalCount}</strong></span>
                          <span className="success">Sucessos: <strong>{estado.execucaoTestes.sucessosCount}</strong></span>
                          <span className="error">Falhas: <strong>{estado.execucaoTestes.errosCount}</strong></span>
                        </div>
                      </div>

                      <pre className="mono-block scroll-region compact" style={{ fontSize: '10px', maxHeight: '180px', padding: '8px' }}>
                        {estado.execucaoTestes.logs}
                      </pre>

                      {estado.execucaoTestes.status !== 'executando' && (
                        <div className="qa-inline-runner__result">
                          <span className={`state-chip ${estado.execucaoTestes.status === 'sucesso' ? 'success' : 'danger'}`} style={{ fontSize: '9.5px' }}>
                            {estado.execucaoTestes.status === 'sucesso' ? <IconCheck /> : <IconClose />}
                            {estado.execucaoTestes.status === 'sucesso' ? 'Suíte concluída com sucesso!' : 'Falhas detectadas nos testes.'}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {estado.execucaoTestes.sumarioCaminhoRelativo && (
                              <button
                                type="button"
                                className="secondary qa-runner__compact-button"
                                onClick={() => enviar({ tipo: 'workspace.abrirCaminho', caminhoRelativo: estado.execucaoTestes!.sumarioCaminhoRelativo! })}
                                style={{ borderColor: 'color-mix(in srgb, var(--qa-success) 45%, var(--qa-border))', color: 'var(--qa-success)', fontSize: '9.5px', display: 'flex', alignItems: 'center', gap: '2px' }}
                              >
                                <IconFolder />
                                <span>Ver Relatório</span>
                              </button>
                            )}
                            <button
                              type="button"
                              className="secondary qa-runner__compact-button"
                              onClick={() => enviar({ tipo: 'testes.limparHistorico' })}
                              style={{ fontSize: '9.5px', display: 'flex', alignItems: 'center', gap: '2px' }}
                            >
                              <IconTrash />
                              <span>Limpar Painel</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PAINEL DE FALHAS DETALHADAS — DEV TRIAGE DASHBOARD */}
                  {estado.execucaoTestes?.falhasDetalhes && estado.execucaoTestes.falhasDetalhes.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <div className="qa-runner__triage-head" style={{ margin: '14px 0 6px', borderRadius: '8px 8px 0 0' }}>
                        <span className="qa-runner__triage-badge">DETALHES</span>
                        <h4 style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: 'var(--qa-foreground)' }}>Painel de Falhas Estruturadas (Dev Triage)</h4>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {estado.execucaoTestes.falhasDetalhes.map((falha: any) => {
                          const estaExpandido = !!falhaExpandida[falha.id];
                          return (
                            <div
                              key={falha.id}
                              style={{
                                border: '1px solid color-mix(in srgb, var(--qa-error) 45%, var(--qa-border))',
                                borderRadius: '6px',
                                background: 'var(--qa-surface)',
                                overflow: 'hidden'
                              }}
                            >
                              {/* Header Collapsible */}
                              <div
                                onClick={() => setFalhaExpandida(prev => ({ ...prev, [falha.id]: !estaExpandido }))}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '8px 10px',
                                  background: 'var(--qa-error-faint)',
                                  cursor: 'pointer',
                                  userSelect: 'none'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '9px', background: 'var(--qa-error)', color: 'var(--qa-brand-foreground)', padding: '1px 5px', borderRadius: '3px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                                    {falha.id}
                                  </span>
                                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--qa-error)' }}>
                                    {falha.nome}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: 'var(--qa-muted)', background: 'var(--qa-surface-subtle)', padding: '1px 4px', borderRadius: '3px' }}>
                                    <IconClock style={{ width: '10px', height: '10px' }} /> {falha.duracao}
                                  </span>
                                  <span style={{ fontSize: '10px', color: 'var(--qa-muted)' }}>
                                    {falha.steps} s.
                                  </span>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--qa-muted)' }}>
                                    {estaExpandido ? <IconChevronDown /> : <IconChevronRight />}
                                  </span>
                                </div>
                              </div>

                              {estaExpandido && (
                                <div style={{ padding: '8px 10px', borderTop: '1px solid color-mix(in srgb, var(--qa-error) 45%, var(--qa-border))', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--qa-muted)', borderBottom: '1px solid var(--qa-border)', paddingBottom: '3px' }}>
                                    Evidências e achados de QA:
                                  </div>
                                  
                                  {falha.findings && falha.findings.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                      {falha.findings.map((finding: string, idx: number) => {
                                        const isHigh = finding.includes('[HIGH]');
                                        const isMedium = finding.includes('[MEDIUM]');
                                        const isLow = finding.includes('[LOW]');
                                        
                                        let bkgColor = 'transparent';
                                        let textColor = 'var(--qa-code-foreground)';
                                        let label = '';

                                        if (isHigh) {
                                          bkgColor = 'var(--qa-error-faint)';
                                          textColor = 'var(--qa-error)';
                                          label = 'HIGH';
                                        } else if (isMedium) {
                                          bkgColor = 'var(--qa-warning-faint)';
                                          textColor = 'var(--qa-warning)';
                                          label = 'MEDIUM';
                                        } else if (isLow) {
                                          bkgColor = 'color-mix(in srgb, var(--qa-warning) 10%, transparent)';
                                          textColor = 'var(--qa-warning)';
                                          label = 'LOW';
                                        }

                                        const isStackTrace = finding.startsWith('    ');

                                        return (
                                          <div
                                            key={idx}
                                            style={{
                                              padding: isStackTrace ? '2px 6px' : '4px 6px',
                                              background: isStackTrace ? 'var(--qa-code-bg)' : bkgColor,
                                              borderLeft: isStackTrace ? '2px solid var(--qa-border)' : `3px solid ${label ? textColor : 'transparent'}`,
                                              borderRadius: isStackTrace ? '2px' : '0 4px 4px 0',
                                              fontFamily: isStackTrace ? 'monospace' : 'inherit',
                                              fontSize: isStackTrace ? '9px' : '10px',
                                              color: textColor,
                                              whiteSpace: 'pre-wrap',
                                              wordBreak: 'break-all'
                                            }}
                                          >
                                            {finding.replace(/^\[(HIGH|MEDIUM|LOW)\]\s*/, '')}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div style={{ fontSize: '10px', color: 'var(--qa-muted)', fontStyle: 'italic' }}>
                                      Nenhum achado estruturado ou erro de console foi extraído para esta falha. Verifique os logs gerais da suíte.
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* HISTÓRICO DE EXECUÇÕES */}
                  {estado.execucaoTestes?.historico && estado.execucaoTestes.historico.length > 0 && (
                    <div>
                      <h4 style={{ margin: '8px 0 4px', fontSize: '10.5px', fontWeight: 600, color: 'var(--qa-muted)' }}>Histórico Recente de Execuções</h4>
                      <div className="qa-inline-runner__history">
                        {estado.execucaoTestes.historico.slice(0, 5).map((run: any) => (
                          <div key={run.id} className="qa-inline-runner__history-row">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: run.status === 'sucesso' ? 'var(--qa-success)' : 'var(--qa-error)' }}></span>
                              <strong style={{ fontFamily: 'monospace' }}>#{run.id}</strong>
                              <span style={{ color: 'var(--qa-muted)' }}>{run.categoria}</span>
                            </div>
                            <div className="qa-inline-runner__history-meta">
                              <span>{run.total} testes em {run.segundos}s</span>
                              <span>{run.dataHora.split(' ')[1]}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                <section className="panel navigator-panel" aria-labelledby="navigator-title">
                  <div className="section-heading">
                    <div>
                      <h2 id="navigator-title" style={{ fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                        <IconSearch />
                        <span>Explorar arquivos de teste</span>
                      </h2>
                      <p style={{ margin: "2px 0 0", fontSize: "10.5px", color: "var(--qa-muted)" }}>Navegue pelas pastas de Qassistant-testes e abra qualquer arquivo.</p>
                    </div>
                    {estado.navegador ? <span className="badge">{estado.navegador.entradas.length} itens</span> : null}
                  </div>

                  {estado.navegador ? (
                    <>
                      {/* Breadcrumbs de Navegação */}
                      <div className="navigator-path" style={{
                        margin: "10px 0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "8px",
                        background: "var(--qa-surface-subtle)",
                        padding: "6px 10px",
                        borderRadius: "6px",
                        border: "1px solid var(--qa-border)",
                        fontSize: "11px",
                        boxSizing: "border-box",
                        minWidth: 0
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--qa-muted)", flex: "1 1 auto", minWidth: 0 }}>
                          <span
                            className="text-truncate"
                            title={estado.navegador.caminhoRelativo || "/"}
                            style={{ fontWeight: 600, color: "var(--qa-foreground)", direction: "rtl", textAlign: "left" }}
                          >
                            {estado.navegador.caminhoRelativo || "/"}
                          </span>
                        </div>
                        {caminhoPai(estado.navegador.caminhoRelativo) ? (
                          <button
                            type="button"
                            className="secondary"
                            style={{
                              minHeight: "20px",
                              height: "20px",
                              padding: "0 8px",
                              fontSize: "10px",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              flexShrink: 0,
                              border: "1px solid var(--qa-border)",
                              borderRadius: "4px"
                            }}
                            onClick={() => enviar({ tipo: "workspace.abrirCaminho", caminhoRelativo: caminhoPai(estado.navegador?.caminhoRelativo || "") || estado.raizTestes })}
                          >
                            <IconArrowLeft />
                            <span>Voltar</span>
                          </button>
                        ) : null}
                      </div>

                      <div className="navigator-list" style={{ 
                        maxHeight: "220px", 
                        overflowY: "auto", 
                        border: "1px solid var(--qa-border)", 
                        padding: "4px", 
                        borderRadius: "6px",
                        background: "var(--qa-surface)",
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px"
                      }}>
                        {estado.navegador.entradas.map((entrada) => {
                          const isFolder = entrada.tipo === "pasta";
                          return (
                            <div 
                              key={entrada.caminhoRelativo}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "8px",
                                padding: "6px 10px",
                                borderRadius: "4px",
                                background: "transparent",
                                transition: "background 0.1s ease-in-out",
                                cursor: "pointer",
                                boxSizing: "border-box",
                                minWidth: 0
                              }}
                              className="navigator-row-hover"
                              onClick={() => enviar({ tipo: "workspace.abrirCaminho", caminhoRelativo: entrada.caminhoRelativo })}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1 1 auto", minWidth: 0 }}>
                                <span style={{ color: isFolder ? "var(--qa-link)" : "var(--qa-muted)", display: "flex", alignItems: "center", flexShrink: 0 }}>
                                  {isFolder ? <IconFolder /> : <IconFile />}
                                </span>
                                <span
                                  className="text-truncate"
                                  title={entrada.nome}
                                  style={{
                                    fontSize: "11.5px",
                                    color: isFolder ? "var(--qa-foreground)" : "var(--qa-muted)",
                                    fontWeight: isFolder ? 700 : 500
                                  }}
                                >
                                  {entrada.nome}
                                </span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, marginLeft: "8px" }}>
                                {isFolder ? (
                                  <span style={{ fontSize: "9.5px", color: "var(--qa-muted)", display: "flex", alignItems: "center", gap: "3px" }}>
                                    <span>Navegar</span>
                                    <IconChevronRight />
                                  </span>
                                ) : (
                                  <>
                                    <small style={{ color: "var(--qa-muted)", fontSize: "9.5px" }}>
                                      {formatarTamanho(entrada.tamanhoBytes)}
                                    </small>
                                    <button
                                      type="button"
                                      className="primary"
                                      style={{
                                        minHeight: "18px",
                                        height: "18px",
                                        padding: "0 6px",
                                        fontSize: "9.5px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "2px",
                                        borderRadius: "3px"
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        enviar({ tipo: "workspace.abrirCaminho", caminhoRelativo: entrada.caminhoRelativo });
                                      }}
                                    >
                                      <IconEye />
                                      <span>Abrir</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {estado.navegador.arquivoAberto ? (
                        <p className="navigator-opened" style={{ marginTop: "var(--qa-space-2)", fontSize: "10px", color: "var(--qa-muted)", overflowWrap: "anywhere" }}>
                          Arquivo em exibição no editor: <code>{estado.navegador.arquivoAberto}</code>
                        </p>
                      ) : null}
                    </>
                  ) : <EmptyState texto="Navegador não disponível. Inicialize o workspace primeiro." />}
                </section>

                <section className="panel directory-panel" aria-labelledby="estrutura-title">
                  <div className="section-heading">
                    <div>
                      <h2 id="estrutura-title" style={{ fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                        <IconFolder />
                        <span>Atalhos do projeto</span>
                      </h2>
                      <p style={{ margin: "2px 0 0", fontSize: "10.5px", color: "var(--qa-muted)" }}>Abra direto as pastas e arquivos-chave do QAssistant.</p>
                    </div>
                  </div>
                  <div className="structure-grid">
                    {resumoEstrutura.map(([rotulo, presente, caminho]) => (
                      <button 
                        className="structure-item" 
                        style={{ 
                          padding: "10px 12px", 
                          fontSize: "11px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          border: "1px solid var(--qa-border)",
                          borderRadius: "6px",
                          background: presente ? "var(--qa-surface)" : "color-mix(in srgb, var(--qa-surface) 50%, transparent)",
                          color: presente ? "var(--qa-foreground)" : "var(--qa-muted)",
                          cursor: presente ? "pointer" : "not-allowed",
                          fontWeight: 600,
                          transition: "all 0.1s ease-in-out",
                          boxSizing: "border-box"
                        }} 
                        disabled={!presente} 
                        key={rotulo} 
                        onClick={() => enviar({ tipo: "workspace.abrirCaminho", caminhoRelativo: caminho })} 
                        type="button"
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <IconFile />
                          <span>{rotulo}</span>
                        </span>
                        {presente ? (
                          <span style={{ fontSize: "10px", color: "var(--qa-link)", display: "inline-flex", alignItems: "center", gap: "2px" }}>Visitar <IconChevronRight /></span>
                        ) : (
                          <span style={{ fontSize: "9px", color: "var(--qa-muted)", background: "var(--qa-surface-subtle)", padding: "1px 4px", borderRadius: "3px" }}>Ausente</span>
                        )}
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* ABA: VALIDAÇÕES (PACOTE COMPACTO / EXIBIÇÃO DE ENTIDADE DIGITAL) */}
            {activeTab === 'validacoes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {abaValidacoesFoco === 'detalhes' && estado.ultimoPacoteValidacao ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Header do Pacote de Valdação */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--qa-surface-subtle)', padding: '8px 12px', border: '1px solid var(--qa-border)', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '9px', color: 'var(--qa-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Pacote de Validação</span>
                        <h2 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: 'var(--qa-foreground)' }}>
                          {formatarNomePacote(estado.ultimoPacoteValidacao.id)}
                        </h2>
                        {estado.ultimoPacoteValidacao.criadoEm && (
                          <span style={{ fontSize: '9.5px', color: 'var(--qa-muted)' }}>
                            Gerado em {formatarData(estado.ultimoPacoteValidacao.criadoEm)}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span className="badge success" style={{ textTransform: 'uppercase', fontSize: '9px', padding: '2px 6px' }}>
                          {estado.ultimoPacoteValidacao.statusCompleto || 'Rascunho'}
                        </span>
                        <button
                          type="button"
                          className="secondary"
                          style={{ fontSize: '10.5px', minHeight: '24px', padding: '2px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => setAbaValidacoesFoco('lista')}
                        >
                          <IconArrowLeft />
                          <span>Voltar</span>
                        </button>
                      </div>
                    </div>

                    {/* ROW 1: Detalhes (compacto) + Assistente de IA — split 38/62, mesma altura */}
                    <div className="validacao-detalhe-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: '8px', alignItems: 'stretch' }}>

                      {/* COLUNA ESQUERDA: Vínculos Operacionais compacto */}
                      <div style={{ background: 'var(--qa-surface)', border: '1px solid var(--qa-border)', borderRadius: '6px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--qa-muted)', letterSpacing: '0.4px' }}>Detalhes</span>

                        {/* Status */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '9px', color: 'var(--qa-muted)' }}>Status</span>
                          <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--qa-link)' }}>
                            {estado.ultimoPacoteValidacao.statusCompleto || 'Rascunho'}
                          </span>
                        </div>

                        {/* OpenProject */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '9px', color: 'var(--qa-muted)' }}>OpenProject</span>
                          {estado.ultimoPacoteValidacao.openProjectId ? (
                            <a
                              href={`${setup.openProjectUrlBase || 'https://openproject.ormel.com.br'}/work_packages/${estado.ultimoPacoteValidacao.openProjectId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: '10.5px', color: 'var(--qa-link)', textDecoration: 'underline', fontWeight: 600, wordBreak: 'break-all' }}
                            >
                              #{estado.ultimoPacoteValidacao.openProjectId}
                            </a>
                          ) : (
                            <span style={{ fontSize: '10px', color: 'var(--qa-muted)', fontStyle: 'italic' }}>Sem vínculo</span>
                          )}
                        </div>

                        {/* Commits: máx 3 visíveis + chip "+N" com tooltip */}
                        {estado.ultimoPacoteValidacao.commits && estado.ultimoPacoteValidacao.commits.length > 0 && (() => {
                          const commits = estado.ultimoPacoteValidacao!.commits!;
                          const visíveis = commits.slice(0, 3);
                          const ocultos = commits.slice(3);
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <span style={{ fontSize: '9px', color: 'var(--qa-muted)' }}>
                                Commits ({commits.length})
                              </span>
                              <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                                {visíveis.map((hash) => (
                                  <code key={hash} title={hash} style={{ fontSize: '9px', background: 'var(--qa-surface-subtle)', border: '1px solid var(--qa-border)', padding: '1px 3px', borderRadius: '3px', color: 'var(--qa-foreground)', cursor: 'default' }}>
                                    {hash.slice(0, 7)}
                                  </code>
                                ))}
                                {ocultos.length > 0 && (
                                  <span
                                    title={ocultos.join('\n')}
                                    style={{ fontSize: '9px', background: 'var(--qa-surface-subtle)', border: '1px solid var(--qa-border)', padding: '1px 4px', borderRadius: '3px', color: 'var(--qa-muted)', cursor: 'help' }}
                                  >
                                    +{ocultos.length}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* COLUNA DIREITA: Assistente de IA — foco nos botões */}
                      <div style={{ background: 'var(--qa-surface)', border: '1px solid var(--qa-border)', borderRadius: '6px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--qa-muted)', letterSpacing: '0.4px' }}>Assistente de IA</span>
                        <p style={{ fontSize: '9.5px', color: 'var(--qa-muted)', margin: 0, lineHeight: '1.3' }}>
                          Invoque inteligência clínica especializada e analise riscos nestes commits.
                        </p>

                        {/* Botão primário: Analisar e Gerar Resumo */}
                        <button
                          type="button"
                          className="btn-ai"
                          style={{ width: '100%', minHeight: '28px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontWeight: 700 }}
                          disabled={processandoIA !== null || !estado.geminiKeyPresente}
                          onClick={() => {
                            setProcessandoIA('resumo');
                            enviar({ tipo: 'validacao.gerarResumoIA', rascunhoCaminho: estado.ultimoPacoteValidacao!.caminhoRelativo });
                          }}
                        >
                          <IconAnalyze />
                          <span>{processandoIA === 'resumo' ? 'Analisando...' : 'Analisar e Gerar Resumo'}</span>
                        </button>

                        {/* Botão secundário: Sugerir Testes IA */}
                        <button
                          type="button"
                          className="btn-ai"
                          style={{ width: '100%', minHeight: '24px', fontSize: '10.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', opacity: 0.85 }}
                          disabled={processandoIA !== null || !estado.geminiKeyPresente}
                          onClick={() => {
                            setProcessandoIA('bateria');
                            enviar({ tipo: 'validacao.sugerirBateriaTestes', rascunhoCaminho: estado.ultimoPacoteValidacao!.caminhoRelativo });
                          }}
                        >
                          <IconClipboardCheck />
                          <span>{processandoIA === 'bateria' ? 'Sugerindo...' : 'Sugerir Testes IA'}</span>
                        </button>

                        {!estado.geminiKeyPresente && (
                          <span style={{ fontSize: '9px', color: 'var(--qa-error)', textAlign: 'center', display: 'block' }}>
                            Forneça a API Key nas configurações.
                          </span>
                        )}

                        <div style={{ borderTop: '1px solid var(--qa-border)', paddingTop: '5px' }}>
                          <button
                            type="button"
                            style={{ width: '100%', minHeight: '22px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: 'transparent', border: '1px solid var(--qa-border)', color: 'var(--qa-foreground)', borderRadius: '4px', cursor: 'pointer' }}
                            disabled={!estado.configuracao?.openProject.habilitado && !estado.openProjectKeyPresente}
                            onClick={() => setModalPublicarOP({ aberto: true, taskId: '', tipoTask: 'Task' })}
                          >
                            <IconExternalLink />
                            <span>Publicar no OpenProject</span>
                          </button>
                          {!estado.configuracao?.openProject.habilitado && !estado.openProjectKeyPresente && (
                            <span style={{ fontSize: '9px', color: 'var(--qa-muted)', textAlign: 'center', display: 'block', marginTop: '2px' }}>
                              Configure o OpenProject primeiro.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ROW 2: Relatório de Impacto (Resumo QA) — largura total, colapsável */}
                    <div style={{ background: 'var(--qa-surface)', border: '1px solid var(--qa-border)', borderRadius: '6px', padding: '12px' }}>
                      <div
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', paddingBottom: relatorioColapsado ? 0 : '4px', borderBottom: relatorioColapsado ? 'none' : '1px solid var(--qa-border)', marginBottom: relatorioColapsado ? 0 : '8px' }}
                        onClick={() => setRelatorioColapsado((v) => !v)}
                        role="button"
                        aria-expanded={!relatorioColapsado}
                        aria-label="Expandir/recolher relatório"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          {relatorioColapsado ? <IconChevronRight /> : <IconChevronDown />}
                          <h3 style={{ margin: 0, fontSize: '11.5px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--qa-muted)' }}>Relatório de Impacto (Resumo QA)</h3>
                        </div>
                        <button
                          type="button"
                          className="secondary"
                          style={{ fontSize: '9px', minHeight: '18px', padding: '1px 5px' }}
                          onClick={(e) => { e.stopPropagation(); enviar({ tipo: 'workspace.abrirCaminho', caminhoRelativo: `${estado.ultimoPacoteValidacao!.caminhoRelativo}/resumo-qa.md` }); }}
                        >
                          Editar Código
                        </button>
                      </div>
                      {!relatorioColapsado && (
                        <div style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                          {estado.ultimoPacoteValidacao.resumoQaConteudo ? (
                            renderizarMarkdown(estado.ultimoPacoteValidacao.resumoQaConteudo)
                          ) : (
                            <p style={{ fontSize: '11px', color: 'var(--qa-muted)', fontStyle: 'italic', margin: 0 }}>
                              Carregando ou sem conteúdo no arquivo resumo-qa.md.
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ROW 3: Arquivos Operacionais */}
                    <div style={{ background: 'var(--qa-surface)', border: '1px solid var(--qa-border)', borderRadius: '6px', padding: '10px' }}>
                      <h3 style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--qa-muted)' }}>Arquivos Operacionais</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <button
                          type="button"
                          className="secondary"
                          style={{ textAlign: 'left', fontSize: '10.5px', display: 'flex', justifyContent: 'space-between', padding: '4px var(--qa-space-2)' }}
                          onClick={() => enviar({ tipo: 'workspace.abrirCaminho', caminhoRelativo: `${estado.ultimoPacoteValidacao!.caminhoRelativo}/pacote.yaml` })}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IconFile /> <span>pacote.yaml</span></span>
                          <span style={{ fontSize: '9px', color: 'var(--qa-muted)' }}>Definições</span>
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          style={{ textAlign: 'left', fontSize: '10.5px', display: 'flex', justifyContent: 'space-between', padding: '4px var(--qa-space-2)' }}
                          onClick={() => enviar({ tipo: 'workspace.abrirCaminho', caminhoRelativo: `${estado.ultimoPacoteValidacao!.caminhoRelativo}/resumo-qa.md` })}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IconFile /> <span>resumo-qa.md</span></span>
                          <span style={{ fontSize: '9px', color: 'var(--qa-muted)' }}>Markdown</span>
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          style={{ textAlign: 'left', fontSize: '10.5px', display: 'flex', justifyContent: 'space-between', padding: '4px var(--qa-space-2)' }}
                          onClick={() => enviar({ tipo: 'workspace.abrirCaminho', caminhoRelativo: `${estado.ultimoPacoteValidacao!.caminhoRelativo}/guia-de-validacao.prompt.md` })}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IconFile /> <span>guia-de-validacao.prompt.md</span></span>
                          <span style={{ fontSize: '9px', color: 'var(--qa-muted)' }}>Prompt IA</span>
                        </button>
                      </div>
                    </div>

                    {/* ROW 4: Ações de Limpeza */}
                    <div style={{ background: 'var(--qa-surface)', border: '1px solid var(--qa-border)', borderRadius: '6px', padding: '10px' }}>
                      <h3 style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--qa-muted)' }}>Ações de Limpeza</h3>
                      {confirmandoExclusao === estado.ultimoPacoteValidacao!.caminhoRelativo ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            className="secondary"
                            style={{ flex: 1, minHeight: '22px', fontSize: '10.5px', color: 'var(--qa-error)', borderColor: 'var(--qa-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                            disabled={acaoAtiva(`pkg:del:${estado.ultimoPacoteValidacao!.caminhoRelativo}`)}
                            onClick={() => {
                              iniciarAcao(`pkg:del:${estado.ultimoPacoteValidacao!.caminhoRelativo}`);
                              enviar({ tipo: 'validacao.excluirPacote', caminhoRelativo: estado.ultimoPacoteValidacao!.caminhoRelativo });
                              setConfirmandoExclusao(null);
                              setAbaValidacoesFoco('lista');
                            }}
                          >
                            {acaoAtiva(`pkg:del:${estado.ultimoPacoteValidacao!.caminhoRelativo}`) && <Spinner size={9} />}
                            <span>Confirmar exclusão</span>
                          </button>
                          <button
                            type="button"
                            className="secondary"
                            style={{ minHeight: '22px', fontSize: '10.5px', padding: '2px 8px' }}
                            onClick={() => setConfirmandoExclusao(null)}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="secondary"
                          style={{ width: '100%', minHeight: '22px', fontSize: '10.5px', color: 'var(--qa-error)', borderColor: 'var(--qa-error)' }}
                          onClick={() => setConfirmandoExclusao(estado.ultimoPacoteValidacao!.caminhoRelativo)}
                        >
                          Excluir Validação
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <section className="panel" style={{ border: '1px solid var(--qa-border)', borderRadius: '4px', padding: '12px' }}>
                    <div className="section-heading" style={{ padding: 0, marginBottom: '8px' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '12px', fontWeight: 600 }}>Cofre de Validações</h3>
                        <p style={{ margin: '2px 0 0', fontSize: '10px', color: 'var(--qa-muted)' }}>Lista completa de relatórios e pacotes operacionais criados localmente.</p>
                      </div>
                      <span className="badge" style={{ fontSize: '10px', padding: '2px 6px' }}>{estado.pacotesDisponiveis?.length || 0}</span>
                    </div>

                    {!estado.pacotesDisponiveis || estado.pacotesDisponiveis.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <EmptyState texto="Nenhuma validação registrada em Qassistant-testes/validacoes." />
                        <button
                          type="button"
                          style={{ fontSize: '11px', marginTop: '10px' }}
                          onClick={() => {
                            setActiveTab('resumos');
                            setCriandoNovoPacote(true);
                            setWizardStep('selecionar');
                          }}
                        >
                          Criar Primeira Validação
                        </button>
                      </div>
                    ) : (
                      <div className="qa-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {estado.pacotesDisponiveis.map((p) => {
                          const ativo = estado.ultimoPacoteValidacao?.caminhoRelativo === p.caminhoRelativo;
                          const selecionando = acaoAtiva(`pkg:sel:${p.caminhoRelativo}`);
                          const excluindo = acaoAtiva(`pkg:del:${p.caminhoRelativo}`);
                          const selecionarPacote = () => { iniciarAcao(`pkg:sel:${p.caminhoRelativo}`); enviar({ tipo: 'validacao.selecionarPacote', caminhoRelativo: p.caminhoRelativo }); };
                          return (
                            <div key={p.id} className="validacao-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', border: ativo ? '1px solid var(--qa-link)' : '1px solid var(--qa-border)', borderRadius: '4px', background: ativo ? 'var(--qa-surface-subtle)' : 'var(--qa-surface)', fontSize: '11px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', cursor: 'pointer', flex: 1, minWidth: 0 }} onClick={selecionarPacote}>
                                <span className="text-truncate" style={{ fontWeight: 600, color: ativo ? 'var(--qa-link)' : 'inherit' }}>
                                  {formatarNomePacote(p.id)}
                                </span>
                                <span style={{ fontSize: '9.5px', color: 'var(--qa-muted)' }}>Gerado em {new Date(p.dataCriacao).toLocaleDateString('pt-BR')} às {new Date(p.dataCriacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
                                <button
                                  type="button"
                                  className="secondary"
                                  style={{ fontSize: '10px', minHeight: '22px', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  disabled={selecionando || excluindo}
                                  onClick={selecionarPacote}
                                >
                                  {selecionando ? <Spinner size={8} /> : <IconEye />}
                                  <span>{selecionando ? 'Abrindo...' : ativo ? 'Visualizando' : 'Visualizar'}</span>
                                </button>
                                <button
                                  type="button"
                                  className="secondary"
                                  aria-label={confirmandoExclusao === p.caminhoRelativo ? 'Confirmar exclusão' : 'Excluir Validação'}
                                  disabled={excluindo}
                                  style={{ fontSize: '10px', minHeight: '22px', padding: '2px 6px', color: 'var(--qa-error)', borderColor: confirmandoExclusao === p.caminhoRelativo ? 'var(--qa-error)' : 'color-mix(in srgb, var(--qa-error) 35%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
                                  onClick={() => {
                                    if (confirmandoExclusao === p.caminhoRelativo) {
                                      iniciarAcao(`pkg:del:${p.caminhoRelativo}`);
                                      enviar({ tipo: 'validacao.excluirPacote', caminhoRelativo: p.caminhoRelativo });
                                      setConfirmandoExclusao(null);
                                    } else {
                                      setConfirmandoExclusao(p.caminhoRelativo);
                                    }
                                  }}
                                  onBlur={() => { if (confirmandoExclusao === p.caminhoRelativo) setConfirmandoExclusao(null); }}
                                >
                                  {excluindo ? <Spinner size={8} /> : <IconTrash />}
                                  {confirmandoExclusao === p.caminhoRelativo && <span style={{ fontSize: '9px' }}>Confirmar?</span>}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                )}
              </div>
            )}

            {/* ABA: CONFIGURAÇÃO (PAINEL GERAL + CONFIGURAÇÃO GEMINI) */}
            {activeTab === 'config' && (
              <>
                <section className="gemini-config-section">
                  <h3 style={{ margin: 0, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Configuração Gemini (API Key)</h3>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--qa-muted)' }}>
                    Para geração instantânea de relatórios e casos de testes por IA direta.
                  </p>
                  <div className="form-grid" style={{ marginTop: '4px' }}>
                    <label style={{ fontSize: '11px' }}>
                      Gemini API Key
                      <input
                        type="password"
                        placeholder="AIzaSy..."
                        value={editApiKey}
                        onChange={(e) => {
                          setEditApiKey(e.target.value);
                          setApiKeySalva(false);
                        }}
                      />
                    </label>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', color: apiKeySalva || estado.geminiKeyPresente ? 'var(--qa-success)' : 'var(--qa-muted)' }}>
                      {apiKeySalva ? 'Chave salva com sucesso!' : estado.geminiKeyPresente ? 'Chave Gemini configurada' : 'Nenhuma chave configurada'}
                    </span>
                    <button
                      type="button"
                      style={{ fontSize: '11px', minHeight: '22px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                      disabled={acaoAtiva('cfg:gemini')}
                      onClick={() => {
                        if (!editApiKey.trim()) {
                          setMensagem('Insira um valor de API Key válido.');
                          return;
                        }
                        iniciarAcao('cfg:gemini');
                        enviar({ tipo: 'config.salvarChaveGemini', chave: editApiKey.trim() });
                        setEditApiKey('');
                        setApiKeySalva(true);
                      }}
                    >
                      {acaoAtiva('cfg:gemini') && <Spinner size={9} />}
                      <span>{acaoAtiva('cfg:gemini') ? 'Salvando...' : 'Salvar Chave Gemini'}</span>
                    </button>
                  </div>
                </section>

                <section className="gemini-config-section" style={{ marginTop: '12px', borderTop: '1px solid var(--qa-border)', paddingTop: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Configuração OpenProject (API Key)</h3>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--qa-muted)' }}>
                    Token de acesso salvo com segurança nos secrets do VS Code.
                  </p>
                  <div className="form-grid" style={{ marginTop: '4px' }}>
                    <label style={{ fontSize: '11px' }}>
                      OpenProject API Key
                      <input
                        type="password"
                        placeholder="Insira o seu token..."
                        value={editOpApiKey}
                        onChange={(e) => {
                          setEditOpApiKey(e.target.value);
                          setOpOpApiKeySalva(false);
                        }}
                      />
                    </label>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', color: opApiKeySalva || estado.openProjectKeyPresente ? 'var(--qa-success)' : 'var(--qa-muted)' }}>
                      {opApiKeySalva ? 'Chave salva com sucesso!' : estado.openProjectKeyPresente ? 'Chave OpenProject configurada' : 'Nenhuma chave configurada'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <a href={`${OPENPROJECT_URL_PADRAO}my/access_token`} target="_blank" rel="noreferrer" className="setup-inline-link">Ainda não tem um token?</a>
                      <button
                        type="button"
                        style={{ fontSize: '11px', minHeight: '22px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                        disabled={acaoAtiva('cfg:op')}
                        onClick={() => {
                          if (!editOpApiKey.trim()) {
                            setMensagem('Insira um valor de API Key válido.');
                            return;
                          }
                          iniciarAcao('cfg:op');
                          enviar({ tipo: 'config.salvarChaveOpenProject', chave: editOpApiKey.trim() });
                          setEditOpApiKey('');
                          setOpOpApiKeySalva(true);
                        }}
                      >
                        {acaoAtiva('cfg:op') && <Spinner size={9} />}
                        <span>{acaoAtiva('cfg:op') ? 'Salvando...' : 'Salvar token OpenProject'}</span>
                      </button>
                    </div>
                  </div>
                </section>

                <section className="panel setup-panel" aria-labelledby="setup-title" style={{ marginTop: '8px' }}>
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">Estrutura de Caminhos e Credenciais</p>
                      <h2 id="setup-title" style={{ fontSize: '13px' }}>Configurar QAssistant</h2>
                    </div>
                    <span className="badge success">Configurado</span>
                  </div>

                  <div className="form-grid">
                    <label>
                      Nome do projeto
                      <input value={setup.nomeProjeto} onChange={(evento) => atualizarSetup('nomeProjeto', evento.target.value)} />
                    </label>
                    {renderCampoDiretorio('Raiz do código', 'raizCodigo')}
                    {renderCampoDiretorio('Frontend', 'frontend', 'Opcional')}
                    {renderCampoDiretorio('Backend', 'backend', 'Opcional')}
                  </div>

                  <div className="toggle-row" style={{ display: 'flex', gap: '12px', margin: '4px 0' }}>
                    <label className="check-row" style={{ fontSize: '11px' }}>
                      <input type="checkbox" checked={setup.criarContextoProjeto} onChange={(evento) => atualizarSetup('criarContextoProjeto', evento.target.checked)} />
                      Criar docs/contexto
                    </label>
                    <label className="check-row" style={{ fontSize: '11px' }}>
                      <input type="checkbox" checked={setup.criarAssetsAgent} onChange={(evento) => atualizarSetup('criarAssetsAgent', evento.target.checked)} />
                      Criar instructions e skills
                    </label>
                  </div>

                  <div className="subsection">
                    <label className="check-row" style={{ fontSize: '11px', fontWeight: 600 }}>
                      <input type="checkbox" checked={setup.openProjectHabilitado} onChange={(evento) => atualizarSetup('openProjectHabilitado', evento.target.checked)} />
                      Ativar integração com OpenProject
                    </label>
                    {setup.openProjectHabilitado && (
                      <>
                      <div className="form-grid" style={{ marginTop: '8px' }}>
                        <label style={{ fontSize: '11px' }}>
                          URL do OpenProject
                          <input value={setup.openProjectUrlBase || ''} onChange={(evento) => atualizarSetup('openProjectUrlBase', evento.target.value)} />
                        </label>
                        {projetosOpenProjectDisponiveis.length > 0 ? (
                          <label style={{ fontSize: '11px' }}>
                            Projeto no OpenProject
                            <select value={setup.openProjectProjetoId || ''} onChange={(evento) => atualizarSetup('openProjectProjetoId', evento.target.value)}>
                              {projetosOpenProjectDisponiveis.map((projeto) => (
                                <option key={projeto.identificador} value={projeto.identificador}>
                                  {projeto.nome}{projeto.identificador !== projeto.nome ? ` (${projeto.identificador})` : ''}
                                </option>
                              ))}
                            </select>
                          </label>
                        ) : (
                          <label style={{ fontSize: '11px' }}>
                            Projeto no OpenProject
                            <input value={setup.openProjectProjetoId || ''} onChange={(evento) => atualizarSetup('openProjectProjetoId', evento.target.value)} placeholder="Clique em carregar projetos para selecionar" />
                          </label>
                        )}
                        <label style={{ fontSize: '11px' }}>
                          Commits padrão
                          <input type="number" min={1} value={setup.commitsPadrao} onChange={(evento) => atualizarSetup('commitsPadrao', numero(evento.target.value, 10))} />
                        </label>
                      </div>
                      <div className="setup-inline-help" style={{ marginTop: '8px' }}>
                        <span>Use o token salvo para carregar os projetos disponíveis e escolher um deles.</span>
                        <button
                          type="button"
                          className="secondary"
                          style={{ minHeight: '22px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}
                          disabled={validacaoOpenProject.status === 'carregando'}
                          onClick={carregarProjetosOpenProject}
                        >
                          {validacaoOpenProject.status === 'carregando' && <Spinner size={9} />}
                          <span>{validacaoOpenProject.status === 'carregando' ? 'Carregando...' : 'Carregar projetos'}</span>
                        </button>
                      </div>
                      {validacaoOpenProject.status !== 'ocioso' && (
                        <div className={`inline-alert ${validacaoOpenProject.status === 'sucesso' ? 'success' : validacaoOpenProject.status === 'erro' ? 'danger' : 'info'}`} style={{ marginTop: '8px' }}>
                          <span>{validacaoOpenProject.status === 'carregando' ? 'Validando...' : validacaoOpenProject.mensagem}</span>
                        </div>
                      )}
                      </>
                    )}
                  </div>

                  <div className="actions-row">
                    <button type="button" onClick={inicializarWorkspace} disabled={!estado.workspaceAberto || !setup.nomeProjeto.trim()}>
                      Atualizar Configuração
                    </button>
                  </div>
                </section>
              </>
            )}
            </div>
          </div>
        )}
      </div>

      {modalCriadorPromptAberto && (
        <div className="modal-backdrop" role="presentation" onClick={(evento) => {
          if (evento.target === evento.currentTarget) {
            fecharCriadorPromptAssistido();
          }
        }}>
          <div className="modal-shell wide prompt-assistido-modal" role="dialog" aria-modal="true" aria-labelledby="prompt-assistido-modal-title">
            <div className="modal-header">
              <div className="modal-title-group">
                <p style={{ margin: 0, fontSize: '9.5px', textTransform: 'uppercase', fontWeight: 600, color: 'var(--qa-muted)', letterSpacing: '0.5px' }}>Criador de prompt</p>
                <h3 id="prompt-assistido-modal-title" style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: 700 }}>Criar prompt guiado de teste</h3>
              </div>
              <button type="button" className="secondary modal-close icon-button" aria-label="Fechar" onClick={fecharCriadorPromptAssistido}>
                <IconClose />
              </button>
            </div>

            <div className="modal-body prompt-assistido-modal__body">
              <div className="steps-indicator">
                <span className={`step-item ${etapaCriadorPrompt === 'parametros' ? 'active' : ''} ${etapaCriadorPrompt === 'contexto' || etapaCriadorPrompt === 'resultado' ? 'completed' : ''}`}>1. Parametros</span>
                <div className="steps-divider" />
                <span className={`step-item ${etapaCriadorPrompt === 'contexto' ? 'active' : ''} ${etapaCriadorPrompt === 'resultado' ? 'completed' : ''}`}>2. Contexto</span>
                <div className="steps-divider" />
                <span className={`step-item ${etapaCriadorPrompt === 'resultado' ? 'active' : ''}`}>3. Gerar</span>
              </div>

              {etapaCriadorPrompt === 'parametros' && (
                <div className="prompt-assistido-grid">
                  <label>
                    Tipo de teste
                    <select value={formCriadorPrompt.tipoTeste} onChange={(evento) => atualizarCriadorPrompt('tipoTeste', evento.target.value as TipoTesteAssistido)}>
                      {TIPOS_PROMPT_ASSISTIDO.map((tipo) => (
                        <option key={tipo.id} value={tipo.id}>{tipo.titulo}</option>
                      ))}
                    </select>
                  </label>

                  {metaTipoPromptAssistido.exigeStack && (
                    <label>
                      Stack alvo
                      <select value={formCriadorPrompt.stack || ''} onChange={(evento) => atualizarCriadorPrompt('stack', evento.target.value as StackTesteAssistido)}>
                        <option value="backend">Backend</option>
                        <option value="frontend">Frontend</option>
                      </select>
                    </label>
                  )}

                  <div className="surface-subtle prompt-assistido-callout">
                    <strong>{metaTipoPromptAssistido.titulo}</strong>
                    <span>{metaTipoPromptAssistido.descricao}</span>
                  </div>

                  <label className="prompt-assistido-span-full">
                    Objetivo do prompt
                    <textarea
                      rows={3}
                      value={formCriadorPrompt.objetivo}
                      onChange={(evento) => atualizarCriadorPrompt('objetivo', evento.target.value)}
                      placeholder="Ex.: criar um teste de integração para o fluxo de autenticação com 2FA e múltiplas permissões"
                    />
                  </label>

                  <label className="prompt-assistido-span-full">
                    Contexto adicional
                    <textarea
                      rows={4}
                      value={formCriadorPrompt.contextoAdicional || ''}
                      onChange={(evento) => atualizarCriadorPrompt('contextoAdicional', evento.target.value)}
                      placeholder="Descreva riscos, módulos sensíveis, regras de negócio, dependências ou instruções extras para o agente."
                    />
                  </label>

                  {estado.ultimoPacoteValidacao ? (
                    <label className="check-row prompt-assistido-span-full prompt-assistido-toggle">
                      <input
                        type="checkbox"
                        checked={formCriadorPrompt.usarPacoteAtivo}
                        onChange={(evento) => atualizarCriadorPrompt('usarPacoteAtivo', evento.target.checked)}
                      />
                      Aproveitar automaticamente o pacote ativo {estado.ultimoPacoteValidacao.id} como contexto inicial
                    </label>
                  ) : (
                    <div className="inline-alert info prompt-assistido-span-full">
                      <span>Sem pacote ativo no momento. O criador continua funcionando com os parâmetros manuais.</span>
                    </div>
                  )}
                </div>
              )}

              {etapaCriadorPrompt === 'contexto' && (
                <div className="prompt-assistido-contexto">
                  <div className="prompt-assistido-actions">
                    <button type="button" className="secondary" onClick={() => abrirSeletorPromptAssistido('arquivos')}>
                      <IconFile />
                      <span>Selecionar arquivos</span>
                    </button>
                    <button type="button" className="secondary" onClick={() => abrirSeletorPromptAssistido('pastas')}>
                      <IconFolder />
                      <span>Selecionar pastas</span>
                    </button>
                    {busyCriadorPrompt.contexto ? <span className="badge">Carregando contexto...</span> : null}
                  </div>

                  <label>
                    Cenários e observações prioritárias
                    <textarea
                      rows={5}
                      value={formCriadorPrompt.cenariosObservacoes || ''}
                      onChange={(evento) => atualizarCriadorPrompt('cenariosObservacoes', evento.target.value)}
                      placeholder="Liste cenários críticos, regressões esperadas, observações operacionais e qualquer nota que deva entrar diretamente no prompt final."
                    />
                  </label>

                  <div className="prompt-assistido-selection-grid">
                    <div className="surface-subtle prompt-assistido-selection-card">
                      <div className="section-heading" style={{ padding: 0 }}>
                        <div>
                          <p className="eyebrow">Arquivos</p>
                          <h4 style={{ margin: 0, fontSize: '12px' }}>Arquivos selecionados</h4>
                        </div>
                        <span className="badge">{formCriadorPrompt.arquivosSelecionados.length}</span>
                      </div>
                      <div className="prompt-assistido-tags">
                        {formCriadorPrompt.arquivosSelecionados.length > 0 ? formCriadorPrompt.arquivosSelecionados.map((caminho) => (
                          <button key={caminho} type="button" className="prompt-assistido-tag" onClick={() => removerSelecaoPromptAssistido('arquivos', caminho)}>
                            <span>{caminho}</span>
                            <IconClose />
                          </button>
                        )) : <EmptyState texto="Nenhum arquivo selecionado ainda." />}
                      </div>
                    </div>

                    <div className="surface-subtle prompt-assistido-selection-card">
                      <div className="section-heading" style={{ padding: 0 }}>
                        <div>
                          <p className="eyebrow">Pastas</p>
                          <h4 style={{ margin: 0, fontSize: '12px' }}>Pastas selecionadas</h4>
                        </div>
                        <span className="badge">{formCriadorPrompt.pastasSelecionadas.length}</span>
                      </div>
                      <div className="prompt-assistido-tags">
                        {formCriadorPrompt.pastasSelecionadas.length > 0 ? formCriadorPrompt.pastasSelecionadas.map((caminho) => (
                          <button key={caminho} type="button" className="prompt-assistido-tag" onClick={() => removerSelecaoPromptAssistido('pastas', caminho)}>
                            <span>{caminho}</span>
                            <IconClose />
                          </button>
                        )) : <EmptyState texto="Nenhuma pasta selecionada ainda." />}
                      </div>
                    </div>
                  </div>

                  <div className="surface-subtle prompt-assistido-browser">
                    <div className="prompt-assistido-browser__header">
                      <div>
                        <p className="eyebrow">Navegador</p>
                        <h4 style={{ margin: 0, fontSize: '12px' }}>
                          {seletorPromptAssistido ? `Selecionando ${seletorPromptAssistido.contexto === 'arquivos' ? 'arquivos' : 'pastas'}` : 'Abra um seletor acima'}
                        </h4>
                      </div>
                      {seletorPromptAssistido ? <span className="badge">{seletorPromptAssistido.navegador.entradas.length} itens</span> : null}
                    </div>

                    {seletorPromptAssistido ? (
                      <>
                        <div className="prompt-assistido-browser__path">
                          <strong>{seletorPromptAssistido.navegador.caminhoRelativo || '.'}</strong>
                          <div className="prompt-assistido-browser__path-actions">
                            {caminhoPai(seletorPromptAssistido.navegador.caminhoRelativo) ? (
                              <button type="button" className="secondary" onClick={() => abrirSeletorPromptAssistido(seletorPromptAssistido.contexto, caminhoPai(seletorPromptAssistido.navegador.caminhoRelativo) || setup.raizCodigo)}>
                                <IconArrowLeft />
                                <span>Voltar</span>
                              </button>
                            ) : null}
                            {seletorPromptAssistido.contexto === 'pastas' ? (
                              <button type="button" className="secondary" onClick={() => alternarSelecaoPromptAssistido('pastas', seletorPromptAssistido.navegador.caminhoRelativo || '.') }>
                                <IconFolder />
                                <span>{formCriadorPrompt.pastasSelecionadas.includes(seletorPromptAssistido.navegador.caminhoRelativo || '.') ? 'Remover pasta atual' : 'Selecionar pasta atual'}</span>
                              </button>
                            ) : null}
                          </div>
                        </div>

                        <div className="prompt-assistido-browser__list scroll-region compact">
                          {seletorPromptAssistido.navegador.entradas.map((entrada) => {
                            const selecionado = seletorPromptAssistido.contexto === 'arquivos'
                              ? formCriadorPrompt.arquivosSelecionados.includes(entrada.caminhoRelativo)
                              : formCriadorPrompt.pastasSelecionadas.includes(entrada.caminhoRelativo);

                            return (
                              <div key={entrada.caminhoRelativo} className="prompt-assistido-browser__row">
                                <div className="prompt-assistido-browser__row-main">
                                  <span>{entrada.tipo === 'pasta' ? <IconFolder /> : <IconFile />}</span>
                                  <div>
                                    <strong>{entrada.nome}</strong>
                                    <span>{entrada.tipo === 'arquivo' ? formatarTamanho(entrada.tamanhoBytes) : 'Pasta do workspace'}</span>
                                  </div>
                                </div>
                                <div className="prompt-assistido-browser__row-actions">
                                  {entrada.tipo === 'pasta' ? (
                                    <>
                                      {seletorPromptAssistido.contexto === 'pastas' ? (
                                        <button type="button" className="secondary" onClick={() => alternarSelecaoPromptAssistido('pastas', entrada.caminhoRelativo)}>
                                          <span>{selecionado ? 'Remover' : 'Selecionar'}</span>
                                        </button>
                                      ) : null}
                                      <button type="button" className="secondary" onClick={() => abrirSeletorPromptAssistido(seletorPromptAssistido.contexto, entrada.caminhoRelativo)}>
                                        <span>Entrar</span>
                                        <IconChevronRight />
                                      </button>
                                    </>
                                  ) : (
                                    <button type="button" className="secondary" onClick={() => alternarSelecaoPromptAssistido('arquivos', entrada.caminhoRelativo)}>
                                      <span>{selecionado ? 'Remover' : 'Selecionar'}</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="empty-dashed-panel">
                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--qa-muted)' }}>Escolha arquivos ou pastas acima para navegar dentro do workspace e montar o contexto do prompt.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {etapaCriadorPrompt === 'resultado' && (
                <div className="prompt-assistido-result">
                  <div className="preview-grid-summary">
                    <div className="preview-block">
                      <h4>Tipo</h4>
                      <p>{metaTipoPromptAssistido.titulo}</p>
                    </div>
                    <div className="preview-block">
                      <h4>Stack</h4>
                      <p>{metaTipoPromptAssistido.exigeStack ? formCriadorPrompt.stack || 'Nao definido' : 'Nao aplicavel'}</p>
                    </div>
                    <div className="preview-block">
                      <h4>Arquivos</h4>
                      <p>{formCriadorPrompt.arquivosSelecionados.length} arquivo(s)</p>
                    </div>
                    <div className="preview-block">
                      <h4>Pastas</h4>
                      <p>{formCriadorPrompt.pastasSelecionadas.length} pasta(s)</p>
                    </div>
                  </div>

                  {busyCriadorPrompt.artefato ? (
                    <div className="inline-alert info">
                      <span>Gerando prompt, salvando no workspace, abrindo no editor e copiando o conteúdo...</span>
                    </div>
                  ) : null}

                  {resultadoPromptAssistido ? (
                    <>
                      <div className="inline-alert success">
                        <span>Prompt salvo em {resultadoPromptAssistido.caminhoRelativo}.</span>
                        {resultadoPromptAssistido.copiado ? <strong>Conteúdo copiado.</strong> : null}
                      </div>
                      <pre className="mono-block scroll-region compact prompt-assistido-preview">{resultadoPromptAssistido.conteudo}</pre>
                    </>
                  ) : (
                    <div className="surface-subtle prompt-assistido-callout">
                      <strong>Pronto para gerar</strong>
                      <span>O QAssistant vai adaptar o template do tipo escolhido com os parâmetros acima, salvar o arquivo na pasta correta de prompts, abrir no editor e copiar o conteúdo para você usar no agente.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer prompt-assistido-footer">
              <button type="button" className="secondary" onClick={etapaCriadorPrompt === 'parametros' ? fecharCriadorPromptAssistido : voltarCriadorPrompt}>
                {etapaCriadorPrompt === 'parametros' ? 'Cancelar' : 'Voltar'}
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                {etapaCriadorPrompt !== 'resultado' ? (
                  <button type="button" onClick={avancarCriadorPrompt} disabled={etapaCriadorPrompt === 'parametros' ? !podeAvancarCriadorPrompt : false}>
                    Avançar
                  </button>
                ) : resultadoPromptAssistido ? (
                  <>
                    <button type="button" className="secondary" onClick={gerarPromptAssistido} disabled={busyCriadorPrompt.artefato || !podeGerarPromptAssistido}>
                      Gerar novamente
                    </button>
                    <button type="button" onClick={fecharCriadorPromptAssistido}>Concluir</button>
                  </>
                ) : (
                  <button type="button" onClick={gerarPromptAssistido} disabled={!podeGerarPromptAssistido || busyCriadorPrompt.artefato}>
                    {busyCriadorPrompt.artefato ? 'Gerando...' : 'Gerar prompt'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY PORTAL: DETALHES DE TAREFA DO OPENPROJECT */}
      {taskAtiva && (
        <div className="modal-backdrop" role="presentation">
          <div
            className="modal-shell wide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="openproject-task-dialog-title"
            style={{ height: '92vh' }}
          >
            {/* Header do Modal — compacto */}
            <div className="modal-header" style={{ alignItems: 'start', gap: '8px', flexShrink: 0 }}>
              <div className="modal-title-group" style={{ flex: 1, minWidth: 0 }}>
                <div className="op-modal-badges">
                  <span className="badge compact">
                    {taskAtiva.tipo || 'Atividade'}
                  </span>
                  <span className="badge compact info">
                    {taskAtiva.status}
                  </span>
                  <span className="badge compact numeric" style={{ marginLeft: 'auto' }}>
                    #{taskAtiva.id}
                  </span>
                  {taskAtiva.canUpdate && (
                    <span className="badge compact success">
                      admin
                    </span>
                  )}
                </div>
                <h3 id="openproject-task-dialog-title" style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--qa-foreground)', lineHeight: '1.35' }}>
                  {taskAtiva.assunto}
                </h3>
                <div className="op-task-meta-line">
                  <span><strong style={{ color: 'var(--qa-foreground)' }}>{taskAtiva.responsavel || 'Sem responsável'}</strong></span>
                  {taskAtiva.comentarios && taskAtiva.comentarios.length > 0 && (
                    <span>Última atividade: {taskAtiva.comentarios[taskAtiva.comentarios.length - 1]?.dataCriacao}</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="secondary modal-close icon-button"
                aria-label="Fechar"
                style={{ flexShrink: 0 }}
                onClick={() => setSelectedTask(null)}
                title="Fechar"
              >
                <IconClose />
              </button>
            </div>

            {/* Corpo do Modal — 3 zonas com scroll independente */}
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', padding: 0 }}>

              {/* ZONA 1: Descrição (colapsável, maior, scroll interno) */}
              <div className="op-modal-zone" style={{ flex: descricaoColapsada ? '0 0 auto' : '2' }}>
                <button
                  type="button"
                  className="op-modal-zone__toggle"
                  onClick={() => setDescricaoColapsada(!descricaoColapsada)}
                >
                  <span>Descrição</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ transform: descricaoColapsada ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform 0.15s' }}>
                    <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {!descricaoColapsada && (
                  <div className="op-modal-zone__body scroll-region compact">
                    {carregandoDetalhesTaskId && String(carregandoDetalhesTaskId) === String(taskAtiva.id) ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div className="skeleton-line" style={{ height: '12px', width: '90%' }}></div>
                        <div className="skeleton-line" style={{ height: '12px', width: '80%' }}></div>
                        <div className="skeleton-line" style={{ height: '12px', width: '45%' }}></div>
                      </div>
                    ) : taskAtiva.descricaoMarkdown ? (
                      <div className="markdown-body prose-block">
                        {renderizarMarkdown(taskAtiva.descricaoMarkdown)}
                      </div>
                    ) : (
                      <em style={{ fontSize: '11px', color: 'var(--qa-muted)' }}>Sem descrição no OpenProject.</em>
                    )}
                  </div>
                )}
              </div>

              {/* ZONA 2: Discussão (scroll interno) */}
              <div className="op-modal-zone" style={{ flex: 1 }}>
                <h4 className="op-modal-zone__header">
                  Discussão ({taskAtiva.comentarios?.length || 0})
                </h4>
                <div className="op-modal-zone__body scroll-region compact">
                  {carregandoDetalhesTaskId && String(carregandoDetalhesTaskId) === String(taskAtiva.id) ? (
                    <div style={{ border: '1px solid var(--qa-border)', borderRadius: '6px', padding: '10px' }}>
                      <div className="skeleton-line" style={{ height: '10px', width: '35%', marginBottom: '10px' }}></div>
                      <div className="skeleton-line" style={{ height: '8px', width: '80%' }}></div>
                    </div>
                  ) : !taskAtiva.comentarios || taskAtiva.comentarios.length === 0 ? (
                    <p style={{ fontSize: '11px', color: 'var(--qa-muted)', fontStyle: 'italic', margin: 0 }}>Nenhuma conversa registrada.</p>
                  ) : (
                    taskAtiva.comentarios.map((c, i) => (
                      <div key={i} className="op-comment-card">
                        <div className="op-comment-card__header">
                          <span style={{ fontWeight: 600, color: 'var(--qa-foreground)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <IconChat />
                            <span>{c.autor}</span>
                          </span>
                          <span style={{ color: 'var(--qa-muted)' }}>{c.dataCriacao}</span>
                        </div>
                        <div className="prose-block text-wrap-anywhere op-comment-card__body">
                          {c.texto}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* ZONA 3: Novo Comentário (fixo no bottom, não rola) */}
              <div className="op-modal-zone__body compact" style={{ flexShrink: 0 }}>
                <h4 className="op-modal-zone__header" style={{ margin: '-10px -16px 0', borderBottom: 'none' }}>
                  Novo Comentário
                </h4>

                {taskAtiva.canUpdate && taskAtiva.statusesDisponiveis && taskAtiva.statusesDisponiveis.length > 0 && (
                  <div className="field-stack">
                    <label className="field-label">
                      Alterar status (opcional)
                    </label>
                    <select
                      value={novoStatusHref}
                      onChange={(e) => setNovoStatusHref(e.target.value)}
                      style={{ fontSize: '11px' }}
                    >
                      <option value="">— Sem alteração de status —</option>
                      {taskAtiva.statusesDisponiveis.map((s) => (
                        <option key={s.id} value={s.href}>{s.nome}</option>
                      ))}
                    </select>
                  </div>
                )}

                <textarea
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                  placeholder="Escreva um comentário..."
                  rows={3}
                  style={{ fontSize: '11.5px', resize: 'none', lineHeight: '1.5' }}
                />

                <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'flex-end', gap: '6px', alignItems: 'center' }}>
                  {!taskAtiva.canUpdate && (
                    <span style={{ fontSize: '10px', color: 'var(--qa-muted)', fontStyle: 'italic', marginRight: 'auto' }}>
                      Apenas comentários permitidos
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={enviandoComentario || (!novoComentario.trim() && !novoStatusHref)}
                    style={{
                      fontSize: '11.5px', minHeight: '28px', padding: '0 16px',
                      fontWeight: 600, borderRadius: '5px',
                      opacity: (enviandoComentario || (!novoComentario.trim() && !novoStatusHref)) ? 0.5 : 1,
                      cursor: (enviandoComentario || (!novoComentario.trim() && !novoStatusHref)) ? 'not-allowed' : 'pointer'
                    }}
                    onClick={() => {
                      if (!novoComentario.trim() && !novoStatusHref) return;
                      setEnviandoComentario(true);
                      if (novoStatusHref && taskAtiva.canUpdate) {
                        enviar({ tipo: 'openproject.alterarStatusTask', taskId: taskAtiva.id, statusHref: novoStatusHref, lockVersion: taskAtiva.lockVersion ?? 0 });
                      }
                      if (novoComentario.trim()) {
                        enviar({ tipo: 'openproject.comentarTask', taskId: taskAtiva.id, texto: novoComentario.trim() });
                      }
                      setNovoComentario('');
                      setNovoStatusHref('');
                    }}
                  >
                    {enviandoComentario ? 'Enviando…' : (novoStatusHref && taskAtiva.canUpdate) ? 'Salvar alterações' : 'Comentar'}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer do Modal — simplificado */}
            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <a
                href={`${setup.openProjectUrlBase || 'https://openproject.ormel.com.br'}/work_packages/${taskAtiva.id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '11px', color: 'var(--qa-link)', textDecoration: 'underline', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                Abrir no OpenProject <IconExternalLink />
              </a>
              <div style={{ display: 'flex', gap: '6px' }}>
                {estado.ultimoPacoteValidacao && (
                  <button
                    type="button"
                    style={{ fontSize: '11px', minHeight: '22px', padding: '0 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => {
                      setModalPublicarOP({ aberto: true, taskId: taskAtiva.id.toString(), tipoTask: 'Task' });
                      setSelectedTask(null);
                    }}
                  >
                    <IconExternalLink />
                    <span>Publicar nesta tarefa</span>
                  </button>
                )}
                <button
                  type="button"
                  className="secondary"
                  style={{ fontSize: '11px', minHeight: '22px', padding: '0 10px' }}
                  onClick={() => setSelectedTask(null)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PUBLICAR VALIDAÇÃO NO OPENPROJECT */}
      {modalPublicarOP?.aberto && estado.ultimoPacoteValidacao && (
        <div className="modal-backdrop"
          role="presentation"
          onClick={(e) => { if (e.target === e.currentTarget) setModalPublicarOP(null); }}
        >
          <div
            className="modal-shell"
            role="dialog"
            aria-modal="true"
            aria-labelledby="openproject-publish-dialog-title"
          >
            {/* Header */}
            <div className="modal-header">
              <div className="modal-title-group">
                <p style={{ margin: 0, fontSize: '9.5px', textTransform: 'uppercase', fontWeight: 600, color: 'var(--qa-muted)', letterSpacing: '0.5px' }}>OpenProject</p>
                <h3 id="openproject-publish-dialog-title" style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: 700 }}>Publicar validação</h3>
              </div>
              <button type="button" className="secondary modal-close icon-button" aria-label="Fechar"
                onClick={() => setModalPublicarOP(null)}
              >
                <IconClose />
              </button>
            </div>

            {/* Corpo */}
            <div className="modal-body scroll-region compact" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Resumo do pacote */}
              <div className="op-summary-box">
                <span style={{ display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 600, color: 'var(--qa-muted)', marginBottom: '2px' }}>Pacote a publicar</span>
                <strong style={{ color: 'var(--qa-link)' }}>{formatarNomePacote(estado.ultimoPacoteValidacao.id)}</strong>
                <span style={{ display: 'block', fontSize: '9.5px', color: 'var(--qa-muted)', marginTop: '2px' }}>
                  Arquivo: <code>resumo-qa.md</code>
                </span>
              </div>

              {/* ID do Work Package */}
              <div className="field-stack">
                <label htmlFor="op-modal-task-id" className="field-label">
                  ID do Work Package (deixe vazio para criar novo)
                </label>
                <input
                  id="op-modal-task-id"
                  placeholder="Ex: 27152"
                  value={modalPublicarOP.taskId}
                  onChange={(e) => setModalPublicarOP((m) => m ? { ...m, taskId: e.target.value } : null)}
                  style={{ fontSize: '11px' }}
                />
              </div>

              {/* Tipo de Task */}
              <div className="field-stack">
                <label htmlFor="op-modal-tipo-task" className="field-label">
                  Tipo de tarefa
                </label>
                <select
                  id="op-modal-tipo-task"
                  value={modalPublicarOP.tipoTask}
                  onChange={(e) => setModalPublicarOP((m) => m ? { ...m, tipoTask: e.target.value } : null)}
                  style={{ fontSize: '11px' }}
                >
                  <option value="Task">Task (Tarefa)</option>
                  <option value="Bug">Bug</option>
                  <option value="Feature">Feature</option>
                  <option value="QA">QA / Validação</option>
                  <option value="Release">Release</option>
                </select>
              </div>

              {/* Modelo enviado */}
              <div className="op-summary-box dashed" style={{ fontSize: '10.5px' }}>
                <span style={{ display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 600, color: 'var(--qa-muted)', marginBottom: '4px' }}>Modelo enviado</span>
                <div className="op-summary-list">
                  <span>• Conteúdo de <code>resumo-qa.md</code> como descrição do WP</span>
                  <span>• Tipo: <strong style={{ color: 'var(--qa-foreground)' }}>{modalPublicarOP.tipoTask}</strong></span>
                  <span>• {modalPublicarOP.taskId ? `Atualiza WP #${modalPublicarOP.taskId}` : 'Cria novo Work Package'}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button type="button" className="secondary" style={{ fontSize: '11px', minHeight: '24px', padding: '0 12px' }}
                onClick={() => setModalPublicarOP(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                style={{ fontSize: '11px', minHeight: '24px', padding: '0 14px' }}
                disabled={processandoIA !== null}
                onClick={() => {
                  setProcessandoIA('openproject');
                  enviar({
                    tipo: 'openproject.publicarTask',
                    rascunhoCaminho: estado.ultimoPacoteValidacao!.caminhoRelativo,
                    taskId: modalPublicarOP!.taskId.trim() || undefined,
                  });
                  setModalPublicarOP(null);
                }}
              >
                {processandoIA === 'openproject' ? 'Enviando...' : 'Confirmar Publicação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function renderizarMarkdown(texto: string): ReactElement {
  if (!texto) return <em style={{ color: 'var(--qa-muted)' }}>(Sem conteúdo)</em>;

  const linhas = texto.replace(/\r\n/g, '\n').split('\n');
  const elementos: ReactElement[] = [];

  linhas.forEach((linha, index) => {
    const trimming = linha.trim();
    if (!trimming) {
      elementos.push(<div key={`empty-${index}`} style={{ height: '8px' }} />);
      return;
    }

    // Headers
    if (trimming.startsWith('### ')) {
      elementos.push(
        <h4 key={`h3-${index}`} style={{ fontSize: '11px', margin: '8px 0 4px', fontWeight: 700, color: 'var(--qa-foreground)', textTransform: 'uppercase' }}>
          {parseFormatosInline(trimming.slice(4))}
        </h4>
      );
      return;
    }
    if (trimming.startsWith('## ')) {
      elementos.push(
        <h3 key={`h2-${index}`} style={{ fontSize: '12px', margin: '12px 0 6px', fontWeight: 700, color: 'var(--qa-foreground)', borderBottom: '1px solid var(--qa-border-subtle)', paddingBottom: '3px' }}>
          {parseFormatosInline(trimming.slice(3))}
        </h3>
      );
      return;
    }
    if (trimming.startsWith('# ')) {
      elementos.push(
        <h2 key={`h1-${index}`} style={{ fontSize: '13px', margin: '14px 0 8px', fontWeight: 800, color: 'var(--qa-foreground)' }}>
          {parseFormatosInline(trimming.slice(2))}
        </h2>
      );
      return;
    }

    // Blockquotes
    if (trimming.startsWith('> ')) {
      elementos.push(
        <blockquote key={`quote-${index}`} style={{ margin: '4px 0', paddingLeft: '8px', borderLeft: '3px solid var(--qa-link)', color: 'var(--qa-muted)', fontStyle: 'italic', fontSize: '10.5px' }}>
          {parseFormatosInline(trimming.slice(2))}
        </blockquote>
      );
      return;
    }

    // Lists
    if (trimming.startsWith('- ') || trimming.startsWith('* ')) {
      elementos.push(
        <div key={`li-${index}`} style={{ display: 'flex', gap: '6px', alignItems: 'start', margin: '3px 0', paddingLeft: '8px', fontSize: '10.5px' }}>
          <span style={{ color: 'var(--qa-link)', fontSize: '12px', lineHeight: '1.2' }}>•</span>
          <span style={{ flex: 1 }}>{parseFormatosInline(trimming.slice(2))}</span>
        </div>
      );
      return;
    }

    // Numbered lists
    const matchNumero = trimming.match(/^(\d+)\.\s(.*)/);
    if (matchNumero) {
      elementos.push(
        <div key={`num-${index}`} style={{ display: 'flex', gap: '6px', alignItems: 'start', margin: '3px 0', paddingLeft: '8px', fontSize: '10.5px' }}>
          <span style={{ color: 'var(--qa-muted)', fontWeight: 600, minWidth: '12px', fontSize: '10px' }}>{matchNumero[1]}.</span>
          <span style={{ flex: 1 }}>{parseFormatosInline(matchNumero[2])}</span>
        </div>
      );
      return;
    }

    // Normal paragraph
    elementos.push(
      <p key={`p-${index}`} style={{ margin: '4px 0', fontSize: '10.5px', lineHeight: '1.4', color: 'var(--qa-foreground)' }}>
        {parseFormatosInline(linha)}
      </p>
    );
  });

  return <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>{elementos}</div>;
}

function parseFormatosInline(texto: string): (string | ReactElement)[] {
  if (!texto) return [];

  const partes: (string | ReactElement)[] = [];
  let indexCorrente = 0;

  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let match;

  while ((match = regex.exec(texto)) !== null) {
    const textoAntes = texto.substring(indexCorrente, match.index);
    if (textoAntes) {
      partes.push(textoAntes);
    }

    const matchValor = match[0];
    if (matchValor.startsWith('`') && matchValor.endsWith('`')) {
      const conteudoCode = matchValor.slice(1, -1);
      partes.push(
        <code key={`code-${match.index}`} style={{ background: 'var(--qa-surface-subtle)', border: '1px solid var(--qa-border)', padding: '1px 3px', borderRadius: '3px', fontFamily: 'monospace', fontSize: '9.5px', color: 'var(--qa-link)' }}>
          {conteudoCode}
        </code>
      );
    } else if (matchValor.startsWith('**') && matchValor.endsWith('**')) {
      const conteudoBold = matchValor.slice(2, -2);
      partes.push(<strong key={`bold-${match.index}`} style={{ fontWeight: 700 }}>{conteudoBold}</strong>);
    } else if (matchValor.startsWith('*') && matchValor.endsWith('*')) {
      const conteudoItalic = matchValor.slice(1, -1);
      partes.push(<em key={`italic-${match.index}`} style={{ fontStyle: 'italic' }}>{conteudoItalic}</em>);
    }

    indexCorrente = regex.lastIndex;
  }

  const textoDepois = texto.substring(indexCorrente);
  if (textoDepois) {
    partes.push(textoDepois);
  }

  return partes;
}

function formatarNomePacote(prefixo: string): string {
  const isoPattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})-(\d{2})(_|-)?(.*)?$/;
  const match = prefixo.match(isoPattern);
  if (!match) return prefixo;

  const [, ano, mes, dia, hora, min, , resto] = match;
  const dataFormatada = `${dia}/${mes}/${ano} ${hora}:${min}`;
  if (resto) {
    const slugAmigavel = resto.replace(/_|-/g, ' ').trim();
    if (slugAmigavel && slugAmigavel !== 'resumos por commits') {
      return `${dataFormatada} (${slugAmigavel})`;
    }
  }
  return dataFormatada;
}

interface CommitItemProps {
  commit: CommitGitQAssistant;
  selecionado: boolean;
  onToggle: () => void;
}

const CommitItem: FC<CommitItemProps> = ({ commit, selecionado, onToggle }) => (
  <label 
    className={`commit-item ${selecionado ? 'selected' : ''}`}
    style={{ position: 'relative' }}
  >
    <input 
      className="commit-item__check"
      type="checkbox" 
      checked={selecionado} 
      onChange={onToggle} 
    />
    <div className="commit-item__content">
      <div className="commit-item__header">
        <span className="commit-item__subject text-truncate" title={commit.assunto}>
          {commit.assunto}
        </span>
        {commit.repositorioNome && (
          <span className="commit-repo-badge text-truncate" title={commit.repositorioNome}>
            {commit.repositorioNome}
          </span>
        )}
      </div>
      <div className="commit-item__meta">
        <strong style={{ fontFamily: 'monospace', color: 'var(--qa-link)' }}>{commit.hashCurto}</strong>
        <span>·</span>
        <span>{commit.autor}</span>
        <span>·</span>
        <span>{formatarData(commit.dataIso)}</span>
      </div>
    </div>
  </label>
);

interface EmptyStateProps {
  texto: string;
}

const EmptyState: FC<EmptyStateProps> = ({ texto }) => <p className="empty-state">{texto}</p>;

function obterMetaTipoPromptAssistido(tipo: TipoTesteAssistido): TipoPromptAssistidoMeta {
  return TIPOS_PROMPT_ASSISTIDO.find((item) => item.id === tipo) || TIPOS_PROMPT_ASSISTIDO[0];
}

function extrairArquivosSugeridosPacote(estado: EstadoPainel): string[] {
  const hashesPacote = new Set(estado.ultimoPacoteValidacao?.commits || []);
  if (hashesPacote.size === 0) return [];

  const arquivos = estado.git.recentes
    .filter((commit) => hashesPacote.has(commit.hash) || hashesPacote.has(commit.hashCurto))
    .flatMap((commit) => commit.arquivosAlterados || [])
    .filter(Boolean);

  return Array.from(new Set(arquivos)).slice(0, 12);
}

function inferirStackPromptAssistido(arquivos: string[], setup: SetupWorkspace): StackTesteAssistido | undefined {
  const frontend = (setup.frontend || '').trim();
  const backend = (setup.backend || '').trim();
  const arquivosNormalizados = arquivos.map((item) => item.toLowerCase());

  if (frontend && arquivosNormalizados.some((item) => item.startsWith(frontend.toLowerCase()))) {
    return 'frontend';
  }
  if (backend && arquivosNormalizados.some((item) => item.startsWith(backend.toLowerCase()))) {
    return 'backend';
  }
  if (arquivosNormalizados.some((item) => item.includes('medsystem_front') || item.includes('/front') || item.endsWith('.tsx') || item.endsWith('.jsx'))) {
    return 'frontend';
  }
  if (arquivosNormalizados.some((item) => item.includes('medsystem_back') || item.includes('/back') || item.endsWith('.service.ts') || item.endsWith('.service.js'))) {
    return 'backend';
  }
  return undefined;
}

function criarResumoContextoPacote(resumoQaConteudo?: string): string {
  const texto = (resumoQaConteudo || '').trim();
  if (!texto) return '';
  return texto.length > 900 ? `${texto.slice(0, 900).trimEnd()}\n\n[resumo do pacote truncado para pre-preenchimento]` : texto;
}

function criarResumoObservacoesPacote(commits: string[]): string {
  if (!commits.length) return '';
  return `Commits vinculados ao pacote ativo:\n${commits.slice(0, 10).map((commit) => `- ${commit}`).join('\n')}`;
}

function sugerirCaminhoInicialSeletorPrompt(
  contexto: ContextoSeletorPrompt,
  form: PromptAssistidoTeste,
  setup: SetupWorkspace,
  seletor: SeletorPromptAssistidoState | null,
): string {
  if (seletor && seletor.contexto === contexto) {
    return seletor.navegador.caminhoRelativo || setup.raizCodigo || '.';
  }
  if (contexto === 'arquivos' && form.arquivosSelecionados.length > 0) {
    return caminhoPai(form.arquivosSelecionados[0]) || form.arquivosSelecionados[0];
  }
  if (contexto === 'pastas' && form.pastasSelecionadas.length > 0) {
    return form.pastasSelecionadas[0];
  }
  return setup.raizCodigo || '.';
}

function focarSetupOpenProject(atualizarSetup: <K extends keyof SetupWorkspace>(campo: K, valor: SetupWorkspace[K]) => void): void {
  atualizarSetup('openProjectHabilitado', true);
  document.getElementById('setup-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function enviar(mensagem: MensagemWebviewParaHost): void {
  vscode.postMessage(mensagem);
}

function numero(valor: string, fallback: number): number {
  const parsed = Number(valor);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function preencherSetupComEstado(atual: SetupWorkspace, estado: EstadoPainel): SetupWorkspace {
  const configuracao = estado.configuracao;
  if (!configuracao) {
    const nomeProjeto = estado.raizWorkspace.split('/').filter(Boolean).pop() || atual.nomeProjeto;
    return { ...atual, nomeProjeto, openProjectUrlBase: atual.openProjectUrlBase || OPENPROJECT_URL_PADRAO };
  }

  return {
    nomeProjeto: configuracao.projeto.nome,
    raizCodigo: configuracao.caminhos.raizCodigo,
    frontend: configuracao.caminhos.frontend || '',
    backend: configuracao.caminhos.backend || '',
    criarContextoProjeto: configuracao.setup.criarContextoProjeto,
    criarAssetsAgent: configuracao.setup.criarAssetsAgent,
    openProjectHabilitado: configuracao.openProject.habilitado,
    openProjectUrlBase: configuracao.openProject.urlBase || OPENPROJECT_URL_PADRAO,
    openProjectProjetoId: configuracao.openProject.projetoId || '',
    intervaloPollingSegundos: configuracao.openProject.intervaloPollingSegundos,
    commitsPadrao: configuracao.resumos.commitsPadrao,
  };
}

function formatarData(dataIso: string): string {
  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) return 'sem data';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(data);
}

function formatarTamanho(tamanhoBytes: number | null): string {
  if (tamanhoBytes === null) return '';
  if (tamanhoBytes < 1024) return `${tamanhoBytes} B`;
  return `${Math.round(tamanhoBytes / 1024)} KB`;
}

function caminhoPai(caminhoRelativo: string): string | null {
  const partes = caminhoRelativo.split('/').filter(Boolean);
  if (partes.length <= 1) return null;
  return partes.slice(0, -1).join('/');
}

interface TaskItemProps {
  task: TaskOpenProjectQA;
  onEnviar: (msg: MensagemWebviewParaHost) => void;
  onSelect?: (task: TaskOpenProjectQA) => void;
}

const TaskItem: FC<TaskItemProps> = ({ task, onEnviar, onSelect }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid var(--qa-border)',
        borderRadius: '6px',
        padding: '8px 12px',
        fontSize: '11px',
        cursor: 'pointer',
        background: 'var(--qa-surface)',
        marginBottom: '6px',
        transition: 'all 0.1s ease-in-out',
        boxSizing: 'border-box'
      }}
      onClick={() => {
        if (onSelect) {
          onSelect(task);
        }
      }}
      className="task-item-hover"
    >
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1, minWidth: 0 }}>
        <span style={{ fontWeight: 600, color: 'var(--qa-link)', flexShrink: 0 }}>#{task.id}</span>
        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--qa-foreground)', fontWeight: 600 }}>{task.assunto}</span>
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0, marginLeft: '8px' }}>
        <span style={{ 
          fontSize: '9px', 
          background: 'var(--qa-surface-subtle)', 
          border: '1px solid var(--qa-border)', 
          padding: '2px 6px', 
          borderRadius: '4px', 
          color: 'var(--qa-muted)',
          textTransform: 'uppercase',
          fontWeight: 600
        }}>
          {task.status}
        </span>
        <button
          type="button"
          className="secondary"
          aria-label="Abrir Detalhes"
          style={{ minHeight: '20px', padding: '0 6px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '3px' }}
        >
          <IconEye />
          <span>Ver</span>
        </button>
      </div>
    </div>
  );
};
