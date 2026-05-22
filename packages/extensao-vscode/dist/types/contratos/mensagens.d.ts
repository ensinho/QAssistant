import { z } from 'zod';
import { ConfiguracaoQAssistant, EstruturaWorkspaceQAssistant } from '@qassistant/nucleo';
export declare const SetupWorkspaceSchema: z.ZodObject<{
    nomeProjeto: z.ZodString;
    raizCodigo: z.ZodDefault<z.ZodString>;
    frontend: z.ZodOptional<z.ZodString>;
    backend: z.ZodOptional<z.ZodString>;
    criarContextoProjeto: z.ZodDefault<z.ZodBoolean>;
    criarAssetsAgent: z.ZodDefault<z.ZodBoolean>;
    openProjectHabilitado: z.ZodDefault<z.ZodBoolean>;
    openProjectUrlBase: z.ZodOptional<z.ZodString>;
    openProjectProjetoId: z.ZodOptional<z.ZodString>;
    intervaloPollingSegundos: z.ZodDefault<z.ZodNumber>;
    commitsPadrao: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    nomeProjeto: string;
    raizCodigo: string;
    criarContextoProjeto: boolean;
    criarAssetsAgent: boolean;
    openProjectHabilitado: boolean;
    intervaloPollingSegundos: number;
    commitsPadrao: number;
    frontend?: string | undefined;
    backend?: string | undefined;
    openProjectUrlBase?: string | undefined;
    openProjectProjetoId?: string | undefined;
}, {
    nomeProjeto: string;
    raizCodigo?: string | undefined;
    frontend?: string | undefined;
    backend?: string | undefined;
    criarContextoProjeto?: boolean | undefined;
    criarAssetsAgent?: boolean | undefined;
    openProjectHabilitado?: boolean | undefined;
    openProjectUrlBase?: string | undefined;
    openProjectProjetoId?: string | undefined;
    intervaloPollingSegundos?: number | undefined;
    commitsPadrao?: number | undefined;
}>;
export type SetupWorkspace = z.infer<typeof SetupWorkspaceSchema>;
export declare const MensagemWebviewParaHostSchema: z.ZodDiscriminatedUnion<"tipo", [z.ZodObject<{
    tipo: z.ZodLiteral<"painel.carregado">;
}, "strip", z.ZodTypeAny, {
    tipo: "painel.carregado";
}, {
    tipo: "painel.carregado";
}>, z.ZodObject<{
    tipo: z.ZodLiteral<"workspace.inicializar">;
    setup: z.ZodObject<{
        nomeProjeto: z.ZodString;
        raizCodigo: z.ZodDefault<z.ZodString>;
        frontend: z.ZodOptional<z.ZodString>;
        backend: z.ZodOptional<z.ZodString>;
        criarContextoProjeto: z.ZodDefault<z.ZodBoolean>;
        criarAssetsAgent: z.ZodDefault<z.ZodBoolean>;
        openProjectHabilitado: z.ZodDefault<z.ZodBoolean>;
        openProjectUrlBase: z.ZodOptional<z.ZodString>;
        openProjectProjetoId: z.ZodOptional<z.ZodString>;
        intervaloPollingSegundos: z.ZodDefault<z.ZodNumber>;
        commitsPadrao: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        nomeProjeto: string;
        raizCodigo: string;
        criarContextoProjeto: boolean;
        criarAssetsAgent: boolean;
        openProjectHabilitado: boolean;
        intervaloPollingSegundos: number;
        commitsPadrao: number;
        frontend?: string | undefined;
        backend?: string | undefined;
        openProjectUrlBase?: string | undefined;
        openProjectProjetoId?: string | undefined;
    }, {
        nomeProjeto: string;
        raizCodigo?: string | undefined;
        frontend?: string | undefined;
        backend?: string | undefined;
        criarContextoProjeto?: boolean | undefined;
        criarAssetsAgent?: boolean | undefined;
        openProjectHabilitado?: boolean | undefined;
        openProjectUrlBase?: string | undefined;
        openProjectProjetoId?: string | undefined;
        intervaloPollingSegundos?: number | undefined;
        commitsPadrao?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    tipo: "workspace.inicializar";
    setup: {
        nomeProjeto: string;
        raizCodigo: string;
        criarContextoProjeto: boolean;
        criarAssetsAgent: boolean;
        openProjectHabilitado: boolean;
        intervaloPollingSegundos: number;
        commitsPadrao: number;
        frontend?: string | undefined;
        backend?: string | undefined;
        openProjectUrlBase?: string | undefined;
        openProjectProjetoId?: string | undefined;
    };
}, {
    tipo: "workspace.inicializar";
    setup: {
        nomeProjeto: string;
        raizCodigo?: string | undefined;
        frontend?: string | undefined;
        backend?: string | undefined;
        criarContextoProjeto?: boolean | undefined;
        criarAssetsAgent?: boolean | undefined;
        openProjectHabilitado?: boolean | undefined;
        openProjectUrlBase?: string | undefined;
        openProjectProjetoId?: string | undefined;
        intervaloPollingSegundos?: number | undefined;
        commitsPadrao?: number | undefined;
    };
}>, z.ZodObject<{
    tipo: z.ZodLiteral<"painel.atualizar">;
}, "strip", z.ZodTypeAny, {
    tipo: "painel.atualizar";
}, {
    tipo: "painel.atualizar";
}>, z.ZodObject<{
    tipo: z.ZodLiteral<"workspace.abrirCaminho">;
    caminhoRelativo: z.ZodString;
}, "strip", z.ZodTypeAny, {
    tipo: "workspace.abrirCaminho";
    caminhoRelativo: string;
}, {
    tipo: "workspace.abrirCaminho";
    caminhoRelativo: string;
}>, z.ZodObject<{
    tipo: z.ZodLiteral<"validacao.criarRascunho">;
    titulo: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tipo: "validacao.criarRascunho";
    titulo: string;
}, {
    tipo: "validacao.criarRascunho";
    titulo?: string | undefined;
}>, z.ZodObject<{
    tipo: z.ZodLiteral<"validacao.criarComCommits">;
    titulo: z.ZodDefault<z.ZodString>;
    hashes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    tipo: "validacao.criarComCommits";
    titulo: string;
    hashes: string[];
}, {
    tipo: "validacao.criarComCommits";
    titulo?: string | undefined;
    hashes?: string[] | undefined;
}>, z.ZodObject<{
    tipo: z.ZodLiteral<"git.carregarCommits">;
    limite: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    tipo: "git.carregarCommits";
    limite: number;
}, {
    tipo: "git.carregarCommits";
    limite?: number | undefined;
}>, z.ZodObject<{
    tipo: z.ZodLiteral<"validacao.gerarResumoIA">;
    rascunhoCaminho: z.ZodString;
}, "strip", z.ZodTypeAny, {
    tipo: "validacao.gerarResumoIA";
    rascunhoCaminho: string;
}, {
    tipo: "validacao.gerarResumoIA";
    rascunhoCaminho: string;
}>, z.ZodObject<{
    tipo: z.ZodLiteral<"validacao.sugerirBateriaTestes">;
    rascunhoCaminho: z.ZodString;
}, "strip", z.ZodTypeAny, {
    tipo: "validacao.sugerirBateriaTestes";
    rascunhoCaminho: string;
}, {
    tipo: "validacao.sugerirBateriaTestes";
    rascunhoCaminho: string;
}>, z.ZodObject<{
    tipo: z.ZodLiteral<"openproject.publicarTask">;
    rascunhoCaminho: z.ZodString;
    taskId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tipo: "openproject.publicarTask";
    rascunhoCaminho: string;
    taskId?: string | undefined;
}, {
    tipo: "openproject.publicarTask";
    rascunhoCaminho: string;
    taskId?: string | undefined;
}>, z.ZodObject<{
    tipo: z.ZodLiteral<"openproject.obterStatus">;
    taskId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    tipo: "openproject.obterStatus";
    taskId: string;
}, {
    tipo: "openproject.obterStatus";
    taskId: string;
}>, z.ZodObject<{
    tipo: z.ZodLiteral<"openproject.listarTasks">;
}, "strip", z.ZodTypeAny, {
    tipo: "openproject.listarTasks";
}, {
    tipo: "openproject.listarTasks";
}>, z.ZodObject<{
    tipo: z.ZodLiteral<"config.salvarChaveGemini">;
    chave: z.ZodString;
}, "strip", z.ZodTypeAny, {
    tipo: "config.salvarChaveGemini";
    chave: string;
}, {
    tipo: "config.salvarChaveGemini";
    chave: string;
}>, z.ZodObject<{
    tipo: z.ZodLiteral<"config.salvarChaveOpenProject">;
    chave: z.ZodString;
}, "strip", z.ZodTypeAny, {
    tipo: "config.salvarChaveOpenProject";
    chave: string;
}, {
    tipo: "config.salvarChaveOpenProject";
    chave: string;
}>]>;
export type MensagemWebviewParaHost = z.infer<typeof MensagemWebviewParaHostSchema>;
export interface AssetsPainel {
    logoUri: string;
}
export interface TaskOpenProjectQA {
    id: string;
    assunto: string;
    status: string;
    tipo?: string;
    responsavel?: string;
}
export interface CommitGitQAssistant {
    hash: string;
    hashCurto: string;
    autor: string;
    dataIso: string;
    assunto: string;
    repositorioId: string;
    repositorioNome: string;
    repositorioCaminho: string;
    arquivosAlterados?: string[];
    arquivosAlteradosCount?: number;
}
export interface RepositorioGitDetectado {
    id: string;
    nome: string;
    caminhoRelativo: string;
    branch: string;
}
export interface EstadoGitQAssistant {
    carregando: boolean;
    erro: string | null;
    recentes: CommitGitQAssistant[];
    carregadoEm: string | null;
    branch?: string;
    repositorios: RepositorioGitDetectado[];
}
export interface EntradaNavegadorQAssistant {
    nome: string;
    caminhoRelativo: string;
    tipo: 'arquivo' | 'pasta';
    tamanhoBytes: number | null;
    atualizadoEm: string | null;
}
export interface NavegadorQAssistant {
    caminhoRelativo: string;
    entradas: EntradaNavegadorQAssistant[];
    arquivoAberto: string | null;
}
export interface EstadoPainel {
    produto: 'QAssistant';
    versaoExtensao: string;
    assets: AssetsPainel;
    workspaceAberto: boolean;
    workspaceInicializado: boolean;
    raizWorkspace: string;
    raizTestes: string;
    raizContexto: string;
    configuracao: ConfiguracaoQAssistant | null;
    estrutura: EstruturaWorkspaceQAssistant | null;
    git: EstadoGitQAssistant;
    navegador: NavegadorQAssistant | null;
    ultimosArquivosCriados: string[];
    ultimosArquivosPreservados: string[];
    ultimoPacoteValidacao?: {
        id: string;
        caminhoRelativo: string;
    };
    geminiKeyPresente: boolean;
    openProjectKeyPresente: boolean;
    openprojectTasks: TaskOpenProjectQA[];
}
export type MensagemHostParaWebview = {
    tipo: 'estado.atualizado';
    estado: EstadoPainel;
} | {
    tipo: 'notificacao.info';
    mensagem: string;
} | {
    tipo: 'notificacao.erro';
    mensagem: string;
};
export declare function criarEstadoInicial(versaoExtensao: string): EstadoPainel;
