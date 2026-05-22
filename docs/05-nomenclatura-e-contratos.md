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

Observacao: os comandos registrados no manifest da extensao ficam em
`packages/extensao-vscode/package.json` e, na v0.1.x, sao exatamente os tres acima.

## Mensagens implementadas

```ts
type MensagemWebviewParaHost =
	| { tipo: 'painel.carregado' }
	| { tipo: 'workspace.inicializar'; setup: SetupWorkspace }
	| { tipo: 'painel.atualizar' }
	| { tipo: 'workspace.abrirCaminho'; caminhoRelativo: string }
	| { tipo: 'validacao.criarRascunho'; titulo: string }
	| { tipo: 'validacao.criarComCommits'; titulo: string; hashes: string[] }
	| { tipo: 'git.carregarCommits'; limite: number }
	| { tipo: 'validacao.gerarResumoIA'; rascunhoCaminho: string }
	| { tipo: 'validacao.sugerirBateriaTestes'; rascunhoCaminho: string }
	| { tipo: 'openproject.publicarTask'; rascunhoCaminho: string; taskId?: string }
	| { tipo: 'openproject.obterStatus'; taskId: string }
	| { tipo: 'openproject.listarTasks' }
	| { tipo: 'openproject.obterDetalhes'; taskId: string }
	| { tipo: 'config.salvarChaveGemini'; chave: string }
	| { tipo: 'config.salvarChaveOpenProject'; chave: string }
	| { tipo: 'validacao.selecionarPacote'; caminhoRelativo: string }
	| { tipo: 'validacao.excluirPacote'; caminhoRelativo: string }
	| { tipo: 'testes.executar'; categoria: string; nomeExecucao?: string }
	| { tipo: 'testes.limparHistorico' };
```

Fonte de verdade dos contratos: `packages/extensao-vscode/src/contratos/mensagens.ts`.

`workspace.abrirCaminho` abre arquivo no editor do VS Code ou lista diretorio no navegador interno. O host valida que o caminho permanece dentro do workspace atual.

`validacao.criarRascunho` cria uma rodada em `Qassistant-testes/validacoes/` e atualiza `ultimoPacoteValidacao` no estado do painel.

`validacao.criarComCommits` cria uma rodada usando hashes carregados pela integracao Git.

`git.carregarCommits` le commits recentes via `git log` no workspace aberto.

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
	workspaceInicializado: boolean;
	raizTestes: string;
	raizContexto: string;
	configuracao?: ConfiguracaoQAssistant;
	estrutura?: EstruturaWorkspaceQAssistant;
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
	ultimoPacoteValidacao?: {
		id: string;
		caminhoRelativo: string;
	};
}
```

Para estrutura completa e atualizada, consulte `packages/extensao-vscode/src/contratos/mensagens.ts`.
