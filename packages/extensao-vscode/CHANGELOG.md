# Changelog

Todas as alterações notáveis no projeto **QAssistant** serão documentadas neste arquivo.

## [2.0.1] - 2026-10-23

### 🎨 Melhorias de UI / UX & Responsividade
- **Feed Ultra-Clean (Estilo Linear / Raycast):**
  - Redesenho de alta densidade dos cards de tarefas, reduzindo altura vertical em 50% sem perda de legibilidade.
  - Micro-dots indicativos de status com acento visual lateral e botões de ação rápida discretos (`>_ Terminal`, `Copiar Prompt`, `Link`).
  - Barra de busca, botão `+ Nova` e recarregar posicionados em linha única compacta e responsiva.
  - Abas superiores em estilo controle segmentado com barra de rolagem oculta.
- **Filtros Fluidos:**
  - Chips de filtragem com contadores em tempo real e rolagem horizontal suave.

## [2.0.0] - 2026-10-21

### ✨ Adicionado
- **Integração Completa com OpenProject**:
  - Sincronização em tempo real de tarefas via API v3 com suporte a Basic Auth e HTTPS.
  - Modais interativos com renderização rica de Markdown (GFM) e histórico de comentários.
  - Notificações visuais flutuantes (toasts) no VS Code ao detectar novas tarefas ou alterações de status.
  - Criação rápida de tarefas e troca de status direto pelo painel.
- **QA Runner com Foco em Scripts Shell**:
  - Descoberta automática de scripts `.sh` / `.bash` (`verify.sh`, `test.sh`, `check.sh`).
  - Liberdade total na organização de testes: remoção da obrigatoriedade da estrutura de pastas pré-definida.
  - Vinculação de pastas customizadas ou arquivos `.sh` específicos de qualquer local do repositório.
  - Botão com 1 clique para gerar um `verify.sh` inicial executável (`chmod +x`).
  - Terminal de logs em tempo real integrado no webview.
  - Publicação de relatórios de validação com logs resumidos diretamente na tarefa do OpenProject.
- **Terminal de Agentes de IA**:
  - Criação padronizada e configurável de branches (ex: `{tipo}/OP-{id}-{slug}`).
  - Integração com agentes de terminal (Claude Code, Gemini CLI, Aider, custom).
  - Ações rápidas de git e comando customizados.
- **Setup Simples e Intuitivo**:
  - Configuração de URL, ID do projeto e token seguro com validação instantânea.

### 🎨 Melhorias de UI / UX
- Interface redesenhada com tipografia limpa, paleta moderna e visual responsivo tanto para sidebars estreitas quanto para telas amplas.
- Animações sutis e estados vazios com ações claras de onboarding.
