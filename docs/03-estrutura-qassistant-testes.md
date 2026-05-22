# Estrutura Qassistant-testes

`Qassistant-testes/` e a raiz fixa da operacao de QA criada no workspace do projeto alvo.

## Arvore inicial

```text
Qassistant-testes/
  README.md
  mapa-de-testes.yaml
  regras-de-teste.md
  prompts/
    guia-validacao-commits.prompt.md
    revisar-cobertura-testes.prompt.md
    sugerir-cenarios-qa.prompt.md
  validacoes/
    README.md
    YYYY-MM-DD-HHMM-slug/
      pacote.yaml
      resumo-qa.md
      commits.yaml
      guia-de-validacao.prompt.md
      openproject.yaml
      snapshots-openproject/
      evidencias/
      resultados/
  evidencias/
  relatorios/
  testes-unitarios/
    prompts/
      criar-teste-unitario.prompt.md
    backend/
    frontend/
  testes-de-integracao/
    prompts/
      criar-teste-integracao.prompt.md
    backend/
    frontend/
  testes-de-componentes/
    prompts/
      criar-teste-componente.prompt.md
    frontend/
  testes-de-ponta-a-ponta/
    prompts/
      criar-teste-ponta-a-ponta.prompt.md
    fluxos/
    auxiliares/
    dados/
    evidencias/
    execucoes/
  testes-de-usabilidade/
    prompts/
      criar-teste-usabilidade.prompt.md
    fluxos/
    evidencias/
    relatorios/
  testes-de-acessibilidade/
    prompts/
      criar-teste-acessibilidade.prompt.md
    fluxos/
    relatorios/
  testes-de-desempenho/
    prompts/
      criar-teste-desempenho.prompt.md
    scripts/
    relatorios/
  testes-de-carga/
    prompts/
      criar-teste-carga.prompt.md
    scripts/
    relatorios/
```

## Pacotes de validacao

Cada rodada por commits deve criar uma pasta dentro de `Qassistant-testes/validacoes/`.

```text
Qassistant-testes/validacoes/2026-05-21-qa-1234/
  pacote.yaml
  resumo-qa.md
  commits.yaml
  guia-de-validacao.prompt.md
  openproject.yaml
  snapshots-openproject/
    2026-05-21T10-30-00.yaml
  evidencias/
  resultados/
```

Arquivos gerados hoje no rascunho:

- `pacote.yaml`: metadados, status, vinculo OpenProject e referencias dos artefatos;
- `resumo-qa.md`: resumo editavel de impacto, riscos e evidencias esperadas;
- `commits.yaml`: commits incluidos, removidos e observacoes;
- `guia-de-validacao.prompt.md`: prompt operacional para agent sugerir validacao;
- `openproject.yaml`: snapshot minimo da task vinculada;
- `snapshots-openproject/`: historico futuro de polling;
- `evidencias/`: anexos da rodada;
- `resultados/`: saidas estruturadas da validacao.

## Regras

- O setup nao sobrescreve arquivos existentes sem confirmacao.
- Prompts especificos ficam dentro da pasta do tipo de teste.
- Prompts gerais ficam em `Qassistant-testes/prompts/`.
- Evidencias de uma rodada podem ficar no pacote de validacao quando estiverem ligadas a commits especificos.
- Evidencias gerais podem ficar em `Qassistant-testes/evidencias/`.
- Todo pacote novo nasce com `status: "rascunho"` para permitir revisao humana antes de gerar testes, comentarios ou vinculacoes externas.
