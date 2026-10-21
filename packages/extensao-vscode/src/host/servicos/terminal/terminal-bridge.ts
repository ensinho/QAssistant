import * as vscode from 'vscode';
import * as childProcess from 'node:child_process';
import type { TaskOpenProjectQA } from '../../../contratos/mensagens';

export class PonteTerminalAgente {
  constructor(private readonly output: vscode.OutputChannel) {}

  public sanitizarSlug(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);
  }

  public formatarNomeBranch(params: {
    taskId: string;
    assunto: string;
    tipo?: string;
    padrao?: string;
  }): string {
    const { taskId, assunto, tipo, padrao = '{tipo}/OP-{id}-{slug}' } = params;
    const ehBug = tipo?.toLowerCase().includes('bug');
    const prefixoTipo = ehBug ? 'fix' : 'feat';
    const tipoBruto = tipo ? this.sanitizarSlug(tipo) : 'task';
    const idLimpo = taskId.replace(/^#/, '').trim();
    const slug = this.sanitizarSlug(assunto) || 'tarefa';

    let branch = padrao
      .replace(/\{id\}/gi, idLimpo)
      .replace(/\{slug\}/gi, slug)
      .replace(/\{tipo\}/gi, prefixoTipo)
      .replace(/\{tipoBruto\}/gi, tipoBruto);

    // Sanitiza para branch Git válida
    branch = branch
      .replace(/[^a-zA-Z0-9_\-\.\/]/g, '-')
      .replace(/\/{2,}/g, '/')
      .replace(/^-+|-+$/g, '')
      .replace(/\.lock$/gi, '')
      .replace(/\/+$/g, '');

    return branch || `task/OP-${idLimpo}`;
  }

  public async criarBranchETerminal(params: {
    taskId: string;
    assunto: string;
    raizWorkspace: string;
    tipo?: string;
    padraoBranch?: string;
  }): Promise<{ sucesso: boolean; branchCriada: string; mensagem: string }> {
    const { taskId, assunto, raizWorkspace, tipo, padraoBranch } = params;
    const nomeBranch = this.formatarNomeBranch({
      taskId,
      assunto,
      tipo,
      padrao: padraoBranch,
    });

    try {
      // Tentar criar ou dar checkout na branch via git CLI
      const comandoGit = `git checkout -B "${nomeBranch}"`;
      await new Promise<void>((resolve) => {
        childProcess.exec(comandoGit, { cwd: raizWorkspace }, (err) => {
          if (err) {
            this.output.appendLine(`[TerminalBridge] Aviso ao rodar '${comandoGit}': ${err.message}`);
          }
          resolve(); // Não bloqueia caso o repositório esteja sem commits iniciais
        });
      });

      // Localiza terminal existente ou cria um novo
      const tituloTerminal = `OP #${taskId}`;
      let terminal = vscode.window.terminals.find((t) => t.name === tituloTerminal);

      if (!terminal) {
        terminal = vscode.window.createTerminal({
          name: tituloTerminal,
          cwd: raizWorkspace,
          env: {
            OPENPROJECT_TASK_ID: taskId,
            OPENPROJECT_TASK_SUBJECT: assunto,
            GIT_BRANCH: nomeBranch,
          },
        });
      }

      terminal.show();
      terminal.sendText(`echo "=================================================="`);
      terminal.sendText(`echo "  QAssistant Terminal Bridge: Task #${taskId}"`);
      terminal.sendText(`echo "  Branch ativa: ${nomeBranch}"`);
      terminal.sendText(`echo "=================================================="`);

      return {
        sucesso: true,
        branchCriada: nomeBranch,
        mensagem: `Branch '${nomeBranch}' e terminal ativados com sucesso!`,
      };
    } catch (err) {
      return {
        sucesso: false,
        branchCriada: '',
        mensagem: `Falha ao preparar branch/terminal: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  public async executarAgenteComTask(params: {
    task: TaskOpenProjectQA;
    raizWorkspace: string;
    ferramenta: 'claude' | 'gemini' | 'aider' | 'custom';
    padraoBranch?: string;
    comandoCustomizado?: string;
  }): Promise<{ sucesso: boolean; mensagem: string }> {
    const { task, raizWorkspace, ferramenta, padraoBranch, comandoCustomizado } = params;

    // 1. Cria ou troca para a branch da task primeiro
    const resBranch = await this.criarBranchETerminal({
      taskId: task.id,
      assunto: task.assunto,
      tipo: task.tipo,
      raizWorkspace,
      padraoBranch,
    });

    const prompt = this.gerarPromptAgente(task);
    const tituloTerminal = `OP #${task.id}`;
    const terminal = vscode.window.terminals.find((t) => t.name === tituloTerminal) || vscode.window.activeTerminal;

    if (!terminal) {
      return { sucesso: false, mensagem: 'Não foi possível encontrar ou abrir o terminal.' };
    }

    terminal.show();

    // 2. Injetar comando do agente CLI
    if (ferramenta === 'claude') {
      const promptLinha = prompt.replace(/\r?\n/g, ' ').replace(/"/g, '\\"');
      terminal.sendText(`claude "${promptLinha}"`);
    } else if (ferramenta === 'gemini') {
      const promptLinha = prompt.replace(/\r?\n/g, ' ').replace(/"/g, '\\"');
      terminal.sendText(`gemini "${promptLinha}"`);
    } else if (ferramenta === 'aider') {
      const promptLinha = prompt.replace(/\r?\n/g, ' ').replace(/"/g, '\\"');
      terminal.sendText(`aider --message "${promptLinha}"`);
    } else if (ferramenta === 'custom' && comandoCustomizado) {
      const comandoFinal = comandoCustomizado
        .replace(/\{id\}/gi, task.id)
        .replace(/\{assunto\}/gi, task.assunto.replace(/"/g, '\\"'))
        .replace(/\{branch\}/gi, resBranch.branchCriada)
        .replace(/\{prompt\}/gi, prompt.replace(/\r?\n/g, ' ').replace(/"/g, '\\"'));
      terminal.sendText(comandoFinal);
    }

    return {
      sucesso: true,
      mensagem: `Agente ${ferramenta.toUpperCase()} acionado no terminal com contexto da task #${task.id}!`,
    };
  }

  public gerarPromptAgente(task: TaskOpenProjectQA): string {
    const separador = '----------------------------------------';
    return `# Contexto da Tarefa OpenProject #${task.id}
**Título**: ${task.assunto}
**Tipo**: ${task.tipo || 'Tarefa'}
**Status**: ${task.status}
**Prioridade**: ${task.prioridade || 'Normal'}
**Responsável**: ${task.responsavel || 'Não atribuído'}

${separador}
## Descrição e Requisitos:
${task.descricaoMarkdown || '(Sem descrição detalhada fornecida)'}

${separador}
## Instruções para o Agente:
1. Analise os arquivos relevantes no projeto para atender aos requisitos da tarefa #${task.id}.
2. Implemente as alterações com código limpo e testes automatizados.
3. Valide o funcionamento com testes locais antes de concluir.
4. Prepare commits claros com referência à tarefa (#${task.id}).
`;
  }

  public async copiarPromptParaClipboard(task: TaskOpenProjectQA): Promise<void> {
    const prompt = this.gerarPromptAgente(task);
    await vscode.env.clipboard.writeText(prompt);
  }

  public async executarNoTerminal(comando: string, raizWorkspace: string, nomeTerminal = 'QAssistant'): Promise<void> {
    let terminal = vscode.window.terminals.find((t) => t.name === nomeTerminal);
    if (!terminal) {
      terminal = vscode.window.createTerminal({
        name: nomeTerminal,
        cwd: raizWorkspace,
      });
    }
    terminal.show();
    terminal.sendText(comando);
  }
}
