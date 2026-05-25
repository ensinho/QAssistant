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
exports.inicializarWorkspaceQAssistant = inicializarWorkspaceQAssistant;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const tipos_1 = require("./tipos");
const configuracao_1 = require("./configuracao");
function inicializarWorkspaceQAssistant(raizWorkspace, configuracao) {
    const criados = [];
    const preservados = [];
    const resultadoConfiguracao = (0, configuracao_1.salvarConfiguracaoWorkspace)(raizWorkspace, configuracao);
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
        estrutura: (0, configuracao_1.inspecionarEstruturaWorkspace)(raizWorkspace),
        configuracao: resultadoConfiguracao.configuracao,
    };
}
function criarEstruturaTestes(raizWorkspace, criados, preservados) {
    const diretorios = [
        tipos_1.RAIZ_TESTES_QASSISTANT,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/prompts`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/validacoes`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/evidencias`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/relatorios`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-unitarios/prompts`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-unitarios/backend`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-unitarios/frontend`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-de-integracao/prompts`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-de-integracao/backend`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-de-integracao/frontend`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-de-componentes/prompts`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-de-componentes/frontend`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-de-ponta-a-ponta/prompts`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-de-ponta-a-ponta/fluxos`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-de-ponta-a-ponta/auxiliares`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-de-ponta-a-ponta/dados`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-de-ponta-a-ponta/evidencias`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-de-ponta-a-ponta/execucoes`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-de-usabilidade/prompts`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-de-usabilidade/fluxos`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-de-usabilidade/evidencias`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-de-usabilidade/relatorios`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-de-acessibilidade/prompts`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-de-acessibilidade/fluxos`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-de-acessibilidade/relatorios`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-de-desempenho/prompts`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-de-desempenho/scripts`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-de-desempenho/relatorios`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-de-carga/prompts`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-de-carga/scripts`,
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-de-carga/relatorios`,
    ];
    for (const relativo of diretorios) {
        garantirDiretorio(raizWorkspace, relativo, criados, preservados);
    }
    escreverArquivoSeAusente(raizWorkspace, `${tipos_1.RAIZ_TESTES_QASSISTANT}/README.md`, readmeTestes(), criados, preservados);
    escreverArquivoSeAusente(raizWorkspace, `${tipos_1.RAIZ_TESTES_QASSISTANT}/mapa-de-testes.yaml`, mapaDeTestes(), criados, preservados);
    escreverArquivoSeAusente(raizWorkspace, `${tipos_1.RAIZ_TESTES_QASSISTANT}/regras-de-teste.md`, regrasDeTeste(), criados, preservados);
    escreverArquivoSeAusente(raizWorkspace, `${tipos_1.RAIZ_TESTES_QASSISTANT}/prompts/guia-validacao-commits.prompt.md`, promptValidacaoCommits(), criados, preservados);
    escreverArquivoSeAusente(raizWorkspace, `${tipos_1.RAIZ_TESTES_QASSISTANT}/prompts/revisar-cobertura-testes.prompt.md`, promptRevisarCobertura(), criados, preservados);
    escreverArquivoSeAusente(raizWorkspace, `${tipos_1.RAIZ_TESTES_QASSISTANT}/prompts/sugerir-cenarios-qa.prompt.md`, promptSugerirCenarios(), criados, preservados);
    escreverArquivoSeAusente(raizWorkspace, `${tipos_1.RAIZ_TESTES_QASSISTANT}/validacoes/README.md`, readmeValidacoes(), criados, preservados);
    escreverPromptsPorTipo(raizWorkspace, criados, preservados);
}
function escreverPromptsPorTipo(raizWorkspace, criados, preservados) {
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
        escreverArquivoSeAusente(raizWorkspace, `${tipos_1.RAIZ_TESTES_QASSISTANT}/${relativo}`, promptTipoTeste(tipo), criados, preservados);
    }
}
function criarContextoProjeto(raizWorkspace, criados, preservados) {
    garantirDiretorio(raizWorkspace, tipos_1.RAIZ_CONTEXTO_PROJETO, criados, preservados);
    escreverArquivoSeAusente(raizWorkspace, `${tipos_1.RAIZ_CONTEXTO_PROJETO}/INDEX.md`, contextoIndex(), criados, preservados);
    escreverArquivoSeAusente(raizWorkspace, `${tipos_1.RAIZ_CONTEXTO_PROJETO}/README.md`, contextoReadme(), criados, preservados);
    escreverArquivoSeAusente(raizWorkspace, `${tipos_1.RAIZ_CONTEXTO_PROJETO}/mapa-do-projeto.md`, mapaProjeto(), criados, preservados);
    escreverArquivoSeAusente(raizWorkspace, `${tipos_1.RAIZ_CONTEXTO_PROJETO}/regras-de-negocio.md`, regrasNegocio(), criados, preservados);
}
function criarAssetsAgent(raizWorkspace, criados, preservados) {
    garantirDiretorio(raizWorkspace, tipos_1.DIRETORIO_INSTRUCTIONS, criados, preservados);
    garantirDiretorio(raizWorkspace, tipos_1.DIRETORIO_SKILLS, criados, preservados);
    garantirDiretorio(raizWorkspace, `${tipos_1.DIRETORIO_SKILLS}/validacao-por-commits`, criados, preservados);
    garantirDiretorio(raizWorkspace, `${tipos_1.DIRETORIO_SKILLS}/operacao-de-testes`, criados, preservados);
    escreverArquivoSeAusente(raizWorkspace, `${tipos_1.DIRETORIO_INSTRUCTIONS}/qassistant-workspace.instructions.md`, instructionsWorkspace(), criados, preservados);
    escreverArquivoSeAusente(raizWorkspace, `${tipos_1.DIRETORIO_SKILLS}/validacao-por-commits/SKILL.md`, skillValidacaoCommits(), criados, preservados);
    escreverArquivoSeAusente(raizWorkspace, `${tipos_1.DIRETORIO_SKILLS}/operacao-de-testes/SKILL.md`, skillOperacaoTestes(), criados, preservados);
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
function readmeTestes() {
    return `# Qassistant-testes

Esta pasta concentra a operacao de QA do projeto.

## Objetivos

- organizar testes por tipo;
- mapear cobertura em \`mapa-de-testes.yaml\`;
- registrar regras em \`regras-de-teste.md\`;
- guardar prompts operacionais gerais e especificos;
- persistir pacotes de validacao ligados a commits e OpenProject.

Antes de criar ou mover testes, consulte \`regras-de-teste.md\`, o contexto do projeto e as instructions/skills relevantes em \`.github/\`.
`;
}
function mapaDeTestes() {
    return `nomeProjeto: ""
pastaRaiz: "Qassistant-testes"
testes: []
`;
}
function regrasDeTeste() {
    return `# Regras de teste

## Leitura obrigatoria antes de agir

- Leia nesta ordem: \`Qassistant-testes/mapa-de-testes.yaml\`, \`Qassistant-testes/regras-de-teste.md\`, \`docs/context/INDEX.md\` quando existir, senao \`docs/contexto/INDEX.md\` ou \`docs/contexto/README.md\`.
- Leia tambem os arquivos relevantes em \`.github/instructions/\` e \`.github/skills/\` antes de criar, mover ou revisar testes.
- Se existir rodada ativa em \`Qassistant-testes/validacoes/\`, leia o pacote atual antes de propor novos testes.

## Onde criar cada tipo de teste

- Testes unitarios ficam em \`Qassistant-testes/testes-unitarios/backend/\` ou \`Qassistant-testes/testes-unitarios/frontend/\`.
- Testes de integracao ficam em \`Qassistant-testes/testes-de-integracao/backend/\` ou \`Qassistant-testes/testes-de-integracao/frontend/\`.
- Testes de componentes ficam em \`Qassistant-testes/testes-de-componentes/frontend/\`.
- Testes de ponta a ponta ficam em \`Qassistant-testes/testes-de-ponta-a-ponta/fluxos/\`. Arquivos auxiliares so devem ir para \`auxiliares/\` ou \`dados/\` quando forem suporte do fluxo.
- Testes de usabilidade ficam em \`Qassistant-testes/testes-de-usabilidade/fluxos/\`.
- Testes de acessibilidade ficam em \`Qassistant-testes/testes-de-acessibilidade/fluxos/\`.
- Testes de desempenho ficam em \`Qassistant-testes/testes-de-desempenho/scripts/\`.
- Testes de carga ficam em \`Qassistant-testes/testes-de-carga/scripts/\`.

## Regras operacionais

- Use nomenclatura clara em pt-BR.
- Antes de criar um novo teste, verifique se ja existe cobertura similar.
- Nao crie arquivos fora da pasta do tipo de teste.
- Ao criar, mover, remover ou consolidar testes, atualize \`Qassistant-testes/mapa-de-testes.yaml\` na mesma entrega.
- Prompts gerais ficam em \`Qassistant-testes/prompts/\`.
- Prompts especificos ficam dentro da pasta do tipo de teste.
- Validacoes por commits devem ser persistidas em \`Qassistant-testes/validacoes/\`.
- IA deve apoiar com sugestoes e checklists, nao substituir revisao humana.
`;
}
function promptValidacaoCommits() {
    return `---
name: guia-validacao-commits
description: Gera um guia de validacao para uma rodada de commits usando o contexto do projeto e a estrutura de QA.
---

Antes de responder, leia obrigatoriamente:

1. \`Qassistant-testes/regras-de-teste.md\`.
2. \`Qassistant-testes/mapa-de-testes.yaml\`.
3. \`docs/context/INDEX.md\` quando existir; senao \`docs/contexto/INDEX.md\` ou \`docs/contexto/README.md\`.
4. Os arquivos relevantes em \`.github/instructions/\` e \`.github/skills/\`.
5. Os artefatos do pacote de validacao atual.

Monte um guia de validacao em pt-BR com riscos, cenarios principais, regressao, tipos de teste recomendados, evidencias esperadas e apontamentos de quais artefatos precisam ser atualizados.
`;
}
function promptRevisarCobertura() {
    return `---
name: revisar-cobertura-testes
description: Revisa a cobertura atual de testes para uma mudanca ou pacote de validacao.
---

Antes de responder, leia \`Qassistant-testes/regras-de-teste.md\`, \`Qassistant-testes/mapa-de-testes.yaml\`, \`docs/context/INDEX.md\` quando existir, os arquivos relevantes em \`.github/instructions/\`, as skills relevantes em \`.github/skills/\` e o pacote atual em \`Qassistant-testes/validacoes/\`, quando existir.

Analise os caminhos indicados e responda:

- o que ja possui cobertura;
- o que precisa de novos testes;
- em quais diretorios esses testes devem ser criados;
- quais artefatos precisam ser atualizados no mapa e na rodada atual.
`;
}
function promptSugerirCenarios() {
    return `---
name: sugerir-cenarios-qa
description: Sugere cenarios de QA a partir de uma mudanca ou pacote validado.
---

Antes de responder, leia \`Qassistant-testes/regras-de-teste.md\`, \`Qassistant-testes/mapa-de-testes.yaml\`, \`docs/context/INDEX.md\` quando existir, os arquivos relevantes em \`.github/instructions/\`, as skills relevantes em \`.github/skills/\` e o pacote atual em \`Qassistant-testes/validacoes/\`, quando existir.

Considere os commits selecionados, os riscos e a estrutura \`Qassistant-testes/\`. Entregue cenarios criticos, regressao, ponta a ponta, integracao, observacoes de evidencias e o diretorio mais adequado para cada novo teste sugerido.
`;
}
function readmeValidacoes() {
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
function promptTipoTeste(tipo) {
    const destinoPorTipo = {
        unitario: '`Qassistant-testes/testes-unitarios/backend/` ou `Qassistant-testes/testes-unitarios/frontend/`',
        integracao: '`Qassistant-testes/testes-de-integracao/backend/` ou `Qassistant-testes/testes-de-integracao/frontend/`',
        componente: '`Qassistant-testes/testes-de-componentes/frontend/`',
        'ponta a ponta': '`Qassistant-testes/testes-de-ponta-a-ponta/fluxos/`',
        usabilidade: '`Qassistant-testes/testes-de-usabilidade/fluxos/`',
        acessibilidade: '`Qassistant-testes/testes-de-acessibilidade/fluxos/`',
        desempenho: '`Qassistant-testes/testes-de-desempenho/scripts/`',
        carga: '`Qassistant-testes/testes-de-carga/scripts/`',
    };
    return `---
name: criar-teste-${tipo.replace(/ /g, '-')}
description: Prompt base para criar ou revisar um teste de ${tipo}.
---

Antes de responder, leia obrigatoriamente:

- \`Qassistant-testes/regras-de-teste.md\`.
- \`Qassistant-testes/mapa-de-testes.yaml\`.
- \`docs/context/INDEX.md\` quando existir; senao \`docs/contexto/INDEX.md\` ou \`docs/contexto/README.md\`.
- Os arquivos relevantes em \`.github/instructions/\`.
- As skills relevantes em \`.github/skills/\`.
- O pacote atual em \`Qassistant-testes/validacoes/\`, quando existir.
- Guias especificos da categoria atual, quando existirem.

Crie ou revise um teste de ${tipo} em pt-BR seguindo estas regras:

- escolha o destino correto em ${destinoPorTipo[tipo] || '`Qassistant-testes/`'};
- nao crie arquivos fora da estrutura esperada;
- verifique se ja existe cobertura similar antes de abrir um novo arquivo;
- atualize \`Qassistant-testes/mapa-de-testes.yaml\` quando houver nova cobertura, remocao ou reorganizacao;
- preserve rastreabilidade com a validacao atual quando houver;
- nao aplique mudancas automaticamente sem revisao humana.
`;
}
function contextoIndex() {
    return `# Indice de contexto do projeto

Leia este diretorio antes de criar ou revisar testes.

Ordem sugerida:

1. \`README.md\`
2. \`mapa-do-projeto.md\`
3. \`regras-de-negocio.md\`

Se o projeto tambem possuir \`docs/context/INDEX.md\` na raiz, priorize esse indice como fonte principal e use este diretorio como complemento operacional.
`;
}
function contextoReadme() {
    return `# Contexto do projeto

Esta pasta registra contexto do projeto alvo para QA, agents e manutencao do QAssistant.

Arquivos iniciais:

- INDEX.md
- mapa-do-projeto.md
- regras-de-negocio.md
`;
}
function mapaProjeto() {
    return `# Mapa do projeto

Preencha este arquivo com arquitetura geral, areas de frontend e backend, integracoes externas, modulos criticos e pontos sensiveis para QA.
`;
}
function regrasNegocio() {
    return `# Regras de negocio

Registre aqui fluxos criticos, restricoes do dominio, regras de seguranca, excecoes conhecidas e comportamentos obrigatorios.
`;
}
function instructionsWorkspace() {
    return `---
applyTo: '**'
---
# QAssistant Workspace

Antes de criar, revisar ou atualizar testes, leia:

- \`Qassistant-testes/regras-de-teste.md\`;
- \`Qassistant-testes/mapa-de-testes.yaml\`;
- \`docs/context/INDEX.md\`, quando existir;
- \`docs/contexto/INDEX.md\` ou \`docs/contexto/README.md\`, quando \`docs/context/INDEX.md\` nao existir;
- arquivos relevantes em \`.github/instructions/\` e \`.github/skills/\`;
- o pacote atual em \`Qassistant-testes/validacoes/\`, quando existir.

Regras:

- priorize prompts e revisao humana;
- nao crie novos testes sem verificar cobertura existente;
- mantenha nomenclatura em pt-BR;
- trate \`Qassistant-testes/\` como fonte operacional de QA.
- nao crie arquivos fora da pasta correta do tipo de teste;
- ao criar, mover ou remover testes, atualize \`Qassistant-testes/mapa-de-testes.yaml\` na mesma entrega.
`;
}
function skillValidacaoCommits() {
    return `# Skill: validacao-por-commits

Use quando precisar transformar uma rodada de commits em plano ou pacote de validacao QA.

Fluxo esperado:

1. ler \`Qassistant-testes/regras-de-teste.md\` e \`Qassistant-testes/mapa-de-testes.yaml\`;
2. ler \`docs/context/INDEX.md\` quando existir, ou o contexto em \`docs/contexto/\`;
3. consultar instructions e skills relevantes em \`.github/\`;
4. ler o pacote de validacao atual;
5. verificar a task vinculada no OpenProject;
6. propor cenarios, riscos, evidencias e atualizacoes de artefato;
7. manter tudo revisavel em pt-BR.
`;
}
function skillOperacaoTestes() {
    return `# Skill: operacao-de-testes

Use quando precisar criar, revisar, reorganizar ou executar testes dentro de \`Qassistant-testes/\`.

Prioridades:

1. ler mapa, regras, contexto e instructions antes de alterar arquivos;
2. identificar se o teste ja existe;
3. criar arquivos apenas no diretorio correto do tipo;
4. usar prompts especificos da categoria;
5. atualizar \`Qassistant-testes/mapa-de-testes.yaml\` quando a cobertura mudar;
6. registrar evidencias e resultados;
7. manter rastreabilidade com pacotes de validacao quando houver.
`;
}
function paraPosix(valor) {
    return valor.replace(/\\/g, '/');
}
//# sourceMappingURL=scaffold.js.map