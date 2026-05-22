# Arquitetura

QAssistant sera uma extensao VS Code com separacao clara entre host, webview, nucleo de dominio e arquivos gerados no projeto alvo.

## Stack recomendada

- Host da extensao: TypeScript + VS Code API.
- Bundle do host: esbuild.
- Webview: React + Vite + TypeScript.
- Validacao de contratos: Zod ou schema equivalente.
- Testes do nucleo: Vitest.
- Testes de webview: Vitest + Testing Library quando necessario.
- Testes de fluxo visual: Playwright apenas para jornadas criticas.
- Design system: tokens `--qa-*` alimentados por variaveis `--vscode-*`, com fallback proprio do QAssistant.
- Marca: usar `qassistant-logo.png` como referencia visual oficial e SVG monocromatico especifico para Activity Bar.
- Assets de webview: o host resolve imagens com `webview.asWebviewUri`, evitando caminhos `/assets` quebrados no sandbox do VS Code.
- Git: o host le commits recentes com `git log` e envia dados estruturados para a webview selecionar.

## Camadas

```text
QAssistant/
  packages/
    extensao-vscode/
      src/host/
      src/webview/
      media/
    nucleo/
      src/configuracao.ts
      src/scaffold.ts
      src/validacoes.ts
      src/tipos.ts
      src/index.ts
```

Observacao: a estrutura acima representa a implementacao atual da v0.1.x.
A modularizacao por dominios (openproject/resumos/testes/ia/workspace) segue como direcao de evolucao.

## Host da extensao

Responsabilidades:

- registrar comandos;
- abrir e atualizar webviews;
- acessar SecretStorage;
- ler e escrever arquivos no workspace;
- executar processos de teste quando autorizado;
- consultar OpenProject sob demanda (listar, obter status e obter detalhes);
- validar mensagens recebidas da webview;
- chamar servicos do nucleo.

## Webview

Responsabilidades:

- renderizar setup guiado;
- renderizar modulos do produto;
- controlar estado local de tela;
- enviar acoes tipadas para o host;
- mostrar resultados, empty states, historico e validacoes.
- garantir que todo botao visivel execute uma acao real, mesmo em fase inicial.
- navegar por pastas operacionais dentro da propria webview, sem revelar diretorios no sistema operacional.
- abrir arquivos editaveis no editor do VS Code quando o usuario escolhe um artefato.

## Nucleo

Responsabilidades:

- coletar commits;
- gerar resumo QA;
- montar pacotes de validacao;
- operar cliente OpenProject;
- gerar scaffold de `Qassistant-testes/`;
- gerar scaffold de `docs/contexto/`;
- gerar prompts, instructions e skills;
- sugerir cenarios via IA quando configurada.

## Decisao sobre tempo real

Na v0.1.x, o acompanhamento de OpenProject e sob demanda no painel.
Polling automatico permanece planejado para uma iteracao futura e deve usar o campo de configuracao `intervaloPollingSegundos` quando for implementado.

## Assets oficiais

- `packages/extensao-vscode/media/qassistant-logo.png`: imagem oficial para package icon e identidade visual.
- `packages/extensao-vscode/media/qassistant-logo-source.svg`: fonte oficial do logo.
- `packages/extensao-vscode/media/qassistant-activitybar.svg`: versao monocromatica para Activity Bar, otimizada para tema do VS Code.
- `packages/extensao-vscode/src/webview/assets/qassistant-logo.png`: referencia de desenvolvimento; a webview empacotada usa a URI resolvida a partir de `media/qassistant-logo.png`.

Observacao de manifest atual: o `package.json` da extensao usa `qassistant-logo-source.svg` como icone do container e da view.

Observacao: a webview nao importa o PNG diretamente pelo Vite. O caminho e entregue pelo host no estado do painel para respeitar CSP e sandbox do VS Code.

## Superficie operacional

Depois do setup, o painel deve mostrar a ferramenta iniciada com:

- commits recentes carregados;
- selecao de commits para pacote QA;
- criacao de pacote com commits selecionados;
- navegador interno dos artefatos QAssistant;
- abertura de arquivos no editor do VS Code.
