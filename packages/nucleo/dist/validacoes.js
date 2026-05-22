"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.criarPacoteValidacaoRascunho = criarPacoteValidacaoRascunho;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const tipos_1 = require("./tipos");
function criarPacoteValidacaoRascunho(raizWorkspace, titulo = 'validacao-qa', commits = []) {
    const id = criarIdPacote(titulo);
    const raizPacote = `${tipos_1.RAIZ_TESTES_QASSISTANT}/validacoes/${id}`;
    const arquivosCriados = [];
    const arquivosPreservados = [];
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
function criarIdPacote(titulo) {
    const agora = new Date();
    const data = agora.toISOString().slice(0, 10);
    const hora = agora.toISOString().slice(11, 19).replace(/:/g, '');
    const slug = slugify(titulo) || 'validacao-qa';
    return `${data}-${hora}-${slug}`;
}
function garantirDiretorio(raizWorkspace, relativo, criados, preservados) {
    const absoluto = path.join(raizWorkspace, relativo);
    if (fs.existsSync(absoluto)) {
        preservados.push(relativo);
        return;
    }
    fs.mkdirSync(absoluto, { recursive: true });
    criados.push(relativo);
}
function escreverArquivoSeAusente(raizWorkspace, relativo, conteudo, criados, preservados) {
    const absoluto = path.join(raizWorkspace, relativo);
    if (fs.existsSync(absoluto)) {
        preservados.push(relativo);
        return;
    }
    fs.mkdirSync(path.dirname(absoluto), { recursive: true });
    fs.writeFileSync(absoluto, conteudo, 'utf8');
    criados.push(relativo);
}
function pacoteYaml(id, titulo, commits) {
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
function resumoQa(titulo, commits) {
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
function commitsYaml(commits) {
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
function guiaValidacao() {
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
function openProjectYaml() {
    return `taskId: null
url: null
status: null
responsavel: null
ultimoSnapshot: null
`;
}
function slugify(valor) {
    return valor
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50);
}
function yamlString(valor) {
    return JSON.stringify(valor);
}
//# sourceMappingURL=validacoes.js.map