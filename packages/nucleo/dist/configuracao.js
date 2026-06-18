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
exports.descreverProduto = descreverProduto;
exports.criarConfiguracaoPadrao = criarConfiguracaoPadrao;
exports.caminhoConfiguracaoWorkspace = caminhoConfiguracaoWorkspace;
exports.workspaceInicializado = workspaceInicializado;
exports.carregarConfiguracaoWorkspace = carregarConfiguracaoWorkspace;
exports.salvarConfiguracaoWorkspace = salvarConfiguracaoWorkspace;
exports.inspecionarEstruturaWorkspace = inspecionarEstruturaWorkspace;
exports.normalizarConfiguracao = normalizarConfiguracao;
exports.normalizarCaminhoRelativo = normalizarCaminhoRelativo;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const tipos_1 = require("./tipos");
function descreverProduto() {
    return `${tipos_1.NOME_PRODUTO} ${tipos_1.VERSAO_NUCLEO}`;
}
function criarConfiguracaoPadrao(raizWorkspace) {
    return {
        versao: 1,
        produto: 'QAssistant',
        projeto: {
            nome: path.basename(raizWorkspace),
        },
        setup: {
            criarContextoProjeto: true,
            criarAssetsAgent: true,
        },
        caminhos: {
            raizCodigo: '.',
            raizTestes: tipos_1.RAIZ_TESTES_QASSISTANT,
            raizContexto: tipos_1.RAIZ_CONTEXTO_PROJETO,
        },
        openProject: {
            habilitado: true,
            intervaloPollingSegundos: 60,
        },
        resumos: {
            commitsPadrao: 10,
        },
    };
}
function caminhoConfiguracaoWorkspace(raizWorkspace) {
    return path.join(raizWorkspace, tipos_1.DIRETORIO_CONFIGURACAO_QASSISTANT, tipos_1.ARQUIVO_CONFIGURACAO_QASSISTANT);
}
function workspaceInicializado(raizWorkspace) {
    return fs.existsSync(caminhoConfiguracaoWorkspace(raizWorkspace));
}
function carregarConfiguracaoWorkspace(raizWorkspace) {
    const arquivoConfiguracao = caminhoConfiguracaoWorkspace(raizWorkspace);
    if (!fs.existsSync(arquivoConfiguracao)) {
        return null;
    }
    const bruto = fs.readFileSync(arquivoConfiguracao, 'utf8');
    const json = JSON.parse(bruto);
    return normalizarConfiguracao(raizWorkspace, json);
}
function salvarConfiguracaoWorkspace(raizWorkspace, configuracao) {
    const arquivoConfiguracao = caminhoConfiguracaoWorkspace(raizWorkspace);
    const normalizada = normalizarConfiguracao(raizWorkspace, configuracao);
    fs.mkdirSync(path.dirname(arquivoConfiguracao), { recursive: true });
    fs.writeFileSync(arquivoConfiguracao, JSON.stringify(normalizada, null, 2), 'utf8');
    return { caminho: arquivoConfiguracao, configuracao: normalizada };
}
function inspecionarEstruturaWorkspace(raizWorkspace) {
    return {
        configuracaoPresente: workspaceInicializado(raizWorkspace),
        qassistantTestesPresente: fs.existsSync(path.join(raizWorkspace, tipos_1.RAIZ_TESTES_QASSISTANT)),
        contextoPresente: fs.existsSync(path.join(raizWorkspace, tipos_1.RAIZ_CONTEXTO_PROJETO)),
        instructionsPresentes: fs.existsSync(path.join(raizWorkspace, tipos_1.DIRETORIO_INSTRUCTIONS)),
        skillsPresentes: fs.existsSync(path.join(raizWorkspace, tipos_1.DIRETORIO_SKILLS)),
    };
}
function normalizarConfiguracao(raizWorkspace, configuracao) {
    const caminhos = {
        raizCodigo: normalizarCaminhoRelativo(raizWorkspace, configuracao.caminhos.raizCodigo) || '.',
        frontend: normalizarCaminhoOpcional(raizWorkspace, configuracao.caminhos.frontend),
        backend: normalizarCaminhoOpcional(raizWorkspace, configuracao.caminhos.backend),
        raizTestes: tipos_1.RAIZ_TESTES_QASSISTANT,
        raizContexto: tipos_1.RAIZ_CONTEXTO_PROJETO,
        repositorios: normalizarListaCaminhos(raizWorkspace, configuracao.caminhos?.repositorios),
    };
    return {
        versao: 1,
        produto: 'QAssistant',
        projeto: {
            nome: (configuracao.projeto?.nome || path.basename(raizWorkspace)).trim() || path.basename(raizWorkspace),
        },
        setup: {
            criarContextoProjeto: configuracao.setup?.criarContextoProjeto !== false,
            criarAssetsAgent: configuracao.setup?.criarAssetsAgent !== false,
        },
        caminhos,
        openProject: {
            habilitado: Boolean(configuracao.openProject?.habilitado),
            urlBase: limparString(configuracao.openProject?.urlBase),
            projetoId: limparString(configuracao.openProject?.projetoId),
            intervaloPollingSegundos: normalizarInteiro(configuracao.openProject?.intervaloPollingSegundos, 60, 15),
        },
        resumos: {
            commitsPadrao: normalizarInteiro(configuracao.resumos?.commitsPadrao, 10, 1),
        },
    };
}
function normalizarCaminhoRelativo(raizWorkspace, caminhoInformado) {
    const bruto = limparString(caminhoInformado);
    if (!bruto) {
        return undefined;
    }
    const absoluto = path.resolve(raizWorkspace, bruto);
    const relativo = paraPosix(path.relative(raizWorkspace, absoluto));
    if (!relativo) {
        return '.';
    }
    if (relativo.startsWith('..') || path.isAbsolute(relativo)) {
        throw new Error('Todos os caminhos do setup devem ficar dentro do workspace atual.');
    }
    return relativo;
}
function normalizarCaminhoOpcional(raizWorkspace, caminhoInformado) {
    const bruto = limparString(caminhoInformado);
    if (!bruto) {
        return undefined;
    }
    return normalizarCaminhoRelativo(raizWorkspace, bruto);
}
/**
 * Normaliza uma lista de caminhos de repositório informada pelo usuário:
 * descarta vazios, valida que ficam dentro do workspace e remove duplicados.
 * Entradas inválidas (fora do workspace) são ignoradas em vez de quebrar o load.
 * Retorna `undefined` quando a lista efetiva ficar vazia (cai na auto-descoberta).
 */
function normalizarListaCaminhos(raizWorkspace, lista) {
    if (!Array.isArray(lista) || lista.length === 0) {
        return undefined;
    }
    const vistos = new Set();
    const resultado = [];
    for (const entrada of lista) {
        const bruto = limparString(entrada);
        if (!bruto)
            continue;
        let normalizado;
        try {
            normalizado = normalizarCaminhoRelativo(raizWorkspace, bruto);
        }
        catch {
            // Caminho fora do workspace — ignora silenciosamente.
            continue;
        }
        if (normalizado && !vistos.has(normalizado)) {
            vistos.add(normalizado);
            resultado.push(normalizado);
        }
    }
    return resultado.length > 0 ? resultado : undefined;
}
function normalizarInteiro(valor, fallback, minimo) {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) {
        return fallback;
    }
    return Math.max(minimo, Math.floor(numero));
}
function limparString(valor) {
    const texto = String(valor || '').trim();
    return texto ? texto : undefined;
}
function paraPosix(valor) {
    return valor.replace(/\\/g, '/');
}
//# sourceMappingURL=configuracao.js.map