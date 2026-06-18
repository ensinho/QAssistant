import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  ARQUIVO_CONFIGURACAO_QASSISTANT,
  CaminhosProjeto,
  ConfiguracaoQAssistant,
  DIRETORIO_CONFIGURACAO_QASSISTANT,
  DIRETORIO_INSTRUCTIONS,
  DIRETORIO_SKILLS,
  EstruturaWorkspaceQAssistant,
  NOME_PRODUTO,
  RAIZ_CONTEXTO_PROJETO,
  RAIZ_TESTES_QASSISTANT,
  VERSAO_NUCLEO,
} from './tipos';

export function descreverProduto(): string {
  return `${NOME_PRODUTO} ${VERSAO_NUCLEO}`;
}

export function criarConfiguracaoPadrao(raizWorkspace: string): ConfiguracaoQAssistant {
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
      raizTestes: RAIZ_TESTES_QASSISTANT,
      raizContexto: RAIZ_CONTEXTO_PROJETO,
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

export function caminhoConfiguracaoWorkspace(raizWorkspace: string): string {
  return path.join(raizWorkspace, DIRETORIO_CONFIGURACAO_QASSISTANT, ARQUIVO_CONFIGURACAO_QASSISTANT);
}

export function workspaceInicializado(raizWorkspace: string): boolean {
  return fs.existsSync(caminhoConfiguracaoWorkspace(raizWorkspace));
}

export function carregarConfiguracaoWorkspace(raizWorkspace: string): ConfiguracaoQAssistant | null {
  const arquivoConfiguracao = caminhoConfiguracaoWorkspace(raizWorkspace);
  if (!fs.existsSync(arquivoConfiguracao)) {
    return null;
  }

  const bruto = fs.readFileSync(arquivoConfiguracao, 'utf8');
  const json = JSON.parse(bruto) as ConfiguracaoQAssistant;
  return normalizarConfiguracao(raizWorkspace, json);
}

export function salvarConfiguracaoWorkspace(raizWorkspace: string, configuracao: ConfiguracaoQAssistant): { caminho: string; configuracao: ConfiguracaoQAssistant } {
  const arquivoConfiguracao = caminhoConfiguracaoWorkspace(raizWorkspace);
  const normalizada = normalizarConfiguracao(raizWorkspace, configuracao);
  fs.mkdirSync(path.dirname(arquivoConfiguracao), { recursive: true });
  fs.writeFileSync(arquivoConfiguracao, JSON.stringify(normalizada, null, 2), 'utf8');
  return { caminho: arquivoConfiguracao, configuracao: normalizada };
}

export function inspecionarEstruturaWorkspace(raizWorkspace: string): EstruturaWorkspaceQAssistant {
  return {
    configuracaoPresente: workspaceInicializado(raizWorkspace),
    qassistantTestesPresente: fs.existsSync(path.join(raizWorkspace, RAIZ_TESTES_QASSISTANT)),
    contextoPresente: fs.existsSync(path.join(raizWorkspace, RAIZ_CONTEXTO_PROJETO)),
    instructionsPresentes: fs.existsSync(path.join(raizWorkspace, DIRETORIO_INSTRUCTIONS)),
    skillsPresentes: fs.existsSync(path.join(raizWorkspace, DIRETORIO_SKILLS)),
  };
}

export function normalizarConfiguracao(raizWorkspace: string, configuracao: ConfiguracaoQAssistant): ConfiguracaoQAssistant {
  const caminhos: CaminhosProjeto = {
    raizCodigo: normalizarCaminhoRelativo(raizWorkspace, configuracao.caminhos.raizCodigo) || '.',
    frontend: normalizarCaminhoOpcional(raizWorkspace, configuracao.caminhos.frontend),
    backend: normalizarCaminhoOpcional(raizWorkspace, configuracao.caminhos.backend),
    raizTestes: RAIZ_TESTES_QASSISTANT,
    raizContexto: RAIZ_CONTEXTO_PROJETO,
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

export function normalizarCaminhoRelativo(raizWorkspace: string, caminhoInformado: string | undefined): string | undefined {
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

function normalizarCaminhoOpcional(raizWorkspace: string, caminhoInformado: string | undefined): string | undefined {
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
function normalizarListaCaminhos(raizWorkspace: string, lista: string[] | undefined): string[] | undefined {
  if (!Array.isArray(lista) || lista.length === 0) {
    return undefined;
  }
  const vistos = new Set<string>();
  const resultado: string[] = [];
  for (const entrada of lista) {
    const bruto = limparString(entrada);
    if (!bruto) continue;
    let normalizado: string | undefined;
    try {
      normalizado = normalizarCaminhoRelativo(raizWorkspace, bruto);
    } catch {
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

function normalizarInteiro(valor: number | undefined, fallback: number, minimo: number): number {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) {
    return fallback;
  }
  return Math.max(minimo, Math.floor(numero));
}

function limparString(valor: string | undefined): string | undefined {
  const texto = String(valor || '').trim();
  return texto ? texto : undefined;
}

function paraPosix(valor: string): string {
  return valor.replace(/\\/g, '/');
}
