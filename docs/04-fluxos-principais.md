# Fluxos Principais

## 1. Setup inicial guiado

1. Usuario abre o painel do QAssistant.
2. Empty state informa que o workspace ainda nao foi inicializado.
3. Usuario inicia setup.
4. QAssistant coleta caminhos customizados do projeto.
5. QAssistant configura OpenProject quando o usuario quiser.
6. QAssistant cria `Qassistant-testes/`.
7. QAssistant cria `docs/contexto/` na raiz do projeto alvo.
8. QAssistant cria `.github/instructions/` e `.github/skills/` quando necessario.
9. Painel muda para estado pronto.

## 2. Resumo QA por commits

1. Usuario abre modulo Resumos.
2. QAssistant lista commits candidatos.
3. Usuario remove ou inclui commits na rodada.
4. QAssistant gera resumo QA.
5. QAssistant gera guia de validacao e cenarios sugeridos.
6. QAssistant persiste pacote em `Qassistant-testes/validacoes/`.
7. Usuario cria ou vincula task real no OpenProject.
8. QAssistant registra o vinculo e permite consultar status/detalhes sob demanda.

## 3. Validacao por commits

1. Usuario abre pacote de validacao.
2. QAssistant mostra resumo, commits, task, guia e cenarios.
3. Usuario abre prompt de validacao para usar com Copilot/agent.
4. Usuario cria ou ajusta testes manualmente com apoio dos prompts.
5. Usuario executa testes pelo painel quando houver comando configurado.
6. QAssistant registra resultados e evidencias.

### Implementacao atual

- O painel carrega commits reais via Git e permite selecionar quais entram no pacote.
- O painel cria um pacote rascunho em `Qassistant-testes/validacoes/` com ou sem commits selecionados.
- O pacote inclui `pacote.yaml`, `resumo-qa.md`, `commits.yaml`, `guia-de-validacao.prompt.md`, `openproject.yaml`, `snapshots-openproject/`, `evidencias/` e `resultados/`.
- Apos criar o pacote, o QAssistant abre `resumo-qa.md` no editor para edicao imediata.
- O navegador interno mostra as pastas e arquivos do QAssistant sem abrir pastas reais do sistema operacional.

## 4. Testes

1. Usuario abre modulo Testes.
2. QAssistant mostra mapa, contadores, tipos e estrutura.
3. Usuario escolhe tipo de teste.
4. QAssistant oferece prompt especifico do tipo.
5. IA pode sugerir cenarios e lacunas.
6. Usuario executa testes existentes ou abre pastas/arquivos para edicao.

## 5. OpenProject

1. Usuario configura URL, projeto e credenciais.
2. QAssistant testa acesso.
3. QAssistant cria, vincula ou atualiza task de validacao.
4. QAssistant lista tasks e busca status/detalhes sob demanda no painel.
5. Snapshots sao salvos no pacote de validacao.

## Regra de fluxo dinamico

Todo botao visivel precisa executar uma acao real.

Estados permitidos:

- executar fluxo completo;
- abrir arquivo ou pasta relevante;
- navegar internamente pela estrutura operacional;
- mover foco para etapa configuravel;
- criar artefato rascunho;
- informar claramente o bloqueio quando a acao depende de setup.

Estados proibidos:

- botoes decorativos;
- cards clicaveis sem feedback;
- mensagens genericas de "em breve" sem alternativa operacional.

## Regra de navegacao

O QAssistant nao deve usar `revealFileInOS` para abrir pastas reais no sistema operacional.

Diretorios sao listados no navegador interno da webview. Arquivos podem ser abertos no editor do VS Code, pois isso mantem a operacao dentro do ambiente de trabalho do usuario.
