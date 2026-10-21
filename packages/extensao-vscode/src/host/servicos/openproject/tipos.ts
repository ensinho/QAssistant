import type { TaskOpenProjectQA } from '../../../contratos/mensagens';

export interface RespostaWorkPackageHal {
  id: number;
  subject: string;
  lockVersion: number;
  updatedAt: string;
  createdAt: string;
  description?: {
    format: string;
    raw: string;
    html: string;
  };
  _links?: {
    status?: { title: string; href: string };
    type?: { title: string; href: string };
    priority?: { title: string; href: string };
    assignee?: { title: string; href: string };
    author?: { title: string; href: string };
    project?: { title: string; href: string };
  };
  _embedded?: {
    activities?: Array<{
      id: number;
      comment?: { raw: string };
      createdAt: string;
      _links?: {
        user?: { title: string };
      };
    }>;
  };
}

export interface StatusDisponivelOpenProject {
  id: string;
  nome: string;
  href: string;
}

export interface RespostaListagemWorkPackages {
  total: number;
  count: number;
  _embedded?: {
    elements?: RespostaWorkPackageHal[];
  };
}

export interface OpcoesCriacaoWorkPackage {
  assunto: string;
  descricao?: string;
  tipoHref?: string;
  prioridadeHref?: string;
}
