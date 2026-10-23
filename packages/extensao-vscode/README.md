# QAssistant para Visual Studio Code

<p align="center">
  <img src="https://raw.githubusercontent.com/ensinho/QAssistant/main/packages/extensao-vscode/media/qassistant-logo.png" alt="QAssistant Logo" width="128" />
</p>

<p align="center">
  <strong>O hub definitivo para desenvolvedores e QAs no VS Code: OpenProject em tempo real, orquestração de Agentes de IA e Runner de testes sem imposição de estrutura.</strong>
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=EnzoEsmeraldo.qassistant-vscode"><img src="https://img.shields.io/visual-studio-marketplace/v/EnzoEsmeraldo.qassistant-vscode?color=2fc7d2&label=Marketplace&logo=visual-studio-code" alt="Marketplace Version" /></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=EnzoEsmeraldo.qassistant-vscode"><img src="https://img.shields.io/visual-studio-marketplace/i/EnzoEsmeraldo.qassistant-vscode?color=blue&label=Installs" alt="Installs" /></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=EnzoEsmeraldo.qassistant-vscode"><img src="https://img.shields.io/visual-studio-marketplace/r/EnzoEsmeraldo.qassistant-vscode?color=brightgreen&label=Rating" alt="Rating" /></a>
  <a href="https://github.com/ensinho/QAssistant/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
</p>

<p align="center">
  <a href="#-visão-geral">Visão Geral</a> •
  <a href="#-principais-recursos">Recursos</a> •
  <a href="#-capturas-de-tela">Prints</a> •
  <a href="#-guia-de-configuração">Configuração</a> •
  <a href="#-qa-runner--scripts-sh">QA Runner</a> •
  <a href="#-terminal-de-agentes-ia">Terminal de Agentes</a>
</p>

---

## 🌟 Visão Geral

O **QAssistant** conecta o seu fluxo de desenvolvimento e testes diários diretamente ao ecossistema do seu time:
1. **Tarefas do OpenProject no seu editor** — Acompanhe status, crie novas tasks, filtre por prioridade e leia especificações com suporte completo a Markdown.
2. **Terminal de Agentes de IA** — Inicie agentes locais como **Claude Code**, **Gemini CLI** ou **Aider** carregando automaticamente o contexto da tarefa e criando branches Git padronizadas com 1 clique.
3. **QA Runner Descentralizado** — Execute scripts shell (`verify.sh`, `test.sh`, `check.sh`) ou suítes de teste de qualquer diretório do seu repositório, com logs ao vivo e publicação do relatório de validação direto na tarefa.

---

## 📸 Capturas de Tela

<p align="center">
  <strong>Feed de Tarefas & Gestão Rápida (Estilo Linear / Raycast)</strong><br />
  <em>Cards de alta densidade, micro-dots indicativos de status, filtros reativos e ações rápidas.</em><br /><br />
  <img src="https://raw.githubusercontent.com/ensinho/QAssistant/main/packages/extensao-vscode/media/screenshot-feed-clean.png" alt="Feed do OpenProject no QAssistant" width="420" />
</p>

<br />

<p align="center">
  <strong>Terminal & Orquestração de Agentes de IA</strong><br />
  <em>Injeção automática do contexto da task, criação de branches padronizadas e atalhos rápidos.</em><br /><br />
  <img src="https://raw.githubusercontent.com/ensinho/QAssistant/main/packages/extensao-vscode/media/screenshot-terminal-agents.png" alt="Terminal e Agentes no QAssistant" width="420" />
</p>

<br />

<p align="center">
  <strong>QA Runner Descentralizado (.sh / scripts)</strong><br />
  <em>Sem pastas obrigatórias: descubra scripts em qualquer local e publique o relatório de execução na task.</em><br /><br />
  <img src="https://raw.githubusercontent.com/ensinho/QAssistant/main/packages/extensao-vscode/media/screenshot-qa-runner.png" alt="QA Runner no QAssistant" width="420" />
</p>

---

## 🚀 Principais Recursos

### 1. 📋 Feed do OpenProject em Tempo Real
- **Notificações Instantâneas (LiveSync)**: Identificação em tempo real de novas tarefas ou alterações de status.
- **Filtros Inteligentes**: Filtre tarefas em um clique por *Novas*, *Minhas*, *Para QA*, *Bugs*, *Em Andamento* e *Urgentes*.
- **Visualizador Rico**: Especificações com tabelas, blocos de código formatados e histórico de comentários.
- **Criação e Atualização Rápida**: Abra novas histórias/bugs ou altere status diretamente pelo painel.

### 2. 🤖 Terminal & Orquestração de Agentes IA
- **Contexto Pré-Carregado**: Envie a descrição técnica da tarefa para o agente (Claude Code, Gemini CLI, Aider) sem precisar copiar e colar dados manualmente.
- **Branches Padronizadas**: Gere branches Git configuráveis automaticamente (ex: `feat/OP-{id}-{slug}`, `bugfix/OP-{id}-{slug}`).
- **Atalhos Produtivos**: Comandos rápidos de git e build direto no terminal integrado.

### 3. 🧪 QA Runner Sem Imposição de Estrutura
- **Liberdade Total de Organização**: Nenhuma pasta pré-fixada é imposta. Aponte para qualquer pasta de testes do seu repositório ou use a raiz.
- **Auto-Discovery de Scripts**: Reconhece scripts executáveis como `verify.sh`, `test.sh`, `check.sh`.
- **Gerador de `verify.sh`**: Cria um script inicial de verificação (`chmod +x`) com 1 clique caso seu projeto ainda não possua um.
- **Publicação na Task**: Registre métricas de sucesso, tempo decorrido e resumo dos logs como comentário oficial na tarefa do OpenProject.

---

## 🛠️ Guia de Configuração

1. Instale o **QAssistant** pela [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=EnzoEsmeraldo.qassistant-vscode).
2. Abra a aba lateral do QAssistant na barra de atividades do VS Code.
3. Na aba **Ajustes**, configure:
   - **URL Base do OpenProject** (ex: `https://openproject.suaempresa.com.br`)
   - **ID do Projeto**
   - **API Key** (gerada no OpenProject em *Minha Conta > Tokens de Acesso > Chaves de API*)
4. Clique em **Salvar e Validar Conexão**. As tarefas serão sincronizadas imediatamente!

---

## 💡 Dicas de Uso

- **Largura da Barra Lateral**: A interface é 100% fluida e se adapta desde barras laterais ultra-estreitas (< 260px) até telas amplas.
- **Segurança**: Seus tokens de acesso são armazenados com segurança no `SecretStorage` nativo do VS Code e nunca são salvos em arquivos do repositório.

---

## 📄 Licença

Distribuído sob a licença [MIT](https://github.com/ensinho/QAssistant/blob/main/LICENSE). Criado com foco em produtividade, clareza e controle por **Enzo Esmeraldo**.
