"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvedorPainel = void 0;
const node_child_process_1 = require("node:child_process");
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const node_util_1 = require("node:util");
const vscode = __importStar(require("vscode"));
const nucleo_1 = require("@qassistant/nucleo");
const mensagens_1 = require("../../contratos/mensagens");
const workspace_1 = require("../servicos/workspace");
const execFileAsync = (0, node_util_1.promisify)(node_child_process_1.execFile);
class ProvedorPainel {
    contexto;
    saida;
    static viewType = 'qassistant.painel';
    webview;
    ultimosArquivosCriados = [];
    ultimosArquivosPreservados = [];
    ultimoPacoteValidacao;
    navegador = null;
    geminiKeyPresente = false;
    openProjectKeyPresente = false;
    openprojectTasks = [];
    git = {
        carregando: false,
        erro: null,
        recentes: [],
        carregadoEm: null,
        branch: '',
        repositorios: [],
    };
    constructor(contexto, saida) {
        this.contexto = contexto;
        this.saida = saida;
    }
    resolveWebviewView(webviewView) {
        this.webview = webviewView.webview;
        this.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.contexto.extensionUri, 'dist', 'webview'),
                vscode.Uri.joinPath(this.contexto.extensionUri, 'media'),
            ],
        };
        this.webview.html = this.criarHtml(this.webview);
        this.webview.onDidReceiveMessage((mensagemDesconhecida) => void this.receberMensagem(mensagemDesconhecida));
        // Carregar presença de chave Gemini e OpenProject de forma assíncrona ao abrir o painel
        void this.contexto.secrets.get('qassistant.geminiApiKey').then((chave) => {
            this.geminiKeyPresente = !!chave;
        });
        void this.contexto.secrets.get('qassistant.openProjectApiKey').then((chave) => {
            this.openProjectKeyPresente = !!chave;
        });
    }
    async atualizar() {
        this.enviar({ tipo: 'estado.atualizado', estado: this.criarEstado() });
    }
    async inicializarWorkspace(setup) {
        const raizWorkspace = (0, workspace_1.obterRaizWorkspace)();
        if (!raizWorkspace) {
            this.enviar({ tipo: 'notificacao.erro', mensagem: 'Abra um workspace antes de inicializar o QAssistant.' });
            return;
        }
        const configuracao = this.montarConfiguracao(raizWorkspace, setup || this.criarSetupPadrao(raizWorkspace));
        const resultado = (0, nucleo_1.inicializarWorkspaceQAssistant)(raizWorkspace, configuracao);
        this.ultimosArquivosCriados = resultado.criados;
        this.ultimosArquivosPreservados = resultado.preservados;
        this.navegador = this.criarNavegadorInterno(raizWorkspace, nucleo_1.RAIZ_TESTES_QASSISTANT);
        await this.carregarCommits(configuracao.resumos.commitsPadrao, false);
        this.saida.appendLine(`Workspace inicializado: ${resultado.criados.length} itens criados, ${resultado.preservados.length} preservados.`);
        this.enviar({ tipo: 'notificacao.info', mensagem: `Setup concluido: ${resultado.criados.length} itens criados e ${resultado.preservados.length} preservados.` });
        await this.atualizar();
    }
    async receberMensagem(mensagemDesconhecida) {
        const resultado = mensagens_1.MensagemWebviewParaHostSchema.safeParse(mensagemDesconhecida);
        if (!resultado.success) {
            this.enviar({ tipo: 'notificacao.erro', mensagem: 'Mensagem invalida recebida pela extensao.' });
            return;
        }
        try {
            switch (resultado.data.tipo) {
                case 'painel.carregado':
                case 'painel.atualizar':
                    await this.atualizar();
                    return;
                case 'workspace.inicializar':
                    await this.inicializarWorkspace(resultado.data.setup);
                    return;
                case 'workspace.abrirCaminho':
                    await this.abrirCaminhoWorkspace(resultado.data.caminhoRelativo);
                    return;
                case 'validacao.criarRascunho':
                    await this.criarPacoteValidacaoRascunho(resultado.data.titulo);
                    return;
                case 'validacao.criarComCommits':
                    await this.criarPacoteValidacaoComCommits(resultado.data.titulo, resultado.data.hashes);
                    return;
                case 'validacao.gerarResumoIA':
                    await this.gerarResumoIA(resultado.data.rascunhoCaminho);
                    return;
                case 'validacao.sugerirBateriaTestes':
                    await this.sugerirBateriaTestes(resultado.data.rascunhoCaminho);
                    return;
                case 'openproject.publicarTask':
                    await this.publicarTaskOpenProject(resultado.data.rascunhoCaminho, resultado.data.taskId);
                    return;
                case 'openproject.obterStatus':
                    await this.obterStatusOpenProject(resultado.data.taskId);
                    return;
                case 'openproject.listarTasks':
                    await this.listarTasksOpenProject();
                    return;
                case 'config.salvarChaveGemini':
                    await this.salvarChaveGemini(resultado.data.chave);
                    return;
                case 'config.salvarChaveOpenProject':
                    await this.salvarChaveOpenProject(resultado.data.chave);
                    return;
                case 'git.carregarCommits':
                    await this.carregarCommits(resultado.data.limite);
                    return;
            }
        }
        catch (error) {
            const mensagem = error instanceof Error ? error.message : String(error);
            this.saida.appendLine(`Erro: ${mensagem}`);
            this.enviar({ tipo: 'notificacao.erro', mensagem });
        }
    }
    criarEstado() {
        const versaoExtensao = String(this.contexto.extension.packageJSON.version || '0.1.0');
        const estado = (0, mensagens_1.criarEstadoInicial)(versaoExtensao);
        const raizWorkspace = (0, workspace_1.obterRaizWorkspace)();
        if (!raizWorkspace)
            return estado;
        const configuracao = (0, nucleo_1.carregarConfiguracaoWorkspace)(raizWorkspace);
        const estrutura = (0, nucleo_1.inspecionarEstruturaWorkspace)(raizWorkspace);
        if (!this.navegador && estrutura.qassistantTestesPresente) {
            this.navegador = this.criarNavegadorInterno(raizWorkspace, configuracao?.caminhos.raizTestes || nucleo_1.RAIZ_TESTES_QASSISTANT);
        }
        return {
            ...estado,
            assets: { logoUri: this.criarUriLogo() },
            workspaceAberto: true,
            workspaceInicializado: estrutura.configuracaoPresente && estrutura.qassistantTestesPresente,
            raizWorkspace,
            raizTestes: configuracao?.caminhos.raizTestes || nucleo_1.RAIZ_TESTES_QASSISTANT,
            raizContexto: configuracao?.caminhos.raizContexto || nucleo_1.RAIZ_CONTEXTO_PROJETO,
            configuracao,
            estrutura,
            git: this.git,
            navegador: this.navegador,
            ultimosArquivosCriados: this.ultimosArquivosCriados,
            ultimosArquivosPreservados: this.ultimosArquivosPreservados,
            ultimoPacoteValidacao: this.ultimoPacoteValidacao,
            geminiKeyPresente: this.geminiKeyPresente,
            openProjectKeyPresente: this.openProjectKeyPresente,
            openprojectTasks: this.openprojectTasks,
        };
    }
    async abrirCaminhoWorkspace(caminhoRelativo) {
        const raizWorkspace = (0, workspace_1.obterRaizWorkspace)();
        if (!raizWorkspace) {
            this.enviar({ tipo: 'notificacao.erro', mensagem: 'Abra um workspace antes de abrir arquivos do QAssistant.' });
            return;
        }
        const caminhoAbsoluto = path.resolve(raizWorkspace, caminhoRelativo);
        const relativo = path.relative(raizWorkspace, caminhoAbsoluto);
        if (relativo.startsWith('..') || path.isAbsolute(relativo)) {
            this.enviar({ tipo: 'notificacao.erro', mensagem: 'Caminho fora do workspace atual.' });
            return;
        }
        if (!fs.existsSync(caminhoAbsoluto)) {
            this.enviar({ tipo: 'notificacao.erro', mensagem: `Caminho ainda nao existe: ${caminhoRelativo}` });
            return;
        }
        const stat = fs.statSync(caminhoAbsoluto);
        const caminhoNormalizado = normalizarRelativo(path.relative(raizWorkspace, caminhoAbsoluto));
        const uri = vscode.Uri.file(caminhoAbsoluto);
        if (stat.isDirectory()) {
            this.navegador = this.criarNavegadorInterno(raizWorkspace, caminhoNormalizado);
            this.enviar({ tipo: 'notificacao.info', mensagem: `Navegando em ${caminhoNormalizado || '.'} dentro do QAssistant.` });
            await this.atualizar();
            return;
        }
        const documento = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(documento, { preview: false });
        this.navegador = {
            caminhoRelativo: this.navegador?.caminhoRelativo || path.dirname(caminhoNormalizado),
            entradas: this.navegador?.entradas || [],
            arquivoAberto: caminhoNormalizado,
        };
        await this.atualizar();
    }
    async criarPacoteValidacaoRascunho(titulo) {
        const raizWorkspace = (0, workspace_1.obterRaizWorkspace)();
        if (!raizWorkspace) {
            this.enviar({ tipo: 'notificacao.erro', mensagem: 'Abra um workspace antes de criar validacoes.' });
            return;
        }
        if (!fs.existsSync(path.join(raizWorkspace, nucleo_1.RAIZ_TESTES_QASSISTANT))) {
            this.enviar({ tipo: 'notificacao.erro', mensagem: 'Inicialize o workspace antes de criar pacotes de validacao.' });
            return;
        }
        const resultado = (0, nucleo_1.criarPacoteValidacaoRascunho)(raizWorkspace, titulo);
        this.ultimosArquivosCriados = resultado.arquivosCriados;
        this.ultimosArquivosPreservados = resultado.arquivosPreservados;
        this.ultimoPacoteValidacao = { id: resultado.id, caminhoRelativo: resultado.caminhoRelativo };
        this.navegador = this.criarNavegadorInterno(raizWorkspace, resultado.caminhoRelativo);
        this.enviar({ tipo: 'notificacao.info', mensagem: `Pacote de validacao criado em ${resultado.caminhoRelativo}.` });
        await this.atualizar();
        await this.abrirCaminhoWorkspace(`${resultado.caminhoRelativo}/resumo-qa.md`);
    }
    async criarPacoteValidacaoComCommits(titulo, hashes) {
        const raizWorkspace = (0, workspace_1.obterRaizWorkspace)();
        if (!raizWorkspace) {
            this.enviar({ tipo: 'notificacao.erro', mensagem: 'Abra um workspace antes de criar validacoes.' });
            return;
        }
        if (!fs.existsSync(path.join(raizWorkspace, nucleo_1.RAIZ_TESTES_QASSISTANT))) {
            this.enviar({ tipo: 'notificacao.erro', mensagem: 'Inicialize o workspace antes de criar pacotes de validacao.' });
            return;
        }
        if (hashes.length === 0) {
            this.enviar({ tipo: 'notificacao.erro', mensagem: 'Selecione ao menos um commit para criar o pacote.' });
            return;
        }
        const commits = this.selecionarCommits(hashes);
        if (commits.length === 0) {
            this.enviar({ tipo: 'notificacao.erro', mensagem: 'Os commits selecionados nao estao carregados no painel.' });
            return;
        }
        const resultado = (0, nucleo_1.criarPacoteValidacaoRascunho)(raizWorkspace, titulo, commits);
        this.ultimosArquivosCriados = resultado.arquivosCriados;
        this.ultimosArquivosPreservados = resultado.arquivosPreservados;
        this.ultimoPacoteValidacao = { id: resultado.id, caminhoRelativo: resultado.caminhoRelativo };
        this.navegador = this.criarNavegadorInterno(raizWorkspace, resultado.caminhoRelativo);
        // Tenta carregar as credenciais para gerar automaticamente o resumo de IA
        const geminiKey = process.env.PROJECT_AI_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (geminiKey) {
            this.saida.appendLine(`Iniciando geração automática de resumo de IA para o novo pacote.`);
            void this.gerarResumoIA(resultado.caminhoRelativo).catch(() => { });
        }
        this.enviar({ tipo: 'notificacao.info', mensagem: `Pacote criado com ${commits.length} commit(s) selecionado(s).` });
        await this.atualizar();
        await this.abrirCaminhoWorkspace(`${resultado.caminhoRelativo}/resumo-qa.md`);
    }
    async carregarCommits(limite, atualizarDepois = true) {
        const raizWorkspace = (0, workspace_1.obterRaizWorkspace)();
        if (!raizWorkspace) {
            this.git = { carregando: false, erro: 'Abra um workspace para carregar commits.', recentes: [], carregadoEm: null, branch: '', repositorios: [] };
            if (atualizarDepois)
                await this.atualizar();
            return;
        }
        this.git = { ...this.git, carregando: true, erro: null };
        if (atualizarDepois)
            await this.atualizar();
        try {
            // 1. Encontrar todos os repositórios Git no workspace
            const dirsParaEscanear = [
                raizWorkspace,
                path.join(raizWorkspace, 'MedSystem_front'),
                path.join(raizWorkspace, 'MedSystem_back'),
                path.join(raizWorkspace, 'project-ai-cli'),
                path.join(raizWorkspace, 'frontend'),
                path.join(raizWorkspace, 'backend'),
                path.join(raizWorkspace, 'front'),
                path.join(raizWorkspace, 'back'),
                path.join(raizWorkspace, 'web'),
                path.join(raizWorkspace, 'client'),
                path.join(raizWorkspace, 'app'),
                path.join(raizWorkspace, 'api'),
                path.join(raizWorkspace, 'server'),
            ];
            // Verificar subpastas imediatas se a raiz não for Git
            if (!fs.existsSync(path.join(raizWorkspace, '.git'))) {
                try {
                    const filhas = fs.readdirSync(raizWorkspace, { withFileTypes: true });
                    for (const filha of filhas) {
                        if (filha.isDirectory()) {
                            const caminhoCompleto = path.join(raizWorkspace, filha.name);
                            if (fs.existsSync(path.join(caminhoCompleto, '.git')) && !dirsParaEscanear.includes(caminhoCompleto)) {
                                dirsParaEscanear.push(caminhoCompleto);
                            }
                        }
                    }
                }
                catch {
                    // Ignorar se falhar ao ler subpastas
                }
            }
            const repositóriosValidos = [];
            for (const dir of dirsParaEscanear) {
                if (fs.existsSync(path.join(dir, '.git'))) {
                    let branch = 'main';
                    try {
                        const { stdout: branchStdout } = await execFileAsync('git', ['Ref-parse', '--abbrev-ref', 'HEAD'], { cwd: dir, timeout: 2000 });
                        branch = branchStdout.trim() || 'detached';
                    }
                    catch {
                        try {
                            const { stdout: branchStdout2 } = await execFileAsync('git', ['branch', '--show-current'], { cwd: dir, timeout: 2000 });
                            branch = branchStdout2.trim() || 'detached';
                        }
                        catch {
                            // Ignorar se não puder ler a branch
                        }
                    }
                    const caminhoRel = normalizarRelativo(path.relative(raizWorkspace, dir)) || '.';
                    const nomeRepo = caminhoRel === '.' ? 'Raiz Workspace' : path.basename(dir);
                    const idRepo = caminhoRel === '.' ? 'raiz' : path.basename(dir).toLowerCase();
                    // Evitar duplicados
                    if (!repositóriosValidos.some((r) => r.caminho === dir)) {
                        repositóriosValidos.push({
                            id: idRepo,
                            nome: nomeRepo,
                            caminho: dir,
                            branch,
                        });
                    }
                }
            }
            if (repositóriosValidos.length === 0) {
                this.git = {
                    carregando: false,
                    erro: 'Nenhum repositório Git (.git) foi detectado neste workspace.',
                    recentes: [],
                    carregadoEm: new Date().toISOString(),
                    branch: '',
                    repositorios: [],
                };
                if (atualizarDepois)
                    await this.atualizar();
                return;
            }
            const todosCommits = [];
            // Carregar os commits de cada repositório detectado
            for (const repo of repositóriosValidos) {
                try {
                    const { stdout } = await execFileAsync('git', [
                        '-C',
                        repo.caminho,
                        'log',
                        `-${limite}`,
                        '--date=iso-strict',
                        '--pretty=format:%H%x1f%h%x1f%an%x1f%ad%x1f%s',
                    ], { cwd: repo.caminho, maxBuffer: 1024 * 1024, timeout: 5000 });
                    const commitsIniciais = this.parsearCommits(String(stdout));
                    for (const commit of commitsIniciais) {
                        let arquivos = [];
                        try {
                            const { stdout: showStdout } = await execFileAsync('git', [
                                '-C',
                                repo.caminho,
                                'show',
                                '--pretty=format:',
                                '--name-only',
                                commit.hash,
                            ], { cwd: repo.caminho, timeout: 3000 });
                            arquivos = showStdout
                                .split(/\r?\n/)
                                .map((item) => item.trim())
                                .filter(Boolean)
                                .filter((item) => !this.isCaminhoSensivel(item));
                        }
                        catch {
                            // Fallback se falhar
                        }
                        todosCommits.push({
                            ...commit,
                            repositorioId: repo.id,
                            repositorioNome: repo.nome,
                            repositorioCaminho: normalizarRelativo(path.relative(raizWorkspace, repo.caminho)) || '.',
                            arquivosAlterados: arquivos,
                            arquivosAlteradosCount: arquivos.length,
                        });
                    }
                }
                catch (err) {
                    this.saida.appendLine(`Erro ao obter commits do repo ${repo.nome}: ${err}`);
                }
            }
            // Ordenar por data (decrescente)
            todosCommits.sort((a, b) => new Date(b.dataIso).getTime() - new Date(a.dataIso).getTime());
            // Atribuir os repositórios simplificados para o estado do webview
            const repositoriosEstado = repositóriosValidos.map((r) => ({
                id: r.id,
                nome: r.nome,
                caminhoRelativo: normalizarRelativo(path.relative(raizWorkspace, r.caminho)) || '.',
                branch: r.branch,
            }));
            // Selecionamos a branch principal para o status como sendo a do primeiro repo ativo
            const branchGeral = repositóriosValidos[0]?.branch || 'main';
            this.git = {
                carregando: false,
                erro: null,
                recentes: todosCommits,
                carregadoEm: new Date().toISOString(),
                branch: branchGeral,
                repositorios: repositoriosEstado,
            };
        }
        catch (error) {
            const mensagem = error instanceof Error ? error.message : String(error);
            this.git = {
                carregando: false,
                erro: `Não foi possível carregar commits Git: ${mensagem}`,
                recentes: [],
                carregadoEm: null,
                branch: '',
                repositorios: [],
            };
        }
        if (atualizarDepois)
            await this.atualizar();
    }
    isCaminhoSensivel(caminho) {
        const normalizado = caminho.toLowerCase().replace(/\\/g, '/');
        const nomeBase = path.basename(normalizado);
        const segmentos = normalizado.split('/');
        if (segmentos.some((seg) => ['.git', 'node_modules', 'dist', 'build', 'coverage', 'secrets'].includes(seg))) {
            return true;
        }
        if (nomeBase === '.env' || nomeBase.startsWith('.env.')) {
            return true;
        }
        if (['id_rsa', 'id_dsa'].includes(nomeBase)) {
            return true;
        }
        if (/\.(pem|key|p12|crt)$/i.test(nomeBase)) {
            return true;
        }
        return /^(secrets|credentials)(\..*)?$/i.test(nomeBase);
    }
    async gerarResumoIA(rascunhoCaminho) {
        const raizWorkspace = (0, workspace_1.obterRaizWorkspace)();
        if (!raizWorkspace)
            return;
        try {
            this.saida.appendLine(`Gerando resumo IA em ${rascunhoCaminho}`);
            const caminhoFisico = path.join(raizWorkspace, rascunhoCaminho);
            const pacoteYamlPath = path.join(caminhoFisico, 'pacote.yaml');
            if (!fs.existsSync(pacoteYamlPath)) {
                throw new Error('Arquivo pacote.yaml não encontrado no pacote de validação.');
            }
            // 1. Obter API Key (VS Code Secrets tem prioridade sobre env vars)
            const apiKey = await this.obterChaveGemini();
            if (!apiKey) {
                throw new Error('Configure a Gemini API Key na aba Configuração do QAssistant, ou defina PROJECT_AI_GEMINI_API_KEY no ambiente.');
            }
            // 2. Extrair commits do pacote.yaml ou commits.yaml
            const commitsYamlPath = path.join(caminhoFisico, 'commits.yaml');
            let listaCommitsDesc = 'Nenhum commit informado.';
            if (fs.existsSync(commitsYamlPath)) {
                const conteudoCommits = fs.readFileSync(commitsYamlPath, 'utf8');
                listaCommitsDesc = conteudoCommits;
            }
            const promptResumo = `Você é um Analista de QA Sênior. Gere um Resumo de Validação de QA técnico e refinado em Português (Brasil) com base nestas alterações recentes de código (commits).

      const promptResumo = `, Você, é, um, Analista, de, QA, Sênior, Gere, um, Resumo, de, Validação, de, QA, técnico, e, refinado, em, Português;
            (Brasil);
            com;
            base;
            nestas;
            alterações;
            recentes;
            de;
            código(commits).
            ;
            Comportamento;
            do
                sistema;
            while (e);
            áreas;
            a;
            testar;
            devem;
            focar;
            estritamente;
            na;
            plataforma;
            MedSystem(sistema, de, Prontuário, Eletrônico, Prescrições, Módulos, Clínicos, Alertas, de, Medicamentos, etc.conforme, aplicável).
            ;
            Use;
            rigorosamente;
            o;
            seguinte;
            formato;
            Markdown, não;
            adicione;
            cabeçalhos;
            de;
            primeiro;
            nível;
            além;
            do
                título;
            while (principal.Evite);
            expor;
            quaisquer;
            segredos;
            ou;
            credenciais.
            ;
            #;
            Resumo;
            de;
            validação;
            de;
            QA;
            #;
            #;
            Resumo;
            simples;
            Explique;
            detalhadamente;
            o;
            que;
            mudou;
            no;
            comportamento;
            clínico;
            ou;
            técnico;
            do
                sistema.
                ;
            while (#);
            #;
            Onde;
            testar;
            no;
            sistema;
            Módulos;
            do
                MedSystem(ex, MedSystem_front, MedSystem_back, telas, integrações);
            while (afetados);
            pelas;
            alterações.
            ;
            #;
            #;
            Checklist;
            de;
            teste;
            Itens;
            objetivos;
            de;
            checklist;
            de;
            verificação;
            de;
            comportamento.
            ;
            #;
            #;
            Testes;
            de;
            regressão;
            sugeridos;
            Sugerir;
            regressões;
            em;
            funcionalidades;
            existentes;
            que;
            façam;
            dependam;
            das;
            áreas;
            alteradas.
            ;
            #;
            #;
            Pontos;
            de;
            atenção;
            Casos;
            de;
            borda;
            clínicos, validações;
            estritas, controle;
            de;
            permissões;
            e;
            resiliência;
            de;
            rede.
            ;
            #;
            #;
            Observações;
            técnicas;
            para;
            apoio;
            Uma;
            linguagem;
            acessível;
            para;
            desenvolvedores;
            e;
            testadores;
            com;
            arquivos;
            alterados;
            listados;
            de;
            forma;
            informativa.
            ;
            DADOS;
            DOS;
            COMMITS;
            REGISTRADOS: $;
            {
                listaCommitsDesc;
            }
            `;

      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptResumo }] }]
        })
      });

      if (!res.ok) {
        const errorData = await res.json() as any;
        throw new Error(errorData?.error?.message || `;
            Google;
            API;
            returned;
            status;
            $;
            {
                res.status;
            }
            `);
      }

      const data = await res.json() as any;
      const resumoIaText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      if (resumoIaText) {
        fs.writeFileSync(path.join(caminhoFisico, 'resumo-qa.md'), resumoIaText, 'utf8');
        this.saida.appendLine('Resumo IA gerado com sucesso!');
        this.enviar({ tipo: 'notificacao.info', mensagem: 'Resumo QA foi gerado com Inteligência Artificial!' });
        await this.atualizar();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.saida.appendLine(`;
            Falha;
            ao;
            gerar;
            resumo;
            por;
            IA: $;
            {
                msg;
            }
            `);
      this.enviar({ tipo: 'notificacao.erro', mensagem: `;
            Erro;
            ao;
            computar;
            Resumo;
            IA: $;
            {
                msg;
            }
            ` });
    }
  }

  private async sugerirBateriaTestes(rascunhoCaminho: string): Promise<void> {
    const raizWorkspace = obterRaizWorkspace();
    if (!raizWorkspace) return;

    try {
      this.saida.appendLine(`;
            Criando;
            sugestões;
            de;
            bateria;
            de;
            testes;
            para;
            $;
            {
                rascunhoCaminho;
            }
            `);
      const caminhoFisico = path.join(raizWorkspace, rascunhoCaminho);
      const resumoPath = path.join(caminhoFisico, 'resumo-qa.md');
      if (!fs.existsSync(resumoPath)) {
        throw new Error('Primeiro gere o resumo-qa.md ou preencha o rascunho de validação.');
      }

      const apiKey = await this.obterChaveGemini();
      if (!apiKey) {
        throw new Error('Configure a Gemini API Key na aba Configuração do QAssistant, ou defina PROJECT_AI_GEMINI_API_KEY no ambiente.');
      }

      const resumoConteudo = fs.readFileSync(resumoPath, 'utf8');
      const promptSugestao = `;
            Você;
            é;
            um;
            Engenheiro;
            de;
            QA;
            especializado;
            em;
            Automação;
            com;
            Playwright.
            ;
            Com;
            base;
            no;
            seguinte;
            Resumo;
            de;
            Validação;
            do
                MedSystem, elabore;
            while (sugestões);
            de;
            cenários;
            de;
            teste;
            automatizados;
            e;
            testes;
            manuais;
            avançados.
            ;
            Escreva;
            o;
            retorno;
            no;
            formato;
            Markdown;
            diretamente.Inclua;
            cenários;
            E2E;
            com;
            sugestões;
            de;
            seletores;
            CSS;
            adequados;
            e;
            fluxos;
            lógicos;
            completos;
            de;
            teste.
            ;
            Resumo;
            Clínico / Técnico;
            de;
            Referência: $;
            {
                resumoConteudo;
            }
            `;

      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptSugestao }] }]
        })
      });

      if (!res.ok) {
        const errorData = await res.json() as any;
        throw new Error(errorData?.error?.message || `;
            Google;
            API;
            returned;
            status;
            $;
            {
                res.status;
            }
            `);
      }

      const data = await res.json() as any;
      const sugestaoText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      if (sugestaoText) {
        const bateriaCaminho = path.join(caminhoFisico, 'bateria-testes-sugerida.md');
        fs.writeFileSync(bateriaCaminho, sugestaoText, 'utf8');
        this.saida.appendLine('Sugestões de bateria de testes geradas!');
        this.enviar({ tipo: 'notificacao.info', mensagem: 'Bateria de testes sugerida com IA (Playwright/Manual) criada com sucesso!' });
        await this.atualizar();
        await this.abrirCaminhoWorkspace(`;
            $;
            {
                rascunhoCaminho;
            }
            /bateria-testes-sugerida.md`;
            ;
        }
        finally {
        }
    }
    catch(err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.saida.appendLine(`Falha ao sugerir bateria de testes: ${msg}`);
        this.enviar({ tipo: 'notificacao.erro', mensagem: `Erro ao sugerir bateria: ${msg}` });
    }
}
exports.ProvedorPainel = ProvedorPainel;
async;
publicarTaskOpenProject(rascunhoCaminho, string, taskId ?  : string);
Promise < void  > {
    const: raizWorkspace = (0, workspace_1.obterRaizWorkspace)(),
    if(, raizWorkspace) { }, return: ,
    try: {
        this: .saida.appendLine(`Publicando no OpenProject a partir de ${rascunhoCaminho}`),
        const: caminhoFisico = path.join(raizWorkspace, rascunhoCaminho),
        const: resumoPath = path.join(caminhoFisico, 'resumo-qa.md'),
        const: pacoteYamlPath = path.join(caminhoFisico, 'pacote.yaml'),
        if(, fs) { }, : .existsSync(resumoPath) || !fs.existsSync(pacoteYamlPath)
    }
};
{
    throw new Error('Arquivos mínimos do pacote de validação ausentes.');
}
const apiKey = await this.obterChaveOpenProject();
const baseUrl = process.env.PROJECT_AI_OPENPROJECT_BASE_URL || 'https://openproject.ormel.com.br';
if (!apiKey) {
    throw new Error('Configure a OpenProject API Key na aba Configuração do QAssistant, ou defina PROJECT_AI_OPENPROJECT_API_KEY no ambiente.');
}
const resumoConteudo = fs.readFileSync(resumoPath, 'utf8');
const tituloPacote = path.basename(caminhoFisico);
// Decidir se cria nova ou atualiza existente
const idExistente = taskId || '';
const rawAuth = Buffer.from(`apikey:${apiKey}`).toString('base64');
if (idExistente) {
    this.saida.appendLine(`Atualizando task existente de ID ${idExistente}`);
    // Primeiro obter lockVersion da task
    const getRes = await fetch(`${baseUrl}/api/v3/work_packages/${idExistente}`, {
        headers: { 'Authorization': `Basic ${rawAuth}`, 'Accept': 'application/hal+json' }
    });
    if (!getRes.ok) {
        throw new Error(`Task #${idExistente} não encontrada no OpenProject.`);
    }
    const taskData = await getRes.json();
    const lockVersion = taskData.lockVersion || 0;
    const updateRes = await fetch(`${baseUrl}/api/v3/work_packages/${idExistente}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Basic ${rawAuth}`,
            'Content-Type': 'application/json',
            'Accept': 'application/hal+json'
        },
        body: JSON.stringify({
            lockVersion,
            description: { format: 'markdown', raw: resumoConteudo }
        })
    });
    if (!updateRes.ok) {
        const detail = await updateRes.json().catch(() => ({}));
        throw new Error(`HTTP ${updateRes.status}: ${detail?.message || 'Falha ao atualizar'}`);
    }
    // Atualizar YAML local
    let yamlContent = fs.readFileSync(pacoteYamlPath, 'utf8');
    yamlContent = yamlContent.replace(/taskId: .*/, `taskId: "${idExistente}"`);
    yamlContent = yamlContent.replace(/url: .*/, `url: "${baseUrl}/projects/medsystem/work_packages/${idExistente}"`);
    fs.writeFileSync(pacoteYamlPath, yamlContent, 'utf8');
    this.enviar({ tipo: 'notificacao.info', mensagem: `Task #${idExistente} atualizada com sucesso no OpenProject!` });
}
else {
    this.saida.appendLine(`Criando nova task no OpenProject`);
    const createRes = await fetch(`${baseUrl}/api/v3/projects/medsystem/work_packages`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${rawAuth}`,
            'Content-Type': 'application/json',
            'Accept': 'application/hal+json'
        },
        body: JSON.stringify({
            subject: `Validação de QA: ${tituloPacote}`,
            description: { format: 'markdown', raw: resumoConteudo },
            _links: {
                type: { href: '/api/v3/types/1' } // Atribui tipo padrão (geralmente Tarefa/Bug)
            }
        })
    });
    if (!createRes.ok) {
        const detail = await createRes.json().catch(() => ({}));
        throw new Error(`HTTP ${createRes.status}: ${detail?.message || 'Falha ao criar task'}`);
    }
    const novaTask = await createRes.json();
    const novaId = novaTask.id;
    // Atualizar YAML local
    let yamlContent = fs.readFileSync(pacoteYamlPath, 'utf8');
    yamlContent = yamlContent.replace(/taskId: .*/, `taskId: "${novaId}"`);
    yamlContent = yamlContent.replace(/url: .*/, `url: "${baseUrl}/projects/medsystem/work_packages/${novaId}"`);
    fs.writeFileSync(pacoteYamlPath, yamlContent, 'utf8');
    // Atualizar o estado local também
    this.ultimoPacoteValidacao = {
        id: this.ultimoPacoteValidacao?.id || tituloPacote,
        caminhoRelativo: rascunhoCaminho
    };
    this.enviar({ tipo: 'notificacao.info', mensagem: `Nova task #${novaId} criada e vinculada com sucesso no OpenProject!` });
}
await this.atualizar();
try { }
catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    this.saida.appendLine(`Falha ao interagir com OpenProject: ${msg}`);
    this.enviar({ tipo: 'notificacao.erro', mensagem: `Erro no OpenProject: ${msg}` });
}
async;
obterStatusOpenProject(taskId, string);
Promise < void  > {
    try: {
        const: apiKey = await this.obterChaveOpenProject(),
        const: baseUrl = process.env.PROJECT_AI_OPENPROJECT_BASE_URL || 'https://openproject.ormel.com.br',
        if(, apiKey) { }, return: ,
        const: rawAuth = Buffer.from(`apikey:${apiKey}`).toString('base64'),
        const: res = await fetch(`${baseUrl}/api/v3/work_packages/${taskId}`, {
            headers: { 'Authorization': `Basic ${rawAuth}`, 'Accept': 'application/hal+json' }
        }),
        if(res) { }, : .ok
    }
};
{
    const data = await res.json();
    const statusNome = data?._links?.status?.title || 'Desconhecido';
    this.enviar({ tipo: 'notificacao.info', mensagem: `Status da Task #${taskId} no OpenProject: ${statusNome}` });
}
try { }
catch (err) {
    // Falha silenciosa ou log rápido
}
async;
obterChaveGemini();
Promise < string | undefined > {
    const: secretKey = await this.contexto.secrets.get('qassistant.geminiApiKey'),
    if(secretKey) { }, return: secretKey,
    return: process.env.PROJECT_AI_GEMINI_API_KEY || process.env.GEMINI_API_KEY
};
async;
salvarChaveGemini(chave, string);
Promise < void  > {
    await, this: .contexto.secrets.store('qassistant.geminiApiKey', chave),
    this: .geminiKeyPresente = true,
    this: .enviar({ tipo: 'notificacao.info', mensagem: 'Gemini API Key salva com segurança nos Secrets do VS Code.' }),
    await, this: .atualizar()
};
async;
obterChaveOpenProject();
Promise < string | undefined > {
    const: secretKey = await this.contexto.secrets.get('qassistant.openProjectApiKey'),
    if(secretKey) { }, return: secretKey,
    return: process.env.PROJECT_AI_OPENPROJECT_API_KEY
};
async;
salvarChaveOpenProject(chave, string);
Promise < void  > {
    await, this: .contexto.secrets.store('qassistant.openProjectApiKey', chave),
    this: .openProjectKeyPresente = true,
    this: .enviar({ tipo: 'notificacao.info', mensagem: 'OpenProject API Key salva com segurança nos Secrets do VS Code.' }),
    await, this: .atualizar()
};
async;
listarTasksOpenProject();
Promise < void  > {
    try: {
        const: apiKey = await this.obterChaveOpenProject(),
        const: baseUrl = process.env.PROJECT_AI_OPENPROJECT_BASE_URL || 'https://openproject.ormel.com.br',
        if(, apiKey) {
            this.enviar({ tipo: 'notificacao.erro', mensagem: 'Configure a OpenProject API Key na aba Configuração do QAssistant, ou defina PROJECT_AI_OPENPROJECT_API_KEY no ambiente.' });
            return;
        },
        const: raizWorkspace = (0, workspace_1.obterRaizWorkspace)(),
        const: configuracao = raizWorkspace ? (0, nucleo_1.carregarConfiguracaoWorkspace)(raizWorkspace) : null,
        const: projetoId = configuracao?.openProject.projetoId || 'medsystem',
        const: rawAuth = Buffer.from(`apikey:${apiKey}`).toString('base64'),
        const: url = `${baseUrl}/api/v3/projects/${projetoId}/work_packages?pageSize=30&sortBy=%5B%5B%22updatedAt%22%2C%22desc%22%5D%5D`,
        const: res = await fetch(url, {
            headers: { 'Authorization': `Basic ${rawAuth}`, 'Accept': 'application/hal+json' },
        }),
        if(, res) { }, : .ok
    }
};
{
    throw new Error(`OpenProject retornou status ${res.status}: ${res.statusText}`);
}
const data = await res.json();
this.openprojectTasks = (data?._embedded?.elements || []).map((wp) => ({
    id: String(wp.id),
    assunto: wp.subject || '(sem título)',
    status: wp._links?.status?.title || 'Desconhecido',
    tipo: wp._links?.type?.title,
    responsavel: wp._links?.assignee?.title,
}));
await this.atualizar();
try { }
catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    this.enviar({ tipo: 'notificacao.erro', mensagem: `Erro ao listar tasks: ${msg}` });
}
parsearCommits(saida, string);
{
    hash: string;
    hashCurto: string;
    autor: string;
    dataIso: string;
    assunto: string;
}
[];
{
    return saida
        .split(/\r?\n/)
        .filter(Boolean)
        .map((linha) => {
        const [hash, hashCurto, autor, dataIso, ...partesAssunto] = linha.split('\x1f');
        return {
            hash: hash || '',
            hashCurto: hashCurto || '',
            autor: autor || '',
            dataIso: dataIso || '',
            assunto: partesAssunto.join(' ').trim() || '(sem mensagem)',
        };
    })
        .filter((commit) => commit.hash && commit.hashCurto);
}
selecionarCommits(hashes, string[]);
nucleo_1.CommitPacoteValidacao[];
{
    const hashesSelecionados = new Set(hashes);
    return this.git.recentes
        .filter((commit) => hashesSelecionados.has(commit.hash))
        .map((commit) => ({
        hash: commit.hash,
        hashCurto: commit.hashCurto,
        autor: commit.autor,
        dataIso: commit.dataIso,
        assunto: commit.assunto,
        repositorioId: commit.repositorioId,
        repositorioNome: commit.repositorioNome,
    }));
}
criarNavegadorInterno(raizWorkspace, string, caminhoRelativo, string);
mensagens_1.NavegadorQAssistant;
{
    const caminhoAbsoluto = path.resolve(raizWorkspace, caminhoRelativo || '.');
    const entradas = fs.readdirSync(caminhoAbsoluto, { withFileTypes: true })
        .filter((entrada) => entrada.name !== '.git')
        .slice(0, 200)
        .map((entrada) => {
        const absoluto = path.join(caminhoAbsoluto, entrada.name);
        const stat = fs.statSync(absoluto);
        const relativo = normalizarRelativo(path.relative(raizWorkspace, absoluto));
        return {
            nome: entrada.name,
            caminhoRelativo: relativo,
            tipo: entrada.isDirectory() ? 'pasta' : 'arquivo',
            tamanhoBytes: entrada.isDirectory() ? null : stat.size,
            atualizadoEm: stat.mtime.toISOString(),
        };
    })
        .sort((primeira, segunda) => {
        if (primeira.tipo !== segunda.tipo)
            return primeira.tipo === 'pasta' ? -1 : 1;
        return primeira.nome.localeCompare(segunda.nome, 'pt-BR');
    });
    return {
        caminhoRelativo: normalizarRelativo(caminhoRelativo || '.'),
        entradas,
        arquivoAberto: this.navegador?.arquivoAberto || null,
    };
}
criarUriLogo();
string;
{
    if (!this.webview)
        return '';
    return this.webview.asWebviewUri(vscode.Uri.joinPath(this.contexto.extensionUri, 'media', 'qassistant-logo.png')).toString();
}
montarConfiguracao(raizWorkspace, string, setup, mensagens_1.SetupWorkspace);
nucleo_1.ConfiguracaoQAssistant;
{
    const padrao = (0, nucleo_1.criarConfiguracaoPadrao)(raizWorkspace);
    return {
        ...padrao,
        projeto: {
            nome: setup.nomeProjeto,
        },
        setup: {
            criarContextoProjeto: setup.criarContextoProjeto,
            criarAssetsAgent: setup.criarAssetsAgent,
        },
        caminhos: {
            ...padrao.caminhos,
            raizCodigo: setup.raizCodigo || '.',
            frontend: setup.frontend || undefined,
            backend: setup.backend || undefined,
        },
        openProject: {
            habilitado: setup.openProjectHabilitado,
            urlBase: setup.openProjectUrlBase || undefined,
            projetoId: setup.openProjectProjetoId || undefined,
            intervaloPollingSegundos: setup.intervaloPollingSegundos,
        },
        resumos: {
            commitsPadrao: setup.commitsPadrao,
        },
    };
}
criarSetupPadrao(raizWorkspace, string);
mensagens_1.SetupWorkspace;
{
    const padrao = (0, nucleo_1.criarConfiguracaoPadrao)(raizWorkspace);
    return {
        nomeProjeto: padrao.projeto.nome,
        raizCodigo: padrao.caminhos.raizCodigo,
        frontend: '',
        backend: '',
        criarContextoProjeto: padrao.setup.criarContextoProjeto,
        criarAssetsAgent: padrao.setup.criarAssetsAgent,
        openProjectHabilitado: padrao.openProject.habilitado,
        openProjectUrlBase: '',
        openProjectProjetoId: '',
        intervaloPollingSegundos: padrao.openProject.intervaloPollingSegundos,
        commitsPadrao: padrao.resumos.commitsPadrao,
    };
}
enviar(mensagem, mensagens_1.MensagemHostParaWebview);
void {
    void: this.webview?.postMessage(mensagem)
};
criarHtml(webview, vscode.Webview);
string;
{
    const diretorioWebview = vscode.Uri.joinPath(this.contexto.extensionUri, 'dist', 'webview');
    const arquivoHtml = vscode.Uri.joinPath(diretorioWebview, 'index.html');
    const nonce = criarNonce();
    let html = fs.readFileSync(arquivoHtml.fsPath, 'utf8');
    const uriAssets = webview.asWebviewUri(vscode.Uri.joinPath(diretorioWebview, 'assets')).toString();
    html = html.replace(/(src|href)="\/?assets\//g, `$1="${uriAssets}/`);
    html = html.replace(/<script /g, `<script nonce="${nonce}" `);
    html = html.replace('</head>', `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https: data:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';"></head>`);
    return html;
}
function criarNonce() {
    const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let valor = '';
    for (let indice = 0; indice < 32; indice += 1) {
        valor += alfabeto.charAt(Math.floor(Math.random() * alfabeto.length));
    }
    return valor;
}
function normalizarRelativo(caminhoRelativo) {
    return caminhoRelativo.split(path.sep).join('/');
}
//# sourceMappingURL=provedor-painel.js.map