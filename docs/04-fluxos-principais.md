# Fluxos Principais

## 1. Setup inicial guiado

1. Usuario abre o painel do QAssistant.
2. Se nao houver configuracao, o painel entra em modo de onboarding guiado e ocupa o fluxo principal.
3. A etapa inicial explica o produto, as integracoes disponiveis e o que sera criado no workspace.
4. A etapa de OpenProject vem ativa por padrao, preenche a URL base, pede o token primeiro e oferece link direto para gerar um novo token.
5. Depois de validar o token, QAssistant lista os projetos visiveis para esse acesso e permite selecionar um deles sem digitar identificadores manualmente.
6. A etapa de projeto coleta o essencial: nome, caminhos principais e criacao opcional de contexto/instructions/skills, incluindo selecao de pastas pelo picker nativo do VS Code.
7. QAssistant cria `Qassistant-testes/`.
8. QAssistant cria `docs/contexto/` com `INDEX.md` na raiz do projeto alvo, quando habilitado.
9. QAssistant cria `.github/instructions/` e `.github/skills/` quando necessario.
10. Painel muda para estado pronto.

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
4. QAssistant oferece prompt especifico do tipo com leitura obrigatoria de regras, mapa, contexto e instructions/skills.
5. IA pode sugerir cenarios e lacunas, mas sempre preservando revisao humana.
6. Usuario executa testes existentes ou abre pastas/arquivos para edicao.
7. Quando a cobertura muda, `Qassistant-testes/mapa-de-testes.yaml` deve ser atualizado na mesma entrega.

### Criacao guiada de prompt para agente

1. Usuario abre o criador guiado na aba de Testes.
2. Escolhe o tipo de teste e, quando necessario, a stack alvo (frontend ou backend).
3. Informa objetivo, contexto adicional e observacoes/cenarios prioritarios.
4. Pode navegar por arquivos e pastas do workspace em um seletor interno, sem sequestrar o navegador principal do painel.
5. Se houver pacote ativo em `Qassistant-testes/validacoes/`, o criador pode aproveitar automaticamente objetivo, resumo e arquivos sugeridos.
6. QAssistant adapta o template base do tipo escolhido com os parametros informados.
7. O prompt final e salvo na pasta de prompts gerados do tipo, aberto no editor e copiado para a area de transferencia.
8. O fluxo gera prompt para o agente; ele nao cria automaticamente o teste nem altera `Qassistant-testes/mapa-de-testes.yaml` sozinho.

## 5. OpenProject

1. Usuario configura URL e token de acesso.
2. QAssistant testa a credencial em `/api/v3/users/me` e salva o token validado nos secrets do VS Code.
3. A mesma validacao consulta a lista de projetos disponiveis para o token e devolve a selecao para a webview.
4. Usuario escolhe o projeto diretamente da lista carregada; quando necessario, o identificador tecnico continua aceito como compatibilidade.
5. QAssistant cria, vincula ou atualiza task de validacao.
6. QAssistant lista tasks e busca status/detalhes sob demanda no painel.
7. Snapshots sao salvos no pacote de validacao.

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
