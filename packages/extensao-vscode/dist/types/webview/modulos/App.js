"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = App;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const vscode = acquireVsCodeApi();
const estadoInicial = {
    produto: 'QAssistant',
    versaoExtensao: '0.1.0',
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
    geminiKeyPresente: false,
    openprojectTasks: [],
};
const setupInicial = {
    nomeProjeto: 'Meu projeto',
    raizCodigo: '.',
    frontend: '',
    backend: '',
    criarContextoProjeto: true,
    criarAssetsAgent: true,
    openProjectHabilitado: false,
    openProjectUrlBase: '',
    openProjectProjetoId: '',
    intervaloPollingSegundos: 60,
    commitsPadrao: 10,
};
function App() {
    const [estado, setEstado] = (0, react_1.useState)(estadoInicial);
    const [mensagem, setMensagem] = (0, react_1.useState)('');
    const [setup, setSetup] = (0, react_1.useState)(setupInicial);
    const [hashesSelecionados, setHashesSelecionados] = (0, react_1.useState)([]);
    const [activeTab, setActiveTab] = (0, react_1.useState)('resumos');
    const [wizardStep, setWizardStep] = (0, react_1.useState)('selecionar');
    const [editApiKey, setEditApiKey] = (0, react_1.useState)('');
    const [editOpApiKey, setEditOpApiKey] = (0, react_1.useState)('');
    const [apiKeySalva, setApiKeySalva] = (0, react_1.useState)(false);
    const [opApiKeySalva, setOpOpApiKeySalva] = (0, react_1.useState)(false);
    const [processandoIA, setProcessandoIA] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const escutarMensagem = (evento) => {
            const mensagemRecebida = evento.data;
            if (mensagemRecebida.tipo === 'estado.atualizado') {
                setEstado(mensagemRecebida.estado);
                setSetup((atual) => preencherSetupComEstado(atual, mensagemRecebida.estado));
                return;
            }
            if (mensagemRecebida.tipo === 'notificacao.info' || mensagemRecebida.tipo === 'notificacao.erro') {
                setProcessandoIA(null);
            }
            setMensagem(mensagemRecebida.mensagem);
        };
        window.addEventListener('message', escutarMensagem);
        enviar({ tipo: 'painel.carregado' });
        return () => window.removeEventListener('message', escutarMensagem);
    }, []);
    (0, react_1.useEffect)(() => {
        if (!estado.workspaceInicializado || estado.git.carregando || estado.git.carregadoEm || estado.git.erro)
            return;
        enviar({ tipo: 'git.carregarCommits', limite: setup.commitsPadrao });
    }, [estado.git.carregando, estado.git.carregadoEm, estado.git.erro, estado.workspaceInicializado, setup.commitsPadrao]);
    (0, react_1.useEffect)(() => {
        if (estado.git.recentes.length === 0) {
            setHashesSelecionados([]);
            return;
        }
        setHashesSelecionados((atuais) => {
            const hashesDisponiveis = new Set(estado.git.recentes.map((commit) => commit.hash));
            const preservados = atuais.filter((hash) => hashesDisponiveis.has(hash));
            if (preservados.length > 0)
                return { preservados }.preservados;
            return estado.git.recentes.slice(0, Math.min(3, estado.git.recentes.length)).map((commit) => commit.hash);
        });
    }, [estado.git.recentes]);
    (0, react_1.useEffect)(() => {
        if (estado.ultimoPacoteValidacao) {
            setWizardStep('sucesso');
        }
        else {
            setWizardStep('selecionar');
        }
    }, [estado.ultimoPacoteValidacao]);
    const status = (0, react_1.useMemo)(() => {
        if (!estado.workspaceAberto)
            return 'Abra um workspace para começar.';
        if (!estado.workspaceInicializado)
            return 'Workspace ainda não inicializado.';
        return 'Ferramenta iniciada e pronta para operar dentro do VS Code.';
    }, [estado.workspaceAberto, estado.workspaceInicializado]);
    const resumoEstrutura = (0, react_1.useMemo)(() => {
        const estrutura = estado.estrutura;
        if (!estrutura)
            return [];
        return [
            ['Configuração', estrutura.configuracaoPresente, '.qassistant/config.json'],
            ['Qassistant-testes', estrutura.qassistantTestesPresente, estado.raizTestes],
            ['docs/contexto', estrutura.contextoPresente, estado.raizContexto],
            ['instructions', estrutura.instructionsPresentes, '.github/instructions'],
            ['skills', estrutura.skillsPresentes, '.github/skills'],
        ];
    }, [estado.estrutura, estado.raizContexto, estado.raizTestes]);
    const progressoSetup = (0, react_1.useMemo)(() => {
        if (!resumoEstrutura.length)
            return 0;
        const prontos = resumoEstrutura.filter(([, presente]) => Boolean(presente)).length;
        return Math.round((prontos / resumoEstrutura.length) * 100);
    }, [resumoEstrutura]);
    const commitsSelecionados = (0, react_1.useMemo)(() => estado.git.recentes.filter((commit) => hashesSelecionados.includes(commit.hash)), [estado.git.recentes, hashesSelecionados]);
    const modulos = [
        {
            titulo: 'OpenProject',
            descricao: 'Preparar vínculo, polling e snapshots de tasks.',
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
    function atualizarSetup(campo, valor) {
        setSetup((atual) => ({ ...atual, [campo]: valor }));
    }
    function inicializarWorkspace() {
        enviar({ tipo: 'workspace.inicializar', setup });
    }
    function recarregarCommits() {
        enviar({ tipo: 'git.carregarCommits', limite: setup.commitsPadrao });
    }
    function criarPacoteComCommits() {
        enviar({ tipo: 'validacao.criarComCommits', titulo: `validacao-${setup.nomeProjeto || 'qa'}`, hashes: hashesSelecionados });
    }
    function criarPacoteRascunho() {
        enviar({ tipo: 'validacao.criarRascunho', titulo: `validacao-${setup.nomeProjeto || 'qa'}` });
    }
    function alternarCommit(hash) {
        setHashesSelecionados((atuais) => (atuais.includes(hash) ? atuais.filter((item) => item !== hash) : [...atuais, hash]));
    }
    return ((0, jsx_runtime_1.jsxs)("main", { className: "app-shell", children: [(0, jsx_runtime_1.jsxs)("header", { className: "sticky-header", children: [(0, jsx_runtime_1.jsxs)("div", { className: "brand-mini-row", children: [estado.assets.logoUri ? ((0, jsx_runtime_1.jsx)("img", { className: "mini-logo", src: estado.assets.logoUri, alt: "QAssistant" })) : ((0, jsx_runtime_1.jsx)("div", { className: "brand-mark", style: { width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--qa-brand)', color: '#fff', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }, children: "Q" })), (0, jsx_runtime_1.jsx)("h1", { children: estado.produto }), (0, jsx_runtime_1.jsxs)("span", { className: "version-small", children: ["v", estado.versaoExtensao] })] }), estado.workspaceInicializado ? ((0, jsx_runtime_1.jsxs)("nav", { className: "tabs-navigation-clean", "aria-label": "M\u00F3dulos de Navega\u00E7\u00E3o", children: [(0, jsx_runtime_1.jsxs)("button", { type: "button", className: `tab-btn-clean ${activeTab === 'resumos' ? 'active' : ''}`, onClick: () => setActiveTab('resumos'), children: ["Resumos ", hashesSelecionados.length > 0 ? `(${hashesSelecionados.length})` : ''] }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: `tab-btn-clean ${activeTab === 'openproject' ? 'active' : ''}`, onClick: () => setActiveTab('openproject'), children: "OpenProject" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: `tab-btn-clean ${activeTab === 'testes' ? 'active' : ''}`, onClick: () => setActiveTab('testes'), children: "Testes & Artefatos" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: `tab-btn-clean ${activeTab === 'prompts' ? 'active' : ''}`, onClick: () => setActiveTab('prompts'), children: "Prompts IA" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: `tab-btn-clean ${activeTab === 'config' ? 'active' : ''}`, onClick: () => setActiveTab('config'), children: "Configura\u00E7\u00E3o" })] })) : ((0, jsx_runtime_1.jsx)("nav", { className: "tabs-navigation-clean", children: (0, jsx_runtime_1.jsx)("button", { type: "button", className: "tab-btn-clean active", children: "Setup Obrigat\u00F3rio" }) }))] }), mensagem ? ((0, jsx_runtime_1.jsxs)("div", { className: "notice", style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 'var(--qa-space-2) var(--qa-space-4) 0' }, children: [(0, jsx_runtime_1.jsx)("span", { children: mensagem }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "secondary", onClick: () => setMensagem(''), style: { minHeight: '20px', border: 'none', padding: '0 var(--qa-space-2)', fontSize: '10px' }, children: "Dispensar" })] })) : null, (0, jsx_runtime_1.jsx)("div", { className: "scrollable-body", children: !estado.workspaceInicializado ? ((0, jsx_runtime_1.jsxs)("div", { className: "tab-panel-content", children: [(0, jsx_runtime_1.jsxs)("section", { className: "panel status-panel", "aria-labelledby": "status-title", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { id: "status-title", style: { fontSize: '13px', fontWeight: 600 }, children: "Setup pendente" }), (0, jsx_runtime_1.jsx)("p", { style: { margin: '4px 0', fontSize: '11px', color: 'var(--qa-muted)' }, children: "O QAssistant precisa inicializar sua estrutura operacional de testes e docs neste workspace antes de come\u00E7ar." }), (0, jsx_runtime_1.jsxs)("div", { className: "progress-block", "aria-label": `Progresso do setup: ${progressoSetup}%`, style: { marginTop: 'var(--qa-space-2)' }, children: [(0, jsx_runtime_1.jsx)("div", { className: "progress-track", children: (0, jsx_runtime_1.jsx)("span", { style: { width: `${progressoSetup}%` } }) }), (0, jsx_runtime_1.jsxs)("strong", { children: [progressoSetup, "% pronto"] })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "actions", style: { marginTop: 'var(--qa-space-2)' }, children: (0, jsx_runtime_1.jsx)("button", { type: "button", className: "secondary", style: { fontSize: '11px' }, onClick: () => enviar({ tipo: 'painel.atualizar' }), children: "Atualizar" }) })] }), (0, jsx_runtime_1.jsxs)("section", { className: "panel setup-panel", "aria-labelledby": "setup-title", children: [(0, jsx_runtime_1.jsxs)("div", { className: "section-heading", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "eyebrow", children: "Jornada guiada" }), (0, jsx_runtime_1.jsx)("h2", { id: "setup-title", style: { fontSize: '13px' }, children: "Inicializar workspace" })] }), (0, jsx_runtime_1.jsx)("span", { className: "badge", children: "Pendente" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-grid", children: [(0, jsx_runtime_1.jsxs)("label", { children: ["Nome do projeto", (0, jsx_runtime_1.jsx)("input", { value: setup.nomeProjeto, onChange: (evento) => atualizarSetup('nomeProjeto', evento.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: ["Raiz do c\u00F3digo", (0, jsx_runtime_1.jsx)("input", { value: setup.raizCodigo, onChange: (evento) => atualizarSetup('raizCodigo', evento.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: ["Frontend", (0, jsx_runtime_1.jsx)("input", { placeholder: "Opcional", value: setup.frontend || '', onChange: (evento) => atualizarSetup('frontend', evento.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: ["Backend", (0, jsx_runtime_1.jsx)("input", { placeholder: "Opcional", value: setup.backend || '', onChange: (evento) => atualizarSetup('backend', evento.target.value) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "toggle-row", style: { display: 'flex', gap: '12px', padding: '4px 0' }, children: [(0, jsx_runtime_1.jsxs)("label", { className: "check-row", style: { fontSize: '11px' }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: setup.criarContextoProjeto, onChange: (evento) => atualizarSetup('criarContextoProjeto', evento.target.checked) }), "Criar docs/contexto"] }), (0, jsx_runtime_1.jsxs)("label", { className: "check-row", style: { fontSize: '11px' }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: setup.criarAssetsAgent, onChange: (evento) => atualizarSetup('criarAssetsAgent', evento.target.checked) }), "Criar instructions e skills"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "subsection", children: [(0, jsx_runtime_1.jsxs)("label", { className: "check-row", style: { fontSize: '11px', fontWeight: 600 }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: setup.openProjectHabilitado, onChange: (evento) => atualizarSetup('openProjectHabilitado', evento.target.checked) }), "Preparar v\u00EDnculo com OpenProject"] }), setup.openProjectHabilitado && ((0, jsx_runtime_1.jsxs)("div", { className: "form-grid", style: { marginTop: '8px' }, children: [(0, jsx_runtime_1.jsxs)("label", { children: ["URL do OpenProject", (0, jsx_runtime_1.jsx)("input", { value: setup.openProjectUrlBase || '', onChange: (evento) => atualizarSetup('openProjectUrlBase', evento.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: ["ID do projeto", (0, jsx_runtime_1.jsx)("input", { value: setup.openProjectProjetoId || '', onChange: (evento) => atualizarSetup('openProjectProjetoId', evento.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: ["Polling em segundos", (0, jsx_runtime_1.jsx)("input", { type: "number", min: 15, value: setup.intervaloPollingSegundos, onChange: (evento) => atualizarSetup('intervaloPollingSegundos', numero(evento.target.value, 60)) })] }), (0, jsx_runtime_1.jsxs)("label", { children: ["Commits padr\u00E3o", (0, jsx_runtime_1.jsx)("input", { type: "number", min: 1, value: setup.commitsPadrao, onChange: (evento) => atualizarSetup('commitsPadrao', numero(evento.target.value, 10)) })] })] }))] }), (0, jsx_runtime_1.jsx)("div", { className: "actions-row", children: (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: inicializarWorkspace, disabled: !estado.workspaceAberto || !setup.nomeProjeto.trim(), children: "Criar estrutura do QAssistant" }) })] })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "tab-panel-content", children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '6px', padding: '6px 0', borderBottom: '1px solid var(--qa-border)', marginBottom: '8px', flexWrap: 'wrap' }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: '10px', color: 'var(--qa-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', marginRight: '4px' }, children: "Atalhos:" }), modulos.slice(2, 5).map((modulo) => ((0, jsx_runtime_1.jsx)("button", { type: "button", className: "secondary", style: { fontSize: '11px', minHeight: '22px', padding: '2px 10px' }, onClick: modulo.executar, disabled: !modulo.habilitado, children: modulo.acao }, modulo.titulo)))] }), activeTab === 'resumos' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "steps-indicator", children: [(0, jsx_runtime_1.jsxs)("span", { className: `step-item ${wizardStep === 'selecionar' ? 'active' : ''} ${wizardStep === 'revisar' || wizardStep === 'sucesso' ? 'completed' : ''}`, children: ["1. Selecionar Commits ", hashesSelecionados.length > 0 ? `(${hashesSelecionados.length})` : ''] }), (0, jsx_runtime_1.jsx)("div", { className: "steps-divider" }), (0, jsx_runtime_1.jsx)("span", { className: `step-item ${wizardStep === 'revisar' ? 'active' : ''} ${wizardStep === 'sucesso' ? 'completed' : ''}`, children: "2. Revisar Pacote" }), (0, jsx_runtime_1.jsx)("div", { className: "steps-divider" }), (0, jsx_runtime_1.jsx)("span", { className: `step-item ${wizardStep === 'sucesso' ? 'active' : ''}`, children: "3. Sugest\u00F5es de IA & Conclus\u00E3o" })] }), wizardStep === 'selecionar' && ((0, jsx_runtime_1.jsxs)("section", { className: "panel", "aria-labelledby": "commits-title", children: [(0, jsx_runtime_1.jsxs)("div", { className: "section-heading", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("p", { className: "eyebrow", style: { color: 'var(--qa-success)' }, children: ["Workspace: ", setup.nomeProjeto] }), (0, jsx_runtime_1.jsx)("h2", { id: "commits-title", style: { fontSize: '13px' }, children: "Lista de commits recentes" })] }), (0, jsx_runtime_1.jsx)("span", { className: "badge", children: estado.git.carregando ? 'Buscando logs...' : `${estado.git.recentes.length} commits` })] }), estado.git.erro ? (0, jsx_runtime_1.jsx)("div", { className: "inline-alert danger", style: { fontSize: '11px' }, children: estado.git.erro }) : null, !estado.git.erro && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("p", { className: "hero-text", style: { fontSize: '11px', margin: '0' }, children: "Escolha as modifica\u00E7\u00F5es que deseja enviar para an\u00E1lise inteligente e gera\u00E7\u00E3o de relat\u00F3rios estruturados." }), estado.git.repositorios && estado.git.repositorios.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { style: { margin: 'var(--qa-space-2) 0', display: 'flex', gap: 'var(--qa-space-2)', flexWrap: 'wrap', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: '10px', color: 'var(--qa-muted)', textTransform: 'uppercase', fontWeight: 600 }, children: "Reposit\u00F3rio:" }), (0, jsx_runtime_1.jsxs)("button", { type: "button", className: `secondary ${!window._repoFiltro || window._repoFiltro === 'todos' ? 'active-filter' : ''}`, style: { minHeight: '20px', padding: '2px 8px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px', border: !window._repoFiltro || window._repoFiltro === 'todos' ? '1px solid var(--qa-link)' : '1px solid var(--qa-border)' }, onClick: () => {
                                                                window._repoFiltro = 'todos';
                                                                setSetup((s) => ({ ...s }));
                                                            }, children: ["Todos ", (0, jsx_runtime_1.jsx)("span", { className: "badge-small", children: estado.git.recentes.length })] }), estado.git.repositorios.map((repo) => {
                                                            const count = estado.git.recentes.filter(c => c.repositorioId === repo.id).length;
                                                            return ((0, jsx_runtime_1.jsxs)("button", { type: "button", className: "secondary", style: {
                                                                    minHeight: '20px',
                                                                    padding: '2px 8px',
                                                                    fontSize: '10px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    border: window._repoFiltro === repo.id ? '1px solid var(--qa-link)' : '1px solid var(--qa-border)'
                                                                }, onClick: () => {
                                                                    window._repoFiltro = repo.id;
                                                                    setSetup((s) => ({ ...s }));
                                                                }, children: [repo.nome, " ", (0, jsx_runtime_1.jsx)("span", { className: "badge-small", children: count })] }, repo.id));
                                                        })] })), (0, jsx_runtime_1.jsxs)("div", { className: "commit-toolbar", style: { display: 'flex', gap: '8px', margin: '8px 0' }, children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "secondary", style: { fontSize: '11px', minHeight: '22px' }, onClick: () => {
                                                                const filtro = window._repoFiltro || 'todos';
                                                                const filtrados = estado.git.recentes.filter(c => filtro === 'todos' || c.repositorioId === filtro);
                                                                setHashesSelecionados(filtrados.map((commit) => commit.hash));
                                                            }, disabled: estado.git.recentes.length === 0, children: "Todos os filtrados" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "secondary", style: { fontSize: '11px', minHeight: '22px' }, onClick: () => setHashesSelecionados([]), disabled: hashesSelecionados.length === 0, children: "Limpar sele\u00E7\u00E3o" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "secondary", style: { fontSize: '11px', minHeight: '22px' }, onClick: recarregarCommits, disabled: estado.git.carregando, children: "Recarregar log" })] }), estado.git.recentes.length === 0 && !estado.git.carregando ? ((0, jsx_runtime_1.jsx)(EmptyState, { texto: "Nenhum commit recente encontrado nos subdiret\u00F3rios monitorados." })) : null, (0, jsx_runtime_1.jsx)("div", { className: "commit-list", style: { display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--qa-border)', padding: '8px', borderRadius: '4px' }, children: estado.git.recentes
                                                        .filter((commit) => {
                                                        const filtro = window._repoFiltro || 'todos';
                                                        return filtro === 'todos' || commit.repositorioId === filtro;
                                                    })
                                                        .map((commit) => ((0, jsx_runtime_1.jsx)(CommitItem, { commit: commit, selecionado: hashesSelecionados.includes(commit.hash), onToggle: () => alternarCommit(commit.hash) }, commit.hash))) }), hashesSelecionados.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "actions-row", style: { marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }, children: (0, jsx_runtime_1.jsx)("button", { type: "button", className: "secondary", style: { fontSize: '11px', minHeight: '24px' }, onClick: () => {
                                                            setWizardStep('revisar');
                                                        }, children: "Avan\u00E7ar para Revis\u00E3o" }) }))] }))] })), wizardStep === 'revisar' && ((0, jsx_runtime_1.jsxs)("section", { className: "panel", children: [(0, jsx_runtime_1.jsx)("div", { className: "section-heading", children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "eyebrow", children: "Ajustes finais" }), (0, jsx_runtime_1.jsx)("h2", { style: { fontSize: '13px' }, children: "Revisar composi\u00E7\u00E3o do pacote" })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "preview-grid-summary", children: [(0, jsx_runtime_1.jsxs)("div", { className: "preview-block", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Projeto" }), (0, jsx_runtime_1.jsx)("p", { children: setup.nomeProjeto })] }), (0, jsx_runtime_1.jsxs)("div", { className: "preview-block", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Branch" }), (0, jsx_runtime_1.jsx)("p", { children: estado.git.branch || 'main' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "preview-block", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Commits Selecionados" }), (0, jsx_runtime_1.jsxs)("p", { children: [hashesSelecionados.length, " selecionado(s)"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '8px' }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: '11px', fontWeight: 600, color: 'var(--qa-muted)', display: 'block', marginBottom: '4px' }, children: "Assunto dos Commits:" }), (0, jsx_runtime_1.jsx)("ul", { style: { margin: 0, paddingLeft: '16px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '100px', overflowY: 'auto' }, children: commitsSelecionados.map(c => ((0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("code", { children: c.hashCurto }), " - ", c.assunto, " ", (0, jsx_runtime_1.jsxs)("span", { style: { fontSize: '9px', color: 'var(--qa-muted)' }, children: ["(", c.repositorioNome, ")"] })] }, c.hash))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "actions-row", style: { marginTop: '12px', display: 'flex', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "secondary", style: { fontSize: '11px', minHeight: '24px' }, onClick: () => setWizardStep('selecionar'), children: "Voltar" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '8px' }, children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "secondary", style: { fontSize: '11px', minHeight: '24px' }, onClick: criarPacoteRascunho, children: "Rascunho sem commits" }), (0, jsx_runtime_1.jsx)("button", { type: "button", style: { fontSize: '11px', minHeight: '24px' }, onClick: () => {
                                                                criarPacoteComCommits();
                                                                setWizardStep('sucesso');
                                                            }, children: "Gerar Pacote de Valida\u00E7\u00E3o" })] })] })] })), wizardStep === 'sucesso' && estado.ultimoPacoteValidacao && ((0, jsx_runtime_1.jsxs)("section", { className: "panel", style: { border: '1px solid var(--qa-success)', background: 'var(--qa-surface-subtle)', padding: '12px' }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "section-heading", style: { padding: 0, marginBottom: '6px' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "eyebrow", style: { color: 'var(--qa-success)' }, children: "Pacote Operacional Ativo" }), (0, jsx_runtime_1.jsx)("h2", { style: { fontSize: '13px', margin: 0 }, children: estado.ultimoPacoteValidacao.id.split('/').pop() })] }), (0, jsx_runtime_1.jsx)("span", { className: "badge success", children: "Pronto" })] }), (0, jsx_runtime_1.jsxs)("p", { style: { fontSize: '11px', margin: '4px 0 10px', color: 'var(--qa-muted)' }, children: ["Seu pacote de valida\u00E7\u00E3o e o arquivo ", (0, jsx_runtime_1.jsx)("code", { children: "resumo-qa.md" }), " foram gerados! Escolha uma das a\u00E7\u00F5es de intelig\u00EAncia e automa\u00E7\u00E3o abaixo para expandir e documentar o impacto das suas altera\u00E7\u00F5es."] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { border: '1px solid var(--qa-border)', padding: '8px', borderRadius: '4px', background: 'var(--qa-surface)' }, children: [(0, jsx_runtime_1.jsx)("h4", { style: { margin: '0 0 4px', fontSize: '11px', fontWeight: 600 }, children: "Resumo de Impacto IA" }), (0, jsx_runtime_1.jsx)("p", { style: { fontSize: '10px', color: 'var(--qa-muted)', margin: '0 0 6px', lineHeight: '1.3' }, children: "Analisa as modifica\u00E7\u00F5es do seu pacote contra o hist\u00F3rico e preenche um relat\u00F3rio de impacto." }), (0, jsx_runtime_1.jsx)("button", { type: "button", style: { width: '100%', minHeight: '22px', fontSize: '10px', padding: '2px 4px' }, disabled: processandoIA !== null, onClick: () => {
                                                                setProcessandoIA('resumo');
                                                                enviar({ tipo: 'validacao.gerarResumoIA', rascunhoCaminho: estado.ultimoPacoteValidacao.caminhoRelativo });
                                                            }, children: processandoIA === 'resumo' ? 'Gerando resumo...' : 'Gerar Resumo IA' })] }), (0, jsx_runtime_1.jsxs)("div", { style: { border: '1px solid var(--qa-border)', padding: '8px', borderRadius: '4px', background: 'var(--qa-surface)' }, children: [(0, jsx_runtime_1.jsx)("h4", { style: { margin: '0 0 4px', fontSize: '11px', fontWeight: 600 }, children: "Sugerir Testes IA" }), (0, jsx_runtime_1.jsx)("p", { style: { fontSize: '10px', color: 'var(--qa-muted)', margin: '0 0 6px', lineHeight: '1.3' }, children: "Gera uma especifica\u00E7\u00E3o completa de baterias de testes automatizados E2E / manuais recomendados." }), (0, jsx_runtime_1.jsx)("button", { type: "button", style: { width: '100%', minHeight: '22px', fontSize: '10px', padding: '2px 4px' }, disabled: processandoIA !== null, onClick: () => {
                                                                setProcessandoIA('bateria');
                                                                enviar({ tipo: 'validacao.sugerirBateriaTestes', rascunhoCaminho: estado.ultimoPacoteValidacao.caminhoRelativo });
                                                            }, children: processandoIA === 'bateria' ? 'Sugerindo testes...' : 'Sugerir Bateria' })] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { border: '1px solid var(--qa-border)', padding: '8px', borderRadius: '4px', background: 'var(--qa-surface)', marginBottom: '8px' }, children: [(0, jsx_runtime_1.jsx)("h4", { style: { margin: '0 0 4px', fontSize: '11px', fontWeight: 600 }, children: "Publicar Relat\u00F3rio no OpenProject" }), (0, jsx_runtime_1.jsxs)("p", { style: { fontSize: '10px', color: 'var(--qa-muted)', margin: '0 0 8px', lineHeight: '1.3' }, children: ["Publique/atualize a descri\u00E7\u00E3o e o progresso da task no OpenProject usando o arquivo ", (0, jsx_runtime_1.jsx)("code", { children: "resumo-qa.md" }), " gerado no editor principal."] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '6px', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("input", { id: "op-wizard-task-id", placeholder: "Task ID (vazio se criar nova)", style: { fontSize: '10px', height: '22px', flex: 1, padding: '2px 6px', borderRadius: '3px', border: '1px solid var(--qa-border)' } }), (0, jsx_runtime_1.jsx)("button", { type: "button", disabled: processandoIA !== null, style: { minHeight: '22px', fontSize: '10px', padding: '2px 8px' }, onClick: () => {
                                                                const input = document.getElementById('op-wizard-task-id');
                                                                const idVal = input?.value?.trim() || '';
                                                                setProcessandoIA('openproject');
                                                                enviar({
                                                                    tipo: 'openproject.publicarTask',
                                                                    rascunhoCaminho: estado.ultimoPacoteValidacao.caminhoRelativo,
                                                                    taskId: idVal || undefined
                                                                });
                                                            }, children: processandoIA === 'openproject' ? 'Enviando...' : 'Publicar' })] })] })] }))] })), "div>"] })
                    ,
                        (0, jsx_runtime_1.jsxs)("div", { className: "actions-row", style: { display: 'flex', gap: '8px', justifyContent: 'space-between', borderTop: '1px solid var(--qa-border)', paddingTop: '8px' }, children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "secondary", style: { fontSize: '10px', minHeight: '22px' }, onClick: () => {
                                        setHashesSelecionados([]);
                                        setWizardStep('selecionar');
                                    }, children: "Criar Novo Pacote" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '6px' }, children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "secondary", style: { fontSize: '10px', minHeight: '22px' }, onClick: () => {
                                                if (estado.ultimoPacoteValidacao) {
                                                    enviar({ tipo: 'workspace.abrirCaminho', caminhoRelativo: `${estado.ultimoPacoteValidacao.caminhoRelativo}/resumo-qa.md` });
                                                }
                                            }, children: "Visualizar Resumo QA" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "secondary", style: { fontSize: '10px', minHeight: '22px' }, onClick: () => {
                                                if (estado.ultimoPacoteValidacao) {
                                                    enviar({ tipo: 'workspace.abrirCaminho', caminhoRelativo: `${estado.ultimoPacoteValidacao.caminhoRelativo}/pacote.yaml` });
                                                }
                                            }, children: "Ver YAML" })] })] })) }), ")}", (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: 'var(--qa-space-2)' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { margin: 'var(--qa-space-2) 0 4px', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.5px', color: 'var(--qa-muted)', fontWeight: 600 }, children: "Acesso R\u00E1pido" }), (0, jsx_runtime_1.jsx)("section", { className: "module-grid", "aria-label": "Acesso R\u00E1pido", style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }, children: modulos.slice(2, 5).map((modulo) => ((0, jsx_runtime_1.jsxs)("article", { className: "module", style: { padding: '8px' }, children: [(0, jsx_runtime_1.jsx)("div", { className: "module-topline", style: { marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }, children: (0, jsx_runtime_1.jsx)("h3", { style: { fontSize: '11px', margin: 0, fontWeight: 600 }, children: modulo.titulo }) }), (0, jsx_runtime_1.jsx)("p", { style: { fontSize: '10px', color: 'var(--qa-muted)', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.2' }, children: modulo.descricao }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "module-action secondary", style: { fontSize: '10px', minHeight: '20px', padding: '2px 6px', width: '100%' }, onClick: modulo.executar, disabled: !modulo.habilitado, children: modulo.acao })] }, modulo.titulo))) })] })] }));
}
{ /* ABA: OPENPROJECT */ }
{
    activeTab === 'openproject' && ((0, jsx_runtime_1.jsxs)("section", { className: "panel", style: { padding: 'var(--qa-space-4)' }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "section-heading", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "eyebrow", children: "Integra\u00E7\u00E3o Externa" }), (0, jsx_runtime_1.jsx)("h2", { style: { fontSize: '13px' }, children: "Gerenciamento no OpenProject" })] }), (0, jsx_runtime_1.jsx)("span", { className: `badge ${estado.configuracao?.openProject.habilitado ? 'success' : ''}`, children: estado.configuracao?.openProject.habilitado ? 'Habilitado' : 'Desativado' })] }), !estado.configuracao?.openProject.habilitado ? ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 'var(--qa-space-2)' }, children: [(0, jsx_runtime_1.jsx)("p", { className: "hero-text", style: { fontSize: '11px' }, children: "O v\u00EDnculo com o OpenProject do MedSystem n\u00E3o est\u00E1 ativado nas configura\u00E7\u00F5es do QAssistant." }), (0, jsx_runtime_1.jsx)("p", { style: { fontSize: '11px', color: 'var(--qa-muted)' }, children: "Ao habilit\u00E1-lo, o QAssistant permite monitorar o status do Work Package, capturar snapshots e associar os pacotes de valida\u00E7\u00E3o gerados diretamente com as tarefas de QA." }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => { setActiveTab('config'); }, style: { marginTop: 'var(--qa-space-2)', fontSize: '11px' }, children: "Habilitar OpenProject" })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "tab-panel-content", style: { marginTop: 'var(--qa-space-2)' }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "op-card", children: [(0, jsx_runtime_1.jsx)("span", { className: "op-status-badge", children: "Configurado" }), (0, jsx_runtime_1.jsx)("h3", { style: { margin: 'var(--qa-space-1) 0', fontSize: '11px' }, children: "Conex\u00E3o Ativa com Servidor" }), (0, jsx_runtime_1.jsxs)("dl", { className: "paths", style: { margin: 0, gap: '4px', fontSize: '11px' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '8px' }, children: [(0, jsx_runtime_1.jsx)("dt", { style: { minWidth: '95px', color: 'var(--qa-muted)' }, children: "Servidor URL" }), (0, jsx_runtime_1.jsx)("dd", { children: estado.configuracao.openProject.urlBase || 'https://medsystem.openproject.com' })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '8px' }, children: [(0, jsx_runtime_1.jsx)("dt", { style: { minWidth: '95px', color: 'var(--qa-muted)' }, children: "ID Projeto" }), (0, jsx_runtime_1.jsx)("dd", { children: estado.configuracao.openProject.projetoId || 'medsystem' })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '8px' }, children: [(0, jsx_runtime_1.jsx)("dt", { style: { minWidth: '95px', color: 'var(--qa-muted)' }, children: "Polling" }), (0, jsx_runtime_1.jsxs)("dd", { children: [estado.configuracao.openProject.intervaloPollingSegundos, " segundos"] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "op-card", style: { borderStyle: 'dashed' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { margin: '0 0 var(--qa-space-1)', fontSize: '11px' }, children: "Vincular Task de Valida\u00E7\u00E3o" }), (0, jsx_runtime_1.jsx)("p", { className: "hero-text", style: { fontSize: '11px', margin: '0 0 var(--qa-space-2)', color: 'var(--qa-muted)' }, children: "Associe o pacote de valida\u00E7\u00E3o ativo a uma tarefa do OpenProject para atualizar automaticamente seu status com os artefatos de testes." }), (0, jsx_runtime_1.jsx)("div", { className: "form-grid", style: { marginBottom: 'var(--qa-space-2)' }, children: (0, jsx_runtime_1.jsxs)("label", { style: { fontSize: '11px' }, children: ["ID do Work Package (#)", (0, jsx_runtime_1.jsx)("input", { id: "op-task-id-input", placeholder: "Ex: 27152", defaultValue: "" })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "actions-row", style: { display: 'flex', gap: '8px' }, children: [(0, jsx_runtime_1.jsx)("button", { type: "button", style: { fontSize: '11px', minHeight: '22px' }, onClick: () => {
                                            const input = document.getElementById('op-task-id-input');
                                            const id = input?.value?.trim() || '';
                                            if (!estado.ultimoPacoteValidacao) {
                                                setMensagem('Crie um pacote de validação na aba "Resumos" primeiro.');
                                                return;
                                            }
                                            enviar({
                                                tipo: 'openproject.publicarTask',
                                                rascunhoCaminho: estado.ultimoPacoteValidacao.caminhoRelativo,
                                                taskId: id || undefined
                                            });
                                        }, children: "Publicar no OpenProject" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "secondary", style: { fontSize: '11px', minHeight: '22px' }, onClick: () => {
                                            const input = document.getElementById('op-task-id-input');
                                            const id = input?.value?.trim() || '';
                                            if (!id) {
                                                setMensagem('Informe o ID do Work Package para testar obter o status.');
                                                return;
                                            }
                                            enviar({ tipo: 'openproject.obterStatus', taskId: id });
                                        }, children: "Consultar Status Atualizado" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "op-card", children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { margin: 0, fontSize: '12px' }, children: "Tasks Abertas" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "secondary", style: { fontSize: '11px', minHeight: '22px' }, onClick: () => enviar({ tipo: 'openproject.listarTasks' }), children: "Atualizar lista" })] }), estado.openprojectTasks.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { style: { fontSize: '11px', color: 'var(--qa-muted)', margin: 0 }, children: "Clique em \"Atualizar lista\" para carregar as tasks do projeto." })) : ((0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '220px', overflowY: 'auto' }, children: estado.openprojectTasks.map((task) => ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '8px', alignItems: 'center', padding: '5px 6px', border: '1px solid var(--qa-border)', borderRadius: '4px', fontSize: '11px' }, children: [(0, jsx_runtime_1.jsxs)("span", { style: { fontWeight: 600, minWidth: '38px', color: 'var(--qa-link)' }, children: ["#", task.id] }), (0, jsx_runtime_1.jsx)("span", { style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: task.assunto }), (0, jsx_runtime_1.jsx)("span", { style: { fontSize: '10px', background: 'var(--qa-surface-subtle)', border: '1px solid var(--qa-border)', padding: '1px 5px', borderRadius: '3px', whiteSpace: 'nowrap', flexShrink: 0 }, children: task.status })] }, task.id))) }))] })] }))] }));
}
{ /* ABA: TESTES & ARTEFATOS (SEM COMPONENTES ADICIONAIS, SÓ RETIRADA DE EMOJIS E DESIGN HIGHLIGHTS) */ }
{
    activeTab === 'testes' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [estado.ultimoPacoteValidacao && ((0, jsx_runtime_1.jsxs)("section", { className: "panel", style: { border: '1px solid var(--qa-link)', background: 'var(--qa-surface-subtle)', padding: '12px' }, "aria-labelledby": "ativos-title", children: [(0, jsx_runtime_1.jsxs)("div", { className: "section-heading", style: { padding: 0, marginBottom: '6px' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "eyebrow", style: { color: 'var(--qa-link)' }, children: "Pacote de Valida\u00E7\u00E3o Ativo" }), (0, jsx_runtime_1.jsx)("h2", { id: "ativos-title", style: { margin: 0, fontSize: '11px', fontWeight: 600 }, children: estado.ultimoPacoteValidacao.id.split('/').pop() })] }), (0, jsx_runtime_1.jsx)("span", { className: "badge success", children: "Ativo" })] }), (0, jsx_runtime_1.jsx)("p", { style: { fontSize: '11px', margin: '0 0 8px', color: 'var(--qa-muted)' }, children: "Invoque de forma manual ou consulte relat\u00F3rios associados. O ideal \u00E9 seguir pelas etapas do painel na aba principal de Resumos." })] })), (0, jsx_runtime_1.jsxs)("section", { className: "panel navigator-panel", "aria-labelledby": "navigator-title", children: [(0, jsx_runtime_1.jsxs)("div", { className: "section-heading", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "eyebrow", children: "Estrutura Operacional" }), (0, jsx_runtime_1.jsx)("h2", { id: "navigator-title", style: { fontSize: '13px' }, children: "Artefatos / Navegador QAssistant" })] }), estado.navegador ? (0, jsx_runtime_1.jsxs)("span", { className: "badge", children: [estado.navegador.entradas.length, " itens"] }) : null] }), (0, jsx_runtime_1.jsxs)("p", { className: "hero-text", style: { fontSize: '11px', margin: '0 0 var(--qa-space-1)' }, children: ["Acesse os arquivos do diret\u00F3rio de testes ", (0, jsx_runtime_1.jsxs)("code", { children: [estado.raizTestes, "/"] }), " de forma segura sem abrir janelas externas no SO."] }), estado.navegador ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "navigator-path", style: { margin: 'var(--qa-space-2) 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontWeight: 'bold', fontSize: '11px' }, children: estado.navegador.caminhoRelativo }), caminhoPai(estado.navegador.caminhoRelativo) ? ((0, jsx_runtime_1.jsx)("button", { type: "button", className: "secondary", style: { minHeight: '22px', padding: '0 var(--qa-space-3)', fontSize: '11px' }, onClick: () => enviar({ tipo: 'workspace.abrirCaminho', caminhoRelativo: caminhoPai(estado.navegador?.caminhoRelativo || '') || estado.raizTestes }), children: "Subir n\u00EDvel" })) : null] }), (0, jsx_runtime_1.jsx)("div", { className: "navigator-list", style: { maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--qa-border)', padding: '4px', borderRadius: '4px' }, children: estado.navegador.entradas.map((entrada) => ((0, jsx_runtime_1.jsxs)("button", { className: "navigator-entry", style: { padding: '4px 6px', fontSize: '11px', display: 'flex', justifyContent: 'space-between', width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }, onClick: () => enviar({ tipo: 'workspace.abrirCaminho', caminhoRelativo: entrada.caminhoRelativo }), type: "button", children: [(0, jsx_runtime_1.jsxs)("span", { style: { fontSize: '10px', color: 'var(--qa-muted)', marginRight: '6px' }, children: ["[", entrada.tipo === 'pasta' ? 'PASTA' : 'FILE', "]"] }), (0, jsx_runtime_1.jsx)("span", { style: { wordBreak: 'break-all', flex: 1 }, children: entrada.nome }), (0, jsx_runtime_1.jsx)("small", { style: { color: 'var(--qa-muted)' }, children: entrada.tipo === 'arquivo' ? formatarTamanho(entrada.tamanhoBytes) : 'Navegar' })] }, entrada.caminhoRelativo))) }), estado.navegador.arquivoAberto ? ((0, jsx_runtime_1.jsxs)("p", { className: "navigator-opened", style: { marginTop: 'var(--qa-space-2)', fontSize: '10px', color: 'var(--qa-muted)' }, children: ["Arquivo em exibi\u00E7\u00E3o no editor: ", (0, jsx_runtime_1.jsx)("code", { children: estado.navegador.arquivoAberto })] })) : null] })) : (0, jsx_runtime_1.jsx)(EmptyState, { texto: "Navegador n\u00E3o dispon\u00EDvel. Inicialize o workspace primeiro." })] }), (0, jsx_runtime_1.jsxs)("section", { className: "panel", "aria-labelledby": "estrutura-title", children: [(0, jsx_runtime_1.jsx)("div", { className: "section-heading", style: { padding: '0 0 var(--qa-space-1)' }, children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "eyebrow", children: "Diret\u00F3rios vitais" }), (0, jsx_runtime_1.jsx)("h2", { id: "estrutura-title", style: { fontSize: '11px', fontWeight: 600 }, children: "Atalhos R\u00E1pidos de Projetos" })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "structure-grid", style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }, children: resumoEstrutura.map(([rotulo, presente, caminho]) => ((0, jsx_runtime_1.jsx)("button", { className: "structure-item", style: { padding: '6px', fontSize: '11px' }, disabled: !presente, onClick: () => enviar({ tipo: 'workspace.abrirCaminho', caminhoRelativo: caminho }), type: "button", children: (0, jsx_runtime_1.jsx)("span", { children: rotulo }) }, rotulo))) })] })] }));
}
{ /* ABA: PROMPTS IA */ }
{
    activeTab === 'prompts' && ((0, jsx_runtime_1.jsxs)("section", { className: "panel", style: { padding: 'var(--qa-space-4)' }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "section-heading", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "eyebrow", children: "Agente Cognitivo" }), (0, jsx_runtime_1.jsx)("h2", { style: { fontSize: '13px' }, children: "Prompts e Guias Editor-First" })] }), (0, jsx_runtime_1.jsx)("span", { className: "badge", children: "Guia Copilot" })] }), (0, jsx_runtime_1.jsxs)("p", { className: "hero-text", style: { margin: '8px 0', fontSize: '11px' }, children: ["Os prompts estruturados s\u00E3o arquivos Markdown especiais (", (0, jsx_runtime_1.jsx)("code", { children: ".prompt.md" }), ") que servem de modelo contextualizado para o assistente de IA compreender o escopo, as regras do MedSystem e sugerir testes perfeitamente alinhados."] }), (0, jsx_runtime_1.jsxs)("div", { className: "op-card", style: { marginBottom: '8px' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { margin: '0 0 4px', fontSize: '11px' }, children: "Sugerir Cen\u00E1rios de QA" }), (0, jsx_runtime_1.jsx)("p", { className: "hero-text", style: { fontSize: '11px', margin: '0 0 8px', color: 'var(--qa-muted)' }, children: "Abre o prompt de cobertura de testes na \u00E1rea principal do VS Code para disparar sugest\u00F5es usando os commits do pacote como contexto." }), (0, jsx_runtime_1.jsxs)("div", { className: "actions-row", style: { display: 'flex', gap: '6px' }, children: [(0, jsx_runtime_1.jsx)("button", { type: "button", style: { fontSize: '11px', minHeight: '22px' }, onClick: () => enviar({ tipo: 'workspace.abrirCaminho', caminhoRelativo: 'Qassistant-testes/prompts/sugerir-cenarios-qa.prompt.md' }), children: "Abrir Prompt Base" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "secondary", style: { fontSize: '11px', minHeight: '22px' }, onClick: () => {
                                    setMensagem('Metadados de prompts copiados para área de transferência.');
                                }, children: "Copiar Contexto" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "op-card", children: [(0, jsx_runtime_1.jsx)("h3", { style: { margin: '0 0 4px', fontSize: '11px' }, children: "Opera\u00E7\u00E3o de IA complementar:" }), (0, jsx_runtime_1.jsxs)("ol", { style: { margin: 0, paddingLeft: '14px', color: 'var(--qa-muted)', display: 'grid', gap: '4px', fontSize: '11px' }, children: [(0, jsx_runtime_1.jsx)("li", { children: "Selecione commits e gere um pacote de valida\u00E7\u00E3o." }), (0, jsx_runtime_1.jsxs)("li", { children: ["Abra o arquivo ", (0, jsx_runtime_1.jsx)("code", { children: "resumo-qa.md" }), " gerado no editor principal."] }), (0, jsx_runtime_1.jsx)("li", { children: "Submeta o arquivo do prompt para guiar o assistente na sua especifica\u00E7\u00E3o." })] })] })] }));
}
{ /* ABA: CONFIGURAÇÃO (PAINEL GERAL + CONFIGURAÇÃO GEMINI) */ }
{
    activeTab === 'config' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("section", { className: "gemini-config-section", children: [(0, jsx_runtime_1.jsx)("h3", { style: { margin: 0, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }, children: "Configura\u00E7\u00E3o Gemini (API Key)" }), (0, jsx_runtime_1.jsx)("p", { style: { margin: 0, fontSize: '11px', color: 'var(--qa-muted)' }, children: "Para gera\u00E7\u00E3o instant\u00E2nea de relat\u00F3rios e casos de testes por IA direta sem usar o Copilot externo. Os dados s\u00E3o enviados apenas aos servidores de infer\u00EAncia do Google." }), (0, jsx_runtime_1.jsx)("div", { className: "form-grid", style: { marginTop: '4px' }, children: (0, jsx_runtime_1.jsxs)("label", { style: { fontSize: '11px' }, children: ["Gemini API Key", (0, jsx_runtime_1.jsx)("input", { type: "password", placeholder: "AIzaSy...", value: editApiKey, onChange: (e) => {
                                        setEditApiKey(e.target.value);
                                        setApiKeySalva(false);
                                    } })] }) }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', marginBottom: '12px' }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: '11px', color: apiKeySalva || estado.geminiKeyPresente ? 'var(--qa-success)' : 'var(--qa-muted)' }, children: apiKeySalva ? 'Chave salva com sucesso!' : estado.geminiKeyPresente ? 'Chave Gemini configurada' : 'Nenhuma chave configurada' }), (0, jsx_runtime_1.jsx)("button", { type: "button", style: { fontSize: '11px', minHeight: '22px', padding: '0 12px' }, onClick: () => {
                                    if (!editApiKey.trim()) {
                                        setMensagem('Insira um valor de API Key válido.');
                                        return;
                                    }
                                    enviar({ tipo: 'config.salvarChaveGemini', chave: editApiKey.trim() });
                                    setEditApiKey('');
                                    setApiKeySalva(true);
                                }, children: "Salvar Chave Gemini" })] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "gemini-config-section", style: { marginTop: '12px', borderTop: '1px solid var(--qa-border)', paddingTop: '12px' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { margin: 0, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }, children: "Configura\u00E7\u00E3o OpenProject (API Key)" }), (0, jsx_runtime_1.jsx)("p", { style: { margin: 0, fontSize: '11px', color: 'var(--qa-muted)' }, children: "Chave de API do para integra\u00E7\u00E3o com o OpenProject da Ormel." }), (0, jsx_runtime_1.jsx)("div", { className: "form-grid", style: { marginTop: '4px' }, children: (0, jsx_runtime_1.jsxs)("label", { style: { fontSize: '11px' }, children: ["OpenProject API Key", (0, jsx_runtime_1.jsx)("input", { type: "password", placeholder: "Insira o seu token...", value: editOpApiKey, onChange: (e) => {
                                        setEditOpApiKey(e.target.value);
                                        setOpOpApiKeySalva(false);
                                    } })] }) }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: '11px', color: opApiKeySalva || estado.openProjectKeyPresente ? 'var(--qa-success)' : 'var(--qa-muted)' }, children: opApiKeySalva ? 'Chave salva com sucesso!' : estado.openProjectKeyPresente ? 'Chave OpenProject configurada' : 'Nenhuma chave configurada' }), (0, jsx_runtime_1.jsx)("button", { type: "button", style: { fontSize: '11px', minHeight: '22px', padding: '0 12px' }, onClick: () => {
                                    if (!editOpApiKey.trim()) {
                                        setMensagem('Insira um valor de API Key válido.');
                                        return;
                                    }
                                    enviar({ tipo: 'config.salvarChaveOpenProject', chave: editOpApiKey.trim() });
                                    setEditOpApiKey('');
                                    setOpOpApiKeySalva(true);
                                }, children: "Salvar Chave OpenProject" })] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "panel setup-panel", "aria-labelledby": "setup-title", style: { marginTop: '8px' }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "section-heading", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "eyebrow", children: "Estrutura de Caminhos e Credenciais" }), (0, jsx_runtime_1.jsx)("h2", { id: "setup-title", style: { fontSize: '13px' }, children: "Configurar QAssistant" })] }), (0, jsx_runtime_1.jsx)("span", { className: "badge success", children: "Configurado" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-grid", children: [(0, jsx_runtime_1.jsxs)("label", { children: ["Nome do projeto", (0, jsx_runtime_1.jsx)("input", { value: setup.nomeProjeto, onChange: (evento) => atualizarSetup('nomeProjeto', evento.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: ["Raiz do c\u00F3digo", (0, jsx_runtime_1.jsx)("input", { value: setup.raizCodigo, onChange: (evento) => atualizarSetup('raizCodigo', evento.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: ["Frontend", (0, jsx_runtime_1.jsx)("input", { placeholder: "Opcional", value: setup.frontend || '', onChange: (evento) => atualizarSetup('frontend', evento.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: ["Backend", (0, jsx_runtime_1.jsx)("input", { placeholder: "Opcional", value: setup.backend || '', onChange: (evento) => atualizarSetup('backend', evento.target.value) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "toggle-row", style: { display: 'flex', gap: '12px', margin: '4px 0' }, children: [(0, jsx_runtime_1.jsxs)("label", { className: "check-row", style: { fontSize: '11px' }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: setup.criarContextoProjeto, onChange: (evento) => atualizarSetup('criarContextoProjeto', evento.target.checked) }), "Criar docs/contexto"] }), (0, jsx_runtime_1.jsxs)("label", { className: "check-row", style: { fontSize: '11px' }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: setup.criarAssetsAgent, onChange: (evento) => atualizarSetup('criarAssetsAgent', evento.target.checked) }), "Criar instructions e skills"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "subsection", children: [(0, jsx_runtime_1.jsxs)("label", { className: "check-row", style: { fontSize: '11px', fontWeight: 600 }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: setup.openProjectHabilitado, onChange: (evento) => atualizarSetup('openProjectHabilitado', evento.target.checked) }), "Ativar integra\u00E7\u00E3o com OpenProject"] }), setup.openProjectHabilitado && ((0, jsx_runtime_1.jsxs)("div", { className: "form-grid", style: { marginTop: '8px' }, children: [(0, jsx_runtime_1.jsxs)("label", { style: { fontSize: '11px' }, children: ["URL do OpenProject", (0, jsx_runtime_1.jsx)("input", { value: setup.openProjectUrlBase || '', onChange: (evento) => atualizarSetup('openProjectUrlBase', evento.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { style: { fontSize: '11px' }, children: ["ID do projeto", (0, jsx_runtime_1.jsx)("input", { value: setup.openProjectProjetoId || '', onChange: (evento) => atualizarSetup('openProjectProjetoId', evento.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { style: { fontSize: '11px' }, children: ["Polling em segundos", (0, jsx_runtime_1.jsx)("input", { type: "number", min: 15, value: setup.intervaloPollingSegundos, onChange: (evento) => atualizarSetup('intervaloPollingSegundos', numero(evento.target.value, 60)) })] }), (0, jsx_runtime_1.jsxs)("label", { style: { fontSize: '11px' }, children: ["Commits padr\u00E3o", (0, jsx_runtime_1.jsx)("input", { type: "number", min: 1, value: setup.commitsPadrao, onChange: (evento) => atualizarSetup('commitsPadrao', numero(evento.target.value, 10)) })] })] }))] }), (0, jsx_runtime_1.jsx)("div", { className: "actions-row", children: (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: inicializarWorkspace, disabled: !estado.workspaceAberto || !setup.nomeProjeto.trim(), children: "Atualizar Configura\u00E7\u00E3o" }) })] })] }));
}
div >
;
div >
;
main >
;
;
const CommitItem = ({ commit, selecionado, onToggle }) => ((0, jsx_runtime_1.jsxs)("label", { className: "commit-item", style: { position: 'relative' }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: selecionado, onChange: onToggle }), (0, jsx_runtime_1.jsxs)("span", { children: [(0, jsx_runtime_1.jsxs)("strong", { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }, children: [commit.assunto, commit.repositorioNome && ((0, jsx_runtime_1.jsx)("span", { style: {
                                fontSize: '9px',
                                background: 'var(--qa-surface-subtle)',
                                border: '1px solid var(--qa-border)',
                                padding: '1px 4px',
                                borderRadius: '4px',
                                fontWeight: 'normal',
                                color: 'var(--qa-muted)'
                            }, children: commit.repositorioNome }))] }), (0, jsx_runtime_1.jsxs)("small", { children: [commit.hashCurto, " \u00B7 ", commit.autor, " \u00B7 ", formatarData(commit.dataIso)] })] })] }));
const EmptyState = ({ texto }) => (0, jsx_runtime_1.jsx)("p", { className: "empty-state", children: texto });
function focarSetupOpenProject(atualizarSetup) {
    atualizarSetup('openProjectHabilitado', true);
    document.getElementById('setup-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function enviar(mensagem) {
    vscode.postMessage(mensagem);
}
function numero(valor, fallback) {
    const parsed = Number(valor);
    return Number.isFinite(parsed) ? parsed : fallback;
}
function preencherSetupComEstado(atual, estado) {
    const configuracao = estado.configuracao;
    if (!configuracao) {
        const nomeProjeto = estado.raizWorkspace.split('/').filter(Boolean).pop() || atual.nomeProjeto;
        return { ...atual, nomeProjeto };
    }
    return {
        nomeProjeto: configuracao.projeto.nome,
        raizCodigo: configuracao.caminhos.raizCodigo,
        frontend: configuracao.caminhos.frontend || '',
        backend: configuracao.caminhos.backend || '',
        criarContextoProjeto: configuracao.setup.criarContextoProjeto,
        criarAssetsAgent: configuracao.setup.criarAssetsAgent,
        openProjectHabilitado: configuracao.openProject.habilitado,
        openProjectUrlBase: configuracao.openProject.urlBase || '',
        openProjectProjetoId: configuracao.openProject.projetoId || '',
        intervaloPollingSegundos: configuracao.openProject.intervaloPollingSegundos,
        commitsPadrao: configuracao.resumos.commitsPadrao,
    };
}
function formatarData(dataIso) {
    const data = new Date(dataIso);
    if (Number.isNaN(data.getTime()))
        return 'sem data';
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(data);
}
function formatarTamanho(tamanhoBytes) {
    if (tamanhoBytes === null)
        return '';
    if (tamanhoBytes < 1024)
        return `${tamanhoBytes} B`;
    return `${Math.round(tamanhoBytes / 1024)} KB`;
}
function caminhoPai(caminhoRelativo) {
    const partes = caminhoRelativo.split('/').filter(Boolean);
    if (partes.length <= 1)
        return null;
    return partes.slice(0, -1).join('/');
}
//# sourceMappingURL=App.js.map