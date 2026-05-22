# QAssistant

QAssistant e uma nova extensao VS Code focada em QA operacional, OpenProject, resumos por commits, organizacao de testes e uso assistido de agents.

Este projeto nasce separado do legado `project-ai-cli`. O legado pode ser usado como referencia tecnica, mas nao guia a arquitetura, os nomes, o storage, os comandos ou o VSIX novo.

## Decisoes fechadas

- Produto novo, pasta nova e VSIX novo.
- Nome publico e tecnico: QAssistant.
- Webview em React + Vite + TypeScript.
- Host da extensao em TypeScript usando a API nativa do VS Code.
- Estrutura operacional fixa no projeto alvo: `Qassistant-testes/`.
- Contexto do projeto alvo em `docs/contexto/`.
- Assets reconhecidos automaticamente pelo Copilot em `.github/instructions/` e `.github/skills/`.
- IA como apoio para sugestoes, cenarios, lacunas e checklists, sem geracao automatica cega de testes.
- OpenProject com vinculo real de task e consulta de status/detalhes sob demanda na v0.1.x.

## Documentos

- [docs/INDEX.md](docs/INDEX.md)
- [docs/00-visao-do-produto.md](docs/00-visao-do-produto.md)
- [docs/01-arquitetura.md](docs/01-arquitetura.md)
- [docs/02-scaffold-repositorio.md](docs/02-scaffold-repositorio.md)
- [docs/03-estrutura-qassistant-testes.md](docs/03-estrutura-qassistant-testes.md)
- [docs/04-fluxos-principais.md](docs/04-fluxos-principais.md)
- [docs/05-nomenclatura-e-contratos.md](docs/05-nomenclatura-e-contratos.md)
- [docs/06-design-system-e-ux.md](docs/06-design-system-e-ux.md)
- [docs/07-roteamento-de-demandas.md](docs/07-roteamento-de-demandas.md)
- [docs/99-historico-implementacao.md](docs/99-historico-implementacao.md)
