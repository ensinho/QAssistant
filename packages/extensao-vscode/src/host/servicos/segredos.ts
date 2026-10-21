import * as vscode from 'vscode';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const CHAVE_SECRET_OPENPROJECT = 'qassistant.openProjectApiKey';
const CHAVE_SECRET_OPENPROJECT_LEGADA = 'qassistant.openproject.token';
const CHAVE_SECRET_GEMINI = 'qassistant.geminiApiKey';

export class ServicoSegredos {
  constructor(private readonly secrets: vscode.SecretStorage) {}

  public async obterChaveOpenProject(): Promise<string | undefined> {
    // 1. SecretStorage do VS Code
    const secret = (await this.secrets.get(CHAVE_SECRET_OPENPROJECT)) || (await this.secrets.get(CHAVE_SECRET_OPENPROJECT_LEGADA));
    if (secret && secret.trim()) {
      return secret.trim();
    }

    // 2. Variáveis de ambiente padrão
    const envToken = process.env.OPENPROJECT_TOKEN || process.env.PROJECT_AI_OPENPROJECT_API_KEY;
    if (envToken && envToken.trim()) {
      return envToken.trim();
    }

    // 3. Arquivo de configuração padrão do OpenProject CLI (~/.config/openproject/token)
    try {
      const arquivoToken = path.join(os.homedir(), '.config', 'openproject', 'token');
      if (fs.existsSync(arquivoToken)) {
        const conteudo = fs.readFileSync(arquivoToken, 'utf8').trim();
        if (conteudo) {
          return conteudo;
        }
      }
    } catch {
      // Ignora erro de leitura do arquivo
    }

    return undefined;
  }

  public async salvarChaveOpenProject(token: string): Promise<void> {
    await this.secrets.store(CHAVE_SECRET_OPENPROJECT, token.trim());
    await this.secrets.store(CHAVE_SECRET_OPENPROJECT_LEGADA, token.trim());
  }

  public async removerChaveOpenProject(): Promise<void> {
    await this.secrets.delete(CHAVE_SECRET_OPENPROJECT);
    await this.secrets.delete(CHAVE_SECRET_OPENPROJECT_LEGADA);
  }

  public async obterChaveGemini(): Promise<string | undefined> {
    const secret = await this.secrets.get(CHAVE_SECRET_GEMINI);
    if (secret && secret.trim()) {
      return secret.trim();
    }
    return process.env.PROJECT_AI_GEMINI_API_KEY?.trim() || undefined;
  }

  public async salvarChaveGemini(token: string): Promise<void> {
    await this.secrets.store(CHAVE_SECRET_GEMINI, token.trim());
  }
}
