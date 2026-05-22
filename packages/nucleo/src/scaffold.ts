import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  ConfiguracaoQAssistant,
  DIRETORIO_INSTRUCTIONS,
  DIRETORIO_SKILLS,
  RAIZ_CONTEXTO_PROJETO,
  RAIZ_TESTES_QASSISTANT,
  ResultadoScaffoldWorkspace,
} from './tipos';
import { inspecionarEstruturaWorkspace, salvarConfiguracaoWorkspace } from './configuracao';

export function inicializarWorkspaceQAssistant(raizWorkspace: string, configuracao: ConfiguracaoQAssistant): ResultadoScaffoldWorkspace {
  const criados: string[] = [];
  const preservados: string[] = [];
  const resultadoConfiguracao = salvarConfiguracaoWorkspace(raizWorkspace, configuracao);
  const relativaConfiguracao = paraPosix(path.relative(raizWorkspace, resultadoConfiguracao.caminho));
  criados.push(relativaConfiguracao);

  criarEstruturaTestes(raizWorkspace, criados, preservados);
  if (resultadoConfiguracao.configuracao.setup.criarContextoProjeto) {
    criarContextoProjeto(raizWorkspace, criados, preservados);
  }
  if (resultadoConfiguracao.configuracao.setup.criarAssetsAgent) {
    criarAssetsAgent(raizWorkspace, criados, preservados);
  }

  return {
    configuracaoPath: relativaConfiguracao,
    criados,
    preservados,
    estrutura: inspecionarEstruturaWorkspace(raizWorkspace),
    configuracao: resultadoConfiguracao.configuracao,
  };
}

function criarEstruturaTestes(raizWorkspace: string, criados: string[], preservados: string[]): void {
  const diretorios = [
    RAIZ_TESTES_QASSISTANT,
    `${RAIZ_TESTES_QASSISTANT}/prompts`,
    `${RAIZ_TESTES_QASSISTANT}/validacoes`,
    `${RAIZ_TESTES_QASSISTANT}/evidencias`,
    `${RAIZ_TESTES_QASSISTANT}/relatorios`,
    `${RAIZ_TESTES_QASSISTANT}/testes-unitarios/prompts`,
    `${RAIZ_TESTES_QASSISTANT}/testes-unitarios/backend`,
    `${RAIZ_TESTES_QASSISTANT}/testes-unitarios/frontend`,
    `${RAIZ_TESTES_QASSISTANT}/testes-de-integracao/prompts`,
    `${RAIZ_TESTES_QASSISTANT}/testes-de-integracao/backend`,
    `${RAIZ_TESTES_QASSISTANT}/testes-de-integracao/frontend`,
    `${RAIZ_TESTES_QASSISTANT}/testes-de-componentes/prompts`,
    `${RAIZ_TESTES_QASSISTANT}/testes-de-componentes/frontend`,
    `${RAIZ_TESTES_QASSISTANT}/testes-de-ponta-a-ponta/prompts`,
    `${RAIZ_TESTES_QASSISTANT}/testes-de-ponta-a-ponta/fluxos`,
    `${RAIZ_TESTES_QASSISTANT}/testes-de-ponta-a-ponta/auxiliares`,
    `${RAIZ_TESTES_QASSISTANT}/testes-de-ponta-a-ponta/dados`,
    `${RAIZ_TESTES_QASSISTANT}/testes-de-ponta-a-ponta/evidencias`,
    `${RAIZ_TESTES_QASSISTANT}/testes-de-ponta-a-ponta/execucoes`,
    `${RAIZ_TESTES_QASSISTANT}/testes-de-usabilidade/prompts`,
    `${RAIZ_TESTES_QASSISTANT}/testes-de-usabilidade/fluxos`,
    `${RAIZ_TESTES_QASSISTANT}/testes-de-usabilidade/evidencias`,
    `${RAIZ_TESTES_QASSISTANT}/testes-de-usabilidade/relatorios`,
    `${RAIZ_TESTES_QASSISTANT}/testes-de-acessibilidade/prompts`,
    `${RAIZ_TESTES_QASSISTANT}/testes-de-acessibilidade/fluxos`,
    `${RAIZ_TESTES_QASSISTANT}/testes-de-acessibilidade/relatorios`,
    `${RAIZ_TESTES_QASSISTANT}/testes-de-desempenho/prompts`,
    `${RAIZ_TESTES_QASSISTANT}/testes-de-desempenho/scripts`,
    `${RAIZ_TESTES_QASSISTANT}/testes-de-desempenho/relatorios`,
    `${RAIZ_TESTES_QASSISTANT}/testes-de-carga/prompts`,
    `${RAIZ_TESTES_QASSISTANT}/testes-de-carga/scripts`,
    `${RAIZ_TESTES_QASSISTANT}/testes-de-carga/relatorios`,
  ];

  for (const relativo of diretorios) {
    garantirDiretorio(raizWorkspace, relativo, criados, preservados);
  }

  escreverArquivoSeAusente(raizWorkspace, `${RAIZ_TESTES_QASSISTANT}/README.md`, readmeTestes(), criados, preservados);
  escreverArquivoSeAusente(raizWorkspace, `${RAIZ_TESTES_QASSISTANT}/mapa-de-testes.yaml`, mapaDeTestes(), criados, preservados);
  escreverArquivoSeAusente(raizWorkspace, `${RAIZ_TESTES_QASSISTANT}/regras-de-teste.md`, regrasDeTeste(), criados, preservados);
  escreverArquivoSeAusente(raizWorkspace, `${RAIZ_TESTES_QASSISTANT}/prompts/guia-validacao-commits.prompt.md`, promptValidacaoCommits(), criados, preservados);
  escreverArquivoSeAusente(raizWorkspace, `${RAIZ_TESTES_QASSISTANT}/prompts/revisar-cobertura-testes.prompt.md`, promptRevisarCobertura(), criados, preservados);
  escreverArquivoSeAusente(raizWorkspace, `${RAIZ_TESTES_QASSISTANT}/prompts/sugerir-cenarios-qa.prompt.md`, promptSugerirCenarios(), criados, preservados);
  escreverArquivoSeAusente(raizWorkspace, `${RAIZ_TESTES_QASSISTANT}/validacoes/README.md`, readmeValidacoes(), criados, preservados);
  escreverPromptsPorTipo(raizWorkspace, criados, preservados);
}

function escreverPromptsPorTipo(raizWorkspace: string, criados: string[], preservados: string[]): void {
  const prompts = [
    ['testes-unitarios/prompts/criar-teste-unitario.prompt.md', 'unitario'],
    ['testes-de-integracao/prompts/criar-teste-integracao.prompt.md', 'integracao'],
    ['testes-de-componentes/prompts/criar-teste-componente.prompt.md', 'componente'],
    ['testes-de-ponta-a-ponta/prompts/criar-teste-ponta-a-ponta.prompt.md', 'ponta a ponta'],
    ['testes-de-usabilidade/prompts/criar-teste-usabilidade.prompt.md', 'usabilidade'],
    ['testes-de-acessibilidade/prompts/criar-teste-acessibilidade.prompt.md', 'acessibilidade'],
    ['testes-de-desempenho/prompts/criar-teste-desempenho.prompt.md', 'desempenho'],
    ['testes-de-carga/prompts/criar-teste-carga.prompt.md', 'carga'],
  ];

  for (const [relativo, tipo] of prompts) {
    escreverArquivoSeAusente(raizWorkspace, `${RAIZ_TESTES_QASSISTANT}/${relativo}`, promptTipoTeste(tipo), criados, preservados);
  }
}

function criarContextoProjeto(raizWorkspace: string, criados: string[], preservados: string[]): void {
  garantirDiretorio(raizWorkspace, RAIZ_CONTEXTO_PROJETO, criados, preservados);
  escreverArquivoSeAusente(raizWorkspace, `${RAIZ_CONTEXTO_PROJETO}/README.md`, contextoReadme(), criados, preservados);
  escreverArquivoSeAusente(raizWorkspace, `${RAIZ_CONTEXTO_PROJETO}/mapa-do-projeto.md`, mapaProjeto(), criados, preservados);
  escreverArquivoSeAusente(raizWorkspace, `${RAIZ_CONTEXTO_PROJETO}/regras-de-negocio.md`, regrasNegocio(), criados, preservados);
}

function criarAssetsAgent(raizWorkspace: string, criados: string[], preservados: string[]): void {
  garantirDiretorio(raizWorkspace, DIRETORIO_INSTRUCTIONS, criados, preservados);
  garantirDiretorio(raizWorkspace, DIRETORIO_SKILLS, criados, preservados);
  garantirDiretorio(raizWorkspace, `${DIRETORIO_SKILLS}/validacao-por-commits`, criados, preservados);
  garantirDiretorio(raizWorkspace, `${DIRETORIO_SKILLS}/operacao-de-testes`, criados, preservados);
  escreverArquivoSeAusente(raizWorkspace, `${DIRETORIO_INSTRUCTIONS}/qassistant-workspace.instructions.md`, instructionsWorkspace(), criados, preservados);
  escreverArquivoSeAusente(raizWorkspace, `${DIRETORIO_SKILLS}/validacao-por-commits/SKILL.md`, skillValidacaoCommits(), criados, preservados);
  escreverArquivoSeAusente(raizWorkspace, `${DIRETORIO_SKILLS}/operacao-de-testes/SKILL.md`, skillOperacaoTestes(), criados, preservados);
}

function garantirDiretorio(raizWorkspace: string, relativo: string, criados: string[], preservados: string[]): void {
  const absoluto = path.join(raizWorkspace, relativo);
  if (fs.existsSync(absoluto)) {
    preservados.push(relativo);
    return;
  }
  fs.mkdirSync(absoluto, { recursive: true });
  criados.push(relativo);
}

function escreverArquivoSeAusente(raizWorkspace: string, relativo: string, conteudo: string, criados: string[], preservados: string[]): void {
  const absoluto = path.join(raizWorkspace, relativo);
  if (fs.existsSync(absoluto)) {
    preservados.push(relativo);
    return;
  }
  fs.mkdirSync(path.dirname(absoluto), { recursive: true });
  fs.writeFileSync(absoluto, conteudo, 'utf8');
  criados.push(relativo);
}

function readmeTestes(): string {
  return `# Qassistant-testes

Esta pasta concentra a operacao de QA do projeto.

## Objetivos

- organizar testes por tipo;
- mapear cobertura em \`mapa-de-testes.yaml\`;
- registrar regras em \`regras-de-teste.md\`;
- guardar prompts operacionais gerais e especificos;
- persistir pacotes de validacao ligados a commits e OpenProject.
`;
}

function mapaDeTestes(): string {
  return `nomeProjeto: ""
pastaRaiz: "Qassistant-testes"
testes: []
`;
}

function regrasDeTeste(): string {
  return `# Regras de teste

- Sempre leia \`Qassistant-testes/mapa-de-testes.yaml\` antes de criar novos testes.
- Use nomenclatura clara em pt-BR.
- Antes de criar um novo teste, verifique se ja existe cobertura similar.
- Prompts gerais ficam em \`Qassistant-testes/prompts/\`.
- Prompts especificos ficam dentro da pasta do tipo de teste.
- Validacoes por commits devem ser persistidas em \`Qassistant-testes/validacoes/\`.
- IA deve apoiar com sugestoes e checklists, nao substituir revisao humana.
`;
}

function promptValidacaoCommits(): string {
  return `---
name: guia-validacao-commits
description: Gera um guia de validacao para uma rodada de commits usando o contexto do projeto e a estrutura de QA.
---

Leia \`Qassistant-testes/regras-de-teste.md\`, \`Qassistant-testes/mapa-de-testes.yaml\` e os arquivos do pacote de validacao atual.

Monte um guia de validacao em pt-BR com riscos, cenarios principais, regressao, tipos de teste recomendados e evidencias esperadas.
`;
}

function promptRevisarCobertura(): string {
  return `---
name: revisar-cobertura-testes
description: Revisa a cobertura atual de testes para uma mudanca ou pacote de validacao.
---

Analise os caminhos indicados e responda o que ja possui cobertura, o que precisa de novos testes e quais artefatos devem ser atualizados no mapa.
`;
}

function promptSugerirCenarios(): string {
  return `---
name: sugerir-cenarios-qa
description: Sugere cenarios de QA a partir de uma mudanca ou pacote validado.
---

Considere os commits selecionados, os riscos e a estrutura \`Qassistant-testes/\`. Entregue cenarios criticos, regressao, ponta a ponta, integracao e observacoes de evidencias.
`;
}

function readmeValidacoes(): string {
  return `# Validacoes por commits

Cada pasta criada aqui representa uma rodada persistida de QA.

Itens recomendados por pacote:

- \`resumo-qa.md\`;
- \`commits.yaml\`;
- \`guia-de-validacao.prompt.md\`;
- \`openproject.yaml\`;
- snapshots da task;
- evidencias e resultados.
`;
}

function promptTipoTeste(tipo: string): string {
  return `---
name: criar-teste-${tipo.replace(/ /g, '-')}
description: Prompt base para criar ou revisar um teste de ${tipo}.
---

Leia \`Qassistant-testes/regras-de-teste.md\`, \`Qassistant-testes/mapa-de-testes.yaml\` e o pacote de validacao atual, quando existir.

Crie ou revise um teste de ${tipo} em pt-BR, mantendo o arquivo de destino e as regras de organizacao da pasta atual. Nao aplique mudancas automaticamente sem revisao humana.
`;
}

function contextoReadme(): string {
  return `# Contexto do projeto

Esta pasta registra contexto do projeto alvo para QA, agents e manutencao do QAssistant.

Arquivos iniciais:

- mapa-do-projeto.md
- regras-de-negocio.md
`;
}

function mapaProjeto(): string {
  return `# Mapa do projeto

Preencha este arquivo com arquitetura geral, areas de frontend e backend, integracoes externas, modulos criticos e pontos sensiveis para QA.
`;
}

function regrasNegocio(): string {
  return `# Regras de negocio

Registre aqui fluxos criticos, restricoes do dominio, regras de seguranca, excecoes conhecidas e comportamentos obrigatorios.
`;
}

function instructionsWorkspace(): string {
  return `---
applyTo: '**'
---
# QAssistant Workspace

Antes de criar, revisar ou atualizar testes, leia:

- \`Qassistant-testes/regras-de-teste.md\`;
- \`Qassistant-testes/mapa-de-testes.yaml\`;
- arquivos relevantes em \`docs/contexto/\`;
- o pacote atual em \`Qassistant-testes/validacoes/\`, quando existir.

Regras:

- priorize prompts e revisao humana;
- nao crie novos testes sem verificar cobertura existente;
- mantenha nomenclatura em pt-BR;
- trate \`Qassistant-testes/\` como fonte operacional de QA.
`;
}

function skillValidacaoCommits(): string {
  return `# Skill: validacao-por-commits

Use quando precisar transformar uma rodada de commits em plano ou pacote de validacao QA.

Fluxo esperado:

1. ler o pacote de validacao atual;
2. verificar a task vinculada no OpenProject;
3. revisar o mapa de testes;
4. propor cenarios, riscos e evidencias;
5. manter tudo revisavel em pt-BR.
`;
}

function skillOperacaoTestes(): string {
  return `# Skill: operacao-de-testes

Use quando precisar criar, revisar, reorganizar ou executar testes dentro de \`Qassistant-testes/\`.

Prioridades:

1. respeitar o mapa de testes e as regras;
2. identificar se o teste ja existe;
3. usar prompts especificos do tipo;
4. registrar evidencias e resultados;
5. manter rastreabilidade com pacotes de validacao quando houver.
`;
}

function paraPosix(valor: string): string {
  return valor.replace(/\\/g, '/');
}
