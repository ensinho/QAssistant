import * as vscode from 'vscode';

export function obterRaizWorkspace(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

export async function revelarArquivo(uri: vscode.Uri): Promise<void> {
  await vscode.commands.executeCommand('revealFileInOS', uri);
}
