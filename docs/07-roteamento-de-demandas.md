# Roteamento De Demandas (Manutencao E Refatoracao)

Este guia responde: para uma demanda X, quais arquivos e camadas devem ser alterados.

## Regra principal

Sempre comece pelos contratos e pelo fluxo real do host antes de alterar UI ou gerar artefatos.

## Onde mexer por tipo de request

### 1) Comandos da extensao (Command Palette / Activity Bar)

- Fonte: `packages/extensao-vscode/package.json` em `contributes.commands`.
- Registro runtime: `packages/extensao-vscode/src/host/extensao.ts`.
- Quando atualizar: sempre que entrar/remover comando publico `qassistant.*`.

### 2) Mensagens host <-> webview

- Fonte unica: `packages/extensao-vscode/src/contratos/mensagens.ts`.
- Consumo no host: `packages/extensao-vscode/src/host/painel/provedor-painel.ts`.
- Consumo na UI: `packages/extensao-vscode/src/webview/modulos/App.tsx`.
- Regra: alterou union de mensagem, atualize host e UI no mesmo PR.

### 3) Setup inicial e estrutura do workspace alvo

- Orquestracao de setup: `packages/extensao-vscode/src/host/painel/provedor-painel.ts`.
- Criacao de estrutura: `packages/nucleo/src/scaffold.ts`.
- Modelo de configuracao: `packages/nucleo/src/configuracao.ts`.
- Onboarding guiado e etapas do primeiro uso: `packages/extensao-vscode/src/webview/modulos/App.tsx`.
- Regra: nunca quebrar compatibilidade de `.qassistant/config.json` sem migracao explicita.

### 4) Pacotes de validacao por commits

- Modelo de pacote: `packages/nucleo/src/validacoes.ts`.
- Criacao/disparo na UI: `packages/extensao-vscode/src/webview/modulos/App.tsx`.
- Integracao host: `packages/extensao-vscode/src/host/painel/provedor-painel.ts`.
- Regra: se mudar `pacote.yaml`, revisar leitura em `resolverDetalhesPacote` no host.

### 5) Integracao com Git

- Carregamento de commits: `packages/extensao-vscode/src/host/painel/provedor-painel.ts` (`carregarCommits`).
- Exibicao e selecao: `packages/extensao-vscode/src/webview/modulos/App.tsx`.
- Regra: qualquer novo filtro deve preservar a rastreabilidade dos hashes selecionados.

### 6) OpenProject

- Chave/segredo: `SecretStorage` no host (`qassistant.openProjectApiKey`).
- API e sincronizacao: `packages/extensao-vscode/src/host/painel/provedor-painel.ts`.
- Estado e cards: `packages/extensao-vscode/src/webview/modulos/App.tsx`.
- Validacao de conexao durante onboarding/configuracao: contrato em `packages/extensao-vscode/src/contratos/mensagens.ts`, host em `provedor-painel.ts` e UI em `App.tsx`.
- Regra: na v0.1.x a atualizacao e sob demanda; polling automatico ainda e evolucao futura.

### 7) Execucao de testes pelo painel

- Entrypoint de execucao: `packages/extensao-vscode/src/host/painel/provedor-painel.ts` (`executarTestes`).
- Estrutura de testes alvo: `Qassistant-testes/`.
- Regra: mapear categoria de UI para runner real antes de habilitar botao.

### 8) UI/UX da webview

- Tela principal: `packages/extensao-vscode/src/webview/modulos/App.tsx`.
- Tokens visuais: `packages/extensao-vscode/src/webview/design-system/tokens.css`.
- Estilos gerais: `packages/extensao-vscode/src/webview/styles.css`.
- Regra: manter acoes visiveis sempre operacionais (sem CTA decorativo).

### 9) Criador guiado de prompt de teste

- Contratos: `packages/extensao-vscode/src/contratos/mensagens.ts`.
- Host e composicao do prompt: `packages/extensao-vscode/src/host/painel/provedor-painel.ts`.
- Modal, steps e seletor na UI: `packages/extensao-vscode/src/webview/modulos/App.tsx`.
- Classes compartilhadas do fluxo: `packages/extensao-vscode/src/webview/styles.css`.
- Fonte de verdade dos templates: `Qassistant-testes/**/prompts/criar-teste-*.prompt.md`.
- Regra: o fluxo gera prompt para agente, nao cria teste automaticamente; por isso nao altera `Qassistant-testes/mapa-de-testes.yaml` sozinho.

### 8.1) Padroes compartilhados obrigatorios

- Antes de editar JSX em `App.tsx`, `TestRunnerAba.tsx` ou `ErrorBoundary.tsx`, verifique se o padrao ja existe em `styles.css`.
- Use `--qa-*` como unica camada de tema. Nao use `--vscode-*` direto em componentes.
- Prefira convergir para classes compartilhadas como `panel`, `badge`, `state-chip`, `inline-alert`, `modal-*`, `scroll-region`, `prose-block` e `mono-block`.
- Conteudo longo deve permanecer acessivel por scroll interno, expansao ou abertura do artefato real. Nao cortar relatorios, comentarios ou logs sem rota de acesso.
- Ajustou ou criou padrao visual? Atualize `docs/06-design-system-e-ux.md` e registre em `docs/99-historico-implementacao.md`.

## Checklist rapido antes de fechar um PR

- Atualizou docs tecnicos em `docs/05-nomenclatura-e-contratos.md` quando houve mudanca de contrato?
- Atualizou `docs/04-fluxos-principais.md` quando mudou jornada de usuario?
- Atualizou `docs/99-historico-implementacao.md` para registrar a decisao?
- Evitou alterar arquivos em `packages/extensao-vscode/dist/` manualmente?
- Validou build: `npm run build` na raiz de `QAssistant/`?

## Anti-padroes a evitar

- Alterar apenas a webview sem refletir no contrato zod.
- Criar comandos no host sem declarar em `package.json`.
- Mudar estrutura de pacote de validacao sem atualizar leitura no painel.
- Escrever docs aspiracionais sem marcar o que e "planejado" vs "implementado".
