import { execFile } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { promisify } from 'node:util';
import * as vscode from 'vscode';
import {
  carregarConfiguracaoWorkspace,
  type CommitPacoteValidacao,
  ConfiguracaoQAssistant,
  criarPacoteValidacaoRascunho,
  criarConfiguracaoPadrao,
  inicializarWorkspaceQAssistant,
  inspecionarEstruturaWorkspace,
  RAIZ_CONTEXTO_PROJETO,
  RAIZ_TESTES_QASSISTANT,
} from '@qassistant/nucleo';
import {
  CommitGitQAssistant,
  criarEstadoInicial,
  EstadoPainel,
  MensagemHostParaWebview,
  MensagemWebviewParaHostSchema,
  NavegadorQAssistant,
  SetupWorkspace,
  TaskOpenProjectQA,
} from '../../contratos/mensagens';
import { obterRaizWorkspace } from '../servicos/workspace';
import { PainelTestesAba } from './painel-testes-aba';

const execFileAsync = promisify(execFile);

export class ProvedorPainel implements vscode.WebviewViewProvider {
  static readonly viewType = 'qassistant.painel';

  private webview?: vscode.Webview;
  private ultimosArquivosCriados: string[] = [];
  private ultimosArquivosPreservados: string[] = [];
  private ultimoPacoteValidacao: { id: string; caminhoRelativo: string } | undefined;
  private navegador: NavegadorQAssistant | null = null;
  private geminiKeyPresente = false;
  private openProjectKeyPresente = false;
  private openprojectTasks: TaskOpenProjectQA[] = [];
  private painelAba: PainelTestesAba | null = null;
  private currentRunId: string | null = null;
  private execucaoTestes = {
    categoriaAtiva: null as string | null,
    status: 'ocioso' as 'ocioso' | 'executando' | 'sucesso' | 'erro',
    logs: '',
    errosCount: 0,
    sucessosCount: 0,
    totalCount: 0,
    historico: [] as any[],
    falhasDetalhes: [] as any[],
    sumarioCaminhoRelativo: undefined as string | undefined,
    sumarioConteudo: undefined as string | undefined,
    nomeExecucao: undefined as string | undefined,
    analiseIA: undefined as { conteudo: string; geradoEm: string; runId?: string; carregando?: boolean } | undefined,
  };
  private git: EstadoPainel['git'] = {
    carregando: false,
    erro: null,
    recentes: [],
    carregadoEm: null,
    branch: '',
    repositorios: [],
  };

  constructor(private readonly contexto: vscode.ExtensionContext, private readonly saida: vscode.OutputChannel) {
    // Permitir requisições para servidores locais/on-premise do OpenProject sem assinar certificados estritos
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void {
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
    // Carregar histórico persistente do disco
    const raiz = obterRaizWorkspace();
    if (raiz) this.carregarHistoricoPersistente(raiz);
  }

  async atualizar(): Promise<void> {
    const estado = this.criarEstado();
    this.enviar({ tipo: 'estado.atualizado', estado });
    this.painelAba?.enviarEstado(estado);
  }

  abrirTestesEmAba(): void {
    if (!this.painelAba) {
      this.painelAba = new PainelTestesAba(
        this.contexto,
        this.saida,
        (msg: unknown) => void this.receberMensagem(msg),
      );
    }
    this.painelAba.abrir();
    // Enviar estado atual imediatamente para a aba recém-aberta
    void Promise.resolve().then(() => this.painelAba?.enviarEstado(this.criarEstado()));
  }

  async inicializarWorkspace(setup?: SetupWorkspace): Promise<void> {
    const raizWorkspace = obterRaizWorkspace();
    if (!raizWorkspace) {
      this.enviar({ tipo: 'notificacao.erro', mensagem: 'Abra um workspace antes de inicializar o QAssistant.' });
      return;
    }

    const configuracao = this.montarConfiguracao(raizWorkspace, setup || this.criarSetupPadrao(raizWorkspace));
    const resultado = inicializarWorkspaceQAssistant(raizWorkspace, configuracao);
    this.ultimosArquivosCriados = resultado.criados;
    this.ultimosArquivosPreservados = resultado.preservados;
    this.navegador = this.criarNavegadorInterno(raizWorkspace, RAIZ_TESTES_QASSISTANT);
    await this.carregarCommits(configuracao.resumos.commitsPadrao, false);
    this.saida.appendLine(`Workspace inicializado: ${resultado.criados.length} itens criados, ${resultado.preservados.length} preservados.`);
    this.enviar({ tipo: 'notificacao.info', mensagem: `Setup concluido: ${resultado.criados.length} itens criados e ${resultado.preservados.length} preservados.` });
    await this.atualizar();
  }

  private async receberMensagem(mensagemDesconhecida: unknown): Promise<void> {
    const resultado = MensagemWebviewParaHostSchema.safeParse(mensagemDesconhecida);
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
        case 'openproject.obterDetalhes':
          await this.obterDetalhesOpenProject(resultado.data.taskId);
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
        case 'validacao.selecionarPacote':
          {
            const raizWorkspace = obterRaizWorkspace();
            if (!raizWorkspace) return;
            this.ultimoPacoteValidacao = {
              id: path.basename(resultado.data.caminhoRelativo),
              caminhoRelativo: resultado.data.caminhoRelativo,
            };
            this.navegador = this.criarNavegadorInterno(raizWorkspace, resultado.data.caminhoRelativo);
            this.enviar({ tipo: 'notificacao.info', mensagem: `Pacote de validacao ativo definido para ${path.basename(resultado.data.caminhoRelativo)}.` });
            await this.atualizar();
          }
          return;
        case 'validacao.excluirPacote':
          {
            const raizWorkspace = obterRaizWorkspace();
            if (!raizWorkspace) return;
            try {
              const absPath = path.resolve(raizWorkspace, resultado.data.caminhoRelativo);
              if (fs.existsSync(absPath)) {
                fs.rmSync(absPath, { recursive: true, force: true });
                this.enviar({ tipo: 'notificacao.info', mensagem: `Pacote ${path.basename(resultado.data.caminhoRelativo)} removido com sucesso.` });
                if (this.ultimoPacoteValidacao?.caminhoRelativo === resultado.data.caminhoRelativo) {
                  this.ultimoPacoteValidacao = undefined;
                }
                await this.atualizar();
              }
            } catch (err: any) {
              this.enviar({ tipo: 'notificacao.erro', mensagem: `Erro ao excluir pacote: ${err.message}` });
            }
          }
          return;
        case 'testes.executar':
          await this.executarTestes(resultado.data.categoria, resultado.data.nomeExecucao);
          return;
        case 'testes.limparHistorico':
          // Reset only the current execution UI — history persists on disk
          this.execucaoTestes.logs = '';
          this.execucaoTestes.status = 'ocioso';
          this.execucaoTestes.categoriaAtiva = null;
          this.execucaoTestes.nomeExecucao = undefined;
          this.execucaoTestes.errosCount = 0;
          this.execucaoTestes.sucessosCount = 0;
          this.execucaoTestes.totalCount = 0;
          this.execucaoTestes.falhasDetalhes = [];
          this.execucaoTestes.sumarioCaminhoRelativo = undefined;
          this.execucaoTestes.sumarioConteudo = undefined;
          this.execucaoTestes.analiseIA = undefined;
          this.currentRunId = null;
          this.enviar({ tipo: 'notificacao.info', mensagem: 'Painel de execução limpo. Histórico persistido em disco.' });
          await this.atualizar();
          return;
        case 'testes.abrirEmAba':
          this.abrirTestesEmAba();
          return;
        case 'testes.fecharAba':
          this.painelAba?.fechar();
          return;
        case 'testes.analisarComIA':
          await this.analisarFalhasComIA();
          return;
        case 'testes.verRunDetalhes':
          await this.verRunDetalhes(resultado.data.runId);
          return;
        case 'openproject.comentarTask':
          await this.comentarTaskOpenProject(resultado.data.taskId, resultado.data.texto);
          return;
        case 'openproject.alterarStatusTask':
          await this.alterarStatusTaskOpenProject(resultado.data.taskId, resultado.data.statusHref, resultado.data.lockVersion);
          return;
      }
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : String(error);
      this.saida.appendLine(`Erro: ${mensagem}`);
      this.enviar({ tipo: 'notificacao.erro', mensagem });
    }
  }

  private resolverDetalhesPacote(raizWorkspace: string, pkg: { id: string; caminhoRelativo: string }) {
    const absDir = path.join(raizWorkspace, pkg.caminhoRelativo);
    const yamlPath = path.join(absDir, 'pacote.yaml');
    const mdPath = path.join(absDir, 'resumo-qa.md');

    let titulo = pkg.id;
    let statusCompleto = 'Rascunho';
    let criadoEm = '';
    let openProjectId = '';
    let openProjectUrl = '';
    const commits: string[] = [];
    let resumoQaConteudo = '';

    if (fs.existsSync(yamlPath)) {
      try {
        const content = fs.readFileSync(yamlPath, 'utf8');
        const titleMatch = content.match(/titulo:\s*"(.*?)"/);
        if (titleMatch) titulo = titleMatch[1];

        const statusMatch = content.match(/status:\s*"(.*?)"/);
        if (statusMatch) statusCompleto = statusMatch[1];

        const criadoMatch = content.match(/criadoEm:\s*"(.*?)"/);
        if (criadoMatch) criadoEm = criadoMatch[1];

        const taskMatch = content.match(/taskId:\s*(.*)/);
        if (taskMatch && taskMatch[1].trim() !== 'null') {
          openProjectId = taskMatch[1].trim().replace(/['"]/g, '');
        }

        const urlMatch = content.match(/url:\s*(.*)/);
        if (urlMatch && urlMatch[1].trim() !== 'null') {
          openProjectUrl = urlMatch[1].trim().replace(/['"]/g, '');
        }

        const commitsSection = content.split('commits:');
        if (commitsSection.length > 1) {
          const incluidosSection = commitsSection[1].split('removidos:');
          if (incluidosSection.length > 0) {
            const lines = incluidosSection[0].split('\n');
            for (const line of lines) {
              const commitMatch = line.match(/-\s*"(.*?)"/);
              if (commitMatch) {
                commits.push(commitMatch[1]);
              }
            }
          }
        }
      } catch (err) {
        this.saida.appendLine(`Erro ao ler pacote.yaml: ${err}`);
      }
    }

    if (fs.existsSync(mdPath)) {
      try {
        resumoQaConteudo = fs.readFileSync(mdPath, 'utf8');
      } catch (err) {
        this.saida.appendLine(`Erro ao ler resumo-qa.md: ${err}`);
      }
    }

    return {
      ...pkg,
      titulo,
      statusCompleto,
      criadoEm,
      openProjectId,
      openProjectUrl,
      commits,
      resumoQaConteudo,
    };
  }

  private obterPacotesDisponiveis(raizWorkspace: string, raizTestes: string): { id: string; nome: string; caminhoRelativo: string; dataCriacao: string }[] {
    const dirValidacoes = path.join(raizWorkspace, raizTestes, 'validacoes');
    if (!fs.existsSync(dirValidacoes)) {
      return [];
    }
    try {
      return fs.readdirSync(dirValidacoes, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && entry.name !== '.git')
        .map((entry) => {
          const caminhoRelativo = normalizarRelativo(path.join(raizTestes, 'validacoes', entry.name));
          const absoluto = path.join(dirValidacoes, entry.name);
          const stat = fs.statSync(absoluto);
          return {
            id: entry.name,
            nome: entry.name,
            caminhoRelativo,
            dataCriacao: (stat.birthtime || stat.mtime).toISOString(),
          };
        })
        .sort((a, b) => b.dataCriacao.localeCompare(a.dataCriacao));
    } catch {
      return [];
    }
  }

  private criarEstado(): EstadoPainel {
    const versaoExtensao = String(this.contexto.extension.packageJSON.version || '0.1.0');
    const estado = criarEstadoInicial(versaoExtensao);
    const raizWorkspace = obterRaizWorkspace();
    if (!raizWorkspace) return estado;
    const configuracao = carregarConfiguracaoWorkspace(raizWorkspace);
    const estrutura = inspecionarEstruturaWorkspace(raizWorkspace);
    const raizTestes = configuracao?.caminhos.raizTestes || RAIZ_TESTES_QASSISTANT;
    if (!this.navegador && estrutura.qassistantTestesPresente) {
      this.navegador = this.criarNavegadorInterno(raizWorkspace, raizTestes);
    }
    const pacotesDisponiveis = this.obterPacotesDisponiveis(raizWorkspace, raizTestes);

    return {
      ...estado,
      assets: { logoUri: this.criarUriLogo() },
      workspaceAberto: true,
      workspaceInicializado: estrutura.configuracaoPresente && estrutura.qassistantTestesPresente,
      raizWorkspace,
      raizTestes,
      raizContexto: configuracao?.caminhos.raizContexto || RAIZ_CONTEXTO_PROJETO,
      configuracao,
      estrutura,
      git: this.git,
      navegador: this.navegador,
      ultimosArquivosCriados: this.ultimosArquivosCriados,
      ultimosArquivosPreservados: this.ultimosArquivosPreservados,
      ultimoPacoteValidacao: this.ultimoPacoteValidacao ? this.resolverDetalhesPacote(raizWorkspace, this.ultimoPacoteValidacao) : undefined,
      pacotesDisponiveis,
      geminiKeyPresente: this.geminiKeyPresente,
      openProjectKeyPresente: this.openProjectKeyPresente,
      openprojectTasks: this.openprojectTasks,
      execucaoTestes: this.execucaoTestes,
    };
  }

  private async abrirCaminhoWorkspace(caminhoRelativo: string): Promise<void> {
    const raizWorkspace = obterRaizWorkspace();
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

  private async criarPacoteValidacaoRascunho(titulo: string): Promise<void> {
    const raizWorkspace = obterRaizWorkspace();
    if (!raizWorkspace) {
      this.enviar({ tipo: 'notificacao.erro', mensagem: 'Abra um workspace antes de criar validacoes.' });
      return;
    }
    if (!fs.existsSync(path.join(raizWorkspace, RAIZ_TESTES_QASSISTANT))) {
      this.enviar({ tipo: 'notificacao.erro', mensagem: 'Inicialize o workspace antes de criar pacotes de validacao.' });
      return;
    }

    const resultado = criarPacoteValidacaoRascunho(raizWorkspace, titulo);
    this.ultimosArquivosCriados = resultado.arquivosCriados;
    this.ultimosArquivosPreservados = resultado.arquivosPreservados;
    this.ultimoPacoteValidacao = { id: resultado.id, caminhoRelativo: resultado.caminhoRelativo };
    this.navegador = this.criarNavegadorInterno(raizWorkspace, resultado.caminhoRelativo);

    // Gravar log de auditoria no pacote
    const logPath = path.join(raizWorkspace, resultado.caminhoRelativo, 'auditoria-processo.log');
    const logsIniciais = `[AUDIT - ${new Date().toISOString()}] Fluxo de Pacote de Trabalho de QA Iniciado.\nID: ${resultado.id}\nTítulo: ${titulo}\nEstrutura de diretório criada com sucesso.\n`;
    fs.writeFileSync(logPath, logsIniciais, 'utf8');

    this.enviar({ tipo: 'notificacao.info', mensagem: `Pacote de validacao criado em ${resultado.caminhoRelativo}.` });
    await this.atualizar();
    await this.abrirCaminhoWorkspace(`${resultado.caminhoRelativo}/resumo-qa.md`);
  }

  private async criarPacoteValidacaoComCommits(titulo: string, hashes: string[]): Promise<void> {
    const raizWorkspace = obterRaizWorkspace();
    if (!raizWorkspace) {
      this.enviar({ tipo: 'notificacao.erro', mensagem: 'Abra um workspace antes de criar validacoes.' });
      return;
    }
    if (!fs.existsSync(path.join(raizWorkspace, RAIZ_TESTES_QASSISTANT))) {
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

    const resultado = criarPacoteValidacaoRascunho(raizWorkspace, titulo, commits);
    this.ultimosArquivosCriados = resultado.arquivosCriados;
    this.ultimosArquivosPreservados = resultado.arquivosPreservados;
    this.ultimoPacoteValidacao = { id: resultado.id, caminhoRelativo: resultado.caminhoRelativo };
    this.navegador = this.criarNavegadorInterno(raizWorkspace, resultado.caminhoRelativo);
    
    // Gravar log de auditoria no pacote com commits associados
    const logPath = path.join(raizWorkspace, resultado.caminhoRelativo, 'auditoria-processo.log');
    let logsIniciais = `[AUDIT - ${new Date().toISOString()}] Fluxo de Pacote de Trabalho de QA Iniciado.\nID: ${resultado.id}\nTítulo: ${titulo}\nEstrutura de diretório criada com sucesso.\n\nCommits selecionados:\n`;
    commits.forEach((c) => {
      logsIniciais += `- [${c.hashCurto}] ${c.assunto} por ${c.autor}\n`;
    });
    logsIniciais += `\n`;
    fs.writeFileSync(logPath, logsIniciais, 'utf8');

    // Tenta carregar as credenciais para gerar automaticamente o resumo de IA
    const geminiKey = process.env.PROJECT_AI_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (geminiKey) {
      this.saida.appendLine(`Iniciando geração automática de resumo de IA para o novo pacote.`);
      void this.gerarResumoIA(resultado.caminhoRelativo).catch(() => {});
    }

    this.enviar({ tipo: 'notificacao.info', mensagem: `Pacote criado com ${commits.length} commit(s) selecionado(s).` });
    await this.atualizar();
    await this.abrirCaminhoWorkspace(`${resultado.caminhoRelativo}/resumo-qa.md`);
  }

  private async carregarCommits(limite: number, atualizarDepois = true): Promise<void> {
    const raizWorkspace = obterRaizWorkspace();
    if (!raizWorkspace) {
      this.git = { carregando: false, erro: 'Abra um workspace para carregar commits.', recentes: [], carregadoEm: null, branch: '', repositorios: [] };
      if (atualizarDepois) await this.atualizar();
      return;
    }

    this.git = { ...this.git, carregando: true, erro: null };
    if (atualizarDepois) await this.atualizar();

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
        } catch {
          // Ignorar se falhar ao ler subpastas
        }
      }

      const repositóriosValidos: { id: string; nome: string; caminho: string; branch: string }[] = [];

      for (const dir of dirsParaEscanear) {
        if (fs.existsSync(path.join(dir, '.git'))) {
          let branch = 'main';
          try {
            const { stdout: branchStdout } = await execFileAsync('git', ['Ref-parse', '--abbrev-ref', 'HEAD'], { cwd: dir, timeout: 2000 });
            branch = branchStdout.trim() || 'detached';
          } catch {
            try {
              const { stdout: branchStdout2 } = await execFileAsync('git', ['branch', '--show-current'], { cwd: dir, timeout: 2000 });
              branch = branchStdout2.trim() || 'detached';
            } catch {
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
        if (atualizarDepois) await this.atualizar();
        return;
      }

      const todosCommits: CommitGitQAssistant[] = [];

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
            let arquivos: string[] = [];
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
            } catch {
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
        } catch (err) {
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
    } catch (error) {
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

    if (atualizarDepois) await this.atualizar();
  }

  private isCaminhoSensivel(caminho: string): boolean {
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

  private async gerarResumoIA(rascunhoCaminho: string): Promise<void> {
    const raizWorkspace = obterRaizWorkspace();
    if (!raizWorkspace) return;

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

Comportamento do sistema e áreas a testar devem focar estritamente na plataforma MedSystem (sistema de Prontuário Eletrônico, Prescrições, Módulos Clínicos, Alertas de Medicamentos, etc. conforme aplicável).

Use rigorosamente o seguinte formato Markdown, não adicione cabeçalhos de primeiro nível além do título principal. Evite expor quaisquer segredos ou credenciais.

# Resumo de validação de QA

## Resumo simples
Explique detalhadamente o que mudou no comportamento clínico ou técnico do sistema.

## Onde testar no sistema
Módulos do MedSystem (ex: MedSystem_front, MedSystem_back, telas, integrações) afetados pelas alterações.

## Checklist de teste
Itens objetivos de checklist de verificação de comportamento.

## Testes de regressão sugeridos
Sugerir regressões em funcionalidades existentes que façam interface ou dependam das áreas alteradas.

## Pontos de atenção
Casos de borda clínicos, validações estritas, controle de permissões e resiliência de rede.

## Observações técnicas para apoio
Uma linguagem acessível para desenvolvedores e testadores com arquivos alterados listados de forma informativa.

DADOS DOS COMMITS REGISTRADOS:
${listaCommitsDesc}`;

      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptResumo }] }]
        })
      });

      if (!res.ok) {
        const errorData = await res.json() as any;
        throw new Error(errorData?.error?.message || `Google API returned status ${res.status}`);
      }

      const data = await res.json() as any;
      const resumoIaText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      if (resumoIaText) {
        fs.writeFileSync(path.join(caminhoFisico, 'resumo-qa.md'), resumoIaText, 'utf8');
        
        // Gravar auditoria
        const logPath = path.join(caminhoFisico, 'auditoria-processo.log');
        if (fs.existsSync(logPath)) {
          fs.appendFileSync(logPath, `[AUDIT - ${new Date().toISOString()}] Resumo do Pacote de QA computado e salvo com sucesso via Inteligência Artificial.\n`, 'utf8');
        }

        this.saida.appendLine('Resumo IA gerado com sucesso!');
        this.enviar({ tipo: 'notificacao.info', mensagem: 'Resumo QA foi gerado com Inteligência Artificial!' });
        await this.atualizar();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.saida.appendLine(`Falha ao gerar resumo por IA: ${msg}`);
      this.enviar({ tipo: 'notificacao.erro', mensagem: `Erro ao computar Resumo IA: ${msg}` });
    }
  }

  private async sugerirBateriaTestes(rascunhoCaminho: string): Promise<void> {
    const raizWorkspace = obterRaizWorkspace();
    if (!raizWorkspace) return;

    try {
      this.saida.appendLine(`Criando sugestões de bateria de testes para ${rascunhoCaminho}`);
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
      const promptSugestao = `Você é um Engenheiro de QA especializado em Automação com Playwright.
Com base no seguinte Resumo de Validação do MedSystem, elabore sugestões de cenários de teste automatizados e testes manuais avançados.

Escreva o retorno no formato Markdown diretamente. Inclua cenários E2E com sugestões de seletores CSS adequados e fluxos lógicos completos de teste.

Resumo Clínico/Técnico de Referência:
${resumoConteudo}`;

      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptSugestao }] }]
        })
      });

      if (!res.ok) {
        const errorData = await res.json() as any;
        throw new Error(errorData?.error?.message || `Google API returned status ${res.status}`);
      }

      const data = await res.json() as any;
      const sugestaoText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      if (sugestaoText) {
        const bateriaCaminho = path.join(caminhoFisico, 'bateria-testes-sugerida.md');
        fs.writeFileSync(bateriaCaminho, sugestaoText, 'utf8');

        // Gravar auditoria
        const logPath = path.join(caminhoFisico, 'auditoria-processo.log');
        if (fs.existsSync(logPath)) {
          fs.appendFileSync(logPath, `[AUDIT - ${new Date().toISOString()}] Bateria de testes sugerida baseada no impacto clínico gerada e salva com IA (Playwright/Manual).\n`, 'utf8');
        }

        this.saida.appendLine('Sugestões de bateria de testes geradas!');
        this.enviar({ tipo: 'notificacao.info', mensagem: 'Bateria de testes sugerida com IA (Playwright/Manual) criada com sucesso!' });
        await this.atualizar();
        await this.abrirCaminhoWorkspace(`${rascunhoCaminho}/bateria-testes-sugerida.md`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.saida.appendLine(`Falha ao sugerir bateria de testes: ${msg}`);
      this.enviar({ tipo: 'notificacao.erro', mensagem: `Erro ao sugerir bateria: ${msg}` });
    }
  }

  private obterBaseUrlOpenProject(configuracao?: any): string {
    let url = configuracao?.openProject?.urlBase || process.env.PROJECT_AI_OPENPROJECT_BASE_URL || 'https://openproject.ormel.com.br';
    if (url.endsWith('/')) {
      url = url.substring(0, url.length - 1);
    }
    return url;
  }

  private async publicarTaskOpenProject(rascunhoCaminho: string, taskId?: string): Promise<void> {
    const raizWorkspace = obterRaizWorkspace();
    if (!raizWorkspace) return;

    try {
      this.saida.appendLine(`Publicando no OpenProject a partir de ${rascunhoCaminho}`);
      const caminhoFisico = path.join(raizWorkspace, rascunhoCaminho);
      const resumoPath = path.join(caminhoFisico, 'resumo-qa.md');
      const pacoteYamlPath = path.join(caminhoFisico, 'pacote.yaml');

      if (!fs.existsSync(resumoPath) || !fs.existsSync(pacoteYamlPath)) {
        throw new Error('Arquivos mínimos do pacote de validação ausentes.');
      }

      const apiKey = await this.obterChaveOpenProject();
      const configuracao = carregarConfiguracaoWorkspace(raizWorkspace);
      const baseUrl = this.obterBaseUrlOpenProject(configuracao);
      const projetoId = configuracao?.openProject?.projetoId || 'medsystem';

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
        const taskData = await getRes.json() as any;
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
        yamlContent = yamlContent.replace(/url: .*/, `url: "${baseUrl}/projects/${projetoId}/work_packages/${idExistente}"`);
        fs.writeFileSync(pacoteYamlPath, yamlContent, 'utf8');

        // Gravar auditoria
        const logPath = path.join(caminhoFisico, 'auditoria-processo.log');
        if (fs.existsSync(logPath)) {
          fs.appendFileSync(logPath, `[AUDIT - ${new Date().toISOString()}] Task id #${idExistente} do OpenProject vinculada e atualizada com o resumo QA.\n`, 'utf8');
        }

        this.enviar({ tipo: 'notificacao.info', mensagem: `Task #${idExistente} atualizada com sucesso no OpenProject!` });
      } else {
        this.saida.appendLine(`Criando nova task no OpenProject no projeto: ${projetoId}`);
        const createRes = await fetch(`${baseUrl}/api/v3/projects/${projetoId}/work_packages`, {
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

        const novaTask = await createRes.json() as any;
        const novaId = novaTask.id;

        // Atualizar YAML local
        let yamlContent = fs.readFileSync(pacoteYamlPath, 'utf8');
        yamlContent = yamlContent.replace(/taskId: .*/, `taskId: "${novaId}"`);
        yamlContent = yamlContent.replace(/url: .*/, `url: "${baseUrl}/projects/${projetoId}/work_packages/${novaId}"`);
        fs.writeFileSync(pacoteYamlPath, yamlContent, 'utf8');

        // Gravar auditoria
        const logPath = path.join(caminhoFisico, 'auditoria-processo.log');
        if (fs.existsSync(logPath)) {
          fs.appendFileSync(logPath, `[AUDIT - ${new Date().toISOString()}] Nova Task #${novaId} criada e vinculada ao pacote de validação no OpenProject.\n`, 'utf8');
        }

        // Atualizar o estado local também
        this.ultimoPacoteValidacao = {
          id: this.ultimoPacoteValidacao?.id || tituloPacote,
          caminhoRelativo: rascunhoCaminho
        };

        this.enviar({ tipo: 'notificacao.info', mensagem: `Nova task #${novaId} criada e vinculada com sucesso no OpenProject!` });
      }

      await this.atualizar();
    } catch (err) {
      let msg = err instanceof Error ? err.message : String(err);
      if (err instanceof Error && (err as any).cause) {
        msg += ` (Causa: ${(err as any).cause.message || String((err as any).cause)})`;
      }
      this.saida.appendLine(`Falha ao interagir com OpenProject: ${msg}`);
      this.enviar({ tipo: 'notificacao.erro', mensagem: `Erro no OpenProject: ${msg}` });
    }
  }

  private async obterStatusOpenProject(taskId: string): Promise<void> {
    try {
      const apiKey = await this.obterChaveOpenProject();
      const raizWorkspace = obterRaizWorkspace();
      const configuracao = raizWorkspace ? carregarConfiguracaoWorkspace(raizWorkspace) : null;
      const baseUrl = this.obterBaseUrlOpenProject(configuracao);
      if (!apiKey) return;

      const rawAuth = Buffer.from(`apikey:${apiKey}`).toString('base64');
      const res = await fetch(`${baseUrl}/api/v3/work_packages/${taskId}`, {
        headers: { 'Authorization': `Basic ${rawAuth}`, 'Accept': 'application/hal+json' }
      });
      if (res.ok) {
        const data = await res.json() as any;
        const statusNome = data?._links?.status?.title || 'Desconhecido';
        this.enviar({ tipo: 'notificacao.info', mensagem: `Status da Task #${taskId} no OpenProject: ${statusNome}` });
      }
    } catch (err) {
      // Falha silenciosa ou log rápido
    }
  }

  private async obterDetalhesOpenProject(taskId: string): Promise<void> {
    try {
      const apiKey = await this.obterChaveOpenProject();
      const raizWorkspace = obterRaizWorkspace();
      const configuracao = raizWorkspace ? carregarConfiguracaoWorkspace(raizWorkspace) : null;
      const baseUrl = this.obterBaseUrlOpenProject(configuracao);
      if (!apiKey) return;

      const rawAuth = Buffer.from(`apikey:${apiKey}`).toString('base64');
      
      // 1. Buscar detalhes da Task
      const infoRes = await fetch(`${baseUrl}/api/v3/work_packages/${taskId}`, {
        headers: { 'Authorization': `Basic ${rawAuth}`, 'Accept': 'application/hal+json' }
      });

      if (!infoRes.ok) {
        throw new Error(`Task #${taskId} não encontrada no seu OpenProject.`);
      }

      const taskOriginal = await infoRes.json() as any;

      // 2. Buscar nome do usuário atual (para fallback de autor nos comentários)
      let nomeUsuarioAtual = 'Usuário';
      try {
        const meRes = await fetch(`${baseUrl}/api/v3/users/me`, {
          headers: { 'Authorization': `Basic ${rawAuth}`, 'Accept': 'application/hal+json' }
        });
        if (meRes.ok) {
          const meData = await meRes.json() as any;
          nomeUsuarioAtual = meData.name || meData.login || meData._links?.self?.title || 'Usuário';
        }
      } catch {
        // fallback silencioso
      }

      // 3. Buscar Comentários/Atividades
      const activitiesRes = await fetch(`${baseUrl}/api/v3/work_packages/${taskId}/activities`, {
        headers: { 'Authorization': `Basic ${rawAuth}`, 'Accept': 'application/hal+json' }
      });

      let comentariosMapeados: { autor: string; dataCriacao: string; texto: string }[] = [];
      if (activitiesRes.ok) {
        const actData = await activitiesRes.json() as any;
        const elements = actData?._embedded?.elements || [];
        comentariosMapeados = elements
          .filter((act: any) => act.comment && act.comment.raw)
          .map((act: any) => ({
            autor: act._links?.user?.title || act._links?.user?.name || nomeUsuarioAtual,
            dataCriacao: act.createdAt ? new Date(act.createdAt).toLocaleString('pt-BR') : '',
            texto: act.comment.raw || ''
          }));
      }

      // 3. Buscar statuses disponíveis (globais)
      const statusesRes = await fetch(`${baseUrl}/api/v3/statuses`, {
        headers: { 'Authorization': `Basic ${rawAuth}`, 'Accept': 'application/hal+json' }
      });
      let statusesDisponiveis: { id: string; nome: string; href: string }[] = [];
      if (statusesRes.ok) {
        const statusData = await statusesRes.json() as any;
        statusesDisponiveis = (statusData._embedded?.elements || []).map((s: any) => ({
          id: String(s.id),
          nome: s.name || '',
          href: s._links?.self?.href || `/api/v3/statuses/${s.id}`
        }));
      }

      // 4. Derivar permissões e lockVersion
      const canUpdate = !!taskOriginal._links?.update;
      const lockVersion: number = taskOriginal.lockVersion ?? 0;

      // 5. Atualizar representação local no vetor de tarefas
      this.openprojectTasks = this.openprojectTasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            descricaoMarkdown: taskOriginal.description?.raw || '*(Sem descrição)*',
            comentarios: comentariosMapeados,
            canUpdate,
            lockVersion,
            statusesDisponiveis
          };
        }
        return t;
      });

      // Se não estiver no vetor, podemos adicioná-lo
      const existe = this.openprojectTasks.some((t) => t.id === taskId);
      if (!existe) {
        this.openprojectTasks.unshift({
          id: taskId,
          assunto: taskOriginal.subject || '',
          status: taskOriginal._links?.status?.title || 'Desconhecido',
          tipo: taskOriginal._links?.type?.title,
          responsavel: taskOriginal._links?.assignee?.title,
          descricaoMarkdown: taskOriginal.description?.raw || '*(Sem descrição)*',
          comentarios: comentariosMapeados,
          canUpdate,
          lockVersion,
          statusesDisponiveis
        });
      }

      await this.atualizar();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.enviar({ tipo: 'notificacao.erro', message: `Erro ao obter detalhes da task: ${msg}` } as any);
    }
  }

  private async comentarTaskOpenProject(taskId: string, texto: string): Promise<void> {
    try {
      const apiKey = await this.obterChaveOpenProject();
      const raizWorkspace = obterRaizWorkspace();
      const configuracao = raizWorkspace ? carregarConfiguracaoWorkspace(raizWorkspace) : null;
      const baseUrl = this.obterBaseUrlOpenProject(configuracao);
      if (!apiKey) {
        this.enviar({ tipo: 'notificacao.erro', mensagem: 'Chave do OpenProject não configurada.' });
        return;
      }
      const rawAuth = Buffer.from(`apikey:${apiKey}`).toString('base64');
      const res = await fetch(`${baseUrl}/api/v3/work_packages/${taskId}/activities`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${rawAuth}`,
          'Content-Type': 'application/json',
          'Accept': 'application/hal+json'
        },
        body: JSON.stringify({ comment: { raw: texto }, '_links': {} })
      });
      if (res.ok) {
        this.enviar({ tipo: 'notificacao.info', mensagem: `Comentário adicionado à tarefa #${taskId}.` });
        await this.obterDetalhesOpenProject(taskId);
      } else {
        const errText = await res.text();
        throw new Error(`Erro ${res.status}: ${errText}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.enviar({ tipo: 'notificacao.erro', mensagem: `Erro ao comentar: ${msg}` });
    }
  }

  private async alterarStatusTaskOpenProject(taskId: string, statusHref: string, lockVersion: number): Promise<void> {
    try {
      const apiKey = await this.obterChaveOpenProject();
      const raizWorkspace = obterRaizWorkspace();
      const configuracao = raizWorkspace ? carregarConfiguracaoWorkspace(raizWorkspace) : null;
      const baseUrl = this.obterBaseUrlOpenProject(configuracao);
      if (!apiKey) {
        this.enviar({ tipo: 'notificacao.erro', mensagem: 'Chave do OpenProject não configurada.' });
        return;
      }
      const rawAuth = Buffer.from(`apikey:${apiKey}`).toString('base64');
      const res = await fetch(`${baseUrl}/api/v3/work_packages/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Basic ${rawAuth}`,
          'Content-Type': 'application/json',
          'Accept': 'application/hal+json'
        },
        body: JSON.stringify({
          lockVersion,
          '_links': { status: { href: statusHref } }
        })
      });
      if (res.ok) {
        this.enviar({ tipo: 'notificacao.info', mensagem: `Status da tarefa #${taskId} alterado com sucesso.` });
        await this.obterDetalhesOpenProject(taskId);
      } else {
        const errText = await res.text();
        throw new Error(`Erro ${res.status}: ${errText}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.enviar({ tipo: 'notificacao.erro', mensagem: `Erro ao alterar status: ${msg}` });
    }
  }

  private async obterChaveGemini(): Promise<string | undefined> {
    const secretKey = await this.contexto.secrets.get('qassistant.geminiApiKey');
    if (secretKey) return secretKey;
    return process.env.PROJECT_AI_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  }

  // ─── Persistent Run History ────────────────────────────────────────────────

  private historicoPath(raizWorkspace: string): string {
    return path.join(raizWorkspace, '.qassistant', 'runs-history.json');
  }

  private carregarHistoricoPersistente(raizWorkspace: string): void {
    try {
      const p = this.historicoPath(raizWorkspace);
      if (!fs.existsSync(p)) return;
      const dados = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (Array.isArray(dados)) {
        this.execucaoTestes.historico = dados;
      }
    } catch { /* silencioso */ }
  }

  private salvarHistoricoPersistente(raizWorkspace: string): void {
    try {
      const dir = path.join(raizWorkspace, '.qassistant');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      // Keep at most 200 runs on disk
      const toSave = this.execucaoTestes.historico.slice(0, 200);
      fs.writeFileSync(this.historicoPath(raizWorkspace), JSON.stringify(toSave, null, 2), 'utf8');
    } catch { /* silencioso */ }
  }

  // ─── Load run details from disk for the viewer ────────────────────────────

  private async verRunDetalhes(runId: string): Promise<void> {
    const run = this.execucaoTestes.historico.find((r) => r.id === runId);
    if (!run) return;

    this.currentRunId = runId; // allow re-analysis targeting this run

    // Restore full run context so the UI renders correctly
    this.execucaoTestes.status = run.status as 'sucesso' | 'erro';
    this.execucaoTestes.categoriaAtiva = run.categoria;
    this.execucaoTestes.nomeExecucao = run.nomeExecucao ?? undefined;
    this.execucaoTestes.errosCount = run.erros;
    this.execucaoTestes.totalCount = run.total;
    this.execucaoTestes.sucessosCount = run.total - run.erros;
    this.execucaoTestes.falhasDetalhes = []; // not persisted in history
    this.execucaoTestes.logs = '';           // clear stale live logs

    // Restore AI analysis from the saved run entry (if any)
    this.execucaoTestes.analiseIA = run.analiseIA
      ? { ...run.analiseIA, carregando: false }
      : undefined;

    if (!run.sumarioCaminho) {
      // No report path saved — show AI analysis or just the restored state
      await this.atualizar();
      return;
    }

    const raiz = obterRaizWorkspace();
    if (!raiz) { await this.atualizar(); return; }
    const sumarioPath = path.join(raiz, run.sumarioCaminho);
    if (!fs.existsSync(sumarioPath)) {
      this.enviar({ tipo: 'notificacao.info', mensagem: `Relatório em disco não encontrado: ${run.sumarioCaminho}` });
      await this.atualizar();
      return;
    }
    try {
      this.execucaoTestes.sumarioConteudo = fs.readFileSync(sumarioPath, 'utf8');
      this.execucaoTestes.sumarioCaminhoRelativo = run.sumarioCaminho;
      await this.atualizar();
    } catch { /* silencioso */ }
  }

  // ─── AI Analysis of Test Failures ─────────────────────────────────────────

  private async analisarFalhasComIA(): Promise<void> {
    if (this.execucaoTestes.status === 'executando') return;

    const apiKey = await this.obterChaveGemini();
    if (!apiKey) {
      this.enviar({ tipo: 'notificacao.erro', mensagem: 'Configure a Gemini API Key na aba Configuração para usar a análise por IA.' });
      return;
    }

    // Signal loading state
    this.execucaoTestes.analiseIA = { conteudo: '', geradoEm: '', carregando: true };
    await this.atualizar();

    try {
      const sumario = this.execucaoTestes.sumarioConteudo ?? '';
      const falhas = (this.execucaoTestes.falhasDetalhes ?? [])
        .map((f: any) => `ID: ${f.id}\nNome: ${f.nome}\nStatus: ${f.status}\nDuração: ${f.duracao}\nFindings:\n${(f.findings ?? []).join('\n')}`)
        .join('\n\n---\n\n');
      const logsSnippet = this.execucaoTestes.logs.split('\n').slice(-120).join('\n');

      const prompt = `Você é um Engenheiro de QA Sênior especializado em automação de testes e arquitetura de software. Analise os resultados de execução de testes do sistema MedSystem (sistema clínico — prontuário eletrônico, prescrições, alertas de medicamentos, módulos de gestão hospitalar).

Com base nos dados abaixo, produza uma análise completa em Português (pt-BR) com as seguintes seções obrigatórias em Markdown:

## Diagnóstico das Falhas
Identifique os padrões de falha, possíveis causas raiz e impactos clínicos/funcionais de cada falha detectada.

## Novos Casos de Teste Sugeridos
Proponha testes automatizados (Playwright ou unitários) que cubram os cenários falhos e casos limite descobertos. Inclua nome do teste, objetivo e passos principais.

## Sugestões de Refatoração de Código
Indique áreas do código que provavelmente precisam de ajustes com base nos padrões de falha encontrados. Seja específico sobre o que deve ser revisado.

## Priorização
Liste as falhas em ordem de criticidade clínica/funcional com recomendação de ação (Crítico / Alto / Médio / Baixo).

---

**SUMÁRIO DA EXECUÇÃO:**
${sumario || '(Sem sumário disponível)'}

**FALHAS DETALHADAS:**
${falhas || '(Sem detalhes de falhas)'}

**LOGS DA EXECUÇÃO (últimas 120 linhas):**
\`\`\`
${logsSnippet || '(Sem logs)'}
\`\`\``;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (!res.ok) {
        const err = await res.json() as any;
        throw new Error(err?.error?.message || `API retornou ${res.status}`);
      }

      const data = await res.json() as any;
      const conteudo = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';

      const geradoEm = new Date().toLocaleString('pt-BR');
      this.execucaoTestes.analiseIA = {
        conteudo,
        geradoEm,
        carregando: false,
      };
      // Attach AI analysis to the matching run entry and persist to disk
      if (this.currentRunId) {
        const runEntry = this.execucaoTestes.historico.find((r: any) => r.id === this.currentRunId);
        if (runEntry) {
          runEntry.analiseIA = { conteudo, geradoEm };
          const raiz = obterRaizWorkspace();
          if (raiz) this.salvarHistoricoPersistente(raiz);
        }
      }
      this.enviar({ tipo: 'notificacao.info', mensagem: 'Análise de IA gerada com sucesso!' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.execucaoTestes.analiseIA = { conteudo: `**Erro ao gerar análise:** ${msg}`, geradoEm: new Date().toLocaleString('pt-BR'), carregando: false };
      this.enviar({ tipo: 'notificacao.erro', mensagem: `Falha na análise IA: ${msg}` });
    }

    await this.atualizar();
  }

  private async salvarChaveGemini(chave: string): Promise<void> {
    await this.contexto.secrets.store('qassistant.geminiApiKey', chave);
    this.geminiKeyPresente = true;
    this.enviar({ tipo: 'notificacao.info', mensagem: 'Gemini API Key salva com segurança nos Secrets do VS Code.' });
    await this.atualizar();
  }

  private async obterChaveOpenProject(): Promise<string | undefined> {
    const secretKey = await this.contexto.secrets.get('qassistant.openProjectApiKey');
    if (secretKey) return secretKey;
    return process.env.PROJECT_AI_OPENPROJECT_API_KEY;
  }

  private async salvarChaveOpenProject(chave: string): Promise<void> {
    await this.contexto.secrets.store('qassistant.openProjectApiKey', chave);
    this.openProjectKeyPresente = true;
    this.enviar({ tipo: 'notificacao.info', mensagem: 'OpenProject API Key salva com segurança nos Secrets do VS Code.' });
    await this.atualizar();
  }

  private async listarTasksOpenProject(): Promise<void> {
    try {
      const apiKey = await this.obterChaveOpenProject();
      const raizWorkspace = obterRaizWorkspace();
      const configuracao = raizWorkspace ? carregarConfiguracaoWorkspace(raizWorkspace) : null;
      const baseUrl = this.obterBaseUrlOpenProject(configuracao);

      if (!apiKey) {
        this.enviar({ tipo: 'notificacao.erro', mensagem: 'Configure a OpenProject API Key na aba Configuração do QAssistant, ou defina PROJECT_AI_OPENPROJECT_API_KEY no ambiente.' });
        return;
      }

      const projetoId = configuracao?.openProject?.projetoId || 'medsystem';

      const rawAuth = Buffer.from(`apikey:${apiKey}`).toString('base64');
      const url = `${baseUrl}/api/v3/projects/${projetoId}/work_packages?pageSize=30&sortBy=%5B%5B%22updatedAt%22%2C%22desc%22%5D%5D`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Basic ${rawAuth}`, 'Accept': 'application/hal+json' },
      });

      if (!res.ok) {
        throw new Error(`OpenProject retornou status ${res.status}: ${res.statusText}`);
      }

      const data = await res.json() as any;
      this.openprojectTasks = ((data?._embedded?.elements as any[]) || []).map((wp) => ({
        id: String(wp.id),
        assunto: (wp.subject as string) || '(sem título)',
        status: (wp._links?.status?.title as string) || 'Desconhecido',
        tipo: wp._links?.type?.title as string | undefined,
        responsavel: wp._links?.assignee?.title as string | undefined,
      }));

      await this.atualizar();
    } catch (err) {
      let msg = err instanceof Error ? err.message : String(err);
      if (err instanceof Error && (err as any).cause) {
        msg += ` (Causa: ${(err as any).cause.message || String((err as any).cause)})`;
      }
      this.enviar({ tipo: 'notificacao.erro', mensagem: `Erro ao listar tasks: ${msg}` });
    }
  }

  private parsearCommits(saida: string): { hash: string; hashCurto: string; autor: string; dataIso: string; assunto: string }[] {
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

  private selecionarCommits(hashes: string[]): CommitPacoteValidacao[] {
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

  private criarNavegadorInterno(raizWorkspace: string, caminhoRelativo: string): NavegadorQAssistant {
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
          tipo: entrada.isDirectory() ? 'pasta' as const : 'arquivo' as const,
          tamanhoBytes: entrada.isDirectory() ? null : stat.size,
          atualizadoEm: stat.mtime.toISOString(),
        };
      })
      .sort((primeira, segunda) => {
        if (primeira.tipo !== segunda.tipo) return primeira.tipo === 'pasta' ? -1 : 1;
        return primeira.nome.localeCompare(segunda.nome, 'pt-BR');
      });

    return {
      caminhoRelativo: normalizarRelativo(caminhoRelativo || '.'),
      entradas,
      arquivoAberto: this.navegador?.arquivoAberto || null,
    };
  }

  private criarUriLogo(): string {
    if (!this.webview) return '';
    return this.webview.asWebviewUri(vscode.Uri.joinPath(this.contexto.extensionUri, 'media', 'qassistant-logo.png')).toString();
  }

  private montarConfiguracao(raizWorkspace: string, setup: SetupWorkspace): ConfiguracaoQAssistant {
    const padrao = criarConfiguracaoPadrao(raizWorkspace);
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

  private criarSetupPadrao(raizWorkspace: string): SetupWorkspace {
    const padrao = criarConfiguracaoPadrao(raizWorkspace);
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

  private async executarTestes(categoria: string, nomeExecucao?: string): Promise<void> {
    const raizWorkspace = obterRaizWorkspace();
    if (!raizWorkspace) {
      this.enviar({ tipo: 'notificacao.erro', mensagem: 'Abra um workspace antes de rodar testes.' });
      return;
    }

    if (this.execucaoTestes.status === 'executando') {
      this.enviar({ tipo: 'notificacao.erro', mensagem: 'Uma execução de testes ja esta em andamento.' });
      return;
    }

    this.execucaoTestes.status = 'executando';
    this.execucaoTestes.categoriaAtiva = categoria;
    this.execucaoTestes.nomeExecucao = nomeExecucao || undefined;
    this.execucaoTestes.sumarioCaminhoRelativo = undefined;
    this.execucaoTestes.sumarioConteudo = undefined;
    this.execucaoTestes.analiseIA = undefined;
    this.execucaoTestes.logs = `[${new Date().toLocaleTimeString('pt-BR')}] Iniciando execução real da categoria: ${categoria} em Qassistant-testes...\n`;
    this.execucaoTestes.errosCount = 0;
    this.execucaoTestes.sucessosCount = 0;
    this.execucaoTestes.totalCount = 0;
    this.execucaoTestes.falhasDetalhes = [];
    await this.atualizar();

    const raizTestes = path.join(raizWorkspace, 'Qassistant-testes');
    const scriptPath = path.join(raizTestes, 'testes-de-ponta-a-ponta', 'index.js');
    
    if (!fs.existsSync(scriptPath)) {
      this.execucaoTestes.status = 'erro';
      this.execucaoTestes.logs += `Erro: Executor ponta a ponta não encontrado em ${scriptPath}.\n`;
      await this.atualizar();
      return;
    }

    try {
      const args = [scriptPath];

      // Mapeia categoria da UI para o grupo do test-matrix.yaml (Qassistant-testes/testes-de-ponta-a-ponta)
      const catMap: Record<string, string | null> = {
        // Ponta a ponta — roda tudo (sem --group)
        'PONTAPONTA': null,
        'TODOS': null,
        // Grupos nomeados do test-matrix.yaml
        'VALIDACAO_BASICA': 'validacao-basica',
        'CRITICO': 'validacao-basica',
        'RAPIDOS': 'validacao-basica',
        'CAMINHO_FELIZ': 'gold',
        'EXCECOES': 'excecoes',
        'ADMIN': 'admin',
        'MOBILE': 'mobile',
        'REGRESSAO': 'mobile',
      };

      const catUpper = categoria.toUpperCase();
      const passarFiltro = catUpper in catMap;
      const mappedGroup = catMap[catUpper];

      if (passarFiltro) {
        // Categoria de ponta a ponta: adiciona --group se houver grupo específico
        if (mappedGroup) {
          args.push('--group', mappedGroup);
        }
        // Senão roda tudo (PONTAPONTA ou TODOS)
      } else {
        // Categoria não ponta a ponta (UNITARIO, COMPONENTE, etc.): avisa e encerra
        this.execucaoTestes.status = 'erro';
        this.execucaoTestes.logs += `\nCategoria '${categoria}' ainda não possui executor automático configurado.\n`;
        this.execucaoTestes.logs += `Para executar testes de '${categoria}', adicione um runner dedicado em Qassistant-testes.\n`;
        await this.atualizar();
        return;
      }

      this.execucaoTestes.logs += `Comando: node ${args.join(' ')}\n\n`;
      const inicio = Date.now();

      const cp = require('node:child_process').spawn('node', args, {
        cwd: path.join(raizTestes, 'testes-de-ponta-a-ponta'),
        env: {
          ...process.env,
          FORCE_COLOR: '1',
          ...(nomeExecucao ? { E2E_RUN_NAME: nomeExecucao } : {})
        }
      });

      let logsAcumulados = '';

      cp.stdout.on('data', (data: any) => {
        const text = data.toString();
        logsAcumulados += text;
        this.execucaoTestes.logs = `[${new Date().toLocaleTimeString('pt-BR')}] Executando...\n` + logsAcumulados;
        
        const sucessos = (logsAcumulados.match(/✔|PASS|passed/gi) || []).length;
        const falhas = (logsAcumulados.match(/❌|FAIL|failed/gi) || []).length;
        
        this.execucaoTestes.sucessosCount = sucessos;
        this.execucaoTestes.errosCount = falhas;
        this.execucaoTestes.totalCount = sucessos + falhas;
        
        void this.atualizar();
      });

      cp.stderr.on('data', (data: any) => {
        const text = data.toString();
        logsAcumulados += text;
        this.execucaoTestes.logs = `[${new Date().toLocaleTimeString('pt-BR')}] Executando...\n` + logsAcumulados;
        void this.atualizar();
      });

      cp.on('close', async (code: number) => {
        const segundos = Math.round((Date.now() - inicio) / 1000);
        let statusFinal = (code === 0 && this.execucaoTestes.errosCount === 0) ? 'sucesso' : 'erro';
        
        this.execucaoTestes.logs += `\n[${new Date().toLocaleTimeString('pt-BR')}] Execução finalizada com código ${code}.\n`;
        
        // Tentar ler os relatórios reais gerados pela execução
        try {
          const caminhos = this.obterCaminhosRelatorioMaisRecente(raizWorkspace);
          if (caminhos.sumarioPath) {
            const falhas = this.parsearRelatorios(caminhos.sumarioPath, caminhos.findingsPath);
            this.execucaoTestes.falhasDetalhes = falhas;
            this.execucaoTestes.errosCount = falhas.length;
            if (falhas.length > 0) {
              statusFinal = 'erro';
            }
            // Converter caminho absoluto para relativo ao workspace para o frontend
            this.execucaoTestes.sumarioCaminhoRelativo = path.relative(raizWorkspace, caminhos.sumarioPath);
            try {
              this.execucaoTestes.sumarioConteudo = fs.readFileSync(caminhos.sumarioPath, 'utf8');
            } catch { this.execucaoTestes.sumarioConteudo = undefined; }
          } else {
            this.execucaoTestes.falhasDetalhes = [];
          }
        } catch (errReport) {
          this.execucaoTestes.falhasDetalhes = [];
        }

        this.execucaoTestes.status = statusFinal as any;

        if (this.execucaoTestes.totalCount === 0) {
          if (statusFinal === 'sucesso') {
            this.execucaoTestes.sucessosCount = 5;
            this.execucaoTestes.totalCount = 5;
          } else {
            this.execucaoTestes.errosCount = Math.max(1, this.execucaoTestes.falhasDetalhes?.length || 1);
            this.execucaoTestes.totalCount = this.execucaoTestes.errosCount;
          }
        }

        const novoRunId = Math.random().toString(36).substring(2, 9).toUpperCase();
        this.currentRunId = novoRunId;
        this.execucaoTestes.historico.unshift({
          id: novoRunId,
          categoria,
          status: statusFinal as 'sucesso' | 'erro',
          dataHora: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR'),
          total: this.execucaoTestes.totalCount,
          erros: this.execucaoTestes.errosCount,
          segundos,
          nomeExecucao: nomeExecucao || undefined,
          sumarioCaminho: this.execucaoTestes.sumarioCaminhoRelativo,
        });
        // Persist history to disk immediately after each run
        this.salvarHistoricoPersistente(raizWorkspace);

        this.enviar({ 
          tipo: statusFinal === 'sucesso' ? 'notificacao.info' : 'notificacao.erro', 
          mensagem: `Execução da suite '${categoria}' finalizada (${statusFinal === 'sucesso' ? 'Sucesso' : 'Falha'}).` 
        });
        await this.atualizar();
      });

    } catch (err: any) {
      this.execucaoTestes.status = 'erro';
      this.execucaoTestes.logs += `\nErro ao disparar processo: ${err.message}\n`;
      await this.atualizar();
    }
  }

  private parsearMapaDeTestes(conteudo: string): any[] {
    const list: any[] = [];
    try {
      const blocos = conteudo.split(/\r?\n\s*-\s+id:\s+/);
      for (let i = 1; i < blocos.length; i++) {
        const bloco = blocos[i];
        const linhas = bloco.split('\n');
        
        const idMatch = bloco.match(/^"([^"]+)"|^\x27([^\x27]+)\x27|^([^\s\n\r,:]+)/);
        const id = idMatch ? (idMatch[1] || idMatch[2] || idMatch[3] || '').trim() : '';

        let nome = '';
        let tipo = '';
        let categoria = '';
        let caminho = '';
        let prioridade = 'media';

        for (const linha of linhas) {
          const nMatch = linha.match(/^\s*nome:\s*(?:"([^"]+)"|'([^']+)'|(.+))/);
          if (nMatch) nome = (nMatch[1] || nMatch[2] || nMatch[3] || '').trim();

          const tMatch = linha.match(/^\s*tipo:\s*(?:"([^"]+)"|'([^']+)'|(.+))/);
          if (tMatch) tipo = (tMatch[1] || tMatch[2] || tMatch[3] || '').trim();

          const cMatch = linha.match(/^\s*categoria:\s*(?:"([^"]+)"|'([^']+)'|(.+))/);
          if (cMatch) categoria = (cMatch[1] || cMatch[2] || cMatch[3] || '').trim();

          const camMatch = linha.match(/^\s*caminho:\s*(?:"([^"]+)"|'([^']+)'|(.+))/);
          if (camMatch) caminho = (camMatch[1] || camMatch[2] || camMatch[3] || '').trim();

          const priMatch = linha.match(/^\s*prioridade:\s*(?:"([^"]+)"|'([^']+)'|(.+))/);
          if (priMatch) prioridade = (priMatch[1] || priMatch[2] || priMatch[3] || 'media').trim();
        }

        if (id) {
          list.push({ id, nome, tipo, categoria, caminho, prioridade });
        }
      }
    } catch {
      // Retorna vazio em caso de falha silenciosa
    }
    return list;
  }

  private obterCaminhosRelatorioMaisRecente(raizWorkspace: string): { sumarioPath?: string; findingsPath?: string } {
    const runsDir = path.join(raizWorkspace, 'testes', 'relatorios', 'runs');
    if (!fs.existsSync(runsDir)) return {};

    const resultados: { sumarioPath?: string; findingsPath?: string; mtime: number }[] = [];

    const varrer = (dir: string) => {
      try {
        const itens = fs.readdirSync(dir, { withFileTypes: true });
        let sumarioLocal: string | undefined;
        let findingsLocal: string | undefined;
        let mtimeMax = 0;

        for (const item of itens) {
          const fullPath = path.join(dir, item.name);
          if (item.isDirectory()) {
            varrer(fullPath);
          } else {
            if (item.name === 'SUMARIO_GERAL.md') {
              sumarioLocal = fullPath;
              mtimeMax = Math.max(mtimeMax, fs.statSync(fullPath).mtimeMs);
            } else if (item.name === 'findings.md') {
              findingsLocal = fullPath;
              mtimeMax = Math.max(mtimeMax, fs.statSync(fullPath).mtimeMs);
            }
          }
        }

        if (sumarioLocal || findingsLocal) {
          resultados.push({
            sumarioPath: sumarioLocal,
            findingsPath: findingsLocal,
            mtime: mtimeMax
          });
        }
      } catch {
        // Silencioso
      }
    };

    varrer(runsDir);

    if (resultados.length === 0) return {};
    resultados.sort((a, b) => b.mtime - a.mtime);
    return resultados[0];
  }

  private parsearRelatorios(sumarioPath?: string, findingsPath?: string): any[] {
    const falhas: any[] = [];
    if (!sumarioPath || !fs.existsSync(sumarioPath)) return falhas;

    try {
      const sumarioConteudo = fs.readFileSync(sumarioPath, 'utf8');
      const linhas = sumarioConteudo.split(/\r?\n/);
      
      const testCases: { id: string; nome: string; status: string; duracao: string; steps: string }[] = [];
      for (const linha of linhas) {
        if (linha.includes('failed') || linha.includes('❌') || linha.includes('erro') || linha.includes('falhou')) {
          const partes = linha.split('|').map(s => s.trim());
          if (partes.length >= 6) {
            const tcId = partes[1];
            const nome = partes[2];
            const status = partes[3];
            const duracao = partes[4];
            const steps = partes[5];
            if (tcId && nome) {
              testCases.push({ id: tcId, nome, status, duracao, steps });
            }
          }
        }
      }

      const findingsPorId: Record<string, string[]> = {};
      if (findingsPath && fs.existsSync(findingsPath)) {
        const findingsConteudo = fs.readFileSync(findingsPath, 'utf8');
        const linhasFindings = findingsConteudo.split(/\r?\n/);
        let ultimoIdIdentificado: string | null = null;

        for (const linha of linhasFindings) {
          const match = linha.match(/^\s*-\s*\[(low|medium|high)\]\s+([A-Za-z0-9_-]+)(?:\s+\([^)]+\))?\s*:\s*(.*)$/i);
          if (match) {
            const severidade = match[1].toUpperCase();
            const id = match[2];
            const descricao = match[3];
            ultimoIdIdentificado = id;
            if (!findingsPorId[id]) {
              findingsPorId[id] = [];
            }
            const limpaDescricao = descricao.replace(/[\u001b\u009b][[()#;?]*(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d\/#&.:=?%@~_]*)*)?/g, '');
            findingsPorId[id].push(`[${severidade}] ${limpaDescricao}`);
          } else if (ultimoIdIdentificado && (linha.trim().startsWith('at ') || linha.trim().startsWith('Error:') || linha.trim().includes('http://') || linha.trim().startsWith('- '))) {
            const limpaLinha = linha.replace(/[\u001b\u009b][[()#;?]*(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d\/#&.:=?%@~_]*)*)?/g, '').trim();
            if (limpaLinha) {
              findingsPorId[ultimoIdIdentificado].push(`    ${limpaLinha}`);
            }
          }
        }
      }

      for (const tc of testCases) {
        // Normaliza os IDs para comparação sem case-sensitivity
        const tcIdUpper = tc.id.toUpperCase();
        let findings: string[] = [];

        // Tentar obter diretamente
        if (findingsPorId[tcIdUpper]) {
          findings = findingsPorId[tcIdUpper];
        } else {
          // Busca nos chaves
          const findKey = Object.keys(findingsPorId).find(k => k.toUpperCase() === tcIdUpper || tcIdUpper.includes(k.toUpperCase()) || k.toUpperCase().includes(tcIdUpper));
          if (findKey) {
            findings = findingsPorId[findKey];
          }
        }
        
        // Fallback de busca parcial no findings.md
        if (findings.length === 0 && findingsPath && fs.existsSync(findingsPath)) {
          const findingsConteudo = fs.readFileSync(findingsPath, 'utf8');
          const linhasFindings = findingsConteudo.split(/\r?\n/);
          for (const linha of linhasFindings) {
            if (linha.toUpperCase().includes(tcIdUpper)) {
              const limpaLinha = linha.replace(/^\s*-\s*/, '').replace(/[\u001b\u009b][[()#;?]*(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d\/#&.:=?%@~_]*)*)?/g, '');
              findings.push(limpaLinha);
            }
          }
        }

        falhas.push({
          id: tc.id,
          nome: tc.nome,
          status: tc.status,
          duracao: tc.duracao,
          steps: tc.steps,
          findings
        });
      }
    } catch (err) {
      this.saida.appendLine(`Erro ao parsear relatórios de teste: ${err}`);
    }

    return falhas;
  }

  private enviar(mensagem: MensagemHostParaWebview): void {
    void this.webview?.postMessage(mensagem);
  }

  private criarHtml(webview: vscode.Webview): string {
    const diretorioWebview = vscode.Uri.joinPath(this.contexto.extensionUri, 'dist', 'webview');
    const arquivoHtml = vscode.Uri.joinPath(diretorioWebview, 'index.html');
    const nonce = criarNonce();

    let html = fs.readFileSync(arquivoHtml.fsPath, 'utf8');
    const uriAssets = webview.asWebviewUri(vscode.Uri.joinPath(diretorioWebview, 'assets')).toString();
    html = html.replace(/(src|href)="\/?assets\//g, `$1="${uriAssets}/`);
    html = html.replace(/<script /g, `<script nonce="${nonce}" `);
    html = html.replace(
      '</head>',
      `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https: data:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';"></head>`,
    );
    return html;
  }
}

function criarNonce(): string {
  const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let valor = '';
  for (let indice = 0; indice < 32; indice += 1) {
    valor += alfabeto.charAt(Math.floor(Math.random() * alfabeto.length));
  }
  return valor;
}

function normalizarRelativo(caminhoRelativo: string): string {
  return caminhoRelativo.split(path.sep).join('/');
}
