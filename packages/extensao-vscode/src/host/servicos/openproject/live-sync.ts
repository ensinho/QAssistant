import * as vscode from 'vscode';
import type { TaskOpenProjectQA } from '../../../contratos/mensagens';
import { ClienteOpenProject } from './cliente-api';

export interface EventoSyncOpenProject {
  novas: TaskOpenProjectQA[];
  atualizadas: TaskOpenProjectQA[];
  todas: TaskOpenProjectQA[];
}

export class LiveSyncOpenProject {
  private timer: NodeJS.Timeout | null = null;
  private executandoSync = false;
  private tarefasConhecidas = new Map<string, { updatedAt: string; status: string }>();
  private primeiroCiclo = true;
  private emissores = new Set<(evento: EventoSyncOpenProject) => void>();

  constructor(
    private readonly obterCliente: () => Promise<{ cliente: ClienteOpenProject; projetoHref: string } | null>,
    private readonly output: vscode.OutputChannel,
  ) {}

  public onSync(callback: (evento: EventoSyncOpenProject) => void): vscode.Disposable {
    this.emissores.add(callback);
    return new vscode.Disposable(() => this.emissores.delete(callback));
  }

  public iniciar(intervaloSegundos = 30): void {
    this.parar();
    const ms = Math.max(15, intervaloSegundos) * 1000;
    this.output.appendLine(`[OpenProject LiveSync] Iniciando monitoramento a cada ${intervaloSegundos}s...`);

    // Dispara a primeira sincronização imediatamente
    void this.sincronizar();

    this.timer = setInterval(() => {
      void this.sincronizar();
    }, ms);
  }

  public parar(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      this.output.appendLine('[OpenProject LiveSync] Monitoramento pausado.');
    }
  }

  public async sincronizar(forcarAlerta = false): Promise<TaskOpenProjectQA[]> {
    if (this.executandoSync) {
      return [];
    }

    this.executandoSync = true;
    try {
      const contexto = await this.obterCliente();
      if (!contexto) {
        return [];
      }

      const { cliente, projetoHref } = contexto;
      const tasks = await cliente.listarTasks(projetoHref, 50);

      const novas: TaskOpenProjectQA[] = [];
      const atualizadas: TaskOpenProjectQA[] = [];

      for (const t of tasks) {
        const id = t.id;
        const infoAtual = { updatedAt: t.dataAtualizacao || '', status: t.status };
        const anterior = this.tarefasConhecidas.get(id);

        if (!anterior) {
          if (!this.primeiroCiclo || forcarAlerta) {
            novas.push(t);
            t.isNova = true;
          }
          this.tarefasConhecidas.set(id, infoAtual);
        } else {
          if (anterior.updatedAt !== infoAtual.updatedAt || anterior.status !== infoAtual.status) {
            atualizadas.push(t);
            this.tarefasConhecidas.set(id, infoAtual);
          }
        }
      }

      this.primeiroCiclo = false;

      // Se houver novas tarefas ou alterações relevantes, notifica no VS Code nativo
      if (novas.length > 0) {
        const plural = novas.length > 1;
        const msg = plural
          ? `[OpenProject] ${novas.length} novas tarefas detectadas no projeto!`
          : `[OpenProject] Nova tarefa: #${novas[0].id} - ${novas[0].assunto}`;

        void vscode.window.showInformationMessage(msg, 'Ver no QAssistant').then((sel) => {
          if (sel === 'Ver no QAssistant') {
            void vscode.commands.executeCommand('qassistant.abrirPainel');
          }
        });
      }

      // Notifica todos os ouvintes internos (Webview)
      const evento: EventoSyncOpenProject = { novas, atualizadas, todas: tasks };
      for (const callback of this.emissores) {
        try {
          callback(evento);
        } catch (err) {
          this.output.appendLine(`[OpenProject LiveSync] Erro no callback: ${String(err)}`);
        }
      }

      return tasks;
    } catch (err) {
      this.output.appendLine(`[OpenProject LiveSync] Erro na sincronização: ${String(err)}`);
      return [];
    } finally {
      this.executandoSync = false;
    }
  }

  public resetarHistorico(): void {
    this.tarefasConhecidas.clear();
    this.primeiroCiclo = true;
  }
}
