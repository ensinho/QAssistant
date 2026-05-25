# Nomenclatura E Contratos

## Regras de nome

- Produto: QAssistant.
- Pasta operacional: `Qassistant-testes/`.
- Sem `projectAi`.
- Sem `project-ai`.
- Sem `.ai-cli`.
- Sem `PROJECT_AI_*`.
- Codigo interno em pt-BR sem acentos em nomes de arquivos, simbolos e pacotes.
- Texto de UI em pt-BR com acentos quando apropriado.

## Namespaces propostos

- Comandos VS Code: `qassistant.*`.
- Settings: `qassistant.*`.
- Secrets: `qassistant.*`.
- Env vars: preferir `QASSISTANT_*` para novos pontos; compatibilidade atual usa `PROJECT_AI_*` e `GEMINI_API_KEY` em alguns fluxos.
- Pasta de configuracao local opcional: `.qassistant/` apenas para metadata da extensao, se necessario.

## Comandos iniciais

- `qassistant.abrirPainel`
- `qassistant.inicializarWorkspace`
- `qassistant.atualizarPainel`
- `qassistant.abrirTesteEmAba`

Observacao: os comandos registrados no manifest da extensao ficam em
`packages/extensao-vscode/package.json` e, na v0.1.x, sao exatamente os quatro acima.

## Mensagens implementadas

```ts
type MensagemWebviewParaHost =
	| { tipo: 'painel.carregado' }
	| { tipo: 'workspace.inicializar'; setup: SetupWorkspace }
	| { tipo: 'painel.atualizar' }
	| { tipo: 'workspace.abrirCaminho'; caminhoRelativo: string }
	| { tipo: 'workspace.selecionarDiretorio'; campo: 'raizCodigo' | 'frontend' | 'backend'; caminhoAtual?: string }
	| { tipo: 'validacao.criarRascunho'; titulo: string }
	| { tipo: 'validacao.criarComCommits'; titulo: string; hashes: string[] }
	| { tipo: 'git.carregarCommits'; limite: number }
	| { tipo: 'validacao.gerarResumoIA'; rascunhoCaminho: string }
	| { tipo: 'validacao.sugerirBateriaTestes'; rascunhoCaminho: string }
	| { tipo: 'openproject.publicarTask'; rascunhoCaminho: string; taskId?: string }
	| { tipo: 'openproject.obterStatus'; taskId: string }
	| { tipo: 'openproject.listarTasks' }
	| { tipo: 'openproject.obterDetalhes'; taskId: string }
	| { tipo: 'openproject.validarConexao'; urlBase: string; projetoRef?: string; token?: string }
	| { tipo: 'config.salvarChaveGemini'; chave: string }
	| { tipo: 'config.salvarChaveOpenProject'; chave: string }
	| { tipo: 'validacao.selecionarPacote'; caminhoRelativo: string }
	| { tipo: 'validacao.excluirPacote'; caminhoRelativo: string }
	| { tipo: 'testes.executar'; categoria: string; nomeExecucao?: string }
	| { tipo: 'testes.navegarSeletorPrompt'; contexto: 'arquivos' | 'pastas'; caminhoRelativo: string }
	| { tipo: 'testes.gerarPromptAssistido'; payload: PromptAssistidoTeste }
	| { tipo: 'testes.limparHistorico' }
	| { tipo: 'testes.abrirEmAba' }
	| { tipo: 'testes.fecharAba' }
	| { tipo: 'testes.analisarComIA' }
	| { tipo: 'testes.verRunDetalhes'; runId: string }
	| { tipo: 'openproject.comentarTask'; taskId: string; texto: string }
	| { tipo: 'openproject.alterarStatusTask'; taskId: string; statusHref: string; lockVersion: number };

type MensagemHostParaWebview =
	| { tipo: 'estado.atualizado'; estado: EstadoPainel }
	| { tipo: 'workspace.diretorioSelecionado'; campo: 'raizCodigo' | 'frontend' | 'backend'; caminho: string }
	| { tipo: 'testes.seletorPromptAtualizado'; contexto: 'arquivos' | 'pastas'; navegador: NavegadorQAssistant }
	| { tipo: 'testes.promptAssistidoGerado'; caminhoRelativo: string; conteudo: string; copiado: boolean }
	| { tipo: 'openproject.validacaoConcluida'; sucesso: boolean; mensagem: string; projeto?: { nome: string; identificador?: string }; projetosDisponiveis?: { nome: string; identificador: string }[] }
	| { tipo: 'notificacao.info'; mensagem: string }
	| { tipo: 'notificacao.erro'; mensagem: string };
```

Fonte de verdade dos contratos: `packages/extensao-vscode/src/contratos/mensagens.ts`.

`workspace.abrirCaminho` abre arquivo no editor do VS Code ou lista diretorio no navegador interno. O host valida que o caminho permanece dentro do workspace atual.

`workspace.selecionarDiretorio` abre o picker nativo do VS Code para selecionar uma pasta dentro do workspace atual e devolve o caminho relativo em `workspace.diretorioSelecionado`.

`testes.navegarSeletorPrompt` abre um navegador interno dedicado ao criador de prompt, com filtros proprios para navegar por arquivos ou apenas por pastas sem interferir em `estado.navegador`.

`testes.gerarPromptAssistido` adapta o template base do tipo escolhido com os parametros fornecidos, salva o arquivo na pasta de prompts gerados do tipo, abre no editor e copia o conteudo para a area de transferencia.

`validacao.criarRascunho` cria uma rodada em `Qassistant-testes/validacoes/` e atualiza `ultimoPacoteValidacao` no estado do painel.

`validacao.criarComCommits` cria uma rodada usando hashes carregados pela integracao Git.

`git.carregarCommits` le commits recentes via `git log` no workspace aberto.

`openproject.validarConexao` testa URL e token durante o onboarding ou na aba de configuracao. Quando a conexao e valida, o host tambem lista os projetos disponiveis para esse acesso; `projetoRef` continua aceitando nome amigavel ou identificador tecnico como compatibilidade para fluxos que ainda precisem resolver um projeto explicitamente.

`openproject.validacaoConcluida` devolve para a webview o resultado da validacao e, quando disponivel, a lista de projetos acessiveis para selecao imediata sem depender de notificacoes genericas.

`PromptAssistidoTeste` carrega o estado minimo do criador guiado: tipo de teste, stack opcional, objetivo, contexto adicional, observacoes/cenarios, arquivos selecionados, pastas selecionadas e uso opcional do pacote ativo.

## Contratos host/webview

Todo contrato entre webview e host deve ser validado por schema.

Categorias recomendadas:

- comandos: acoes iniciadas pela webview;
- consultas: pedidos de leitura de estado;
- eventos: mensagens enviadas pelo host para atualizar a webview;
- erros: falhas normalizadas;
- progresso: estados longos como resumo, execucao de testes e IA.

## Entidades principais

- WorkspaceMapeado
- ConfiguracaoQAssistant
- CredencialOpenProject
- CommitSelecionado
- ResumoQa
- PacoteValidacao
- VinculoOpenProject
- SnapshotOpenProject
- TipoTeste
- PromptTeste
- ExecucaoTeste
- SugestaoIa

## Estado do painel

Campos operacionais atuais (recorte simplificado):

```ts
interface EstadoPainel {
	produto: 'QAssistant';
	versaoExtensao: string;
	workspaceAberto: boolean;
	workspaceInicializado: boolean;
	raizTestes: string;
	raizContexto: string;
	configuracao: ConfiguracaoQAssistant | null;
	estrutura: EstruturaWorkspaceQAssistant | null;
	assets: {
		logoUri: string;
	};
	git: {
		carregando: boolean;
		erro: string | null;
		recentes: CommitGitQAssistant[];
		carregadoEm: string | null;
	};
	navegador: NavegadorQAssistant | null;
	ultimosArquivosCriados: string[];
	ultimosArquivosPreservados: string[];
	geminiKeyPresente: boolean;
	openProjectKeyPresente: boolean;
	openprojectTasks: TaskOpenProjectQA[];
	execucaoTestes?: ExecucaoTestes;
	ultimoPacoteValidacao?: {
		id: string;
		caminhoRelativo: string;
	};
}
```

Para estrutura completa e atualizada, consulte `packages/extensao-vscode/src/contratos/mensagens.ts`.
