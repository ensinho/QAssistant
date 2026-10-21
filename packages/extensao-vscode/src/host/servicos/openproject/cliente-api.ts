import type { ProjetoOpenProjectDisponivel, TaskOpenProjectQA, UsuarioOpenProjectQA } from '../../../contratos/mensagens';
import type { RespostaWorkPackageHal, StatusDisponivelOpenProject } from './tipos';

export class ClienteOpenProject {
  constructor(
    private readonly urlBase: string,
    private readonly token: string,
  ) {}

  private get authHeader(): string {
    const limpo = (this.token || '').trim();
    if (limpo.startsWith('Basic ') || limpo.startsWith('Bearer ')) {
      return limpo;
    }
    if (limpo.includes(':')) {
      return `Basic ${Buffer.from(limpo, 'utf8').toString('base64')}`;
    }
    return `Basic ${Buffer.from(`apikey:${limpo}`, 'utf8').toString('base64')}`;
  }

  private normalizarUrl(caminho: string): string {
    let base = (this.urlBase || '').trim().replace(/\/+$/, '');
    if (base.endsWith('/api/v3')) {
      base = base.slice(0, -'/api/v3'.length);
    }
    const path = caminho.startsWith('/') ? caminho : `/${caminho}`;
    return `${base}${path}`;
  }

  private async requisitar<T>(caminho: string, init?: RequestInit): Promise<T> {
    const url = this.normalizarUrl(caminho);
    const headers: Record<string, string> = {
      Authorization: this.authHeader,
      Accept: 'application/hal+json',
      ...((init?.headers as Record<string, string>) || {}),
    };

    const res = await fetch(url, {
      ...init,
      headers,
    });

    if (!res.ok) {
      let corpoErro = '';
      try {
        corpoErro = await res.text();
      } catch {
        // Ignora falha de leitura do corpo
      }
      throw new Error(`OpenProject HTTP ${res.status}: ${res.statusText} ${corpoErro ? `(${corpoErro.slice(0, 250)})` : ''}`.trim());
    }

    if (res.status === 204) {
      return {} as T;
    }

    return (await res.json()) as T;
  }

  public async testarConexao(): Promise<{ usuario: string; projetos: ProjetoOpenProjectDisponivel[] }> {
    let nomeUsuario = 'Usuário Autenticado';

    // 1. Tentar obter perfil do usuário autenticado
    try {
      const me = await this.requisitar<{ name?: string; login?: string; _links?: { self?: { title?: string } } }>('/api/v3/users/me');
      nomeUsuario = me.name || me.login || me._links?.self?.title || nomeUsuario;
    } catch {
      // Alguns perfis têm acesso restrito ao endpoint me, continuamos para listar projetos
    }

    // 2. Listar projetos acessíveis
    const projetos = await this.listarProjetos();

    return {
      usuario: nomeUsuario,
      projetos,
    };
  }

  public async listarProjetos(): Promise<ProjetoOpenProjectDisponivel[]> {
    let data: { _embedded?: { elements?: Array<{ id: number; name: string; identifier?: string }> } } | null = null;

    try {
      data = await this.requisitar<{ _embedded?: { elements?: Array<{ id: number; name: string; identifier?: string }> } }>(
        '/api/v3/projects?pageSize=100&sortBy=[["name","asc"]]',
      );
    } catch {
      // Fallback para versões mais antigas do OpenProject que não aceitam sortBy complexo
      data = await this.requisitar<{ _embedded?: { elements?: Array<{ id: number; name: string; identifier?: string }> } }>(
        '/api/v3/projects?pageSize=100',
      );
    }

    const elements = data?._embedded?.elements || [];
    return elements
      .map((p) => ({
        nome: p.name || 'Projeto sem nome',
        identificador: p.identifier || String(p.id),
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  public async resolverProjeto(projetoRef?: string): Promise<{ id: number; nome: string; identifier: string; apiHref: string }> {
    const refLimpa = (projetoRef || '').trim();

    if (refLimpa) {
      // Tentar resolver diretamente por identificador/id
      try {
        const encoded = encodeURIComponent(refLimpa);
        const data = await this.requisitar<{ id: number; name: string; identifier: string; _links?: { self?: { href: string } } }>(
          `/api/v3/projects/${encoded}`,
        );
        return {
          id: data.id,
          nome: data.name,
          identifier: data.identifier,
          apiHref: data._links?.self?.href || `/api/v3/projects/${data.id}`,
        };
      } catch {
        // Busca aproximada por nome na lista de projetos
        try {
          const projetos = await this.listarProjetos();
          const normalizado = refLimpa.toLowerCase();
          const encontrado = projetos.find(
            (p) => p.identificador.toLowerCase() === normalizado || p.nome.toLowerCase() === normalizado,
          );
          if (encontrado) {
            return {
              id: 0,
              nome: encontrado.nome,
              identifier: encontrado.identificador,
              apiHref: `/api/v3/projects/${encodeURIComponent(encontrado.identificador)}`,
            };
          }
        } catch {
          // segue para fallback
        }
      }
    }

    // Se não informou projeto ou não encontrou, pega o primeiro projeto disponível
    try {
      const projetos = await this.listarProjetos();
      if (projetos.length > 0) {
        const primeiro = projetos[0];
        return {
          id: 0,
          nome: primeiro.nome,
          identifier: primeiro.identificador,
          apiHref: `/api/v3/projects/${encodeURIComponent(primeiro.identificador)}`,
        };
      }
    } catch {
      // segue para fallback global
    }

    // Fallback para o projeto padrão do usuário (28 - Exitus Gestor)
    const padraoProjeto = process.env.OPENPROJECT_PROJECT || '28';
    return {
      id: Number(padraoProjeto) || 28,
      nome: 'Exitus Gestor',
      identifier: padraoProjeto,
      apiHref: `/api/v3/projects/${encodeURIComponent(padraoProjeto)}`,
    };
  }

  public async listarTasks(projetoApiHref?: string, limite = 50): Promise<TaskOpenProjectQA[]> {
    let urlBaseEndpoint = projetoApiHref && projetoApiHref !== '/api/v3'
      ? `${projetoApiHref}/work_packages`
      : '/api/v3/work_packages';

    let data: { _embedded?: { elements?: RespostaWorkPackageHal[] } } | null = null;

    try {
      const urlComSort = `${urlBaseEndpoint}?pageSize=${limite}&sortBy=${encodeURIComponent('[["updatedAt","desc"]]')}`;
      data = await this.requisitar<{ _embedded?: { elements?: RespostaWorkPackageHal[] } }>(urlComSort);
    } catch {
      // Fallback sem ordenação
      const urlSimples = `${urlBaseEndpoint}?pageSize=${limite}`;
      data = await this.requisitar<{ _embedded?: { elements?: RespostaWorkPackageHal[] } }>(urlSimples);
    }

    const elements = data?._embedded?.elements || [];
    return elements.map((wp) => this.mapearTaskHalParaModelo(wp));
  }

  public async obterDetalhesTask(taskId: string): Promise<TaskOpenProjectQA> {
    const idLimpo = encodeURIComponent(taskId.replace(/^#/, '').trim());
    const wp = await this.requisitar<RespostaWorkPackageHal>(`/api/v3/work_packages/${idLimpo}`);
    const task = this.mapearTaskHalParaModelo(wp);

    // Buscar status disponíveis no sistema para permitir troca imediata
    try {
      const statuses = await this.listarStatusesDisponiveis();
      task.statusesDisponiveis = statuses;
    } catch {
      // Statuses opcionais se falhar a listagem global
    }

    return task;
  }

  public async listarStatusesDisponiveis(): Promise<StatusDisponivelOpenProject[]> {
    const data = await this.requisitar<{ _embedded?: { elements?: Array<{ id: number; name: string; _links?: { self?: { href: string } } }> } }>(
      '/api/v3/statuses',
    );
    const elements = data?._embedded?.elements || [];
    return elements.map((s) => ({
      id: String(s.id),
      nome: s.name,
      href: s._links?.self?.href || `/api/v3/statuses/${s.id}`,
    }));
  }

  public async alterarStatusTask(taskId: string, statusHref: string, lockVersion: number): Promise<TaskOpenProjectQA> {
    const idLimpo = encodeURIComponent(taskId.replace(/^#/, '').trim());
    const payload = {
      lockVersion,
      _links: {
        status: {
          href: statusHref,
        },
      },
    };

    const wp = await this.requisitar<RespostaWorkPackageHal>(`/api/v3/work_packages/${idLimpo}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return this.mapearTaskHalParaModelo(wp);
  }

  public async obterUsuarioAtual(): Promise<UsuarioOpenProjectQA> {
    const me = await this.requisitar<{ id: number; name?: string; login?: string; _links?: { self?: { href?: string } } }>('/api/v3/users/me');
    return {
      id: me.id,
      nome: me.name || me.login || 'Usuário',
      login: me.login || '',
      href: me._links?.self?.href || `/api/v3/users/${me.id}`,
    };
  }

  public async atribuirTask(taskId: string, assigneeHref: string, lockVersion: number): Promise<TaskOpenProjectQA> {
    const idLimpo = encodeURIComponent(taskId.replace(/^#/, '').trim());
    const payload = {
      lockVersion,
      _links: {
        assignee: {
          href: assigneeHref,
        },
      },
    };

    const wp = await this.requisitar<RespostaWorkPackageHal>(`/api/v3/work_packages/${idLimpo}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return this.mapearTaskHalParaModelo(wp);
  }

  public async listarAtividadesTempo(): Promise<Array<{ id: number; nome: string; href: string }>> {
    try {
      const data = await this.requisitar<{ _embedded?: { elements?: Array<{ id: number; name: string; _links?: { self?: { href: string } } }> } }>(
        '/api/v3/time_entries/activities',
      );
      return (data._embedded?.elements || []).map((a) => ({
        id: a.id,
        nome: a.name,
        href: a._links?.self?.href || `/api/v3/time_entries/activities/${a.id}`,
      }));
    } catch {
      try {
        const data = await this.requisitar<{ _embedded?: { elements?: Array<{ id: number; name: string; _links?: { self?: { href: string } } }> } }>(
          '/api/v3/time_entry_activities',
        );
        return (data._embedded?.elements || []).map((a) => ({
          id: a.id,
          nome: a.name,
          href: a._links?.self?.href || `/api/v3/time_entry_activities/${a.id}`,
        }));
      } catch {
        return [];
      }
    }
  }

  public async registrarTempo(taskId: string, horasStr: string, comentario?: string): Promise<void> {
    const idLimpo = encodeURIComponent(taskId.replace(/^#/, '').trim());
    let duracaoIso = 'PT1H';
    const numLimpo = parseFloat(horasStr.replace(/h/i, '').replace(',', '.').trim());
    if (!isNaN(numLimpo) && numLimpo > 0) {
      const horasInt = Math.floor(numLimpo);
      const minutos = Math.round((numLimpo - horasInt) * 60);
      duracaoIso = minutos > 0 ? `PT${horasInt}H${minutos}M` : `PT${horasInt}H`;
    }

    const payload: any = {
      hours: duracaoIso,
      spentOn: new Date().toISOString().split('T')[0],
      _links: {
        workPackage: {
          href: `/api/v3/work_packages/${idLimpo}`,
        },
      },
    };

    if (comentario && comentario.trim()) {
      payload.comment = { raw: comentario.trim() };
    }

    const atividades = await this.listarAtividadesTempo();
    if (atividades.length > 0) {
      payload._links.activity = { href: atividades[0].href };
    }

    await this.requisitar('/api/v3/time_entries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

  public async adicionarComentario(taskId: string, comentario: string): Promise<void> {
    const idLimpo = encodeURIComponent(taskId.replace(/^#/, '').trim());
    const payload = {
      comment: {
        raw: comentario,
      },
    };

    await this.requisitar(`/api/v3/work_packages/${idLimpo}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

  public async criarTask(
    projetoApiHref: string,
    params: { assunto: string; descricao?: string; tipoHref?: string; prioridadeHref?: string },
  ): Promise<TaskOpenProjectQA> {
    const payload: any = {
      subject: params.assunto.trim(),
      description: {
        raw: params.descricao?.trim() || '',
      },
    };

    if (params.tipoHref) {
      payload._links = payload._links || {};
      payload._links.type = { href: params.tipoHref };
    }

    if (params.prioridadeHref) {
      payload._links = payload._links || {};
      payload._links.priority = { href: params.prioridadeHref };
    }

    const endpoint = projetoApiHref && projetoApiHref !== '/api/v3'
      ? `${projetoApiHref}/work_packages`
      : '/api/v3/work_packages';

    const wp = await this.requisitar<RespostaWorkPackageHal>(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return this.mapearTaskHalParaModelo(wp);
  }

  public obterUrlNavegador(taskId: string): string {
    const idLimpo = taskId.replace(/^#/, '').trim();
    const base = this.urlBase.replace(/\/+$/, '');
    return `${base}/work_packages/${idLimpo}`;
  }

  private mapearTaskHalParaModelo(wp: RespostaWorkPackageHal): TaskOpenProjectQA {
    const comentarios = (wp._embedded?.activities || [])
      .filter((a) => a.comment?.raw)
      .map((a) => ({
        autor: a._links?.user?.title || 'Usuário',
        dataCriacao: a.createdAt ? new Date(a.createdAt).toLocaleString('pt-BR') : '',
        texto: a.comment?.raw || '',
      }))
      .reverse();

    return {
      id: String(wp.id),
      assunto: wp.subject || '(sem título)',
      status: wp._links?.status?.title || 'Indefinido',
      tipo: wp._links?.type?.title,
      responsavel: wp._links?.assignee?.title,
      prioridade: wp._links?.priority?.title,
      autor: wp._links?.author?.title,
      dataAtualizacao: wp.updatedAt,
      dataCriacao: wp.createdAt,
      descricaoMarkdown: wp.description?.raw || '',
      lockVersion: wp.lockVersion,
      statusHref: wp._links?.status?.href,
      comentarios,
      canUpdate: true,
    };
  }
}
