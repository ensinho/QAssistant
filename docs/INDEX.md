# Indice De Documentacao QAssistant

Este indice e a porta de entrada para entender o QAssistant rapidamente.

## Ordem recomendada para leitura

1. `00-visao-do-produto.md`
2. `01-arquitetura.md`
3. `04-fluxos-principais.md`
4. `05-nomenclatura-e-contratos.md`
5. `07-roteamento-de-demandas.md`

## Mapa de documentos

- `00-visao-do-produto.md`: objetivo, modulos e principios de UX.
- `01-arquitetura.md`: stack, camadas, responsabilidades e estado tecnico atual.
- `02-scaffold-repositorio.md`: desenho inicial de estrutura e escopo.
- `03-estrutura-qassistant-testes.md`: estrutura operacional gerada no workspace alvo.
- `04-fluxos-principais.md`: setup, resumo por commits, validacoes, testes e OpenProject.
- `05-nomenclatura-e-contratos.md`: namespaces, contratos host/webview e estado de painel.
- `06-design-system-e-ux.md`: tokens e regras de interface da webview.
- `07-roteamento-de-demandas.md`: guia pratico de manutencao/refatoracao por tipo de request.
- `99-historico-implementacao.md`: linha do tempo de decisoes e entregas.

## Fontes de verdade no codigo

- Manifest da extensao e comandos: `packages/extensao-vscode/package.json`.
- Contratos de mensagens e estado do painel: `packages/extensao-vscode/src/contratos/mensagens.ts`.
- Fluxo host/painel: `packages/extensao-vscode/src/host/painel/provedor-painel.ts`.
- Scaffolding de workspace e assets de agent: `packages/nucleo/src/scaffold.ts`.
- Estrutura e conteudo de pacote de validacao: `packages/nucleo/src/validacoes.ts`.
- Configuracao e inspecao de estrutura: `packages/nucleo/src/configuracao.ts`.
