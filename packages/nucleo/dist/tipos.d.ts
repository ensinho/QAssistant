export declare const NOME_PRODUTO = "QAssistant";
export declare const VERSAO_NUCLEO = "0.1.0";
export declare const DIRETORIO_CONFIGURACAO_QASSISTANT = ".qassistant";
export declare const ARQUIVO_CONFIGURACAO_QASSISTANT = "config.json";
export declare const RAIZ_TESTES_QASSISTANT = "Qassistant-testes";
export declare const RAIZ_CONTEXTO_PROJETO = "docs/contexto";
export declare const DIRETORIO_INSTRUCTIONS = ".github/instructions";
export declare const DIRETORIO_SKILLS = ".github/skills";
export interface CaminhosProjeto {
    raizCodigo: string;
    frontend?: string;
    backend?: string;
    raizTestes: string;
    raizContexto: string;
}
export interface ConfiguracaoQAssistant {
    versao: 1;
    produto: 'QAssistant';
    projeto: {
        nome: string;
    };
    setup: {
        criarContextoProjeto: boolean;
        criarAssetsAgent: boolean;
    };
    caminhos: CaminhosProjeto;
    openProject: {
        habilitado: boolean;
        urlBase?: string;
        projetoId?: string;
        intervaloPollingSegundos: number;
    };
    resumos: {
        commitsPadrao: number;
    };
}
export interface EstruturaWorkspaceQAssistant {
    configuracaoPresente: boolean;
    qassistantTestesPresente: boolean;
    contextoPresente: boolean;
    instructionsPresentes: boolean;
    skillsPresentes: boolean;
}
export interface ResultadoScaffoldWorkspace {
    configuracaoPath: string;
    criados: string[];
    preservados: string[];
    estrutura: EstruturaWorkspaceQAssistant;
    configuracao: ConfiguracaoQAssistant;
}
