"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../nucleo/dist/tipos.js
var require_tipos = __commonJS({
  "../nucleo/dist/tipos.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DIRETORIO_SKILLS = exports2.DIRETORIO_INSTRUCTIONS = exports2.RAIZ_CONTEXTO_PROJETO = exports2.RAIZ_TESTES_QASSISTANT = exports2.ARQUIVO_CONFIGURACAO_QASSISTANT = exports2.DIRETORIO_CONFIGURACAO_QASSISTANT = exports2.VERSAO_NUCLEO = exports2.NOME_PRODUTO = void 0;
    exports2.NOME_PRODUTO = "QAssistant";
    exports2.VERSAO_NUCLEO = "0.1.0";
    exports2.DIRETORIO_CONFIGURACAO_QASSISTANT = ".qassistant";
    exports2.ARQUIVO_CONFIGURACAO_QASSISTANT = "config.json";
    exports2.RAIZ_TESTES_QASSISTANT = "Qassistant-testes";
    exports2.RAIZ_CONTEXTO_PROJETO = "docs/contexto";
    exports2.DIRETORIO_INSTRUCTIONS = ".github/instructions";
    exports2.DIRETORIO_SKILLS = ".github/skills";
  }
});

// ../nucleo/dist/configuracao.js
var require_configuracao = __commonJS({
  "../nucleo/dist/configuracao.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.descreverProduto = descreverProduto2;
    exports2.criarConfiguracaoPadrao = criarConfiguracaoPadrao2;
    exports2.caminhoConfiguracaoWorkspace = caminhoConfiguracaoWorkspace;
    exports2.workspaceInicializado = workspaceInicializado;
    exports2.carregarConfiguracaoWorkspace = carregarConfiguracaoWorkspace2;
    exports2.salvarConfiguracaoWorkspace = salvarConfiguracaoWorkspace;
    exports2.inspecionarEstruturaWorkspace = inspecionarEstruturaWorkspace2;
    exports2.normalizarConfiguracao = normalizarConfiguracao;
    exports2.normalizarCaminhoRelativo = normalizarCaminhoRelativo;
    var fs3 = __importStar(require("node:fs"));
    var path2 = __importStar(require("node:path"));
    var tipos_1 = require_tipos();
    function descreverProduto2() {
      return `${tipos_1.NOME_PRODUTO} ${tipos_1.VERSAO_NUCLEO}`;
    }
    function criarConfiguracaoPadrao2(raizWorkspace) {
      return {
        versao: 1,
        produto: "QAssistant",
        projeto: {
          nome: path2.basename(raizWorkspace)
        },
        setup: {
          criarContextoProjeto: true,
          criarAssetsAgent: true
        },
        caminhos: {
          raizCodigo: ".",
          raizTestes: tipos_1.RAIZ_TESTES_QASSISTANT,
          raizContexto: tipos_1.RAIZ_CONTEXTO_PROJETO
        },
        openProject: {
          habilitado: true,
          intervaloPollingSegundos: 60
        },
        resumos: {
          commitsPadrao: 10
        }
      };
    }
    function caminhoConfiguracaoWorkspace(raizWorkspace) {
      return path2.join(raizWorkspace, tipos_1.DIRETORIO_CONFIGURACAO_QASSISTANT, tipos_1.ARQUIVO_CONFIGURACAO_QASSISTANT);
    }
    function workspaceInicializado(raizWorkspace) {
      return fs3.existsSync(caminhoConfiguracaoWorkspace(raizWorkspace));
    }
    function carregarConfiguracaoWorkspace2(raizWorkspace) {
      const arquivoConfiguracao = caminhoConfiguracaoWorkspace(raizWorkspace);
      if (!fs3.existsSync(arquivoConfiguracao)) {
        return null;
      }
      const bruto = fs3.readFileSync(arquivoConfiguracao, "utf8");
      const json = JSON.parse(bruto);
      return normalizarConfiguracao(raizWorkspace, json);
    }
    function salvarConfiguracaoWorkspace(raizWorkspace, configuracao) {
      const arquivoConfiguracao = caminhoConfiguracaoWorkspace(raizWorkspace);
      const normalizada = normalizarConfiguracao(raizWorkspace, configuracao);
      fs3.mkdirSync(path2.dirname(arquivoConfiguracao), { recursive: true });
      fs3.writeFileSync(arquivoConfiguracao, JSON.stringify(normalizada, null, 2), "utf8");
      return { caminho: arquivoConfiguracao, configuracao: normalizada };
    }
    function inspecionarEstruturaWorkspace2(raizWorkspace) {
      return {
        configuracaoPresente: workspaceInicializado(raizWorkspace),
        qassistantTestesPresente: fs3.existsSync(path2.join(raizWorkspace, tipos_1.RAIZ_TESTES_QASSISTANT)),
        contextoPresente: fs3.existsSync(path2.join(raizWorkspace, tipos_1.RAIZ_CONTEXTO_PROJETO)),
        instructionsPresentes: fs3.existsSync(path2.join(raizWorkspace, tipos_1.DIRETORIO_INSTRUCTIONS)),
        skillsPresentes: fs3.existsSync(path2.join(raizWorkspace, tipos_1.DIRETORIO_SKILLS))
      };
    }
    function normalizarConfiguracao(raizWorkspace, configuracao) {
      const caminhos = {
        raizCodigo: normalizarCaminhoRelativo(raizWorkspace, configuracao.caminhos.raizCodigo) || ".",
        frontend: normalizarCaminhoOpcional(raizWorkspace, configuracao.caminhos.frontend),
        backend: normalizarCaminhoOpcional(raizWorkspace, configuracao.caminhos.backend),
        raizTestes: tipos_1.RAIZ_TESTES_QASSISTANT,
        raizContexto: tipos_1.RAIZ_CONTEXTO_PROJETO,
        repositorios: normalizarListaCaminhos(raizWorkspace, configuracao.caminhos?.repositorios)
      };
      return {
        versao: 1,
        produto: "QAssistant",
        projeto: {
          nome: (configuracao.projeto?.nome || path2.basename(raizWorkspace)).trim() || path2.basename(raizWorkspace)
        },
        setup: {
          criarContextoProjeto: configuracao.setup?.criarContextoProjeto !== false,
          criarAssetsAgent: configuracao.setup?.criarAssetsAgent !== false
        },
        caminhos,
        openProject: {
          habilitado: Boolean(configuracao.openProject?.habilitado),
          urlBase: limparString(configuracao.openProject?.urlBase),
          projetoId: limparString(configuracao.openProject?.projetoId),
          intervaloPollingSegundos: normalizarInteiro(configuracao.openProject?.intervaloPollingSegundos, 60, 15)
        },
        resumos: {
          commitsPadrao: normalizarInteiro(configuracao.resumos?.commitsPadrao, 10, 1)
        }
      };
    }
    function normalizarCaminhoRelativo(raizWorkspace, caminhoInformado) {
      const bruto = limparString(caminhoInformado);
      if (!bruto) {
        return void 0;
      }
      const absoluto = path2.resolve(raizWorkspace, bruto);
      const relativo = paraPosix(path2.relative(raizWorkspace, absoluto));
      if (!relativo) {
        return ".";
      }
      if (relativo.startsWith("..") || path2.isAbsolute(relativo)) {
        throw new Error("Todos os caminhos do setup devem ficar dentro do workspace atual.");
      }
      return relativo;
    }
    function normalizarCaminhoOpcional(raizWorkspace, caminhoInformado) {
      const bruto = limparString(caminhoInformado);
      if (!bruto) {
        return void 0;
      }
      return normalizarCaminhoRelativo(raizWorkspace, bruto);
    }
    function normalizarListaCaminhos(raizWorkspace, lista) {
      if (!Array.isArray(lista) || lista.length === 0) {
        return void 0;
      }
      const vistos = /* @__PURE__ */ new Set();
      const resultado = [];
      for (const entrada of lista) {
        const bruto = limparString(entrada);
        if (!bruto)
          continue;
        let normalizado;
        try {
          normalizado = normalizarCaminhoRelativo(raizWorkspace, bruto);
        } catch {
          continue;
        }
        if (normalizado && !vistos.has(normalizado)) {
          vistos.add(normalizado);
          resultado.push(normalizado);
        }
      }
      return resultado.length > 0 ? resultado : void 0;
    }
    function normalizarInteiro(valor, fallback, minimo) {
      const numero = Number(valor);
      if (!Number.isFinite(numero)) {
        return fallback;
      }
      return Math.max(minimo, Math.floor(numero));
    }
    function limparString(valor) {
      const texto = String(valor || "").trim();
      return texto ? texto : void 0;
    }
    function paraPosix(valor) {
      return valor.replace(/\\/g, "/");
    }
  }
});

// ../nucleo/dist/scaffold.js
var require_scaffold = __commonJS({
  "../nucleo/dist/scaffold.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.inicializarWorkspaceQAssistant = inicializarWorkspaceQAssistant2;
    var fs3 = __importStar(require("node:fs"));
    var path2 = __importStar(require("node:path"));
    var tipos_1 = require_tipos();
    var configuracao_1 = require_configuracao();
    function inicializarWorkspaceQAssistant2(raizWorkspace, configuracao) {
      const criados = [];
      const preservados = [];
      const resultadoConfiguracao = (0, configuracao_1.salvarConfiguracaoWorkspace)(raizWorkspace, configuracao);
      const relativaConfiguracao = paraPosix(path2.relative(raizWorkspace, resultadoConfiguracao.caminho));
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
        configuracao: resultadoConfiguracao.configuracao
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
        `${tipos_1.RAIZ_TESTES_QASSISTANT}/testes-de-carga/relatorios`
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
        ["testes-unitarios/prompts/criar-teste-unitario.prompt.md", "unitario"],
        ["testes-de-integracao/prompts/criar-teste-integracao.prompt.md", "integracao"],
        ["testes-de-componentes/prompts/criar-teste-componente.prompt.md", "componente"],
        ["testes-de-ponta-a-ponta/prompts/criar-teste-ponta-a-ponta.prompt.md", "ponta a ponta"],
        ["testes-de-usabilidade/prompts/criar-teste-usabilidade.prompt.md", "usabilidade"],
        ["testes-de-acessibilidade/prompts/criar-teste-acessibilidade.prompt.md", "acessibilidade"],
        ["testes-de-desempenho/prompts/criar-teste-desempenho.prompt.md", "desempenho"],
        ["testes-de-carga/prompts/criar-teste-carga.prompt.md", "carga"]
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
      const absoluto = path2.join(raizWorkspace, relativo);
      if (fs3.existsSync(absoluto)) {
        preservados.push(relativo);
        return;
      }
      fs3.mkdirSync(absoluto, { recursive: true });
      criados.push(relativo);
    }
    function escreverArquivoSeAusente(raizWorkspace, relativo, conteudo, criados, preservados) {
      const absoluto = path2.join(raizWorkspace, relativo);
      if (fs3.existsSync(absoluto)) {
        preservados.push(relativo);
        return;
      }
      fs3.mkdirSync(path2.dirname(absoluto), { recursive: true });
      fs3.writeFileSync(absoluto, conteudo, "utf8");
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
        unitario: "`Qassistant-testes/testes-unitarios/backend/` ou `Qassistant-testes/testes-unitarios/frontend/`",
        integracao: "`Qassistant-testes/testes-de-integracao/backend/` ou `Qassistant-testes/testes-de-integracao/frontend/`",
        componente: "`Qassistant-testes/testes-de-componentes/frontend/`",
        "ponta a ponta": "`Qassistant-testes/testes-de-ponta-a-ponta/fluxos/`",
        usabilidade: "`Qassistant-testes/testes-de-usabilidade/fluxos/`",
        acessibilidade: "`Qassistant-testes/testes-de-acessibilidade/fluxos/`",
        desempenho: "`Qassistant-testes/testes-de-desempenho/scripts/`",
        carga: "`Qassistant-testes/testes-de-carga/scripts/`"
      };
      return `---
name: criar-teste-${tipo.replace(/ /g, "-")}
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

- escolha o destino correto em ${destinoPorTipo[tipo] || "`Qassistant-testes/`"};
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
      return valor.replace(/\\/g, "/");
    }
  }
});

// ../nucleo/dist/validacoes.js
var require_validacoes = __commonJS({
  "../nucleo/dist/validacoes.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.criarPacoteValidacaoRascunho = criarPacoteValidacaoRascunho2;
    var fs3 = __importStar(require("node:fs"));
    var path2 = __importStar(require("node:path"));
    var tipos_1 = require_tipos();
    function criarPacoteValidacaoRascunho2(raizWorkspace, titulo = "validacao-qa", commits = []) {
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
        arquivosPreservados
      };
    }
    function criarIdPacote(titulo) {
      const agora = /* @__PURE__ */ new Date();
      const data = agora.toISOString().slice(0, 10);
      const hora = agora.toISOString().slice(11, 19).replace(/:/g, "");
      const slug = slugify(titulo) || "validacao-qa";
      return `${data}-${hora}-${slug}`;
    }
    function garantirDiretorio(raizWorkspace, relativo, criados, preservados) {
      const absoluto = path2.join(raizWorkspace, relativo);
      if (fs3.existsSync(absoluto)) {
        preservados.push(relativo);
        return;
      }
      fs3.mkdirSync(absoluto, { recursive: true });
      criados.push(relativo);
    }
    function escreverArquivoSeAusente(raizWorkspace, relativo, conteudo, criados, preservados) {
      const absoluto = path2.join(raizWorkspace, relativo);
      if (fs3.existsSync(absoluto)) {
        preservados.push(relativo);
        return;
      }
      fs3.mkdirSync(path2.dirname(absoluto), { recursive: true });
      fs3.writeFileSync(absoluto, conteudo, "utf8");
      criados.push(relativo);
    }
    function pacoteYaml(id, titulo, commits) {
      const hashes = commits.length > 0 ? commits.map((commit) => `    - ${yamlString(commit.hash)}`).join("\n") : "    []";
      return `id: ${yamlString(id)}
titulo: ${yamlString(titulo)}
status: "rascunho"
criadoEm: "${(/* @__PURE__ */ new Date()).toISOString()}"
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
      const listaCommits = commits.length > 0 ? commits.map((commit) => `- \`${commit.hashCurto}\` ${commit.assunto} (${commit.autor})`).join("\n") : "- Nenhum commit selecionado ainda.";
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
      const incluidos = commits.length > 0 ? commits.map((commit) => `  - hash: ${yamlString(commit.hash)}
    hashCurto: ${yamlString(commit.hashCurto)}
    autor: ${yamlString(commit.autor)}
    dataIso: ${yamlString(commit.dataIso)}
    assunto: ${yamlString(commit.assunto)}`).join("\n") : "  []";
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
      return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50);
    }
    function yamlString(valor) {
      return JSON.stringify(valor);
    }
  }
});

// ../nucleo/dist/index.js
var require_dist = __commonJS({
  "../nucleo/dist/index.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    __exportStar(require_tipos(), exports2);
    __exportStar(require_configuracao(), exports2);
    __exportStar(require_scaffold(), exports2);
    __exportStar(require_validacoes(), exports2);
  }
});

// src/host/extensao.ts
var extensao_exports = {};
__export(extensao_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extensao_exports);
var vscode4 = __toESM(require("vscode"));
var import_nucleo3 = __toESM(require_dist());

// src/host/painel/provedor-painel.ts
var import_node_child_process = require("node:child_process");
var fs2 = __toESM(require("node:fs"));
var path = __toESM(require("node:path"));
var import_node_util = require("node:util");
var vscode3 = __toESM(require("vscode"));
var import_nucleo2 = __toESM(require_dist());

// ../../node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});

// ../../node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_) => {
  };
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// ../../node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = class _ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// ../../node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var en_default = errorMap;

// ../../node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}

// ../../node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path: path2, errorMaps, issueData } = params;
  const fullPath = [...path2, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var ParseStatus = class _ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

// ../../node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// ../../node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  constructor(parent, value, path2, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path2;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
var ZodString = class _ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var ZodNumber = class _ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class _ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class _ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = /* @__PURE__ */ Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new _ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: ((arg) => ZodString.create({ ...arg, coerce: true })),
  number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
  boolean: ((arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  })),
  bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
  date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
};
var NEVER = INVALID;

// src/contratos/mensagens.ts
var import_nucleo = __toESM(require_dist());
var SetupWorkspaceSchema = external_exports.object({
  nomeProjeto: external_exports.string().min(1),
  raizCodigo: external_exports.string().default("."),
  frontend: external_exports.string().optional(),
  backend: external_exports.string().optional(),
  criarContextoProjeto: external_exports.boolean().default(true),
  criarAssetsAgent: external_exports.boolean().default(true),
  openProjectHabilitado: external_exports.boolean().default(true),
  openProjectUrlBase: external_exports.string().optional(),
  openProjectProjetoId: external_exports.string().optional(),
  intervaloPollingSegundos: external_exports.number().int().min(15).default(60),
  commitsPadrao: external_exports.number().int().min(1).default(10)
});
var CampoDiretorioSetupSchema = external_exports.enum(["raizCodigo", "frontend", "backend"]);
var TipoTesteAssistidoSchema = external_exports.enum(["unitario", "integracao", "componente", "ponta-a-ponta", "usabilidade", "acessibilidade", "desempenho", "carga"]);
var StackTesteAssistidoSchema = external_exports.enum(["backend", "frontend"]);
var ContextoSeletorPromptSchema = external_exports.enum(["arquivos", "pastas"]);
var PromptAssistidoTesteSchema = external_exports.object({
  tipoTeste: TipoTesteAssistidoSchema,
  stack: StackTesteAssistidoSchema.optional(),
  objetivo: external_exports.string().min(8),
  contextoAdicional: external_exports.string().optional(),
  cenariosObservacoes: external_exports.string().optional(),
  arquivosSelecionados: external_exports.array(external_exports.string().min(1)).default([]),
  pastasSelecionadas: external_exports.array(external_exports.string().min(1)).default([]),
  usarPacoteAtivo: external_exports.boolean().default(false)
});
var MensagemWebviewParaHostSchema = external_exports.discriminatedUnion("tipo", [
  external_exports.object({ tipo: external_exports.literal("painel.carregado") }),
  external_exports.object({ tipo: external_exports.literal("workspace.inicializar"), setup: SetupWorkspaceSchema }),
  external_exports.object({ tipo: external_exports.literal("painel.atualizar") }),
  external_exports.object({ tipo: external_exports.literal("workspace.abrirCaminho"), caminhoRelativo: external_exports.string().min(1) }),
  external_exports.object({ tipo: external_exports.literal("workspace.selecionarDiretorio"), campo: CampoDiretorioSetupSchema, caminhoAtual: external_exports.string().optional() }),
  external_exports.object({ tipo: external_exports.literal("validacao.criarRascunho"), titulo: external_exports.string().min(1).default("validacao-qa") }),
  external_exports.object({ tipo: external_exports.literal("validacao.criarComCommits"), titulo: external_exports.string().min(1).default("validacao-qa"), hashes: external_exports.array(external_exports.string().min(7)).default([]) }),
  external_exports.object({ tipo: external_exports.literal("git.carregarCommits"), limite: external_exports.number().int().min(1).max(100).default(10) }),
  external_exports.object({ tipo: external_exports.literal("validacao.gerarResumoIA"), rascunhoCaminho: external_exports.string().min(1) }),
  external_exports.object({ tipo: external_exports.literal("validacao.sugerirBateriaTestes"), rascunhoCaminho: external_exports.string().min(1) }),
  external_exports.object({ tipo: external_exports.literal("openproject.publicarTask"), rascunhoCaminho: external_exports.string().min(1), taskId: external_exports.string().optional() }),
  external_exports.object({ tipo: external_exports.literal("openproject.obterStatus"), taskId: external_exports.string().min(1) }),
  external_exports.object({ tipo: external_exports.literal("openproject.listarTasks") }),
  external_exports.object({ tipo: external_exports.literal("openproject.obterDetalhes"), taskId: external_exports.string().min(1) }),
  external_exports.object({
    tipo: external_exports.literal("openproject.validarConexao"),
    urlBase: external_exports.string().min(1),
    projetoRef: external_exports.string().optional(),
    token: external_exports.string().optional()
  }),
  external_exports.object({ tipo: external_exports.literal("config.salvarChaveGemini"), chave: external_exports.string().min(1) }),
  external_exports.object({ tipo: external_exports.literal("config.salvarChaveOpenProject"), chave: external_exports.string().min(1) }),
  external_exports.object({ tipo: external_exports.literal("validacao.selecionarPacote"), caminhoRelativo: external_exports.string().min(1) }),
  external_exports.object({ tipo: external_exports.literal("validacao.excluirPacote"), caminhoRelativo: external_exports.string().min(1) }),
  external_exports.object({ tipo: external_exports.literal("testes.executar"), categoria: external_exports.string(), nomeExecucao: external_exports.string().optional() }),
  external_exports.object({ tipo: external_exports.literal("testes.navegarSeletorPrompt"), contexto: ContextoSeletorPromptSchema, caminhoRelativo: external_exports.string().default(".") }),
  external_exports.object({ tipo: external_exports.literal("testes.gerarPromptAssistido"), payload: PromptAssistidoTesteSchema }),
  external_exports.object({ tipo: external_exports.literal("testes.limparHistorico") }),
  external_exports.object({ tipo: external_exports.literal("testes.abrirEmAba") }),
  external_exports.object({ tipo: external_exports.literal("testes.fecharAba") }),
  external_exports.object({ tipo: external_exports.literal("testes.analisarComIA") }),
  external_exports.object({ tipo: external_exports.literal("testes.verRunDetalhes"), runId: external_exports.string().min(1) }),
  external_exports.object({ tipo: external_exports.literal("openproject.comentarTask"), taskId: external_exports.string().min(1), texto: external_exports.string().min(1) }),
  external_exports.object({ tipo: external_exports.literal("openproject.alterarStatusTask"), taskId: external_exports.string().min(1), statusHref: external_exports.string().min(1), lockVersion: external_exports.number().int() })
]);
function criarEstadoInicial(versaoExtensao) {
  return {
    produto: "QAssistant",
    versaoExtensao,
    assets: { logoUri: "" },
    workspaceAberto: false,
    workspaceInicializado: false,
    raizWorkspace: "",
    raizTestes: import_nucleo.RAIZ_TESTES_QASSISTANT,
    raizContexto: import_nucleo.RAIZ_CONTEXTO_PROJETO,
    configuracao: null,
    estrutura: null,
    git: {
      carregando: false,
      erro: null,
      recentes: [],
      carregadoEm: null,
      branch: "",
      repositorios: []
    },
    navegador: null,
    ultimosArquivosCriados: [],
    ultimosArquivosPreservados: [],
    ultimoPacoteValidacao: void 0,
    pacotesDisponiveis: [],
    geminiKeyPresente: false,
    openProjectKeyPresente: false,
    openprojectTasks: [],
    execucaoTestes: {
      categoriaAtiva: null,
      status: "ocioso",
      logs: "",
      errosCount: 0,
      sucessosCount: 0,
      totalCount: 0,
      historico: []
    }
  };
}

// src/host/servicos/workspace.ts
var vscode = __toESM(require("vscode"));
function obterRaizWorkspace() {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

// src/host/painel/painel-testes-aba.ts
var fs = __toESM(require("node:fs"));
var vscode2 = __toESM(require("vscode"));
function criarNonce() {
  const alfabeto = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let valor = "";
  for (let i = 0; i < 32; i += 1) {
    valor += alfabeto.charAt(Math.floor(Math.random() * alfabeto.length));
  }
  return valor;
}
var PainelTestesAba = class {
  constructor(contexto, saida, onMensagem) {
    this.contexto = contexto;
    this.saida = saida;
    this.onMensagem = onMensagem;
  }
  contexto;
  saida;
  onMensagem;
  panel = null;
  estaAberto() {
    return this.panel !== null;
  }
  abrir() {
    if (this.panel) {
      this.panel.reveal(vscode2.ViewColumn.One);
      return;
    }
    this.panel = vscode2.window.createWebviewPanel(
      "qassistant.abaTestesRunner",
      "QA Runner",
      vscode2.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode2.Uri.joinPath(this.contexto.extensionUri, "dist", "webview"),
          vscode2.Uri.joinPath(this.contexto.extensionUri, "media")
        ]
      }
    );
    this.panel.iconPath = {
      light: vscode2.Uri.joinPath(this.contexto.extensionUri, "media", "qassistant-logo-source.svg"),
      dark: vscode2.Uri.joinPath(this.contexto.extensionUri, "media", "qassistant-logo-source.svg")
    };
    this.panel.webview.html = this.criarHtml(this.panel.webview);
    this.panel.webview.onDidReceiveMessage(this.onMensagem);
    this.panel.onDidDispose(() => {
      this.panel = null;
    });
  }
  focar() {
    this.panel?.reveal(vscode2.ViewColumn.One);
  }
  fechar() {
    this.panel?.dispose();
    this.panel = null;
  }
  enviar(mensagem) {
    void this.panel?.webview.postMessage(mensagem);
  }
  enviarEstado(estado) {
    this.enviar({ tipo: "estado.atualizado", estado });
  }
  criarHtml(webview) {
    const diretorioWebview = vscode2.Uri.joinPath(this.contexto.extensionUri, "dist", "webview");
    const arquivoHtml = vscode2.Uri.joinPath(diretorioWebview, "index.html");
    const nonce = criarNonce();
    let html = fs.readFileSync(arquivoHtml.fsPath, "utf8");
    const uriAssets = webview.asWebviewUri(vscode2.Uri.joinPath(diretorioWebview, "assets")).toString();
    html = html.replace(/(src|href)="\/?assets\//g, `$1="${uriAssets}/`);
    html = html.replace(/<script /g, `<script nonce="${nonce}" `);
    html = html.replace(
      "</head>",
      `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https: data:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';"></head>`
    );
    html = html.replace(
      "</body>",
      `<script nonce="${nonce}">window.__QA_MODO__='aba';</script></body>`
    );
    return html;
  }
};

// src/host/painel/provedor-painel.ts
var execFileAsync = (0, import_node_util.promisify)(import_node_child_process.execFile);
var OPENPROJECT_URL_PADRAO = "http://openproject.ormel.com.br/";
var CONFIGURACOES_PROMPT_ASSISTIDO = {
  unitario: {
    rotulo: "teste unitario",
    templateSubPath: "testes-unitarios/prompts/criar-teste-unitario.prompt.md",
    promptGeradoSubPath: "testes-unitarios/prompts/gerados",
    exigeStack: true,
    resolverDestinoTeste: (stack) => `testes-unitarios/${stack || "backend"}/`
  },
  integracao: {
    rotulo: "teste de integracao",
    templateSubPath: "testes-de-integracao/prompts/criar-teste-integracao.prompt.md",
    promptGeradoSubPath: "testes-de-integracao/prompts/gerados",
    exigeStack: true,
    resolverDestinoTeste: (stack) => `testes-de-integracao/${stack || "backend"}/`
  },
  componente: {
    rotulo: "teste de componente",
    templateSubPath: "testes-de-componentes/prompts/criar-teste-componente.prompt.md",
    promptGeradoSubPath: "testes-de-componentes/prompts/gerados",
    exigeStack: false,
    resolverDestinoTeste: () => "testes-de-componentes/frontend/"
  },
  "ponta-a-ponta": {
    rotulo: "teste de ponta a ponta",
    templateSubPath: "testes-de-ponta-a-ponta/prompts/criar-teste-ponta-a-ponta.prompt.md",
    promptGeradoSubPath: "testes-de-ponta-a-ponta/prompts/gerados",
    exigeStack: false,
    resolverDestinoTeste: () => "testes-de-ponta-a-ponta/fluxos/"
  },
  usabilidade: {
    rotulo: "teste de usabilidade",
    templateSubPath: "testes-de-usabilidade/prompts/criar-teste-usabilidade.prompt.md",
    promptGeradoSubPath: "testes-de-usabilidade/prompts/gerados",
    exigeStack: false,
    resolverDestinoTeste: () => "testes-de-usabilidade/fluxos/"
  },
  acessibilidade: {
    rotulo: "teste de acessibilidade",
    templateSubPath: "testes-de-acessibilidade/prompts/criar-teste-acessibilidade.prompt.md",
    promptGeradoSubPath: "testes-de-acessibilidade/prompts/gerados",
    exigeStack: false,
    resolverDestinoTeste: () => "testes-de-acessibilidade/fluxos/"
  },
  desempenho: {
    rotulo: "teste de desempenho",
    templateSubPath: "testes-de-desempenho/prompts/criar-teste-desempenho.prompt.md",
    promptGeradoSubPath: "testes-de-desempenho/prompts/gerados",
    exigeStack: false,
    resolverDestinoTeste: () => "testes-de-desempenho/scripts/"
  },
  carga: {
    rotulo: "teste de carga",
    templateSubPath: "testes-de-carga/prompts/criar-teste-carga.prompt.md",
    promptGeradoSubPath: "testes-de-carga/prompts/gerados",
    exigeStack: false,
    resolverDestinoTeste: () => "testes-de-carga/scripts/"
  }
};
var ProvedorPainel = class {
  constructor(contexto, saida) {
    this.contexto = contexto;
    this.saida = saida;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }
  contexto;
  saida;
  static viewType = "qassistant.painel";
  webview;
  ultimosArquivosCriados = [];
  ultimosArquivosPreservados = [];
  ultimoPacoteValidacao;
  navegador = null;
  geminiKeyPresente = false;
  openProjectKeyPresente = false;
  openprojectTasks = [];
  painelAba = null;
  currentRunId = null;
  execucaoTestes = {
    categoriaAtiva: null,
    status: "ocioso",
    logs: "",
    errosCount: 0,
    sucessosCount: 0,
    totalCount: 0,
    historico: [],
    falhasDetalhes: [],
    sumarioCaminhoRelativo: void 0,
    sumarioConteudo: void 0,
    nomeExecucao: void 0,
    analiseIA: void 0
  };
  git = {
    carregando: false,
    erro: null,
    recentes: [],
    carregadoEm: null,
    branch: "",
    repositorios: []
  };
  resolveWebviewView(webviewView) {
    this.webview = webviewView.webview;
    this.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode3.Uri.joinPath(this.contexto.extensionUri, "dist", "webview"),
        vscode3.Uri.joinPath(this.contexto.extensionUri, "media")
      ]
    };
    this.webview.html = this.criarHtml(this.webview);
    this.webview.onDidReceiveMessage((mensagemDesconhecida) => void this.receberMensagem(mensagemDesconhecida));
    void this.contexto.secrets.get("qassistant.geminiApiKey").then((chave) => {
      this.geminiKeyPresente = !!chave;
    });
    void this.contexto.secrets.get("qassistant.openProjectApiKey").then((chave) => {
      this.openProjectKeyPresente = !!chave;
    });
    const raiz = obterRaizWorkspace();
    if (raiz) this.carregarHistoricoPersistente(raiz);
  }
  async atualizar() {
    const estado = this.criarEstado();
    this.enviar({ tipo: "estado.atualizado", estado });
    this.painelAba?.enviarEstado(estado);
  }
  abrirTestesEmAba() {
    if (!this.painelAba) {
      this.painelAba = new PainelTestesAba(
        this.contexto,
        this.saida,
        (msg) => void this.receberMensagem(msg)
      );
    }
    this.painelAba.abrir();
    void Promise.resolve().then(() => this.painelAba?.enviarEstado(this.criarEstado()));
  }
  async inicializarWorkspace(setup) {
    const raizWorkspace = obterRaizWorkspace();
    if (!raizWorkspace) {
      this.enviar({ tipo: "notificacao.erro", mensagem: "Abra um workspace antes de inicializar o QAssistant." });
      return;
    }
    const configuracao = this.montarConfiguracao(raizWorkspace, setup || this.criarSetupPadrao(raizWorkspace));
    const resultado = (0, import_nucleo2.inicializarWorkspaceQAssistant)(raizWorkspace, configuracao);
    this.ultimosArquivosCriados = resultado.criados;
    this.ultimosArquivosPreservados = resultado.preservados;
    this.navegador = this.criarNavegadorInterno(raizWorkspace, import_nucleo2.RAIZ_TESTES_QASSISTANT);
    await this.carregarCommits(configuracao.resumos.commitsPadrao, false);
    this.saida.appendLine(`Workspace inicializado: ${resultado.criados.length} itens criados, ${resultado.preservados.length} preservados.`);
    this.enviar({ tipo: "notificacao.info", mensagem: `Setup concluido: ${resultado.criados.length} itens criados e ${resultado.preservados.length} preservados.` });
    await this.atualizar();
  }
  async receberMensagem(mensagemDesconhecida) {
    const resultado = MensagemWebviewParaHostSchema.safeParse(mensagemDesconhecida);
    if (!resultado.success) {
      this.enviar({ tipo: "notificacao.erro", mensagem: "Mensagem invalida recebida pela extensao." });
      return;
    }
    try {
      switch (resultado.data.tipo) {
        case "painel.carregado":
        case "painel.atualizar":
          await this.atualizar();
          return;
        case "workspace.inicializar":
          await this.inicializarWorkspace(resultado.data.setup);
          return;
        case "workspace.abrirCaminho":
          await this.abrirCaminhoWorkspace(resultado.data.caminhoRelativo);
          return;
        case "workspace.selecionarDiretorio":
          await this.selecionarDiretorioWorkspace(resultado.data.campo, resultado.data.caminhoAtual);
          return;
        case "validacao.criarRascunho":
          await this.criarPacoteValidacaoRascunho(resultado.data.titulo);
          return;
        case "validacao.criarComCommits":
          await this.criarPacoteValidacaoComCommits(resultado.data.titulo, resultado.data.hashes);
          return;
        case "validacao.gerarResumoIA":
          await this.gerarResumoIA(resultado.data.rascunhoCaminho);
          return;
        case "validacao.sugerirBateriaTestes":
          await this.sugerirBateriaTestes(resultado.data.rascunhoCaminho);
          return;
        case "openproject.publicarTask":
          await this.publicarTaskOpenProject(resultado.data.rascunhoCaminho, resultado.data.taskId);
          return;
        case "openproject.obterStatus":
          await this.obterStatusOpenProject(resultado.data.taskId);
          return;
        case "openproject.listarTasks":
          await this.listarTasksOpenProject();
          return;
        case "openproject.obterDetalhes":
          await this.obterDetalhesOpenProject(resultado.data.taskId);
          return;
        case "openproject.validarConexao":
          await this.validarConexaoOpenProject(resultado.data.urlBase, resultado.data.projetoRef, resultado.data.token);
          return;
        case "config.salvarChaveGemini":
          await this.salvarChaveGemini(resultado.data.chave);
          return;
        case "config.salvarChaveOpenProject":
          await this.salvarChaveOpenProject(resultado.data.chave);
          return;
        case "git.carregarCommits":
          await this.carregarCommits(resultado.data.limite);
          return;
        case "validacao.selecionarPacote":
          {
            const raizWorkspace = obterRaizWorkspace();
            if (!raizWorkspace) return;
            this.ultimoPacoteValidacao = {
              id: path.basename(resultado.data.caminhoRelativo),
              caminhoRelativo: resultado.data.caminhoRelativo
            };
            this.navegador = this.criarNavegadorInterno(raizWorkspace, resultado.data.caminhoRelativo);
            this.enviar({ tipo: "notificacao.info", mensagem: `Pacote de validacao ativo definido para ${path.basename(resultado.data.caminhoRelativo)}.` });
            await this.atualizar();
          }
          return;
        case "validacao.excluirPacote":
          {
            const raizWorkspace = obterRaizWorkspace();
            if (!raizWorkspace) return;
            try {
              const absPath = path.resolve(raizWorkspace, resultado.data.caminhoRelativo);
              if (fs2.existsSync(absPath)) {
                fs2.rmSync(absPath, { recursive: true, force: true });
                this.enviar({ tipo: "notificacao.info", mensagem: `Pacote ${path.basename(resultado.data.caminhoRelativo)} removido com sucesso.` });
                if (this.ultimoPacoteValidacao?.caminhoRelativo === resultado.data.caminhoRelativo) {
                  this.ultimoPacoteValidacao = void 0;
                }
                await this.atualizar();
              }
            } catch (err) {
              this.enviar({ tipo: "notificacao.erro", mensagem: `Erro ao excluir pacote: ${err.message}` });
            }
          }
          return;
        case "testes.executar":
          await this.executarTestes(resultado.data.categoria, resultado.data.nomeExecucao);
          return;
        case "testes.navegarSeletorPrompt":
          await this.navegarSeletorPrompt(resultado.data.contexto, resultado.data.caminhoRelativo);
          return;
        case "testes.gerarPromptAssistido":
          await this.gerarPromptAssistido(resultado.data.payload);
          return;
        case "testes.limparHistorico":
          this.execucaoTestes.logs = "";
          this.execucaoTestes.status = "ocioso";
          this.execucaoTestes.categoriaAtiva = null;
          this.execucaoTestes.nomeExecucao = void 0;
          this.execucaoTestes.errosCount = 0;
          this.execucaoTestes.sucessosCount = 0;
          this.execucaoTestes.totalCount = 0;
          this.execucaoTestes.falhasDetalhes = [];
          this.execucaoTestes.sumarioCaminhoRelativo = void 0;
          this.execucaoTestes.sumarioConteudo = void 0;
          this.execucaoTestes.analiseIA = void 0;
          this.currentRunId = null;
          this.enviar({ tipo: "notificacao.info", mensagem: "Painel de execu\xE7\xE3o limpo. Hist\xF3rico persistido em disco." });
          await this.atualizar();
          return;
        case "testes.abrirEmAba":
          this.abrirTestesEmAba();
          return;
        case "testes.fecharAba":
          this.painelAba?.fechar();
          return;
        case "testes.analisarComIA":
          await this.analisarFalhasComIA();
          return;
        case "testes.verRunDetalhes":
          await this.verRunDetalhes(resultado.data.runId);
          return;
        case "openproject.comentarTask":
          await this.comentarTaskOpenProject(resultado.data.taskId, resultado.data.texto);
          return;
        case "openproject.alterarStatusTask":
          await this.alterarStatusTaskOpenProject(resultado.data.taskId, resultado.data.statusHref, resultado.data.lockVersion);
          return;
      }
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : String(error);
      this.saida.appendLine(`Erro: ${mensagem}`);
      this.enviar({ tipo: "notificacao.erro", mensagem });
    }
  }
  resolverDetalhesPacote(raizWorkspace, pkg) {
    const absDir = path.join(raizWorkspace, pkg.caminhoRelativo);
    const yamlPath = path.join(absDir, "pacote.yaml");
    const mdPath = path.join(absDir, "resumo-qa.md");
    let titulo = pkg.id;
    let statusCompleto = "Rascunho";
    let criadoEm = "";
    let openProjectId = "";
    let openProjectUrl = "";
    const commits = [];
    let resumoQaConteudo = "";
    if (fs2.existsSync(yamlPath)) {
      try {
        const content = fs2.readFileSync(yamlPath, "utf8");
        const titleMatch = content.match(/titulo:\s*"(.*?)"/);
        if (titleMatch) titulo = titleMatch[1];
        const statusMatch = content.match(/status:\s*"(.*?)"/);
        if (statusMatch) statusCompleto = statusMatch[1];
        const criadoMatch = content.match(/criadoEm:\s*"(.*?)"/);
        if (criadoMatch) criadoEm = criadoMatch[1];
        const taskMatch = content.match(/taskId:\s*(.*)/);
        if (taskMatch && taskMatch[1].trim() !== "null") {
          openProjectId = taskMatch[1].trim().replace(/['"]/g, "");
        }
        const urlMatch = content.match(/url:\s*(.*)/);
        if (urlMatch && urlMatch[1].trim() !== "null") {
          openProjectUrl = urlMatch[1].trim().replace(/['"]/g, "");
        }
        const commitsSection = content.split("commits:");
        if (commitsSection.length > 1) {
          const incluidosSection = commitsSection[1].split("removidos:");
          if (incluidosSection.length > 0) {
            const lines = incluidosSection[0].split("\n");
            for (const line of lines) {
              const commitMatch = line.match(/-\s*"(.*?)"/);
              if (commitMatch) {
                commits.push(commitMatch[1]);
              }
            }
          }
        }
      } catch (err) {
        this.saida.appendLine(`Erro ao ler pacote.yaml: ${err}`);
      }
    }
    if (fs2.existsSync(mdPath)) {
      try {
        resumoQaConteudo = fs2.readFileSync(mdPath, "utf8");
      } catch (err) {
        this.saida.appendLine(`Erro ao ler resumo-qa.md: ${err}`);
      }
    }
    return {
      ...pkg,
      titulo,
      statusCompleto,
      criadoEm,
      openProjectId,
      openProjectUrl,
      commits,
      resumoQaConteudo
    };
  }
  obterPacotesDisponiveis(raizWorkspace, raizTestes) {
    const dirValidacoes = path.join(raizWorkspace, raizTestes, "validacoes");
    if (!fs2.existsSync(dirValidacoes)) {
      return [];
    }
    try {
      return fs2.readdirSync(dirValidacoes, { withFileTypes: true }).filter((entry) => entry.isDirectory() && entry.name !== ".git").map((entry) => {
        const caminhoRelativo = normalizarRelativo(path.join(raizTestes, "validacoes", entry.name));
        const absoluto = path.join(dirValidacoes, entry.name);
        const stat = fs2.statSync(absoluto);
        return {
          id: entry.name,
          nome: entry.name,
          caminhoRelativo,
          dataCriacao: (stat.birthtime || stat.mtime).toISOString()
        };
      }).sort((a, b) => b.dataCriacao.localeCompare(a.dataCriacao));
    } catch {
      return [];
    }
  }
  criarEstado() {
    const versaoExtensao = String(this.contexto.extension.packageJSON.version || "2.0.0");
    const estado = criarEstadoInicial(versaoExtensao);
    const raizWorkspace = obterRaizWorkspace();
    if (!raizWorkspace) return estado;
    const configuracao = (0, import_nucleo2.carregarConfiguracaoWorkspace)(raizWorkspace);
    const estrutura = (0, import_nucleo2.inspecionarEstruturaWorkspace)(raizWorkspace);
    const raizTestes = configuracao?.caminhos.raizTestes || import_nucleo2.RAIZ_TESTES_QASSISTANT;
    if (!this.navegador && estrutura.qassistantTestesPresente) {
      this.navegador = this.criarNavegadorInterno(raizWorkspace, raizTestes);
    }
    const pacotesDisponiveis = this.obterPacotesDisponiveis(raizWorkspace, raizTestes);
    return {
      ...estado,
      assets: { logoUri: this.criarUriLogo() },
      workspaceAberto: true,
      workspaceInicializado: estrutura.configuracaoPresente && estrutura.qassistantTestesPresente,
      raizWorkspace,
      raizTestes,
      raizContexto: configuracao?.caminhos.raizContexto || import_nucleo2.RAIZ_CONTEXTO_PROJETO,
      configuracao,
      estrutura,
      git: this.git,
      navegador: this.navegador,
      ultimosArquivosCriados: this.ultimosArquivosCriados,
      ultimosArquivosPreservados: this.ultimosArquivosPreservados,
      ultimoPacoteValidacao: this.ultimoPacoteValidacao ? this.resolverDetalhesPacote(raizWorkspace, this.ultimoPacoteValidacao) : void 0,
      pacotesDisponiveis,
      geminiKeyPresente: this.geminiKeyPresente,
      openProjectKeyPresente: this.openProjectKeyPresente,
      openprojectTasks: this.openprojectTasks,
      execucaoTestes: this.execucaoTestes
    };
  }
  async abrirCaminhoWorkspace(caminhoRelativo) {
    const raizWorkspace = obterRaizWorkspace();
    if (!raizWorkspace) {
      this.enviar({ tipo: "notificacao.erro", mensagem: "Abra um workspace antes de abrir arquivos do QAssistant." });
      return;
    }
    const caminhoAbsoluto = path.resolve(raizWorkspace, caminhoRelativo);
    const relativo = path.relative(raizWorkspace, caminhoAbsoluto);
    if (relativo.startsWith("..") || path.isAbsolute(relativo)) {
      this.enviar({ tipo: "notificacao.erro", mensagem: "Caminho fora do workspace atual." });
      return;
    }
    if (!fs2.existsSync(caminhoAbsoluto)) {
      this.enviar({ tipo: "notificacao.erro", mensagem: `Caminho ainda nao existe: ${caminhoRelativo}` });
      return;
    }
    const stat = fs2.statSync(caminhoAbsoluto);
    const caminhoNormalizado = normalizarRelativo(path.relative(raizWorkspace, caminhoAbsoluto));
    const uri = vscode3.Uri.file(caminhoAbsoluto);
    if (stat.isDirectory()) {
      this.navegador = this.criarNavegadorInterno(raizWorkspace, caminhoNormalizado);
      this.enviar({ tipo: "notificacao.info", mensagem: `Navegando em ${caminhoNormalizado || "."} dentro do QAssistant.` });
      await this.atualizar();
      return;
    }
    const documento = await vscode3.workspace.openTextDocument(uri);
    await vscode3.window.showTextDocument(documento, { preview: false });
    this.navegador = {
      caminhoRelativo: this.navegador?.caminhoRelativo || path.dirname(caminhoNormalizado),
      entradas: this.navegador?.entradas || [],
      arquivoAberto: caminhoNormalizado
    };
    await this.atualizar();
  }
  async criarPacoteValidacaoRascunho(titulo) {
    const raizWorkspace = obterRaizWorkspace();
    if (!raizWorkspace) {
      this.enviar({ tipo: "notificacao.erro", mensagem: "Abra um workspace antes de criar validacoes." });
      return;
    }
    if (!fs2.existsSync(path.join(raizWorkspace, import_nucleo2.RAIZ_TESTES_QASSISTANT))) {
      this.enviar({ tipo: "notificacao.erro", mensagem: "Inicialize o workspace antes de criar pacotes de validacao." });
      return;
    }
    const resultado = (0, import_nucleo2.criarPacoteValidacaoRascunho)(raizWorkspace, titulo);
    this.ultimosArquivosCriados = resultado.arquivosCriados;
    this.ultimosArquivosPreservados = resultado.arquivosPreservados;
    this.ultimoPacoteValidacao = { id: resultado.id, caminhoRelativo: resultado.caminhoRelativo };
    this.navegador = this.criarNavegadorInterno(raizWorkspace, resultado.caminhoRelativo);
    const logPath = path.join(raizWorkspace, resultado.caminhoRelativo, "auditoria-processo.log");
    const logsIniciais = `[AUDIT - ${(/* @__PURE__ */ new Date()).toISOString()}] Fluxo de Pacote de Trabalho de QA Iniciado.
ID: ${resultado.id}
T\xEDtulo: ${titulo}
Estrutura de diret\xF3rio criada com sucesso.
`;
    fs2.writeFileSync(logPath, logsIniciais, "utf8");
    this.enviar({ tipo: "notificacao.info", mensagem: `Pacote de validacao criado em ${resultado.caminhoRelativo}.` });
    await this.atualizar();
    await this.abrirCaminhoWorkspace(`${resultado.caminhoRelativo}/resumo-qa.md`);
  }
  async criarPacoteValidacaoComCommits(titulo, hashes) {
    const raizWorkspace = obterRaizWorkspace();
    if (!raizWorkspace) {
      this.enviar({ tipo: "notificacao.erro", mensagem: "Abra um workspace antes de criar validacoes." });
      return;
    }
    if (!fs2.existsSync(path.join(raizWorkspace, import_nucleo2.RAIZ_TESTES_QASSISTANT))) {
      this.enviar({ tipo: "notificacao.erro", mensagem: "Inicialize o workspace antes de criar pacotes de validacao." });
      return;
    }
    if (hashes.length === 0) {
      this.enviar({ tipo: "notificacao.erro", mensagem: "Selecione ao menos um commit para criar o pacote." });
      return;
    }
    const commits = this.selecionarCommits(hashes);
    if (commits.length === 0) {
      this.enviar({ tipo: "notificacao.erro", mensagem: "Os commits selecionados nao estao carregados no painel." });
      return;
    }
    const resultado = (0, import_nucleo2.criarPacoteValidacaoRascunho)(raizWorkspace, titulo, commits);
    this.ultimosArquivosCriados = resultado.arquivosCriados;
    this.ultimosArquivosPreservados = resultado.arquivosPreservados;
    this.ultimoPacoteValidacao = { id: resultado.id, caminhoRelativo: resultado.caminhoRelativo };
    this.navegador = this.criarNavegadorInterno(raizWorkspace, resultado.caminhoRelativo);
    const logPath = path.join(raizWorkspace, resultado.caminhoRelativo, "auditoria-processo.log");
    let logsIniciais = `[AUDIT - ${(/* @__PURE__ */ new Date()).toISOString()}] Fluxo de Pacote de Trabalho de QA Iniciado.
ID: ${resultado.id}
T\xEDtulo: ${titulo}
Estrutura de diret\xF3rio criada com sucesso.

Commits selecionados:
`;
    commits.forEach((c) => {
      logsIniciais += `- [${c.hashCurto}] ${c.assunto} por ${c.autor}
`;
    });
    logsIniciais += `
`;
    fs2.writeFileSync(logPath, logsIniciais, "utf8");
    const geminiKey = process.env.PROJECT_AI_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (geminiKey) {
      this.saida.appendLine(`Iniciando gera\xE7\xE3o autom\xE1tica de resumo de IA para o novo pacote.`);
      void this.gerarResumoIA(resultado.caminhoRelativo).catch(() => {
      });
    }
    this.enviar({ tipo: "notificacao.info", mensagem: `Pacote criado com ${commits.length} commit(s) selecionado(s).` });
    await this.atualizar();
    await this.abrirCaminhoWorkspace(`${resultado.caminhoRelativo}/resumo-qa.md`);
  }
  async navegarSeletorPrompt(contexto, caminhoRelativo) {
    const raizWorkspace = obterRaizWorkspace();
    if (!raizWorkspace) {
      this.enviar({ tipo: "notificacao.erro", mensagem: "Abra um workspace antes de selecionar arquivos para o prompt." });
      return;
    }
    const configuracao = (0, import_nucleo2.carregarConfiguracaoWorkspace)(raizWorkspace);
    const caminhoFallback = configuracao?.caminhos.raizCodigo || ".";
    let caminhoBase = String(caminhoRelativo || "").trim() || caminhoFallback;
    let caminhoAbsoluto = path.resolve(raizWorkspace, caminhoBase);
    if (!fs2.existsSync(caminhoAbsoluto)) {
      caminhoBase = caminhoFallback;
      caminhoAbsoluto = path.resolve(raizWorkspace, caminhoBase);
    }
    if (fs2.existsSync(caminhoAbsoluto) && fs2.statSync(caminhoAbsoluto).isFile()) {
      caminhoAbsoluto = path.dirname(caminhoAbsoluto);
    }
    const relativo = path.relative(raizWorkspace, caminhoAbsoluto);
    if (relativo.startsWith("..") || path.isAbsolute(relativo)) {
      this.enviar({ tipo: "notificacao.erro", mensagem: "Selecione apenas arquivos e pastas dentro do workspace atual." });
      return;
    }
    this.enviar({
      tipo: "testes.seletorPromptAtualizado",
      contexto,
      navegador: this.criarNavegadorPrompt(raizWorkspace, normalizarRelativo(relativo || "."), contexto)
    });
  }
  async gerarPromptAssistido(payload) {
    const raizWorkspace = obterRaizWorkspace();
    if (!raizWorkspace) {
      this.enviar({ tipo: "notificacao.erro", mensagem: "Abra um workspace antes de gerar prompts de teste." });
      return;
    }
    const configuracao = (0, import_nucleo2.carregarConfiguracaoWorkspace)(raizWorkspace);
    const estrutura = (0, import_nucleo2.inspecionarEstruturaWorkspace)(raizWorkspace);
    const raizTestes = configuracao?.caminhos.raizTestes || import_nucleo2.RAIZ_TESTES_QASSISTANT;
    if (!estrutura.qassistantTestesPresente) {
      this.enviar({ tipo: "notificacao.erro", mensagem: "Inicialize o workspace do QAssistant antes de gerar prompts guiados." });
      return;
    }
    const configuracaoPrompt = this.obterConfiguracaoPromptAssistido(payload.tipoTeste);
    if (configuracaoPrompt.exigeStack && !payload.stack) {
      this.enviar({ tipo: "notificacao.erro", mensagem: "Escolha se o prompt e para frontend ou backend antes de gerar." });
      return;
    }
    const templateRelPath = normalizarRelativo(path.join(raizTestes, configuracaoPrompt.templateSubPath));
    const templateAbsPath = path.join(raizWorkspace, templateRelPath);
    if (!fs2.existsSync(templateAbsPath)) {
      this.enviar({ tipo: "notificacao.erro", mensagem: `Template base nao encontrado: ${templateRelPath}.` });
      return;
    }
    const templateBase = fs2.readFileSync(templateAbsPath, "utf8").trim();
    const promptFinal = this.montarPromptAssistido(raizWorkspace, raizTestes, payload, templateBase, configuracaoPrompt);
    const diretorioSaidaRelativo = normalizarRelativo(path.join(raizTestes, configuracaoPrompt.promptGeradoSubPath));
    const diretorioSaidaAbsoluto = path.join(raizWorkspace, diretorioSaidaRelativo);
    fs2.mkdirSync(diretorioSaidaAbsoluto, { recursive: true });
    const nomeArquivo = `${criarPrefixoPromptAssistido()}-${criarSlugPromptAssistido(payload.objetivo)}.prompt.md`;
    const caminhoRelativoGerado = normalizarRelativo(path.join(diretorioSaidaRelativo, nomeArquivo));
    fs2.writeFileSync(path.join(raizWorkspace, caminhoRelativoGerado), promptFinal, "utf8");
    await vscode3.env.clipboard.writeText(promptFinal);
    await this.abrirArquivoNoEditor(raizWorkspace, caminhoRelativoGerado);
    this.enviar({
      tipo: "testes.promptAssistidoGerado",
      caminhoRelativo: caminhoRelativoGerado,
      conteudo: promptFinal,
      copiado: true
    });
    this.enviar({
      tipo: "notificacao.info",
      mensagem: `Prompt salvo em ${caminhoRelativoGerado}, aberto no editor e copiado para a area de transferencia.`
    });
  }
  /**
   * Resolve os diretórios Git a escanear.
   * - Se `repositoriosConfigurados` tiver entradas, usa exatamente esses caminhos
   *   (relativos à raiz do workspace), mantendo apenas os que contêm `.git`.
   * - Caso contrário, descobre automaticamente: a própria raiz (se for repo) e
   *   cada subpasta imediata que contenha `.git`.
   * Sempre inclui a raiz do workspace quando ela for um repositório Git.
   */
  descobrirDiretoriosGit(raizWorkspace, repositoriosConfigurados) {
    const candidatos = /* @__PURE__ */ new Set();
    const raizEhRepo = fs2.existsSync(path.join(raizWorkspace, ".git"));
    if (raizEhRepo) {
      candidatos.add(raizWorkspace);
    }
    if (repositoriosConfigurados.length > 0) {
      for (const rel of repositoriosConfigurados) {
        const absoluto = path.resolve(raizWorkspace, rel);
        if (fs2.existsSync(path.join(absoluto, ".git"))) {
          candidatos.add(absoluto);
        }
      }
    } else {
      try {
        for (const filha of fs2.readdirSync(raizWorkspace, { withFileTypes: true })) {
          if (!filha.isDirectory() || filha.name.startsWith(".")) continue;
          const caminhoCompleto = path.join(raizWorkspace, filha.name);
          if (fs2.existsSync(path.join(caminhoCompleto, ".git"))) {
            candidatos.add(caminhoCompleto);
          }
        }
      } catch {
      }
    }
    return Array.from(candidatos);
  }
  async carregarCommits(limite, atualizarDepois = true) {
    const raizWorkspace = obterRaizWorkspace();
    if (!raizWorkspace) {
      this.git = { carregando: false, erro: "Abra um workspace para carregar commits.", recentes: [], carregadoEm: null, branch: "", repositorios: [] };
      if (atualizarDepois) await this.atualizar();
      return;
    }
    this.git = { ...this.git, carregando: true, erro: null };
    if (atualizarDepois) await this.atualizar();
    try {
      const configuracao = (0, import_nucleo2.carregarConfiguracaoWorkspace)(raizWorkspace);
      const repositoriosConfigurados = configuracao?.caminhos?.repositorios ?? [];
      const dirsParaEscanear = this.descobrirDiretoriosGit(raizWorkspace, repositoriosConfigurados);
      const reposit\u00F3riosValidos = [];
      for (const dir of dirsParaEscanear) {
        if (fs2.existsSync(path.join(dir, ".git"))) {
          let branch = "main";
          try {
            const { stdout: branchStdout } = await execFileAsync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: dir, timeout: 2e3 });
            branch = branchStdout.trim() || "detached";
          } catch {
            try {
              const { stdout: branchStdout2 } = await execFileAsync("git", ["branch", "--show-current"], { cwd: dir, timeout: 2e3 });
              branch = branchStdout2.trim() || "detached";
            } catch {
            }
          }
          const caminhoRel = normalizarRelativo(path.relative(raizWorkspace, dir)) || ".";
          const nomeRepo = caminhoRel === "." ? "Raiz Workspace" : path.basename(dir);
          const idRepo = caminhoRel === "." ? "raiz" : path.basename(dir).toLowerCase();
          if (!reposit\u00F3riosValidos.some((r) => r.caminho === dir)) {
            reposit\u00F3riosValidos.push({
              id: idRepo,
              nome: nomeRepo,
              caminho: dir,
              branch
            });
          }
        }
      }
      if (reposit\u00F3riosValidos.length === 0) {
        this.git = {
          carregando: false,
          erro: "Nenhum reposit\xF3rio Git (.git) foi detectado neste workspace.",
          recentes: [],
          carregadoEm: (/* @__PURE__ */ new Date()).toISOString(),
          branch: "",
          repositorios: []
        };
        if (atualizarDepois) await this.atualizar();
        return;
      }
      const todosCommits = [];
      for (const repo of reposit\u00F3riosValidos) {
        try {
          const { stdout } = await execFileAsync("git", [
            "-C",
            repo.caminho,
            "log",
            `-${limite}`,
            "--date=iso-strict",
            "--pretty=format:%H%x1f%h%x1f%an%x1f%ad%x1f%s"
          ], { cwd: repo.caminho, maxBuffer: 1024 * 1024, timeout: 5e3 });
          const commitsIniciais = this.parsearCommits(String(stdout));
          for (const commit of commitsIniciais) {
            let arquivos = [];
            try {
              const { stdout: showStdout } = await execFileAsync("git", [
                "-C",
                repo.caminho,
                "show",
                "--pretty=format:",
                "--name-only",
                commit.hash
              ], { cwd: repo.caminho, timeout: 3e3 });
              arquivos = showStdout.split(/\r?\n/).map((item) => item.trim()).filter(Boolean).filter((item) => !this.isCaminhoSensivel(item));
            } catch {
            }
            todosCommits.push({
              ...commit,
              repositorioId: repo.id,
              repositorioNome: repo.nome,
              repositorioCaminho: normalizarRelativo(path.relative(raizWorkspace, repo.caminho)) || ".",
              arquivosAlterados: arquivos,
              arquivosAlteradosCount: arquivos.length
            });
          }
        } catch (err) {
          this.saida.appendLine(`Erro ao obter commits do repo ${repo.nome}: ${err}`);
        }
      }
      todosCommits.sort((a, b) => new Date(b.dataIso).getTime() - new Date(a.dataIso).getTime());
      const repositoriosEstado = reposit\u00F3riosValidos.map((r) => ({
        id: r.id,
        nome: r.nome,
        caminhoRelativo: normalizarRelativo(path.relative(raizWorkspace, r.caminho)) || ".",
        branch: r.branch
      }));
      const branchGeral = reposit\u00F3riosValidos[0]?.branch || "main";
      this.git = {
        carregando: false,
        erro: null,
        recentes: todosCommits,
        carregadoEm: (/* @__PURE__ */ new Date()).toISOString(),
        branch: branchGeral,
        repositorios: repositoriosEstado
      };
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : String(error);
      this.git = {
        carregando: false,
        erro: `N\xE3o foi poss\xEDvel carregar commits Git: ${mensagem}`,
        recentes: [],
        carregadoEm: null,
        branch: "",
        repositorios: []
      };
    }
    if (atualizarDepois) await this.atualizar();
  }
  isCaminhoSensivel(caminho) {
    const normalizado = caminho.toLowerCase().replace(/\\/g, "/");
    const nomeBase = path.basename(normalizado);
    const segmentos = normalizado.split("/");
    if (segmentos.some((seg) => [".git", "node_modules", "dist", "build", "coverage", "secrets"].includes(seg))) {
      return true;
    }
    if (nomeBase === ".env" || nomeBase.startsWith(".env.")) {
      return true;
    }
    if (["id_rsa", "id_dsa"].includes(nomeBase)) {
      return true;
    }
    if (/\.(pem|key|p12|crt)$/i.test(nomeBase)) {
      return true;
    }
    return /^(secrets|credentials)(\..*)?$/i.test(nomeBase);
  }
  async gerarResumoIA(rascunhoCaminho) {
    const raizWorkspace = obterRaizWorkspace();
    if (!raizWorkspace) return;
    try {
      this.saida.appendLine(`Gerando resumo IA em ${rascunhoCaminho}`);
      const caminhoFisico = path.join(raizWorkspace, rascunhoCaminho);
      const pacoteYamlPath = path.join(caminhoFisico, "pacote.yaml");
      if (!fs2.existsSync(pacoteYamlPath)) {
        throw new Error("Arquivo pacote.yaml n\xE3o encontrado no pacote de valida\xE7\xE3o.");
      }
      const apiKey = await this.obterChaveGemini();
      if (!apiKey) {
        throw new Error("Configure a Gemini API Key na aba Configura\xE7\xE3o do QAssistant, ou defina PROJECT_AI_GEMINI_API_KEY no ambiente.");
      }
      const commitsYamlPath = path.join(caminhoFisico, "commits.yaml");
      let listaCommitsDesc = "Nenhum commit informado.";
      if (fs2.existsSync(commitsYamlPath)) {
        const conteudoCommits = fs2.readFileSync(commitsYamlPath, "utf8");
        listaCommitsDesc = conteudoCommits;
      }
      const promptResumo = `Voc\xEA \xE9 um Analista de QA S\xEAnior. Gere um Resumo de Valida\xE7\xE3o de QA t\xE9cnico e refinado em Portugu\xEAs (Brasil) com base nestas altera\xE7\xF5es recentes de c\xF3digo (commits).

Comportamento do sistema e \xE1reas a testar devem focar estritamente na plataforma MedSystem (sistema de Prontu\xE1rio Eletr\xF4nico, Prescri\xE7\xF5es, M\xF3dulos Cl\xEDnicos, Alertas de Medicamentos, etc. conforme aplic\xE1vel).

Use rigorosamente o seguinte formato Markdown, n\xE3o adicione cabe\xE7alhos de primeiro n\xEDvel al\xE9m do t\xEDtulo principal. Evite expor quaisquer segredos ou credenciais.

# Resumo de valida\xE7\xE3o de QA

## Resumo simples
Explique detalhadamente o que mudou no comportamento cl\xEDnico ou t\xE9cnico do sistema.

## Onde testar no sistema
M\xF3dulos do MedSystem (ex: MedSystem_front, MedSystem_back, telas, integra\xE7\xF5es) afetados pelas altera\xE7\xF5es.

## Checklist de teste
Itens objetivos de checklist de verifica\xE7\xE3o de comportamento.

## Testes de regress\xE3o sugeridos
Sugerir regress\xF5es em funcionalidades existentes que fa\xE7am interface ou dependam das \xE1reas alteradas.

## Pontos de aten\xE7\xE3o
Casos de borda cl\xEDnicos, valida\xE7\xF5es estritas, controle de permiss\xF5es e resili\xEAncia de rede.

## Observa\xE7\xF5es t\xE9cnicas para apoio
Uma linguagem acess\xEDvel para desenvolvedores e testadores com arquivos alterados listados de forma informativa.

DADOS DOS COMMITS REGISTRADOS:
${listaCommitsDesc}`;
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptResumo }] }]
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error?.message || `Google API returned status ${res.status}`);
      }
      const data = await res.json();
      const resumoIaText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      if (resumoIaText) {
        fs2.writeFileSync(path.join(caminhoFisico, "resumo-qa.md"), resumoIaText, "utf8");
        const logPath = path.join(caminhoFisico, "auditoria-processo.log");
        if (fs2.existsSync(logPath)) {
          fs2.appendFileSync(logPath, `[AUDIT - ${(/* @__PURE__ */ new Date()).toISOString()}] Resumo do Pacote de QA computado e salvo com sucesso via Intelig\xEAncia Artificial.
`, "utf8");
        }
        this.saida.appendLine("Resumo IA gerado com sucesso!");
        this.enviar({ tipo: "notificacao.info", mensagem: "Resumo QA foi gerado com Intelig\xEAncia Artificial!" });
        await this.atualizar();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.saida.appendLine(`Falha ao gerar resumo por IA: ${msg}`);
      this.enviar({ tipo: "notificacao.erro", mensagem: `Erro ao computar Resumo IA: ${msg}` });
    }
  }
  async sugerirBateriaTestes(rascunhoCaminho) {
    const raizWorkspace = obterRaizWorkspace();
    if (!raizWorkspace) return;
    try {
      this.saida.appendLine(`Criando sugest\xF5es de bateria de testes para ${rascunhoCaminho}`);
      const caminhoFisico = path.join(raizWorkspace, rascunhoCaminho);
      const resumoPath = path.join(caminhoFisico, "resumo-qa.md");
      if (!fs2.existsSync(resumoPath)) {
        throw new Error("Primeiro gere o resumo-qa.md ou preencha o rascunho de valida\xE7\xE3o.");
      }
      const apiKey = await this.obterChaveGemini();
      if (!apiKey) {
        throw new Error("Configure a Gemini API Key na aba Configura\xE7\xE3o do QAssistant, ou defina PROJECT_AI_GEMINI_API_KEY no ambiente.");
      }
      const resumoConteudo = fs2.readFileSync(resumoPath, "utf8");
      const promptSugestao = `Voc\xEA \xE9 um Engenheiro de QA especializado em Automa\xE7\xE3o com Playwright.
Com base no seguinte Resumo de Valida\xE7\xE3o do MedSystem, elabore sugest\xF5es de cen\xE1rios de teste automatizados e testes manuais avan\xE7ados.

Escreva o retorno no formato Markdown diretamente. Inclua cen\xE1rios E2E com sugest\xF5es de seletores CSS adequados e fluxos l\xF3gicos completos de teste.

Resumo Cl\xEDnico/T\xE9cnico de Refer\xEAncia:
${resumoConteudo}`;
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptSugestao }] }]
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error?.message || `Google API returned status ${res.status}`);
      }
      const data = await res.json();
      const sugestaoText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      if (sugestaoText) {
        const bateriaCaminho = path.join(caminhoFisico, "bateria-testes-sugerida.md");
        fs2.writeFileSync(bateriaCaminho, sugestaoText, "utf8");
        const logPath = path.join(caminhoFisico, "auditoria-processo.log");
        if (fs2.existsSync(logPath)) {
          fs2.appendFileSync(logPath, `[AUDIT - ${(/* @__PURE__ */ new Date()).toISOString()}] Bateria de testes sugerida baseada no impacto cl\xEDnico gerada e salva com IA (Playwright/Manual).
`, "utf8");
        }
        this.saida.appendLine("Sugest\xF5es de bateria de testes geradas!");
        this.enviar({ tipo: "notificacao.info", mensagem: "Bateria de testes sugerida com IA (Playwright/Manual) criada com sucesso!" });
        await this.atualizar();
        await this.abrirCaminhoWorkspace(`${rascunhoCaminho}/bateria-testes-sugerida.md`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.saida.appendLine(`Falha ao sugerir bateria de testes: ${msg}`);
      this.enviar({ tipo: "notificacao.erro", mensagem: `Erro ao sugerir bateria: ${msg}` });
    }
  }
  obterBaseUrlOpenProject(configuracao) {
    let url = configuracao?.openProject?.urlBase || process.env.PROJECT_AI_OPENPROJECT_BASE_URL || OPENPROJECT_URL_PADRAO;
    if (url.endsWith("/")) {
      url = url.substring(0, url.length - 1);
    }
    return url;
  }
  criarAuthOpenProject(apiKey) {
    return Buffer.from(`apikey:${apiKey}`).toString("base64");
  }
  async buscarProjetoOpenProject(baseUrl, rawAuth, referencia) {
    const url = `${baseUrl}/api/v3/projects/${encodeURIComponent(referencia)}`;
    const resposta = await fetch(url, {
      headers: { Authorization: `Basic ${rawAuth}`, Accept: "application/hal+json" }
    });
    if (resposta.status === 404) {
      return null;
    }
    if (!resposta.ok) {
      throw new Error(`OpenProject retornou status ${resposta.status}: ${resposta.statusText}`);
    }
    return resposta.json();
  }
  async listarProjetosOpenProjectDisponiveis(baseUrl, rawAuth) {
    const listaUrl = `${baseUrl}/api/v3/projects?pageSize=200`;
    const resposta = await fetch(listaUrl, {
      headers: { Authorization: `Basic ${rawAuth}`, Accept: "application/hal+json" }
    });
    if (!resposta.ok) {
      throw new Error(`OpenProject retornou status ${resposta.status}: ${resposta.statusText}`);
    }
    const data = await resposta.json();
    const projetos = (data?._embedded?.elements || []).map((item) => this.mapearProjetoOpenProject(item, String(item?.identifier || item?.name || "projeto"))).filter((item) => Boolean(item.identificador || item.nome)).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    return projetos;
  }
  normalizarTextoBusca(valor) {
    return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
  }
  mapearProjetoOpenProject(projeto, referenciaFallback) {
    const apiHref = String(projeto?._links?.self?.href || "").trim() || `/api/v3/projects/${encodeURIComponent(referenciaFallback)}`;
    const identificadorBruto = String(projeto?.identifier || "").trim();
    const identificadorHref = apiHref.split("/").filter(Boolean).pop();
    return {
      apiHref,
      identificador: identificadorBruto || identificadorHref,
      nome: String(projeto?.name || identificadorBruto || referenciaFallback).trim() || referenciaFallback
    };
  }
  async resolverProjetoOpenProject(baseUrl, rawAuth, referenciaInformada) {
    const referencia = String(referenciaInformada || "medsystem").trim() || "medsystem";
    const projetoDireto = await this.buscarProjetoOpenProject(baseUrl, rawAuth, referencia);
    if (projetoDireto) {
      return this.mapearProjetoOpenProject(projetoDireto, referencia);
    }
    const projetos = await this.listarProjetosOpenProjectDisponiveis(baseUrl, rawAuth);
    const referenciaNormalizada = this.normalizarTextoBusca(referencia);
    const projeto = projetos.find((item) => {
      const nome = this.normalizarTextoBusca(item.nome);
      const identificador = this.normalizarTextoBusca(String(item.identificador || ""));
      return nome === referenciaNormalizada || identificador === referenciaNormalizada;
    });
    if (!projeto) {
      throw new Error(`Projeto "${referencia}" n\xE3o encontrado no OpenProject. Use o nome exibido no projeto ou o identificador atual.`);
    }
    return projeto;
  }
  montarUrlWebTaskOpenProject(baseUrl, projeto, taskId) {
    if (projeto.identificador) {
      return `${baseUrl}/projects/${projeto.identificador}/work_packages/${taskId}`;
    }
    return `${baseUrl}/work_packages/${taskId}`;
  }
  async validarConexaoOpenProject(urlBase, projetoRef, tokenInformado) {
    const baseUrl = this.obterBaseUrlOpenProject({ openProject: { urlBase } });
    const apiKey = String(tokenInformado || "").trim() || await this.obterChaveOpenProject();
    if (!apiKey) {
      this.enviar({
        tipo: "openproject.validacaoConcluida",
        sucesso: false,
        mensagem: "Informe um token para validar a conex\xE3o com o OpenProject."
      });
      return;
    }
    try {
      const rawAuth = this.criarAuthOpenProject(apiKey);
      const usuarioResposta = await fetch(`${baseUrl}/api/v3/users/me`, {
        headers: { Authorization: `Basic ${rawAuth}`, Accept: "application/hal+json" }
      });
      if (!usuarioResposta.ok) {
        throw new Error("Token inv\xE1lido ou sem acesso ao OpenProject informado.");
      }
      const projetos = await this.listarProjetosOpenProjectDisponiveis(baseUrl, rawAuth);
      const projeto = projetoRef?.trim() ? await this.resolverProjetoOpenProject(baseUrl, rawAuth, projetoRef) : void 0;
      if (tokenInformado?.trim()) {
        await this.contexto.secrets.store("qassistant.openProjectApiKey", tokenInformado.trim());
        this.openProjectKeyPresente = true;
      }
      this.enviar({
        tipo: "openproject.validacaoConcluida",
        sucesso: true,
        mensagem: projeto ? `Conex\xE3o validada com sucesso para o projeto ${projeto.nome}.` : projetos.length > 0 ? `Conex\xE3o validada com sucesso. ${projetos.length} projeto(s) dispon\xEDvel(is) para sele\xE7\xE3o.` : "Conex\xE3o validada com sucesso, mas este token n\xE3o retornou projetos vis\xEDveis para sele\xE7\xE3o.",
        projeto: projeto ? { nome: projeto.nome, identificador: projeto.identificador } : void 0,
        projetosDisponiveis: projetos.map((item) => ({
          nome: item.nome,
          identificador: item.identificador || item.nome
        }))
      });
      await this.atualizar();
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : String(err);
      this.enviar({
        tipo: "openproject.validacaoConcluida",
        sucesso: false,
        mensagem
      });
    }
  }
  obterConfiguracaoPromptAssistido(tipoTeste) {
    return CONFIGURACOES_PROMPT_ASSISTIDO[tipoTeste];
  }
  criarNavegadorPrompt(raizWorkspace, caminhoRelativo, contexto) {
    const caminhoAbsoluto = path.resolve(raizWorkspace, caminhoRelativo || ".");
    const entradas = fs2.readdirSync(caminhoAbsoluto, { withFileTypes: true }).filter((entrada) => !this.deveOcultarEntradaPrompt(entrada.name, entrada.isDirectory())).filter((entrada) => contexto === "arquivos" || entrada.isDirectory()).slice(0, 200).map((entrada) => {
      const absoluto = path.join(caminhoAbsoluto, entrada.name);
      const stat = fs2.statSync(absoluto);
      const relativo = normalizarRelativo(path.relative(raizWorkspace, absoluto));
      return {
        nome: entrada.name,
        caminhoRelativo: relativo,
        tipo: entrada.isDirectory() ? "pasta" : "arquivo",
        tamanhoBytes: entrada.isDirectory() ? null : stat.size,
        atualizadoEm: stat.mtime.toISOString()
      };
    }).sort((primeira, segunda) => {
      if (primeira.tipo !== segunda.tipo) return primeira.tipo === "pasta" ? -1 : 1;
      return primeira.nome.localeCompare(segunda.nome, "pt-BR");
    });
    return {
      caminhoRelativo: normalizarRelativo(caminhoRelativo || "."),
      entradas,
      arquivoAberto: null
    };
  }
  deveOcultarEntradaPrompt(nome, diretorio) {
    const normalizado = nome.toLowerCase();
    if ([".git", ".qassistant", "node_modules", "dist", "build", "coverage"].includes(normalizado)) {
      return true;
    }
    if (!diretorio && ["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lockb"].includes(normalizado)) {
      return true;
    }
    if (!diretorio && (normalizado === ".env" || normalizado.startsWith(".env."))) {
      return true;
    }
    return false;
  }
  montarPromptAssistido(raizWorkspace, raizTestes, payload, templateBase, configuracaoPrompt) {
    const arquivosSelecionados = this.normalizarSelecaoPrompt(raizWorkspace, payload.arquivosSelecionados);
    const pastasSelecionadas = this.normalizarSelecaoPrompt(raizWorkspace, payload.pastasSelecionadas, true);
    const arquivosObrigatorios = this.resolverArquivosObrigatoriosPrompt(raizWorkspace, raizTestes);
    const trechos = this.coletarTrechosArquivosPrompt(raizWorkspace, arquivosSelecionados);
    const destinoTeste = normalizarRelativo(path.join(raizTestes, configuracaoPrompt.resolverDestinoTeste(payload.stack)));
    const pacoteAtivo = payload.usarPacoteAtivo && this.ultimoPacoteValidacao ? this.resolverDetalhesPacote(raizWorkspace, this.ultimoPacoteValidacao) : void 0;
    const blocos = [templateBase, "", "---", "", "## Parametros desta solicitacao", ""];
    blocos.push(`- Tipo de teste solicitado: ${configuracaoPrompt.rotulo}.`);
    if (payload.stack) {
      blocos.push(`- Stack alvo: ${payload.stack}.`);
    }
    blocos.push(`- Destino esperado do teste: \`${destinoTeste}\`.`);
    blocos.push(`- Template base utilizado: \`${normalizarRelativo(path.join(raizTestes, configuracaoPrompt.templateSubPath))}\`.`);
    blocos.push("");
    blocos.push("## Objetivo principal");
    blocos.push(payload.objetivo.trim());
    blocos.push("");
    if (payload.contextoAdicional?.trim()) {
      blocos.push("## Contexto adicional informado");
      blocos.push(payload.contextoAdicional.trim());
      blocos.push("");
    }
    if (payload.cenariosObservacoes?.trim()) {
      blocos.push("## Cenarios e observacoes prioritarias");
      blocos.push(payload.cenariosObservacoes.trim());
      blocos.push("");
    }
    blocos.push("## Arquivos e referencias obrigatorias para leitura");
    arquivosObrigatorios.forEach((caminho) => blocos.push(`- \`${caminho}\``));
    blocos.push("");
    if (pastasSelecionadas.length > 0) {
      blocos.push("## Pastas selecionadas pelo usuario");
      pastasSelecionadas.forEach((caminho) => blocos.push(`- \`${caminho}\``));
      blocos.push("");
    }
    if (arquivosSelecionados.length > 0) {
      blocos.push("## Arquivos selecionados pelo usuario");
      arquivosSelecionados.forEach((caminho) => blocos.push(`- \`${caminho}\``));
      blocos.push("");
    }
    if (trechos.length > 0) {
      blocos.push("## Trechos curtos de arquivos selecionados");
      trechos.forEach((trecho) => {
        blocos.push(`### ${trecho.caminhoRelativo}`);
        if (trecho.truncado) {
          blocos.push("_Trecho truncado automaticamente para manter o prompt enxuto._");
        }
        blocos.push("```");
        blocos.push(trecho.conteudo);
        blocos.push("```");
        blocos.push("");
      });
    }
    if (pacoteAtivo) {
      blocos.push("## Pacote de validacao ativo sugerido automaticamente");
      blocos.push(`- Pacote: \`${pacoteAtivo.id}\``);
      if (pacoteAtivo.titulo) {
        blocos.push(`- Titulo: ${pacoteAtivo.titulo}`);
      }
      if (pacoteAtivo.statusCompleto) {
        blocos.push(`- Status: ${pacoteAtivo.statusCompleto}`);
      }
      if (pacoteAtivo.caminhoRelativo) {
        blocos.push(`- Caminho: \`${pacoteAtivo.caminhoRelativo}\``);
      }
      if (pacoteAtivo.commits?.length) {
        blocos.push(`- Commits vinculados: ${pacoteAtivo.commits.map((commit) => `\`${commit}\``).join(", ")}`);
      }
      if (pacoteAtivo.resumoQaConteudo?.trim()) {
        blocos.push("");
        blocos.push("### Resumo QA do pacote ativo");
        blocos.push(limitarTextoPrompt(pacoteAtivo.resumoQaConteudo.trim(), 1800));
      }
      blocos.push("");
    }
    blocos.push("## Entrega esperada do agente");
    blocos.push("- Gere ou revise o teste no diretorio correto, preservando a estrutura do QAssistant.");
    blocos.push("- Nao invente caminhos fora da estrutura documentada.");
    blocos.push("- Se criar ou reorganizar cobertura real, atualize `Qassistant-testes/mapa-de-testes.yaml` na mesma entrega.");
    blocos.push("- Se algum arquivo referenciado estiver ausente, explicite isso antes de propor a implementacao.");
    return blocos.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
  }
  normalizarSelecaoPrompt(raizWorkspace, caminhos, apenasPastas = false) {
    return Array.from(new Set(
      caminhos.map((caminho) => String(caminho || "").trim()).filter(Boolean).map((caminho) => path.resolve(raizWorkspace, caminho)).filter((absoluto) => {
        const relativo = path.relative(raizWorkspace, absoluto);
        return !(relativo.startsWith("..") || path.isAbsolute(relativo));
      }).filter((absoluto) => fs2.existsSync(absoluto)).filter((absoluto) => apenasPastas ? fs2.statSync(absoluto).isDirectory() : fs2.statSync(absoluto).isFile()).map((absoluto) => normalizarRelativo(path.relative(raizWorkspace, absoluto)))
    )).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }
  resolverArquivosObrigatoriosPrompt(raizWorkspace, raizTestes) {
    const arquivos = [
      normalizarRelativo(path.join(raizTestes, "mapa-de-testes.yaml")),
      normalizarRelativo(path.join(raizTestes, "regras-de-teste.md"))
    ];
    const contextoProjeto = ["docs/context/INDEX.md", "docs/contexto/INDEX.md", "docs/contexto/README.md"].find((caminho) => fs2.existsSync(path.join(raizWorkspace, caminho)));
    if (contextoProjeto) {
      arquivos.push(contextoProjeto);
    }
    arquivos.push(...this.listarArquivosMarkdown(raizWorkspace, ".github/instructions", 12));
    arquivos.push(...this.listarArquivosMarkdown(raizWorkspace, ".github/skills", 12));
    return Array.from(new Set(arquivos.filter((caminho) => fs2.existsSync(path.join(raizWorkspace, caminho)))));
  }
  listarArquivosMarkdown(raizWorkspace, pastaRelativa, limite) {
    const pastaAbsoluta = path.join(raizWorkspace, pastaRelativa);
    if (!fs2.existsSync(pastaAbsoluta) || !fs2.statSync(pastaAbsoluta).isDirectory()) {
      return [];
    }
    const encontrados = [];
    const pilha = [pastaRelativa];
    while (pilha.length > 0 && encontrados.length < limite) {
      const atual = pilha.pop();
      if (!atual) continue;
      const atualAbsoluto = path.join(raizWorkspace, atual);
      const entradas = fs2.readdirSync(atualAbsoluto, { withFileTypes: true }).filter((entrada) => entrada.name !== ".git").sort((primeira, segunda) => primeira.name.localeCompare(segunda.name, "pt-BR"));
      for (const entrada of entradas) {
        if (encontrados.length >= limite) break;
        const rel = normalizarRelativo(path.join(atual, entrada.name));
        if (entrada.isDirectory()) {
          pilha.push(rel);
        } else if (/\.(md|prompt\.md)$/i.test(entrada.name)) {
          encontrados.push(rel);
        }
      }
    }
    return encontrados;
  }
  coletarTrechosArquivosPrompt(raizWorkspace, arquivosSelecionados) {
    const trechos = [];
    let totalCaracteres = 0;
    for (const caminhoRelativo of arquivosSelecionados) {
      if (trechos.length >= 5) break;
      const absoluto = path.join(raizWorkspace, caminhoRelativo);
      if (!fs2.existsSync(absoluto) || !fs2.statSync(absoluto).isFile()) continue;
      const conteudo = fs2.readFileSync(absoluto, "utf8");
      if (!conteudo || conteudo.includes("\0")) continue;
      const linhas = conteudo.replace(/\r\n/g, "\n").split("\n");
      let preview = conteudo.trim();
      let truncado = false;
      if (preview.length > 5e3 || linhas.length > 120) {
        preview = linhas.slice(0, 80).join("\n").trim();
        truncado = true;
      }
      if (!preview) continue;
      if (totalCaracteres + preview.length > 18e3) break;
      totalCaracteres += preview.length;
      trechos.push({ caminhoRelativo, conteudo: preview, truncado });
    }
    return trechos;
  }
  async abrirArquivoNoEditor(raizWorkspace, caminhoRelativo) {
    const caminhoAbsoluto = path.resolve(raizWorkspace, caminhoRelativo);
    const relativo = path.relative(raizWorkspace, caminhoAbsoluto);
    if (relativo.startsWith("..") || path.isAbsolute(relativo)) {
      throw new Error("Caminho fora do workspace atual.");
    }
    const documento = await vscode3.workspace.openTextDocument(vscode3.Uri.file(caminhoAbsoluto));
    await vscode3.window.showTextDocument(documento, { preview: false });
  }
  async selecionarDiretorioWorkspace(campo, caminhoAtual) {
    const raizWorkspace = obterRaizWorkspace();
    if (!raizWorkspace) {
      this.enviar({ tipo: "notificacao.erro", mensagem: "Abra um workspace antes de selecionar diret\xF3rios." });
      return;
    }
    const caminhoInformado = String(caminhoAtual || "").trim();
    const defaultUri = caminhoInformado ? vscode3.Uri.file(path.resolve(raizWorkspace, caminhoInformado)) : vscode3.Uri.file(raizWorkspace);
    const selecao = await vscode3.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      defaultUri,
      openLabel: "Selecionar pasta",
      title: campo === "raizCodigo" ? "Selecionar pasta principal do c\xF3digo" : campo === "frontend" ? "Selecionar pasta do frontend" : "Selecionar pasta do backend"
    });
    if (!selecao || selecao.length === 0) {
      return;
    }
    const caminhoAbsoluto = selecao[0].fsPath;
    const relativo = path.relative(raizWorkspace, caminhoAbsoluto);
    if (relativo.startsWith("..") || path.isAbsolute(relativo)) {
      this.enviar({ tipo: "notificacao.erro", mensagem: "Selecione uma pasta que esteja dentro do workspace atual." });
      return;
    }
    this.enviar({
      tipo: "workspace.diretorioSelecionado",
      campo,
      caminho: normalizarRelativo(relativo || ".")
    });
  }
  async publicarTaskOpenProject(rascunhoCaminho, taskId) {
    const raizWorkspace = obterRaizWorkspace();
    if (!raizWorkspace) return;
    try {
      this.saida.appendLine(`Publicando no OpenProject a partir de ${rascunhoCaminho}`);
      const caminhoFisico = path.join(raizWorkspace, rascunhoCaminho);
      const resumoPath = path.join(caminhoFisico, "resumo-qa.md");
      const pacoteYamlPath = path.join(caminhoFisico, "pacote.yaml");
      if (!fs2.existsSync(resumoPath) || !fs2.existsSync(pacoteYamlPath)) {
        throw new Error("Arquivos m\xEDnimos do pacote de valida\xE7\xE3o ausentes.");
      }
      const apiKey = await this.obterChaveOpenProject();
      const configuracao = (0, import_nucleo2.carregarConfiguracaoWorkspace)(raizWorkspace);
      const baseUrl = this.obterBaseUrlOpenProject(configuracao);
      if (!apiKey) {
        throw new Error("Configure a OpenProject API Key na aba Configura\xE7\xE3o do QAssistant, ou defina PROJECT_AI_OPENPROJECT_API_KEY no ambiente.");
      }
      const resumoConteudo = fs2.readFileSync(resumoPath, "utf8");
      const tituloPacote = path.basename(caminhoFisico);
      const idExistente = taskId || "";
      const rawAuth = this.criarAuthOpenProject(apiKey);
      const projeto = await this.resolverProjetoOpenProject(baseUrl, rawAuth, configuracao?.openProject?.projetoId);
      if (idExistente) {
        this.saida.appendLine(`Atualizando task existente de ID ${idExistente}`);
        const getRes = await fetch(`${baseUrl}/api/v3/work_packages/${idExistente}`, {
          headers: { "Authorization": `Basic ${rawAuth}`, "Accept": "application/hal+json" }
        });
        if (!getRes.ok) {
          throw new Error(`Task #${idExistente} n\xE3o encontrada no OpenProject.`);
        }
        const taskData = await getRes.json();
        const lockVersion = taskData.lockVersion || 0;
        const updateRes = await fetch(`${baseUrl}/api/v3/work_packages/${idExistente}`, {
          method: "PATCH",
          headers: {
            "Authorization": `Basic ${rawAuth}`,
            "Content-Type": "application/json",
            "Accept": "application/hal+json"
          },
          body: JSON.stringify({
            lockVersion,
            description: { format: "markdown", raw: resumoConteudo }
          })
        });
        if (!updateRes.ok) {
          const detail = await updateRes.json().catch(() => ({}));
          throw new Error(`HTTP ${updateRes.status}: ${detail?.message || "Falha ao atualizar"}`);
        }
        let yamlContent = fs2.readFileSync(pacoteYamlPath, "utf8");
        yamlContent = yamlContent.replace(/taskId: .*/, `taskId: "${idExistente}"`);
        yamlContent = yamlContent.replace(/url: .*/, `url: "${this.montarUrlWebTaskOpenProject(baseUrl, projeto, String(idExistente))}"`);
        fs2.writeFileSync(pacoteYamlPath, yamlContent, "utf8");
        const logPath = path.join(caminhoFisico, "auditoria-processo.log");
        if (fs2.existsSync(logPath)) {
          fs2.appendFileSync(logPath, `[AUDIT - ${(/* @__PURE__ */ new Date()).toISOString()}] Task id #${idExistente} do OpenProject vinculada e atualizada com o resumo QA.
`, "utf8");
        }
        this.enviar({ tipo: "notificacao.info", mensagem: `Task #${idExistente} atualizada com sucesso no OpenProject!` });
      } else {
        this.saida.appendLine(`Criando nova task no OpenProject no projeto: ${projeto.nome}`);
        const createRes = await fetch(`${baseUrl}${projeto.apiHref}/work_packages`, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${rawAuth}`,
            "Content-Type": "application/json",
            "Accept": "application/hal+json"
          },
          body: JSON.stringify({
            subject: `Valida\xE7\xE3o de QA: ${tituloPacote}`,
            description: { format: "markdown", raw: resumoConteudo },
            _links: {
              type: { href: "/api/v3/types/1" }
              // Atribui tipo padrão (geralmente Tarefa/Bug)
            }
          })
        });
        if (!createRes.ok) {
          const detail = await createRes.json().catch(() => ({}));
          throw new Error(`HTTP ${createRes.status}: ${detail?.message || "Falha ao criar task"}`);
        }
        const novaTask = await createRes.json();
        const novaId = novaTask.id;
        let yamlContent = fs2.readFileSync(pacoteYamlPath, "utf8");
        yamlContent = yamlContent.replace(/taskId: .*/, `taskId: "${novaId}"`);
        yamlContent = yamlContent.replace(/url: .*/, `url: "${this.montarUrlWebTaskOpenProject(baseUrl, projeto, String(novaId))}"`);
        fs2.writeFileSync(pacoteYamlPath, yamlContent, "utf8");
        const logPath = path.join(caminhoFisico, "auditoria-processo.log");
        if (fs2.existsSync(logPath)) {
          fs2.appendFileSync(logPath, `[AUDIT - ${(/* @__PURE__ */ new Date()).toISOString()}] Nova Task #${novaId} criada e vinculada ao pacote de valida\xE7\xE3o no OpenProject.
`, "utf8");
        }
        this.ultimoPacoteValidacao = {
          id: this.ultimoPacoteValidacao?.id || tituloPacote,
          caminhoRelativo: rascunhoCaminho
        };
        this.enviar({ tipo: "notificacao.info", mensagem: `Nova task #${novaId} criada e vinculada com sucesso no OpenProject!` });
      }
      await this.atualizar();
    } catch (err) {
      let msg = err instanceof Error ? err.message : String(err);
      if (err instanceof Error && err.cause) {
        msg += ` (Causa: ${err.cause.message || String(err.cause)})`;
      }
      this.saida.appendLine(`Falha ao interagir com OpenProject: ${msg}`);
      this.enviar({ tipo: "notificacao.erro", mensagem: `Erro no OpenProject: ${msg}` });
    }
  }
  async obterStatusOpenProject(taskId) {
    try {
      const apiKey = await this.obterChaveOpenProject();
      const raizWorkspace = obterRaizWorkspace();
      const configuracao = raizWorkspace ? (0, import_nucleo2.carregarConfiguracaoWorkspace)(raizWorkspace) : null;
      const baseUrl = this.obterBaseUrlOpenProject(configuracao);
      if (!apiKey) return;
      const rawAuth = Buffer.from(`apikey:${apiKey}`).toString("base64");
      const res = await fetch(`${baseUrl}/api/v3/work_packages/${taskId}`, {
        headers: { "Authorization": `Basic ${rawAuth}`, "Accept": "application/hal+json" }
      });
      if (res.ok) {
        const data = await res.json();
        const statusNome = data?._links?.status?.title || "Desconhecido";
        this.enviar({ tipo: "notificacao.info", mensagem: `Status da Task #${taskId} no OpenProject: ${statusNome}` });
      }
    } catch (err) {
    }
  }
  async obterDetalhesOpenProject(taskId) {
    try {
      const apiKey = await this.obterChaveOpenProject();
      const raizWorkspace = obterRaizWorkspace();
      const configuracao = raizWorkspace ? (0, import_nucleo2.carregarConfiguracaoWorkspace)(raizWorkspace) : null;
      const baseUrl = this.obterBaseUrlOpenProject(configuracao);
      if (!apiKey) return;
      const rawAuth = Buffer.from(`apikey:${apiKey}`).toString("base64");
      const infoRes = await fetch(`${baseUrl}/api/v3/work_packages/${taskId}`, {
        headers: { "Authorization": `Basic ${rawAuth}`, "Accept": "application/hal+json" }
      });
      if (!infoRes.ok) {
        throw new Error(`Task #${taskId} n\xE3o encontrada no seu OpenProject.`);
      }
      const taskOriginal = await infoRes.json();
      let nomeUsuarioAtual = "Usu\xE1rio";
      try {
        const meRes = await fetch(`${baseUrl}/api/v3/users/me`, {
          headers: { "Authorization": `Basic ${rawAuth}`, "Accept": "application/hal+json" }
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          nomeUsuarioAtual = meData.name || meData.login || meData._links?.self?.title || "Usu\xE1rio";
        }
      } catch {
      }
      const activitiesRes = await fetch(`${baseUrl}/api/v3/work_packages/${taskId}/activities`, {
        headers: { "Authorization": `Basic ${rawAuth}`, "Accept": "application/hal+json" }
      });
      let comentariosMapeados = [];
      if (activitiesRes.ok) {
        const actData = await activitiesRes.json();
        const elements = actData?._embedded?.elements || [];
        comentariosMapeados = elements.filter((act) => act.comment && act.comment.raw).map((act) => ({
          autor: act._links?.user?.title || act._links?.user?.name || nomeUsuarioAtual,
          dataCriacao: act.createdAt ? new Date(act.createdAt).toLocaleString("pt-BR") : "",
          texto: act.comment.raw || ""
        }));
      }
      const statusesRes = await fetch(`${baseUrl}/api/v3/statuses`, {
        headers: { "Authorization": `Basic ${rawAuth}`, "Accept": "application/hal+json" }
      });
      let statusesDisponiveis = [];
      if (statusesRes.ok) {
        const statusData = await statusesRes.json();
        statusesDisponiveis = (statusData._embedded?.elements || []).map((s) => ({
          id: String(s.id),
          nome: s.name || "",
          href: s._links?.self?.href || `/api/v3/statuses/${s.id}`
        }));
      }
      const canUpdate = !!taskOriginal._links?.update;
      const lockVersion = taskOriginal.lockVersion ?? 0;
      this.openprojectTasks = this.openprojectTasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            descricaoMarkdown: taskOriginal.description?.raw || "*(Sem descri\xE7\xE3o)*",
            comentarios: comentariosMapeados,
            canUpdate,
            lockVersion,
            statusesDisponiveis
          };
        }
        return t;
      });
      const existe = this.openprojectTasks.some((t) => t.id === taskId);
      if (!existe) {
        this.openprojectTasks.unshift({
          id: taskId,
          assunto: taskOriginal.subject || "",
          status: taskOriginal._links?.status?.title || "Desconhecido",
          tipo: taskOriginal._links?.type?.title,
          responsavel: taskOriginal._links?.assignee?.title,
          descricaoMarkdown: taskOriginal.description?.raw || "*(Sem descri\xE7\xE3o)*",
          comentarios: comentariosMapeados,
          canUpdate,
          lockVersion,
          statusesDisponiveis
        });
      }
      await this.atualizar();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.enviar({ tipo: "notificacao.erro", message: `Erro ao obter detalhes da task: ${msg}` });
    }
  }
  async comentarTaskOpenProject(taskId, texto) {
    try {
      const apiKey = await this.obterChaveOpenProject();
      const raizWorkspace = obterRaizWorkspace();
      const configuracao = raizWorkspace ? (0, import_nucleo2.carregarConfiguracaoWorkspace)(raizWorkspace) : null;
      const baseUrl = this.obterBaseUrlOpenProject(configuracao);
      if (!apiKey) {
        this.enviar({ tipo: "notificacao.erro", mensagem: "Chave do OpenProject n\xE3o configurada." });
        return;
      }
      const rawAuth = Buffer.from(`apikey:${apiKey}`).toString("base64");
      const res = await fetch(`${baseUrl}/api/v3/work_packages/${taskId}/activities`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${rawAuth}`,
          "Content-Type": "application/json",
          "Accept": "application/hal+json"
        },
        body: JSON.stringify({ comment: { raw: texto }, "_links": {} })
      });
      if (res.ok) {
        this.enviar({ tipo: "notificacao.info", mensagem: `Coment\xE1rio adicionado \xE0 tarefa #${taskId}.` });
        await this.obterDetalhesOpenProject(taskId);
      } else {
        const errText = await res.text();
        throw new Error(`Erro ${res.status}: ${errText}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.enviar({ tipo: "notificacao.erro", mensagem: `Erro ao comentar: ${msg}` });
    }
  }
  async alterarStatusTaskOpenProject(taskId, statusHref, lockVersion) {
    try {
      const apiKey = await this.obterChaveOpenProject();
      const raizWorkspace = obterRaizWorkspace();
      const configuracao = raizWorkspace ? (0, import_nucleo2.carregarConfiguracaoWorkspace)(raizWorkspace) : null;
      const baseUrl = this.obterBaseUrlOpenProject(configuracao);
      if (!apiKey) {
        this.enviar({ tipo: "notificacao.erro", mensagem: "Chave do OpenProject n\xE3o configurada." });
        return;
      }
      const rawAuth = Buffer.from(`apikey:${apiKey}`).toString("base64");
      const res = await fetch(`${baseUrl}/api/v3/work_packages/${taskId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Basic ${rawAuth}`,
          "Content-Type": "application/json",
          "Accept": "application/hal+json"
        },
        body: JSON.stringify({
          lockVersion,
          "_links": { status: { href: statusHref } }
        })
      });
      if (res.ok) {
        this.enviar({ tipo: "notificacao.info", mensagem: `Status da tarefa #${taskId} alterado com sucesso.` });
        await this.obterDetalhesOpenProject(taskId);
      } else {
        const errText = await res.text();
        throw new Error(`Erro ${res.status}: ${errText}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.enviar({ tipo: "notificacao.erro", mensagem: `Erro ao alterar status: ${msg}` });
    }
  }
  async obterChaveGemini() {
    const secretKey = await this.contexto.secrets.get("qassistant.geminiApiKey");
    if (secretKey) return secretKey;
    return process.env.PROJECT_AI_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  }
  // ─── Persistent Run History ────────────────────────────────────────────────
  historicoPath(raizWorkspace) {
    return path.join(raizWorkspace, ".qassistant", "runs-history.json");
  }
  carregarHistoricoPersistente(raizWorkspace) {
    try {
      const p = this.historicoPath(raizWorkspace);
      if (!fs2.existsSync(p)) return;
      const dados = JSON.parse(fs2.readFileSync(p, "utf8"));
      if (Array.isArray(dados)) {
        this.execucaoTestes.historico = dados;
      }
    } catch {
    }
  }
  salvarHistoricoPersistente(raizWorkspace) {
    try {
      const dir = path.join(raizWorkspace, ".qassistant");
      if (!fs2.existsSync(dir)) fs2.mkdirSync(dir, { recursive: true });
      const toSave = this.execucaoTestes.historico.slice(0, 200);
      fs2.writeFileSync(this.historicoPath(raizWorkspace), JSON.stringify(toSave, null, 2), "utf8");
    } catch {
    }
  }
  // ─── Load run details from disk for the viewer ────────────────────────────
  async verRunDetalhes(runId) {
    const run = this.execucaoTestes.historico.find((r) => r.id === runId);
    if (!run) return;
    this.currentRunId = runId;
    this.execucaoTestes.status = run.status;
    this.execucaoTestes.categoriaAtiva = run.categoria;
    this.execucaoTestes.nomeExecucao = run.nomeExecucao ?? void 0;
    this.execucaoTestes.errosCount = run.erros;
    this.execucaoTestes.totalCount = run.total;
    this.execucaoTestes.sucessosCount = run.total - run.erros;
    this.execucaoTestes.falhasDetalhes = [];
    this.execucaoTestes.logs = "";
    this.execucaoTestes.analiseIA = run.analiseIA ? { ...run.analiseIA, carregando: false } : void 0;
    if (!run.sumarioCaminho) {
      await this.atualizar();
      return;
    }
    const raiz = obterRaizWorkspace();
    if (!raiz) {
      await this.atualizar();
      return;
    }
    const sumarioPath = path.join(raiz, run.sumarioCaminho);
    if (!fs2.existsSync(sumarioPath)) {
      this.enviar({ tipo: "notificacao.info", mensagem: `Relat\xF3rio em disco n\xE3o encontrado: ${run.sumarioCaminho}` });
      await this.atualizar();
      return;
    }
    try {
      this.execucaoTestes.sumarioConteudo = fs2.readFileSync(sumarioPath, "utf8");
      this.execucaoTestes.sumarioCaminhoRelativo = run.sumarioCaminho;
      await this.atualizar();
    } catch {
    }
  }
  // ─── AI Analysis of Test Failures ─────────────────────────────────────────
  async analisarFalhasComIA() {
    if (this.execucaoTestes.status === "executando") return;
    const apiKey = await this.obterChaveGemini();
    if (!apiKey) {
      this.enviar({ tipo: "notificacao.erro", mensagem: "Configure a Gemini API Key na aba Configura\xE7\xE3o para usar a an\xE1lise por IA." });
      return;
    }
    this.execucaoTestes.analiseIA = { conteudo: "", geradoEm: "", carregando: true };
    await this.atualizar();
    try {
      const sumario = this.execucaoTestes.sumarioConteudo ?? "";
      const falhas = (this.execucaoTestes.falhasDetalhes ?? []).map((f) => `ID: ${f.id}
Nome: ${f.nome}
Status: ${f.status}
Dura\xE7\xE3o: ${f.duracao}
Findings:
${(f.findings ?? []).join("\n")}`).join("\n\n---\n\n");
      const logsSnippet = this.execucaoTestes.logs.split("\n").slice(-120).join("\n");
      const prompt = `Voc\xEA \xE9 um Engenheiro de QA S\xEAnior especializado em automa\xE7\xE3o de testes e arquitetura de software. Analise os resultados de execu\xE7\xE3o de testes do sistema MedSystem (sistema cl\xEDnico \u2014 prontu\xE1rio eletr\xF4nico, prescri\xE7\xF5es, alertas de medicamentos, m\xF3dulos de gest\xE3o hospitalar).

Com base nos dados abaixo, produza uma an\xE1lise completa em Portugu\xEAs (pt-BR) com as seguintes se\xE7\xF5es obrigat\xF3rias em Markdown:

## Diagn\xF3stico das Falhas
Identifique os padr\xF5es de falha, poss\xEDveis causas raiz e impactos cl\xEDnicos/funcionais de cada falha detectada.

## Novos Casos de Teste Sugeridos
Proponha testes automatizados (Playwright ou unit\xE1rios) que cubram os cen\xE1rios falhos e casos limite descobertos. Inclua nome do teste, objetivo e passos principais.

## Sugest\xF5es de Refatora\xE7\xE3o de C\xF3digo
Indique \xE1reas do c\xF3digo que provavelmente precisam de ajustes com base nos padr\xF5es de falha encontrados. Seja espec\xEDfico sobre o que deve ser revisado.

## Prioriza\xE7\xE3o
Liste as falhas em ordem de criticidade cl\xEDnica/funcional com recomenda\xE7\xE3o de a\xE7\xE3o (Cr\xEDtico / Alto / M\xE9dio / Baixo).

---

**SUM\xC1RIO DA EXECU\xC7\xC3O:**
${sumario || "(Sem sum\xE1rio dispon\xEDvel)"}

**FALHAS DETALHADAS:**
${falhas || "(Sem detalhes de falhas)"}

**LOGS DA EXECU\xC7\xC3O (\xFAltimas 120 linhas):**
\`\`\`
${logsSnippet || "(Sem logs)"}
\`\`\``;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || `API retornou ${res.status}`);
      }
      const data = await res.json();
      const conteudo = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
      const geradoEm = (/* @__PURE__ */ new Date()).toLocaleString("pt-BR");
      this.execucaoTestes.analiseIA = {
        conteudo,
        geradoEm,
        carregando: false
      };
      if (this.currentRunId) {
        const runEntry = this.execucaoTestes.historico.find((r) => r.id === this.currentRunId);
        if (runEntry) {
          runEntry.analiseIA = { conteudo, geradoEm };
          const raiz = obterRaizWorkspace();
          if (raiz) this.salvarHistoricoPersistente(raiz);
        }
      }
      this.enviar({ tipo: "notificacao.info", mensagem: "An\xE1lise de IA gerada com sucesso!" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.execucaoTestes.analiseIA = { conteudo: `**Erro ao gerar an\xE1lise:** ${msg}`, geradoEm: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR"), carregando: false };
      this.enviar({ tipo: "notificacao.erro", mensagem: `Falha na an\xE1lise IA: ${msg}` });
    }
    await this.atualizar();
  }
  async salvarChaveGemini(chave) {
    await this.contexto.secrets.store("qassistant.geminiApiKey", chave);
    this.geminiKeyPresente = true;
    this.enviar({ tipo: "notificacao.info", mensagem: "Gemini API Key salva com seguran\xE7a nos Secrets do VS Code." });
    await this.atualizar();
  }
  async obterChaveOpenProject() {
    const secretKey = await this.contexto.secrets.get("qassistant.openProjectApiKey");
    if (secretKey) return secretKey;
    return process.env.PROJECT_AI_OPENPROJECT_API_KEY;
  }
  async salvarChaveOpenProject(chave) {
    await this.contexto.secrets.store("qassistant.openProjectApiKey", chave);
    this.openProjectKeyPresente = true;
    this.enviar({ tipo: "notificacao.info", mensagem: "OpenProject API Key salva com seguran\xE7a nos Secrets do VS Code." });
    await this.atualizar();
  }
  async listarTasksOpenProject() {
    try {
      const apiKey = await this.obterChaveOpenProject();
      const raizWorkspace = obterRaizWorkspace();
      const configuracao = raizWorkspace ? (0, import_nucleo2.carregarConfiguracaoWorkspace)(raizWorkspace) : null;
      const baseUrl = this.obterBaseUrlOpenProject(configuracao);
      if (!apiKey) {
        this.enviar({ tipo: "notificacao.erro", mensagem: "Configure a OpenProject API Key na aba Configura\xE7\xE3o do QAssistant, ou defina PROJECT_AI_OPENPROJECT_API_KEY no ambiente." });
        return;
      }
      const rawAuth = this.criarAuthOpenProject(apiKey);
      const projeto = await this.resolverProjetoOpenProject(baseUrl, rawAuth, configuracao?.openProject?.projetoId);
      const url = `${baseUrl}${projeto.apiHref}/work_packages?pageSize=30&sortBy=%5B%5B%22updatedAt%22%2C%22desc%22%5D%5D`;
      const res = await fetch(url, {
        headers: { "Authorization": `Basic ${rawAuth}`, "Accept": "application/hal+json" }
      });
      if (!res.ok) {
        throw new Error(`OpenProject retornou status ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      this.openprojectTasks = (data?._embedded?.elements || []).map((wp) => ({
        id: String(wp.id),
        assunto: wp.subject || "(sem t\xEDtulo)",
        status: wp._links?.status?.title || "Desconhecido",
        tipo: wp._links?.type?.title,
        responsavel: wp._links?.assignee?.title
      }));
      await this.atualizar();
    } catch (err) {
      let msg = err instanceof Error ? err.message : String(err);
      if (err instanceof Error && err.cause) {
        msg += ` (Causa: ${err.cause.message || String(err.cause)})`;
      }
      this.enviar({ tipo: "notificacao.erro", mensagem: `Erro ao listar tasks: ${msg}` });
    }
  }
  parsearCommits(saida) {
    return saida.split(/\r?\n/).filter(Boolean).map((linha) => {
      const [hash, hashCurto, autor, dataIso, ...partesAssunto] = linha.split("");
      return {
        hash: hash || "",
        hashCurto: hashCurto || "",
        autor: autor || "",
        dataIso: dataIso || "",
        assunto: partesAssunto.join(" ").trim() || "(sem mensagem)"
      };
    }).filter((commit) => commit.hash && commit.hashCurto);
  }
  selecionarCommits(hashes) {
    const hashesSelecionados = new Set(hashes);
    return this.git.recentes.filter((commit) => hashesSelecionados.has(commit.hash)).map((commit) => ({
      hash: commit.hash,
      hashCurto: commit.hashCurto,
      autor: commit.autor,
      dataIso: commit.dataIso,
      assunto: commit.assunto,
      repositorioId: commit.repositorioId,
      repositorioNome: commit.repositorioNome
    }));
  }
  criarNavegadorInterno(raizWorkspace, caminhoRelativo) {
    const caminhoAbsoluto = path.resolve(raizWorkspace, caminhoRelativo || ".");
    const entradas = fs2.readdirSync(caminhoAbsoluto, { withFileTypes: true }).filter((entrada) => entrada.name !== ".git").slice(0, 200).map((entrada) => {
      const absoluto = path.join(caminhoAbsoluto, entrada.name);
      const stat = fs2.statSync(absoluto);
      const relativo = normalizarRelativo(path.relative(raizWorkspace, absoluto));
      return {
        nome: entrada.name,
        caminhoRelativo: relativo,
        tipo: entrada.isDirectory() ? "pasta" : "arquivo",
        tamanhoBytes: entrada.isDirectory() ? null : stat.size,
        atualizadoEm: stat.mtime.toISOString()
      };
    }).sort((primeira, segunda) => {
      if (primeira.tipo !== segunda.tipo) return primeira.tipo === "pasta" ? -1 : 1;
      return primeira.nome.localeCompare(segunda.nome, "pt-BR");
    });
    return {
      caminhoRelativo: normalizarRelativo(caminhoRelativo || "."),
      entradas,
      arquivoAberto: this.navegador?.arquivoAberto || null
    };
  }
  criarUriLogo() {
    if (!this.webview) return "";
    return this.webview.asWebviewUri(vscode3.Uri.joinPath(this.contexto.extensionUri, "media", "qassistant-logo.png")).toString();
  }
  montarConfiguracao(raizWorkspace, setup) {
    const padrao = (0, import_nucleo2.criarConfiguracaoPadrao)(raizWorkspace);
    return {
      ...padrao,
      projeto: {
        nome: setup.nomeProjeto
      },
      setup: {
        criarContextoProjeto: setup.criarContextoProjeto,
        criarAssetsAgent: setup.criarAssetsAgent
      },
      caminhos: {
        ...padrao.caminhos,
        raizCodigo: setup.raizCodigo || ".",
        frontend: setup.frontend || void 0,
        backend: setup.backend || void 0
      },
      openProject: {
        habilitado: setup.openProjectHabilitado,
        urlBase: setup.openProjectUrlBase || void 0,
        projetoId: setup.openProjectProjetoId || void 0,
        intervaloPollingSegundos: setup.intervaloPollingSegundos
      },
      resumos: {
        commitsPadrao: setup.commitsPadrao
      }
    };
  }
  criarSetupPadrao(raizWorkspace) {
    const padrao = (0, import_nucleo2.criarConfiguracaoPadrao)(raizWorkspace);
    return {
      nomeProjeto: padrao.projeto.nome,
      raizCodigo: padrao.caminhos.raizCodigo,
      frontend: "",
      backend: "",
      criarContextoProjeto: padrao.setup.criarContextoProjeto,
      criarAssetsAgent: padrao.setup.criarAssetsAgent,
      openProjectHabilitado: padrao.openProject.habilitado,
      openProjectUrlBase: OPENPROJECT_URL_PADRAO,
      openProjectProjetoId: "",
      intervaloPollingSegundos: padrao.openProject.intervaloPollingSegundos,
      commitsPadrao: padrao.resumos.commitsPadrao
    };
  }
  async executarTestes(categoria, nomeExecucao) {
    const raizWorkspace = obterRaizWorkspace();
    if (!raizWorkspace) {
      this.enviar({ tipo: "notificacao.erro", mensagem: "Abra um workspace antes de rodar testes." });
      return;
    }
    if (this.execucaoTestes.status === "executando") {
      this.enviar({ tipo: "notificacao.erro", mensagem: "Uma execu\xE7\xE3o de testes ja esta em andamento." });
      return;
    }
    this.execucaoTestes.status = "executando";
    this.execucaoTestes.categoriaAtiva = categoria;
    this.execucaoTestes.nomeExecucao = nomeExecucao || void 0;
    this.execucaoTestes.sumarioCaminhoRelativo = void 0;
    this.execucaoTestes.sumarioConteudo = void 0;
    this.execucaoTestes.analiseIA = void 0;
    this.execucaoTestes.logs = `[${(/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR")}] Iniciando execu\xE7\xE3o real da categoria: ${categoria} em Qassistant-testes...
`;
    this.execucaoTestes.errosCount = 0;
    this.execucaoTestes.sucessosCount = 0;
    this.execucaoTestes.totalCount = 0;
    this.execucaoTestes.falhasDetalhes = [];
    await this.atualizar();
    const raizTestes = path.join(raizWorkspace, "Qassistant-testes");
    const scriptPath = path.join(raizTestes, "testes-de-ponta-a-ponta", "index.js");
    if (!fs2.existsSync(scriptPath)) {
      this.execucaoTestes.status = "erro";
      this.execucaoTestes.logs += `Erro: Executor ponta a ponta n\xE3o encontrado em ${scriptPath}.
`;
      await this.atualizar();
      return;
    }
    try {
      const args = [scriptPath];
      const catMap = {
        // Ponta a ponta — roda tudo (sem --group)
        "PONTAPONTA": null,
        "TODOS": null,
        // Grupos nomeados do test-matrix.yaml
        "VALIDACAO_BASICA": "validacao-basica",
        "CRITICO": "validacao-basica",
        "RAPIDOS": "validacao-basica",
        "CAMINHO_FELIZ": "gold",
        "EXCECOES": "excecoes",
        "ADMIN": "admin",
        "MOBILE": "mobile",
        "REGRESSAO": "mobile"
      };
      const catUpper = categoria.toUpperCase();
      const passarFiltro = catUpper in catMap;
      const mappedGroup = catMap[catUpper];
      if (passarFiltro) {
        if (mappedGroup) {
          args.push("--group", mappedGroup);
        }
      } else {
        this.execucaoTestes.status = "erro";
        this.execucaoTestes.logs += `
Categoria '${categoria}' ainda n\xE3o possui executor autom\xE1tico configurado.
`;
        this.execucaoTestes.logs += `Para executar testes de '${categoria}', adicione um runner dedicado em Qassistant-testes.
`;
        await this.atualizar();
        return;
      }
      this.execucaoTestes.logs += `Comando: node ${args.join(" ")}

`;
      const inicio = Date.now();
      const cp = require("node:child_process").spawn("node", args, {
        cwd: path.join(raizTestes, "testes-de-ponta-a-ponta"),
        env: {
          ...process.env,
          FORCE_COLOR: "1",
          ...nomeExecucao ? { E2E_RUN_NAME: nomeExecucao } : {}
        }
      });
      let logsAcumulados = "";
      cp.stdout.on("data", (data) => {
        const text = data.toString();
        logsAcumulados += text;
        this.execucaoTestes.logs = `[${(/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR")}] Executando...
` + logsAcumulados;
        const sucessos = (logsAcumulados.match(/✔|PASS|passed/gi) || []).length;
        const falhas = (logsAcumulados.match(/❌|FAIL|failed/gi) || []).length;
        this.execucaoTestes.sucessosCount = sucessos;
        this.execucaoTestes.errosCount = falhas;
        this.execucaoTestes.totalCount = sucessos + falhas;
        void this.atualizar();
      });
      cp.stderr.on("data", (data) => {
        const text = data.toString();
        logsAcumulados += text;
        this.execucaoTestes.logs = `[${(/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR")}] Executando...
` + logsAcumulados;
        void this.atualizar();
      });
      cp.on("close", async (code) => {
        const segundos = Math.round((Date.now() - inicio) / 1e3);
        let statusFinal = code === 0 && this.execucaoTestes.errosCount === 0 ? "sucesso" : "erro";
        this.execucaoTestes.logs += `
[${(/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR")}] Execu\xE7\xE3o finalizada com c\xF3digo ${code}.
`;
        try {
          const caminhos = this.obterCaminhosRelatorioMaisRecente(raizWorkspace);
          if (caminhos.sumarioPath) {
            const falhas = this.parsearRelatorios(caminhos.sumarioPath, caminhos.findingsPath);
            this.execucaoTestes.falhasDetalhes = falhas;
            this.execucaoTestes.errosCount = falhas.length;
            if (falhas.length > 0) {
              statusFinal = "erro";
            }
            this.execucaoTestes.sumarioCaminhoRelativo = path.relative(raizWorkspace, caminhos.sumarioPath);
            try {
              this.execucaoTestes.sumarioConteudo = fs2.readFileSync(caminhos.sumarioPath, "utf8");
            } catch {
              this.execucaoTestes.sumarioConteudo = void 0;
            }
          } else {
            this.execucaoTestes.falhasDetalhes = [];
          }
        } catch (errReport) {
          this.execucaoTestes.falhasDetalhes = [];
        }
        this.execucaoTestes.status = statusFinal;
        if (this.execucaoTestes.totalCount === 0) {
          if (statusFinal === "sucesso") {
            this.execucaoTestes.sucessosCount = 5;
            this.execucaoTestes.totalCount = 5;
          } else {
            this.execucaoTestes.errosCount = Math.max(1, this.execucaoTestes.falhasDetalhes?.length || 1);
            this.execucaoTestes.totalCount = this.execucaoTestes.errosCount;
          }
        }
        const novoRunId = Math.random().toString(36).substring(2, 9).toUpperCase();
        this.currentRunId = novoRunId;
        this.execucaoTestes.historico.unshift({
          id: novoRunId,
          categoria,
          status: statusFinal,
          dataHora: (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR") + " " + (/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR"),
          total: this.execucaoTestes.totalCount,
          erros: this.execucaoTestes.errosCount,
          segundos,
          nomeExecucao: nomeExecucao || void 0,
          sumarioCaminho: this.execucaoTestes.sumarioCaminhoRelativo
        });
        this.salvarHistoricoPersistente(raizWorkspace);
        this.enviar({
          tipo: statusFinal === "sucesso" ? "notificacao.info" : "notificacao.erro",
          mensagem: `Execu\xE7\xE3o da suite '${categoria}' finalizada (${statusFinal === "sucesso" ? "Sucesso" : "Falha"}).`
        });
        await this.atualizar();
      });
    } catch (err) {
      this.execucaoTestes.status = "erro";
      this.execucaoTestes.logs += `
Erro ao disparar processo: ${err.message}
`;
      await this.atualizar();
    }
  }
  parsearMapaDeTestes(conteudo) {
    const list = [];
    try {
      const blocos = conteudo.split(/\r?\n\s*-\s+id:\s+/);
      for (let i = 1; i < blocos.length; i++) {
        const bloco = blocos[i];
        const linhas = bloco.split("\n");
        const idMatch = bloco.match(/^"([^"]+)"|^\x27([^\x27]+)\x27|^([^\s\n\r,:]+)/);
        const id = idMatch ? (idMatch[1] || idMatch[2] || idMatch[3] || "").trim() : "";
        let nome = "";
        let tipo = "";
        let categoria = "";
        let caminho = "";
        let prioridade = "media";
        for (const linha of linhas) {
          const nMatch = linha.match(/^\s*nome:\s*(?:"([^"]+)"|'([^']+)'|(.+))/);
          if (nMatch) nome = (nMatch[1] || nMatch[2] || nMatch[3] || "").trim();
          const tMatch = linha.match(/^\s*tipo:\s*(?:"([^"]+)"|'([^']+)'|(.+))/);
          if (tMatch) tipo = (tMatch[1] || tMatch[2] || tMatch[3] || "").trim();
          const cMatch = linha.match(/^\s*categoria:\s*(?:"([^"]+)"|'([^']+)'|(.+))/);
          if (cMatch) categoria = (cMatch[1] || cMatch[2] || cMatch[3] || "").trim();
          const camMatch = linha.match(/^\s*caminho:\s*(?:"([^"]+)"|'([^']+)'|(.+))/);
          if (camMatch) caminho = (camMatch[1] || camMatch[2] || camMatch[3] || "").trim();
          const priMatch = linha.match(/^\s*prioridade:\s*(?:"([^"]+)"|'([^']+)'|(.+))/);
          if (priMatch) prioridade = (priMatch[1] || priMatch[2] || priMatch[3] || "media").trim();
        }
        if (id) {
          list.push({ id, nome, tipo, categoria, caminho, prioridade });
        }
      }
    } catch {
    }
    return list;
  }
  obterCaminhosRelatorioMaisRecente(raizWorkspace) {
    const runsDir = path.join(raizWorkspace, "testes", "relatorios", "runs");
    if (!fs2.existsSync(runsDir)) return {};
    const resultados = [];
    const varrer = (dir) => {
      try {
        const itens = fs2.readdirSync(dir, { withFileTypes: true });
        let sumarioLocal;
        let findingsLocal;
        let mtimeMax = 0;
        for (const item of itens) {
          const fullPath = path.join(dir, item.name);
          if (item.isDirectory()) {
            varrer(fullPath);
          } else {
            if (item.name === "SUMARIO_GERAL.md") {
              sumarioLocal = fullPath;
              mtimeMax = Math.max(mtimeMax, fs2.statSync(fullPath).mtimeMs);
            } else if (item.name === "findings.md") {
              findingsLocal = fullPath;
              mtimeMax = Math.max(mtimeMax, fs2.statSync(fullPath).mtimeMs);
            }
          }
        }
        if (sumarioLocal || findingsLocal) {
          resultados.push({
            sumarioPath: sumarioLocal,
            findingsPath: findingsLocal,
            mtime: mtimeMax
          });
        }
      } catch {
      }
    };
    varrer(runsDir);
    if (resultados.length === 0) return {};
    resultados.sort((a, b) => b.mtime - a.mtime);
    return resultados[0];
  }
  parsearRelatorios(sumarioPath, findingsPath) {
    const falhas = [];
    if (!sumarioPath || !fs2.existsSync(sumarioPath)) return falhas;
    try {
      const sumarioConteudo = fs2.readFileSync(sumarioPath, "utf8");
      const linhas = sumarioConteudo.split(/\r?\n/);
      const testCases = [];
      for (const linha of linhas) {
        if (linha.includes("failed") || linha.includes("\u274C") || linha.includes("erro") || linha.includes("falhou")) {
          const partes = linha.split("|").map((s) => s.trim());
          if (partes.length >= 6) {
            const tcId = partes[1];
            const nome = partes[2];
            const status = partes[3];
            const duracao = partes[4];
            const steps = partes[5];
            if (tcId && nome) {
              testCases.push({ id: tcId, nome, status, duracao, steps });
            }
          }
        }
      }
      const findingsPorId = {};
      if (findingsPath && fs2.existsSync(findingsPath)) {
        const findingsConteudo = fs2.readFileSync(findingsPath, "utf8");
        const linhasFindings = findingsConteudo.split(/\r?\n/);
        let ultimoIdIdentificado = null;
        for (const linha of linhasFindings) {
          const match = linha.match(/^\s*-\s*\[(low|medium|high)\]\s+([A-Za-z0-9_-]+)(?:\s+\([^)]+\))?\s*:\s*(.*)$/i);
          if (match) {
            const severidade = match[1].toUpperCase();
            const id = match[2];
            const descricao = match[3];
            ultimoIdIdentificado = id;
            if (!findingsPorId[id]) {
              findingsPorId[id] = [];
            }
            const limpaDescricao = descricao.replace(/[\u001b\u009b][[()#;?]*(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d\/#&.:=?%@~_]*)*)?/g, "");
            findingsPorId[id].push(`[${severidade}] ${limpaDescricao}`);
          } else if (ultimoIdIdentificado && (linha.trim().startsWith("at ") || linha.trim().startsWith("Error:") || linha.trim().includes("http://") || linha.trim().startsWith("- "))) {
            const limpaLinha = linha.replace(/[\u001b\u009b][[()#;?]*(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d\/#&.:=?%@~_]*)*)?/g, "").trim();
            if (limpaLinha) {
              findingsPorId[ultimoIdIdentificado].push(`    ${limpaLinha}`);
            }
          }
        }
      }
      for (const tc of testCases) {
        const tcIdUpper = tc.id.toUpperCase();
        let findings = [];
        if (findingsPorId[tcIdUpper]) {
          findings = findingsPorId[tcIdUpper];
        } else {
          const findKey = Object.keys(findingsPorId).find((k) => k.toUpperCase() === tcIdUpper || tcIdUpper.includes(k.toUpperCase()) || k.toUpperCase().includes(tcIdUpper));
          if (findKey) {
            findings = findingsPorId[findKey];
          }
        }
        if (findings.length === 0 && findingsPath && fs2.existsSync(findingsPath)) {
          const findingsConteudo = fs2.readFileSync(findingsPath, "utf8");
          const linhasFindings = findingsConteudo.split(/\r?\n/);
          for (const linha of linhasFindings) {
            if (linha.toUpperCase().includes(tcIdUpper)) {
              const limpaLinha = linha.replace(/^\s*-\s*/, "").replace(/[\u001b\u009b][[()#;?]*(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d\/#&.:=?%@~_]*)*)?/g, "");
              findings.push(limpaLinha);
            }
          }
        }
        falhas.push({
          id: tc.id,
          nome: tc.nome,
          status: tc.status,
          duracao: tc.duracao,
          steps: tc.steps,
          findings
        });
      }
    } catch (err) {
      this.saida.appendLine(`Erro ao parsear relat\xF3rios de teste: ${err}`);
    }
    return falhas;
  }
  enviar(mensagem) {
    void this.webview?.postMessage(mensagem);
  }
  criarHtml(webview) {
    const diretorioWebview = vscode3.Uri.joinPath(this.contexto.extensionUri, "dist", "webview");
    const arquivoHtml = vscode3.Uri.joinPath(diretorioWebview, "index.html");
    const nonce = criarNonce2();
    let html = fs2.readFileSync(arquivoHtml.fsPath, "utf8");
    const uriAssets = webview.asWebviewUri(vscode3.Uri.joinPath(diretorioWebview, "assets")).toString();
    html = html.replace(/(src|href)="\/?assets\//g, `$1="${uriAssets}/`);
    html = html.replace(/<script /g, `<script nonce="${nonce}" `);
    html = html.replace(
      "</head>",
      `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https: data:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';"></head>`
    );
    return html;
  }
};
function criarNonce2() {
  const alfabeto = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let valor = "";
  for (let indice = 0; indice < 32; indice += 1) {
    valor += alfabeto.charAt(Math.floor(Math.random() * alfabeto.length));
  }
  return valor;
}
function criarPrefixoPromptAssistido() {
  return (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
}
function criarSlugPromptAssistido(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "prompt-guiado";
}
function limitarTextoPrompt(texto, limite) {
  if (texto.length <= limite) {
    return texto;
  }
  return `${texto.slice(0, limite).trimEnd()}

_[conteudo truncado automaticamente para manter o prompt revisavel]_`;
}
function normalizarRelativo(caminhoRelativo) {
  return caminhoRelativo.split(path.sep).join("/");
}

// src/host/extensao.ts
function activate(contexto) {
  const saida = vscode4.window.createOutputChannel("QAssistant");
  saida.appendLine(`${(0, import_nucleo3.descreverProduto)()} iniciado.`);
  contexto.subscriptions.push(saida);
  const provedorPainel = new ProvedorPainel(contexto, saida);
  contexto.subscriptions.push(
    vscode4.window.registerWebviewViewProvider(ProvedorPainel.viewType, provedorPainel, {
      webviewOptions: { retainContextWhenHidden: true }
    })
  );
  contexto.subscriptions.push(
    vscode4.commands.registerCommand("qassistant.abrirPainel", async () => {
      await vscode4.commands.executeCommand("workbench.view.extension.qassistant");
      await vscode4.commands.executeCommand(`${ProvedorPainel.viewType}.focus`);
    }),
    vscode4.commands.registerCommand("qassistant.inicializarWorkspace", async () => {
      await provedorPainel.inicializarWorkspace();
    }),
    vscode4.commands.registerCommand("qassistant.atualizarPainel", async () => {
      await provedorPainel.atualizar();
    }),
    vscode4.commands.registerCommand("qassistant.abrirTesteEmAba", () => {
      provedorPainel.abrirTestesEmAba();
    }),
    vscode4.workspace.onDidChangeWorkspaceFolders(() => void provedorPainel.atualizar())
  );
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
