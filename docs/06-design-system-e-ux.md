# Design System E UX

## Direcao

O QAssistant deve parecer nativo ao VS Code, com hierarquia visual limpa, previsivel e profissional.

A webview usa uma unica camada visual:

- tokens `--qa-*` em `packages/extensao-vscode/src/webview/design-system/tokens.css`;
- classes compartilhadas em `packages/extensao-vscode/src/webview/styles.css`;
- JSX com o minimo necessario de estilo inline, restrito a valores realmente dinamicos.

Componentes nao devem consumir `--vscode-*` diretamente. O acoplamento com o tema do editor acontece somente na camada de tokens.

## Tokens e tema

Arquivos-base:

- `packages/extensao-vscode/src/webview/design-system/tokens.css`
- `packages/extensao-vscode/src/webview/styles.css`

Categorias obrigatorias de token:

- tipografia;
- espacamento;
- raios;
- superficies;
- bordas;
- texto;
- marca;
- estados semanticos (`info`, `success`, `warning`, `error`, `danger`);
- overlays e superficies de codigo ou relatorio;
- sombra.

Regras:

- use `--qa-*` em componentes e classes;
- evite hex, `rgb()` e `rgba()` em TSX;
- quando um fallback hardcoded for inevitavel, registre o motivo nesta documentacao;
- antes de criar um token novo, verifique se `--qa-surface`, `--qa-surface-subtle`, `--qa-surface-strong`, `--qa-code-*`, `--qa-overlay*` ou os tokens semanticos existentes ja cobrem o caso.

## Logo e assets

Referencias oficiais:

- `packages/extensao-vscode/media/qassistant-logo.png`;
- `packages/extensao-vscode/media/qassistant-logo-source.svg`.

Uso:

- package icon: PNG oficial;
- webview: URI recebida pelo estado do host;
- Activity Bar: SVG monocromatico dedicado.

Regra tecnica: nao importar o PNG diretamente em React quando isso gerar `/assets/...` no bundle.

## Componentes base

Padroes compartilhados que devem ser priorizados:

- superfices principais: `.panel`, `.module`, `.op-card`, `.surface-subtle`, `.surface-strong`;
- shells compostos: `.qa-runner*`, `.dashboard-summary-grid`, `.summary-card*`, `.telemetry-grid`, `.telemetry-row`, `.resource-card*`;
- abas: `.tabs-navigation-clean`, `.tab-btn-clean`;
- formularios: `input`, `select`, `textarea`, `label`, `.form-grid`, `.toggle-row`, `.check-row`;
- estados compactos: `.badge`, `.badge.success|warning|info|error`, `.state-chip`;
- feedbacks: `.inline-alert`, `.inline-alert.success|warning|info|danger`;
- estados de tela: `.empty-state`, `.loading-state`, `.error-state`, `.skeleton-line`, `.inline-spinner`;
- modais: `.modal-backdrop`, `.modal-shell`, `.modal-header`, `.modal-body`, `.modal-footer`, `.modal-close`;
- leitura de conteudo longo: `.scroll-region`, `.prose-block`, `.mono-block`, `.log-block`, `.log-line`, `.text-truncate`, `.text-wrap-anywhere`.

Regras de composicao:

- prefira classes compartilhadas a objetos de estilo grandes em JSX;
- estilo inline deve ficar restrito a largura dinamica, proporcao dinamica, `flex` calculado ou estados que dependem de dado runtime;
- quando um padrao se repetir em mais de um lugar, mova para `styles.css` ou extraia componente visual.

Aplicacoes recentes dessas regras:

- o QA Runner dedicado deve usar o shell compartilhado `.qa-runner`, com sidebar empilhavel em largura menor e cabecalhos internos `.qa-runner__panel-*`;
- cards de resumo e cards de recursos da tela principal devem usar as familias `.summary-card*` e `.resource-card*` em vez de variantes inline locais;
- listas resumidas do OpenProject devem reutilizar `.op-task-summary-row`, `.badge-small` e `scroll-region` para evitar nova duplicacao visual.
- o onboarding inicial deve usar `setup-wizard*`, `setup-step-pill`, `setup-summary-grid`, `setup-checklist-grid` e `setup-inline-help` para manter o primeiro uso compacto e guiado;
- campos de caminho do setup devem usar `setup-path-picker` e o botao compartilhado de selecao para manter input e picker alinhados no onboarding e na configuracao;
- a lista de commits do wizard deve usar `commit-list-shell`, `commit-item*` e `commit-repo-badge` para manter padding, densidade e selecao consistentes;
- o runner embutido da aba principal deve convergir para as primitivas `qa-inline-runner*`, reaproveitando a linguagem de metricas, logs, estados e historico do runner dedicado;
- modais do OpenProject devem preferir `op-modal-zone*`, `op-comment-card`, `op-summary-box` e `field-stack` em vez de novas superfices inline.
- ajustes de espaco no wizard de commits devem acontecer no shell/lista compartilhados, nao por padding ad hoc nos itens isolados.

## Botoes, cards e listas

Regras operacionais:

- todo botao visivel precisa executar uma acao real;
- estado `disabled` representa bloqueio real, nao placeholder;
- botoes secundarios usam superficie transparente com borda do tema;
- acoes destrutivas devem usar variacao `danger` e contexto claro;
- cards e linhas clicaveis precisam manter foco visivel e area de clique legivel.

Em listas densas:

- preserve o titulo principal como primeiro alvo visual;
- metadados devem ser secundarios e truncar antes de empurrar a acao principal para fora da viewport;
- acoes compactas nao podem desaparecer em painel estreito.

## Estados padrao

Todos os fluxos devem ter tratamento consistente para:

- carregando;
- vazio;
- sucesso;
- alerta;
- erro.

Regras:

- loading curto: spinner inline ou `skeleton-line`;
- loading de bloco: `.loading-state`;
- empty state: mensagem curta + proxima acao operacional;
- erro: `.inline-alert.danger` ou `.error-state`, sem texto generico demais;
- sucesso: `badge` ou `state-chip` sem exagero visual.

No primeiro uso:

- o onboarding deve mostrar uma etapa por vez;
- a configuracao do OpenProject deve vir ativa por padrao, mas continuar podendo ser desligada sem quebrar o setup;
- o token precisa ser solicitado antes da escolha do projeto, para permitir carregar a lista real de projetos visiveis para aquele acesso;
- a ajuda para token precisa ficar visivel no proprio passo, sem exigir scroll longo.

## Overflow e leitura de conteudo longo

Conteudo longo nunca pode ser cortado sem rota de acesso.

Aplicar especialmente em:

- analise de IA;
- relatorio de execucao;
- markdown de descricao;
- comentarios;
- logs;
- listas de commits e artefatos;
- resumos e detalhes de validacao.

Ordem preferencial:

1. `scroll-region` com altura controlada;
2. expandir ou recolher secoes;
3. abrir artefato bruto, copiar ou mostrar modal maior quando o scroll local nao bastar.

Regras de texto:

- use `.prose-block` para markdown e texto de leitura;
- use `.mono-block` ou `.log-block` para logs e saida tecnica;
- use `.text-truncate` apenas em titulos ou metadados secundarios;
- use `.text-wrap-anywhere` quando qualquer quebra for preferivel a esconder conteudo.
- quando uma analise longa do QA Runner exceder a area visivel, o corpo pode usar scroll interno dedicado como em `.qa-runner__analysis-body`.

Scroll horizontal so e aceitavel para tabelas ou blocos tecnicos que realmente nao cabem com quebra segura.

## Modais

Todo modal deve:

- usar `.modal-backdrop` e `.modal-shell`;
- declarar `role="dialog"` e `aria-modal="true"`;
- ter titulo rotulado por `aria-labelledby`;
- ter botao de fechar com `aria-label`;
- manter body com scroll interno quando o conteudo crescer;
- continuar legivel em largura estreita.

Nao esconder acoes primarias fora do footer visivel.

## Responsividade

O painel precisa funcionar em:

- aba larga;
- painel medio;
- painel estreito;
- largura muito pequena ou colapsada.

Regras:

- use `grid`, `minmax`, `auto-fit`, `auto-fill` e larguras fluidas;
- evite colunas fixas sem queda para uma coluna;
- nao use alturas fixas quando um `scroll-region` resolver melhor;
- barras laterais fixas devem colapsar ou empilhar quando a largura cair;
- em larguras pequenas, metadados secundarias podem truncar, mas a acao principal nao pode sumir.

Breakpoints hoje relevantes em `styles.css`:

- `680px` para reflow principal;
- `420px` para painel estreito;
- `320px` para painel muito estreito.

## Acessibilidade

Obrigatorio:

- labels visiveis ou `aria-label` em campos e botoes icon-only;
- foco visivel preservado;
- paridade de teclado para elementos clicaveis;
- modal com rotulo claro e fechamento previsivel;
- contraste suficiente com o tema ativo do VS Code;
- nenhuma acao critica fora da viewport sem scroll ou alternativa.

## Estado iniciado

Apos o setup, o primeiro sinal de produto deve ser operacional:

- indicador de ferramenta pronta;
- contadores ou estados de commits, pacote recente e navegador;
- acoes reais para criar pacote, recarregar commits e abrir artefatos;
- navegador interno funcional.

## Regras para futuros agentes

- nao introduza uma segunda linguagem visual na webview;
- nao reintroduza paleta hardcoded em telas como App, QA Runner ou ErrorBoundary;
- reduza estilo inline quando tocar em areas existentes;
- se criar um novo padrao visual, atualize este arquivo e `docs/99-historico-implementacao.md`;
- se mudar o lugar correto para mexer em frontend, atualize `docs/07-roteamento-de-demandas.md`;
- se o ajuste afetar interacao alem de apresentacao, atualize tambem `docs/04-fluxos-principais.md`.
