"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MensagemWebviewParaHostSchema = exports.SetupWorkspaceSchema = void 0;
exports.criarEstadoInicial = criarEstadoInicial;
const zod_1 = require("zod");
const nucleo_1 = require("@qassistant/nucleo");
exports.SetupWorkspaceSchema = zod_1.z.object({
    nomeProjeto: zod_1.z.string().min(1),
    raizCodigo: zod_1.z.string().default('.'),
    frontend: zod_1.z.string().optional(),
    backend: zod_1.z.string().optional(),
    criarContextoProjeto: zod_1.z.boolean().default(true),
    criarAssetsAgent: zod_1.z.boolean().default(true),
    openProjectHabilitado: zod_1.z.boolean().default(false),
    openProjectUrlBase: zod_1.z.string().optional(),
    openProjectProjetoId: zod_1.z.string().optional(),
    intervaloPollingSegundos: zod_1.z.number().int().min(15).default(60),
    commitsPadrao: zod_1.z.number().int().min(1).default(10),
});
exports.MensagemWebviewParaHostSchema = zod_1.z.discriminatedUnion('tipo', [
    zod_1.z.object({ tipo: zod_1.z.literal('painel.carregado') }),
    zod_1.z.object({ tipo: zod_1.z.literal('workspace.inicializar'), setup: exports.SetupWorkspaceSchema }),
    zod_1.z.object({ tipo: zod_1.z.literal('painel.atualizar') }),
    zod_1.z.object({ tipo: zod_1.z.literal('workspace.abrirCaminho'), caminhoRelativo: zod_1.z.string().min(1) }),
    zod_1.z.object({ tipo: zod_1.z.literal('validacao.criarRascunho'), titulo: zod_1.z.string().min(1).default('validacao-qa') }),
    zod_1.z.object({ tipo: zod_1.z.literal('validacao.criarComCommits'), titulo: zod_1.z.string().min(1).default('validacao-qa'), hashes: zod_1.z.array(zod_1.z.string().min(7)).default([]) }),
    zod_1.z.object({ tipo: zod_1.z.literal('git.carregarCommits'), limite: zod_1.z.number().int().min(1).max(100).default(10) }),
    zod_1.z.object({ tipo: zod_1.z.literal('validacao.gerarResumoIA'), rascunhoCaminho: zod_1.z.string().min(1) }),
    zod_1.z.object({ tipo: zod_1.z.literal('validacao.sugerirBateriaTestes'), rascunhoCaminho: zod_1.z.string().min(1) }),
    zod_1.z.object({ tipo: zod_1.z.literal('openproject.publicarTask'), rascunhoCaminho: zod_1.z.string().min(1), taskId: zod_1.z.string().optional() }),
    zod_1.z.object({ tipo: zod_1.z.literal('openproject.obterStatus'), taskId: zod_1.z.string().min(1) }),
    zod_1.z.object({ tipo: zod_1.z.literal('openproject.listarTasks') }),
    zod_1.z.object({ tipo: zod_1.z.literal('config.salvarChaveGemini'), chave: zod_1.z.string().min(1) }),
    zod_1.z.object({ tipo: zod_1.z.literal('config.salvarChaveOpenProject'), chave: zod_1.z.string().min(1) }),
]);
function criarEstadoInicial(versaoExtensao) {
    return {
        produto: 'QAssistant',
        versaoExtensao,
        assets: { logoUri: '' },
        workspaceAberto: false,
        workspaceInicializado: false,
        raizWorkspace: '',
        raizTestes: nucleo_1.RAIZ_TESTES_QASSISTANT,
        raizContexto: nucleo_1.RAIZ_CONTEXTO_PROJETO,
        configuracao: null,
        estrutura: null,
        git: {
            carregando: false,
            erro: null,
            recentes: [],
            carregadoEm: null,
            branch: '',
            repositorios: [],
        },
        navegador: null,
        ultimosArquivosCriados: [],
        ultimosArquivosPreservados: [],
        ultimoPacoteValidacao: undefined,
        geminiKeyPresente: false,
        openProjectKeyPresente: false,
        openprojectTasks: [],
    };
}
//# sourceMappingURL=mensagens.js.map