# Historico De Implementacao

## 2026-05-21

### Scaffold inicial

- Criado workspace novo em `QAssistant/`.
- Criado pacote `@qassistant/nucleo`.
- Criado pacote `qassistant-vscode`.
- Criado host VS Code com webview React/Vite.
- Build inicial validado.

### Setup guiado

- Implementado wizard inicial na webview.
- Implementada persistencia em `.qassistant/config.json`.
- Implementado scaffold de `Qassistant-testes/`.
- Implementado scaffold de `docs/contexto/`.
- Implementado scaffold de `.github/instructions/` e `.github/skills/`.

### Design system e marca

- Copiados assets oficiais `qassistant-logo.png` e `qassistant-logo-source.svg`.
- Criado SVG dedicado para Activity Bar.
- SVG da Activity Bar passou a usar `currentColor` para acompanhar o tema do VS Code.
- Adicionada camada de tokens `--qa-*` baseada em `--vscode-*`.
- Webview passou a receber o logo oficial por URI resolvida pelo host.
- Cards de modulo ganharam estados e acoes reais.

### Validacoes por commits

- Criado modelo inicial de pacote rascunho.
- Botao de resumos cria pacote em `Qassistant-testes/validacoes/`.
- Selecionador de commits reais via Git adicionado ao painel.
- Pacotes podem nascer com commits selecionados gravados em `commits.yaml` e `resumo-qa.md`.
- Criacao de pacote abre `resumo-qa.md` automaticamente para edicao.
- Botao de validacoes abre o ultimo pacote criado ou a pasta de validacoes.

### Navegacao interna

- Removido uso de abertura de pastas no sistema operacional.
- Diretorios agora sao listados no navegador interno do painel.
- Arquivos continuam abrindo no editor do VS Code.

### Empacotamento

- Gerada VSIX em `packages/extensao-vscode/qassistant-vscode-0.1.1.vsix`.
- Adicionado `.vscodeignore` para evitar incluir fontes e arquivos de desenvolvimento no pacote final.
- Versao de validacao visual atualizada para `0.1.1`, evitando cache de reinstalacao da `0.1.0`.

## 2026-05-22

### Governanca de documentacao e workflow

- Criado `docs/INDEX.md` como porta de entrada da documentacao do QAssistant.
- Criado `docs/07-roteamento-de-demandas.md` com mapa de manutencao/refatoracao por tipo de request.
- Ajustada documentacao para refletir estado atual do OpenProject na v0.1.x (consulta sob demanda).
- Atualizado `docs/05-nomenclatura-e-contratos.md` com comandos reais e mensagens implementadas.
- Adicionadas instrucoes e skills na raiz `.github/` para orientar futuros agentes sobre roteamento tecnico e manutencao segura.

### Padronizacao inicial do frontend da webview

- Expandida a documentacao de design system e UX com regras explicitas para tokens, estados, modais, overflow, responsividade e acessibilidade.
- Adicionada instrucao dedicada para frontend do QAssistant em `.github/instructions/qassistant-frontend.instructions.md`.
- Estendida a camada compartilhada da webview com tokens semanticos, overlays, superficies de codigo, scroll-regions, estados padrao, skeletons, spinners e shell de modal.
- ErrorBoundary passou a usar a linguagem visual da webview em vez de cores hardcoded.
- Modais de OpenProject passaram a convergir para o shell compartilhado da webview.
- QA Runner em aba dedicada passou a usar um shell responsivo compartilhado, com status, sidebar e paineis internos apoiados por classes em `styles.css` e tokens `--qa-*`.
- Tela principal passou a reaproveitar classes compartilhadas para cards de resumo, blocos de telemetria, alertas e cards de recursos da aba de testes, reduzindo variantes inline repetidas.
- Corrigidos os limites de altura do painel de "Relatório de Execução" no QA Runner para devolver o scroll interno do corpo do relatório.
- O wizard de commits passou a usar um shell padronizado para lista e cards de commit, evitando conteudo colado nas bordas.
- O runner embutido da aba principal e as superfices restantes de modal do OpenProject passaram a convergir para classes compartilhadas de layout, campos e cards de comentario/resumo.
- Ajustado o corpo da analise Gemini para permitir scroll interno quando o texto exceder a altura disponivel.
- Reforcado o padding do shell de commits e dos cards internos para corrigir a aparencia "colada" no wizard de selecao.
