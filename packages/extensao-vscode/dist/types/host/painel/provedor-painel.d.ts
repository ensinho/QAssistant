import * as vscode from 'vscode';
import { SetupWorkspace } from '../../contratos/mensagens';
export declare class ProvedorPainel implements vscode.WebviewViewProvider {
    private readonly contexto;
    private readonly saida;
    static readonly viewType = "qassistant.painel";
    private webview?;
    private ultimosArquivosCriados;
    private ultimosArquivosPreservados;
    private ultimoPacoteValidacao;
    private navegador;
    private geminiKeyPresente;
    private openProjectKeyPresente;
    private openprojectTasks;
    private git;
    constructor(contexto: vscode.ExtensionContext, saida: vscode.OutputChannel);
    resolveWebviewView(webviewView: vscode.WebviewView): void;
    atualizar(): Promise<void>;
    inicializarWorkspace(setup?: SetupWorkspace): Promise<void>;
    private receberMensagem;
    private criarEstado;
    private abrirCaminhoWorkspace;
    private criarPacoteValidacaoRascunho;
    private criarPacoteValidacaoComCommits;
    private carregarCommits;
    private isCaminhoSensivel;
    private gerarResumoIA;
    catch(err: any): void;
}
