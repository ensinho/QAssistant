import * as vscode from 'vscode';
import { descreverProduto } from '@qassistant/nucleo';
import { ProvedorPainel } from './painel/provedor-painel';

export function activate(contexto: vscode.ExtensionContext): void {
  const saida = vscode.window.createOutputChannel('QAssistant');
  saida.appendLine(`${descreverProduto()} iniciado.`);
  contexto.subscriptions.push(saida);

  const provedorPainel = new ProvedorPainel(contexto, saida);
  contexto.subscriptions.push(
    vscode.window.registerWebviewViewProvider(ProvedorPainel.viewType, provedorPainel, {
      webviewOptions: { retainContextWhenHidden: true },
    }),
  );

  contexto.subscriptions.push(
    vscode.commands.registerCommand('qassistant.abrirPainel', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.qassistant');
      await vscode.commands.executeCommand(`${ProvedorPainel.viewType}.focus`);
    }),
    vscode.commands.registerCommand('qassistant.inicializarWorkspace', async () => {
      await provedorPainel.inicializarWorkspace();
    }),
    vscode.commands.registerCommand('qassistant.atualizarPainel', async () => {
      await provedorPainel.atualizar();
    }),
    vscode.commands.registerCommand('qassistant.abrirTesteEmAba', () => {
      provedorPainel.abrirTestesEmAba();
    }),
    vscode.workspace.onDidChangeWorkspaceFolders(() => void provedorPainel.atualizar()),
  );
}

export function deactivate(): void {
  // O VS Code descarta subscriptions automaticamente.
}
