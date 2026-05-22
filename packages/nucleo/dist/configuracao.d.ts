import { ConfiguracaoQAssistant, EstruturaWorkspaceQAssistant } from './tipos';
export declare function descreverProduto(): string;
export declare function criarConfiguracaoPadrao(raizWorkspace: string): ConfiguracaoQAssistant;
export declare function caminhoConfiguracaoWorkspace(raizWorkspace: string): string;
export declare function workspaceInicializado(raizWorkspace: string): boolean;
export declare function carregarConfiguracaoWorkspace(raizWorkspace: string): ConfiguracaoQAssistant | null;
export declare function salvarConfiguracaoWorkspace(raizWorkspace: string, configuracao: ConfiguracaoQAssistant): {
    caminho: string;
    configuracao: ConfiguracaoQAssistant;
};
export declare function inspecionarEstruturaWorkspace(raizWorkspace: string): EstruturaWorkspaceQAssistant;
export declare function normalizarConfiguracao(raizWorkspace: string, configuracao: ConfiguracaoQAssistant): ConfiguracaoQAssistant;
export declare function normalizarCaminhoRelativo(raizWorkspace: string, caminhoInformado: string | undefined): string | undefined;
