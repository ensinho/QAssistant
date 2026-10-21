import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import {
  Globe,
  Key,
  FolderGit2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import type {
  ProjetoOpenProjectDisponivel,
  SetupWorkspace,
} from '../../../contratos/mensagens';

interface SetupSimplesProps {
  setupAtual: SetupWorkspace;
  openProjectKeyPresente: boolean;
  projetosDisponiveis?: ProjetoOpenProjectDisponivel[];
  aoValidarConexao: (urlBase: string, token?: string) => void;
  aoSalvarToken: (token: string) => void;
  aoConcluirSetup: (setup: SetupWorkspace) => void;
}

export const SetupSimples: FC<SetupSimplesProps> = ({
  setupAtual,
  openProjectKeyPresente,
  projetosDisponiveis = [],
  aoValidarConexao,
  aoSalvarToken,
  aoConcluirSetup,
}) => {
  const [urlBase, setUrlBase] = useState(
    setupAtual.openProjectUrlBase || 'https://openproject.ormel.com.br'
  );
  const [token, setToken] = useState('');
  const [projetoId, setProjetoId] = useState(setupAtual.openProjectProjetoId || '28');
  const [padraoBranch, setPadraoBranch] = useState(setupAtual.padraoBranch || '{tipo}/OP-{id}-{slug}');
  const [intervalo, setIntervalo] = useState(setupAtual.intervaloPollingSegundos || 30);
  const [validando, setValidando] = useState(false);
  const [etapa, setEtapa] = useState<'conexao' | 'projeto'>(
    openProjectKeyPresente && projetosDisponiveis.length > 0 ? 'projeto' : 'conexao'
  );

  const handleValidar = () => {
    if (!urlBase.trim()) return;
    setValidando(true);
    aoValidarConexao(urlBase.trim(), token.trim() || undefined);
    if (token.trim()) {
      aoSalvarToken(token.trim());
    }
    setTimeout(() => {
      setValidando(false);
      setEtapa('projeto');
    }, 1500);
  };

  const handleSalvarConcluir = (e: FormEvent) => {
    e.preventDefault();
    aoConcluirSetup({
      ...setupAtual,
      openProjectUrlBase: urlBase.trim(),
      openProjectProjetoId: projetoId || undefined,
      padraoBranch: padraoBranch.trim() || '{tipo}/OP-{id}-{slug}',
      intervaloPollingSegundos: intervalo,
      openProjectHabilitado: true,
      nomeProjeto: setupAtual.nomeProjeto || 'Meu Projeto',
    });
  };

  return (
    <div className="qa-setup-simple-container">
      <div className="qa-setup-header">
        <h2 className="qa-setup-title">Configuração do OpenProject</h2>
        <p className="qa-setup-subtitle">
          Conecte seu workspace ao OpenProject para sincronizar tarefas em tempo real e interagir
          com o terminal.
        </p>
      </div>

      <div className="qa-setup-card">
        {/* Indicador de passos */}
        <div className="qa-setup-steps-indicator">
          <div
            className={`qa-setup-step-pill ${etapa === 'conexao' ? 'qa-step-active' : 'qa-step-done'}`}
            onClick={() => setEtapa('conexao')}
          >
            <span>1. Servidor & Token</span>
          </div>
          <div
            className={`qa-setup-step-pill ${etapa === 'projeto' ? 'qa-step-active' : ''}`}
            onClick={() => setEtapa('projeto')}
          >
            <span>2. Projeto & Sync</span>
          </div>
        </div>

        {etapa === 'conexao' ? (
          <div className="qa-setup-form-body">
            <div className="qa-form-group">
              <label className="qa-form-label" htmlFor="setup-url">
                <Globe size={13} />
                <span>URL do Servidor OpenProject</span>
              </label>
              <input
                id="setup-url"
                type="url"
                className="qa-form-input"
                placeholder="http://openproject.suaempresa.com.br/"
                value={urlBase}
                onChange={(e) => setUrlBase(e.target.value)}
              />
            </div>

            <div className="qa-form-group">
              <label className="qa-form-label" htmlFor="setup-token">
                <Key size={13} />
                <span>API Key / Token de Acesso</span>
                {openProjectKeyPresente && (
                  <span className="qa-tag-saved">
                    <ShieldCheck size={11} /> Salvo com segurança
                  </span>
                )}
              </label>
              <input
                id="setup-token"
                type="password"
                className="qa-form-input"
                placeholder={
                  openProjectKeyPresente
                    ? '•••••••••••••••••••••••• (Chave salva nos segredos)'
                    : 'Cole seu token do OpenProject aqui'
                }
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <span className="qa-subtle-hint">
                No OpenProject, acesse <em>Meu Perfil → Tokens de Acesso → API</em> para gerar sua chave.
              </span>
            </div>

            <div className="qa-setup-form-actions">
              <button
                type="button"
                className="qa-btn-action-primary"
                onClick={handleValidar}
                disabled={validando || !urlBase.trim()}
              >
                {validando ? <RefreshCw size={13} className="qa-spin" /> : <ArrowRight size={13} />}
                <span>{validando ? 'Validando conexão...' : 'Avançar para Seleção de Projeto'}</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSalvarConcluir} className="qa-setup-form-body">
            <div className="qa-form-group">
              <label className="qa-form-label" htmlFor="setup-project">
                <FolderGit2 size={13} />
                <span>Projeto Alvo no OpenProject</span>
              </label>
              {projetosDisponiveis.length > 0 ? (
                <select
                  id="setup-project"
                  className="qa-form-select"
                  value={projetoId}
                  onChange={(e) => setProjetoId(e.target.value)}
                >
                  <option value="">Selecione um projeto...</option>
                  {projetosDisponiveis.map((p) => (
                    <option key={p.identificador} value={p.identificador}>
                      {p.nome} ({p.identificador})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="setup-project"
                  type="text"
                  className="qa-form-input"
                  placeholder="Nome ou identificador do projeto"
                  value={projetoId}
                  onChange={(e) => setProjetoId(e.target.value)}
                />
              )}
            </div>

            <div className="qa-form-group">
              <label className="qa-form-label" htmlFor="setup-branch">
                <span>Padrão de Nome da Branch Git</span>
              </label>
              <input
                id="setup-branch"
                type="text"
                className="qa-form-input"
                placeholder="{tipo}/OP-{id}-{slug}"
                value={padraoBranch}
                onChange={(e) => setPadraoBranch(e.target.value)}
              />
              <span className="qa-subtle-hint">
                Variáveis: <code>&#123;tipo&#125;</code> (feat/fix), <code>&#123;id&#125;</code>, <code>&#123;slug&#125;</code>
              </span>
            </div>

            <div className="qa-form-group">
              <label className="qa-form-label" htmlFor="setup-interval">
                <span>Intervalo do LiveSync (Tempo Real)</span>
              </label>
              <select
                id="setup-interval"
                className="qa-form-select"
                value={intervalo}
                onChange={(e) => setIntervalo(Number(e.target.value))}
              >
                <option value={15}>A cada 15 segundos (Mais ágil)</option>
                <option value={30}>A cada 30 segundos (Recomendado)</option>
                <option value={60}>A cada 60 segundos</option>
                <option value={120}>A cada 2 minutos</option>
              </select>
            </div>

            <div className="qa-setup-form-actions">
              <button
                type="button"
                className="qa-btn-action-ghost"
                onClick={() => setEtapa('conexao')}
              >
                Voltar
              </button>
              <button type="submit" className="qa-btn-action-primary">
                <CheckCircle2 size={13} />
                <span>Concluir e Abrir Tarefas</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
