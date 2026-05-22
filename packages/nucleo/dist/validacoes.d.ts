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
export declare function criarPacoteValidacaoRascunho(raizWorkspace: string, titulo?: string, commits?: CommitPacoteValidacao[]): ResultadoPacoteValidacao;
