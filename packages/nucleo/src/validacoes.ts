import * as fs from 'node:fs';
import * as path from 'node:path';
import { RAIZ_TESTES_QASSISTANT } from './tipos';

export interface ResultadoPacoteValidacao {
  id: string;
  caminhoRelativo: string;
  arquivosCriados: string[];
  arquivosPreservados: string[];
}

export interface CommitPacoteValidacao {
  hash: string;
  hashCurto: string;
  autor: string;
  dataIso: string;
  assunto: string;
}

export function criarPacoteValidacaoRascunho(raizWorkspace: string, titulo = 'validacao-qa', commits: CommitPacoteValidacao[] = []): ResultadoPacoteValidacao {
  const id = criarIdPacote(titulo);
  const raizPacote = `${RAIZ_TESTES_QASSISTANT}/validacoes/${id}`;
  const arquivosCriados: string[] = [];
  const arquivosPreservados: string[] = [];

  garantirDiretorio(raizWorkspace, raizPacote, arquivosCriados, arquivosPreservados);
  garantirDiretorio(raizWorkspace, `${raizPacote}/snapshots-openproject`, arquivosCriados, arquivosPreservados);
  garantirDiretorio(raizWorkspace, `${raizPacote}/evidencias`, arquivosCriados, arquivosPreservados);
  garantirDiretorio(raizWorkspace, `${raizPacote}/resultados`, arquivosCriados, arquivosPreservados);

  escreverArquivoSeAusente(raizWorkspace, `${raizPacote}/pacote.yaml`, pacoteYaml(id, titulo, commits), arquivosCriados, arquivosPreservados);
  escreverArquivoSeAusente(raizWorkspace, `${raizPacote}/resumo-qa.md`, resumoQa(titulo, commits), arquivosCriados, arquivosPreservados);
  escreverArquivoSeAusente(raizWorkspace, `${raizPacote}/commits.yaml`, commitsYaml(commits), arquivosCriados, arquivosPreservados);
  escreverArquivoSeAusente(raizWorkspace, `${raizPacote}/guia-de-validacao.prompt.md`, guiaValidacao(), arquivosCriados, arquivosPreservados);
  escreverArquivoSeAusente(raizWorkspace, `${raizPacote}/openproject.yaml`, openProjectYaml(), arquivosCriados, arquivosPreservados);

  return {
    id,
    caminhoRelativo: raizPacote,
    arquivosCriados,
    arquivosPreservados,
  };
}

function criarIdPacote(titulo: string): string {
  const agora = new Date();
  const data = agora.toISOString().slice(0, 10);
  const hora = agora.toISOString().slice(11, 19).replace(/:/g, '');
  const slug = slugify(titulo) || 'validacao-qa';
  return `${data}-${hora}-${slug}`;
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

function pacoteYaml(id: string, titulo: string, commits: CommitPacoteValidacao[]): string {
  const hashes = commits.length > 0
    ? commits.map((commit) => `    - ${yamlString(commit.hash)}`).join('\n')
    : '    []';

  return `id: ${yamlString(id)}
titulo: ${yamlString(titulo)}
status: "rascunho"
criadoEm: "${new Date().toISOString()}"
openProject:
  taskId: null
  url: null
commits:
  incluidos:
${hashes}
  removidos: []
artefatos:
  resumo: "resumo-qa.md"
  commits: "commits.yaml"
  guiaValidacao: "guia-de-validacao.prompt.md"
  openProject: "openproject.yaml"
`;
}

function resumoQa(titulo: string, commits: CommitPacoteValidacao[]): string {
  const listaCommits = commits.length > 0
    ? commits.map((commit) => `- \`${commit.hashCurto}\` ${commit.assunto} (${commit.autor})`).join('\n')
    : '- Nenhum commit selecionado ainda.';

  return `# Resumo QA - ${titulo}

Este pacote ainda esta em rascunho.

## Commits selecionados

${listaCommits}

## Objetivo

Registrar o impacto dos commits selecionados, riscos de QA, cenarios sugeridos e vinculo com OpenProject.

## Impacto esperado

- Preencher apos selecionar commits.

## Riscos

- Preencher apos analise.

## Evidencias esperadas

- Preencher durante a validacao.
`;
}

function commitsYaml(commits: CommitPacoteValidacao[]): string {
  const incluidos = commits.length > 0
    ? commits.map((commit) => `  - hash: ${yamlString(commit.hash)}
    hashCurto: ${yamlString(commit.hashCurto)}
    autor: ${yamlString(commit.autor)}
    dataIso: ${yamlString(commit.dataIso)}
    assunto: ${yamlString(commit.assunto)}`).join('\n')
    : '  []';

  return `incluidos:
${incluidos}
removidos: []
observacoes: []
`;
}

function guiaValidacao(): string {
  return `---
name: guia-validacao-pacote
description: Guia para validar os commits deste pacote com apoio de agent.
---

Leia este pacote de validacao, \`Qassistant-testes/regras-de-teste.md\`, \`Qassistant-testes/mapa-de-testes.yaml\` e \`docs/contexto/\`.

Monte um plano de validacao em pt-BR com:

- riscos principais;
- cenarios criticos;
- testes existentes relacionados;
- novos testes sugeridos;
- evidencias necessarias;
- observacoes para a task vinculada no OpenProject.
`;
}

function openProjectYaml(): string {
  return `taskId: null
url: null
status: null
responsavel: null
ultimoSnapshot: null
`;
}

function slugify(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

function yamlString(valor: string): string {
  return JSON.stringify(valor);
}
