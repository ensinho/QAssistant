# QAssistant para Visual Studio Code

<p align="center">
  <img src="https://raw.githubusercontent.com/ensinho/QAssistant/main/packages/extensao-vscode/media/qassistant-logo.png" alt="QAssistant Logo" width="128" />
</p>

<p align="center">
  <strong>Hub operacional de QA reativo, integração em tempo real com OpenProject, runner de validações (.sh) e orquestração de Agentes de IA no VS Code.</strong>
</p>

<p align="center">
  <a href="#principais-recursos">Recursos</a> •
  <a href="#guia-rápido-de-configuração">Configuração</a> •
  <a href="#módulos-e-funcionalidades">Módulos</a> •
  <a href="#qa-runner-e-scripts-sh">QA Runner</a> •
  <a href="#terminal-de-agentes">Terminal de Agentes</a>
</p>

---

## 🚀 Principais Recursos

- **OpenProject em Tempo Real**:
  - Acompanhe tarefas, bugs e features com status, responsáveis, prioridades e datas.
  - Notificações instantâneas (toasts) no VS Code ao surgirem novas tarefas ou alterações.
  - Modais responsivos com renderização completa de **Markdown** e histórico de comentários.
  - Criação rápida de tarefas e atualização de status diretamente pelo painel.
- **QA Runner Descentralizado & Scripts Shell**:
  - Descubra e execute scripts de validação (`verify.sh`, `test.sh`, `check.sh`) em qualquer pasta do repositório.
  - **Sem imposição de estrutura**: você decide como organizar seus testes no seu projeto.
  - Console integrado com streaming de logs em tempo real e tempo de execução.
  - Publicação com 1 clique do relatório de validação direto como comentário na tarefa do OpenProject.
- **Terminal & Orquestração de Agentes de IA**:
  - Inicie agentes locais (Claude Code, Gemini CLI, Aider, etc.) com contexto automático da tarefa.
  - Criação padronizada e configurável de branches Git (ex: `feature/OP-1234-meu-slug`).
  - Terminal interativo com botões para envio rápido de comandos.
- **Interface Clean & Responsiva**:
  - Projetada para visualização perfeita tanto em sidebars estreitas quanto em painéis amplos.

---

## 🛠️ Guia Rápido de Configuração

1. **Abra o Painel do QAssistant**:
   - Clique no ícone do QAssistant na barra lateral esquerda de atividades (Activity Bar) do VS Code.
2. **Conecte com o OpenProject**:
   - Acesse a aba **Setup**.
   - Insira a URL da sua instância do OpenProject (ex: `https://openproject.empresa.com.br`) e o ID do seu projeto.
   - Forneça sua **API Key** do OpenProject (gerada em *Minha Conta > Tokens de Acesso > Chaves de API*).
   - Clique em **Validar Conexão** e pronto!

---

## 📂 Módulos e Funcionalidades

### 1. OpenProject Hub
- **Lista de Tarefas**: Filtre tarefas por status, prioridade ou texto.
- **Visualizador com Markdown**: Veja as especificações técnicas com tabelas, blocos de código formatados e listas.
- **Criação Rápida**: Abra o modal para registrar novas histórias ou bugs sem sair do VS Code.
- **Troca de Status**: Mova a tarefa de *Novo* para *Em Progresso*, *Em Teste* ou *Concluído* em segundos.

### 2. QA Runner (.sh & Suítes de Teste)
- **Vinculação Flexível**:
  - Escaneamento automático de scripts `.sh` na raiz ou em pastas customizadas (ex: `scripts/`, `bin/`).
  - Botão para criar um `verify.sh` inicial executável (`chmod +x`) caso seu projeto ainda não tenha um.
  - Suporte a flags e argumentos adicionais por script (ex: `--quick`, `-v`, `--filter`).
- **Logs ao Vivo**:
  - Acompanhe a saída `stdout`/`stderr` enquanto o script roda.
  - Métricas de sucesso/erro e duração precisa.
- **Integração com Tasks**:
  - Selecione a tarefa ativa e clique em **Publicar na Task** para registrar o relatório de execução e logs para a equipe.

### 3. Terminal de Agentes
- Crie a branch da tarefa automaticamente seguindo seu padrão (ex: `{tipo}/OP-{id}-{slug}`).
- Dispare o comando do agente pré-configurado no terminal integrado do VS Code carregando o contexto da issue.
- Botões de ações rápidas (`git status`, `git push`, etc.) personalizáveis.

---

## 📋 Requisitos

- VS Code `1.85.0` ou superior.
- Node.js `18.18.0` ou superior (para execução da extensão).
- Conta/Instância no OpenProject (API v3).

---

## 📄 Licença

Distribuído sob a licença [MIT](https://opensource.org/licenses/MIT).
