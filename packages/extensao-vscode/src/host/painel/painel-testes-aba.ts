import * as fs from 'node:fs';
import * as vscode from 'vscode';
import { EstadoPainel, MensagemHostParaWebview, MensagemWebviewParaHostSchema } from '../../contratos/mensagens';

type OnMensagem = (mensagem: unknown) => void;

function criarNonce(): string {
  const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let valor = '';
  for (let i = 0; i < 32; i += 1) {
    valor += alfabeto.charAt(Math.floor(Math.random() * alfabeto.length));
  }
  return valor;
}

export class PainelTestesAba {
  private panel: vscode.WebviewPanel | null = null;

  constructor(
    private readonly contexto: vscode.ExtensionContext,
    private readonly saida: vscode.OutputChannel,
    private readonly onMensagem: OnMensagem,
  ) {}

  estaAberto(): boolean {
    return this.panel !== null;
  }

  abrir(): void {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.One);
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      'qassistant.abaTestesRunner',
      'QA Runner',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(this.contexto.extensionUri, 'dist', 'webview'),
          vscode.Uri.joinPath(this.contexto.extensionUri, 'media'),
        ],
      },
    );

    this.panel.iconPath = {
      light: vscode.Uri.joinPath(this.contexto.extensionUri, 'media', 'qassistant-logo-source.svg'),
      dark: vscode.Uri.joinPath(this.contexto.extensionUri, 'media', 'qassistant-logo-source.svg'),
    };

    this.panel.webview.html = this.criarHtml(this.panel.webview);
    this.panel.webview.onDidReceiveMessage(this.onMensagem);
    this.panel.onDidDispose(() => {
      this.panel = null;
    });
  }

  focar(): void {
    this.panel?.reveal(vscode.ViewColumn.One);
  }

  fechar(): void {
    this.panel?.dispose();
    this.panel = null;
  }

  enviar(mensagem: MensagemHostParaWebview): void {
    void this.panel?.webview.postMessage(mensagem);
  }

  enviarEstado(estado: EstadoPainel): void {
    this.enviar({ tipo: 'estado.atualizado', estado });
  }

  private criarHtml(webview: vscode.Webview): string {
    const diretorioWebview = vscode.Uri.joinPath(this.contexto.extensionUri, 'dist', 'webview');
    const arquivoHtml = vscode.Uri.joinPath(diretorioWebview, 'index.html');
    const nonce = criarNonce();

    let html = fs.readFileSync(arquivoHtml.fsPath, 'utf8');
    const uriAssets = webview.asWebviewUri(vscode.Uri.joinPath(diretorioWebview, 'assets')).toString();
    html = html.replace(/(src|href)="\/?assets\//g, `$1="${uriAssets}/`);
    html = html.replace(/<script /g, `<script nonce="${nonce}" `);
    html = html.replace(
      '</head>',
      `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https: data:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';"></head>`,
    );
    // Injectar modo 'aba' para o React reconhecer e renderizar o TestRunnerAba
    html = html.replace(
      '</body>',
      `<script nonce="${nonce}">window.__QA_MODO__='aba';</script></body>`,
    );
    return html;
  }
}
