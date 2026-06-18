# QAssistant

> Extensão para VS Code que transforma **commits em rodadas de teste rastreáveis**, integra com o **OpenProject** e apoia a QA com IA — sem geração cega de testes.

QAssistant é uma extensão de **QA operacional**: a partir dos commits do seu workspace, você monta pacotes de validação, gera resumos de impacto e baterias de teste com IA (Gemini), executa suítes locais e publica o resultado direto em uma task do OpenProject — tudo sem sair do editor.

A IA atua como **apoio** (sugestões, cenários, lacunas, checklists). A revisão humana de todo conteúdo sugerido é obrigatória.

---

## O que faz

- **Pacotes de validação por commits** — selecione commits recentes (de um ou vários repositórios do workspace) e gere um pacote rastreável com `resumo-qa.md`, `commits.yaml` e guia de validação.
- **Resumo de impacto com IA** — analisa os commits do pacote e preenche um relatório estruturado de impacto de QA.
- **Sugestão de bateria de testes** — gera cenários Playwright e manuais a partir do resumo.
- **QA Runner integrado** — executa suítes de teste locais por categoria, com logs ao vivo, métricas (passou/falhou) e um painel de **falhas detalhadas** com severidade (`HIGH` / `MEDIUM` / `LOW`).
- **Integração com OpenProject** — valida conexão, lista work packages, publica/atualiza descrição via `resumo-qa.md`, consulta status, comenta e altera status de tasks (sob demanda).
- **Navegador interno de artefatos** — explore as pastas de `Qassistant-testes/` e abra arquivos sem sair do painel.
- **Criador de prompts de teste** — monta um prompt parametrizado (arquivos, pastas, contexto, observações) pronto para usar no seu agente.

---

## Fluxo principal

```
1. Selecionar commits   →   2. Revisar pacote   →   3. Gerar pacote + IA + publicar
```

1. **Setup** — abra o workspace, informe o projeto e (opcional) conecte o OpenProject.
2. **Commits** — escolha os commits da rodada (filtre por repositório).
3. **Revisar** — confira a composição do pacote.
4. **Gerar** — crie o pacote; rode o resumo de impacto e a sugestão de testes com IA.
5. **Publicar** — envie o relatório para uma task do OpenProject (nova ou existente).
6. **Executar** — rode as suítes pelo QA Runner e acompanhe falhas e relatórios.

---

## Instalação e build

Pré-requisitos: **Node.js ≥ 18** e **VS Code**.

```bash
npm install                    # instala dependências do monorepo

npm run build                  # compila todos os pacotes
npm run dev:webview            # Vite dev server (hot-reload da webview)

npm run package:vsix           # gera o .vsix
npm run package:vsix:install   # gera e instala no VS Code
```

Outros scripts úteis:

```bash
npm run build:nucleo           # compila apenas @qassistant/nucleo
npm run build:extensao         # compila a extensão (webview + host)
npm run test                   # type-check de todos os pacotes
npm run clean                  # remove dist/ e .tsbuildinfo
```

Após instalar o `.vsix`, abra o painel do QAssistant na barra lateral e siga o setup guiado.

---

## Configuração

A configuração fica em `.qassistant/config.json` no workspace alvo (schema validado por Zod em `@qassistant/nucleo`):

| Campo | Descrição |
| --- | --- |
| `projeto.nome` | Nome do projeto exibido no painel. |
| `caminhos.raizCodigo` | Pasta principal do código. |
| `caminhos.frontend` / `backend` | Pastas opcionais por stack. |
| `caminhos.repositorios` | **Opcional.** Lista de repositórios Git a escanear (relativos à raiz). Vazio = descoberta automática de `.git`. |
| `openProject.urlBase` / `projetoId` | Conexão com o OpenProject. |
| `resumos.commitsPadrao` | Quantidade padrão de commits por rodada. |

**Segredos** (chave do Gemini e token do OpenProject) ficam no `SecretStorage` do VS Code — **nunca** em arquivos de configuração.

### Estrutura criada no setup

```
Qassistant-testes/      # raiz operacional de testes (fixa)
docs/contexto/          # contexto do projeto (opcional)
.github/instructions/   # instruções para agentes (opcional)
.github/skills/         # skills para agentes (opcional)
.qassistant/config.json # configuração
```

---

## Arquitetura

Monorepo com separação estrita de camadas:

```
packages/nucleo/          → @qassistant/nucleo   (lógica de domínio pura, sem VS Code)
packages/extensao-vscode/ → qassistant-vscode    (host + webview)
```

- **`@qassistant/nucleo`** — tipos, schema/validação de configuração (Zod), scaffold do workspace e constantes. Sem dependências do VS Code.
- **Host** (`src/host/`) — ciclo de vida da extensão, comandos, providers de webview, integração Git, sistema de arquivos e chamadas ao OpenProject.
- **Webview** (`src/webview/`) — app **React 19 + Vite**. Comunica-se com o host exclusivamente via `postMessage`, com contratos validados por Zod (`src/contratos/mensagens.ts`).

O design system usa variáveis de tema do VS Code mapeadas para tokens `--qa-*`, respeitando temas claro/escuro.

---

## Documentação

Decisões de arquitetura e specs de produto vivem em [`docs/`](docs/INDEX.md):

- [Visão do produto](docs/00-visao-do-produto.md)
- [Arquitetura](docs/01-arquitetura.md)
- [Scaffold do repositório](docs/02-scaffold-repositorio.md)
- [Estrutura de `Qassistant-testes/`](docs/03-estrutura-qassistant-testes.md)
- [Fluxos principais](docs/04-fluxos-principais.md)
- [Nomenclatura e contratos](docs/05-nomenclatura-e-contratos.md)
- [Design system e UX](docs/06-design-system-e-ux.md)
- [Roteamento de demandas](docs/07-roteamento-de-demandas.md)

---

## Limitações conhecidas (v2.0.x)

- O **QA Runner** tem executor configurado para as suítes de ponta a ponta (Playwright); demais categorias dependem de configuração adicional.
- A integração com OpenProject é **sob demanda** — ainda não há polling automático.
- Os prompts de IA são voltados ao contexto do projeto alvo e ainda não são externalizáveis por arquivo.
