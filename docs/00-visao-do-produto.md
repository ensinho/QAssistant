# Visao Do Produto

QAssistant sera uma extensao VS Code para organizar o ciclo de QA dentro do proprio workspace do usuario.

O produto nao deve tentar substituir o desenvolvedor, o tester ou o agent. Ele deve preparar a estrutura, gerar contexto util, organizar prompts, vincular OpenProject, acompanhar validacoes e facilitar a criacao e execucao de testes revisaveis.

## Objetivo principal

Transformar commits selecionados em uma rodada rastreavel de validacao de QA.

Cada rodada deve reunir:

- resumo tecnico dos commits;
- commits incluidos e removidos da rodada;
- impacto esperado;
- prompt ou guia de validacao;
- cenarios de teste sugeridos;
- task real vinculada no OpenProject;
- snapshots e atualizacoes da task consultadas sob demanda no painel;
- evidencias e resultados de testes quando existirem.

## Modulos do produto

1. Setup guiado
2. OpenProject
3. Resumos por commits
4. Validacoes por commits
5. Testes
6. IA complementar
7. Configuracao

## Papel da IA

A IA deve ajudar com sugestoes, cenarios, lacunas, checklists e revisao.

A IA nao deve ser o caminho principal para gerar codigo de teste automaticamente dentro do painel. O caminho principal e preparar prompts bons para o usuario trabalhar com Copilot/agent, com revisao humana.

## Principios de UX

- Empty states claros e acionaveis.
- Jornada guiada para setup inicial.
- Fluxos curtos para tarefas frequentes.
- Rastreamento visivel entre commits, resumo, testes, evidencias e OpenProject.
- Nada de nomes legados do `project-ai-cli`.
