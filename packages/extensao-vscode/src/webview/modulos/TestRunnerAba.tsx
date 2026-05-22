import type { CSSProperties, FC, ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { EstadoPainel, MensagemHostParaWebview, MensagemWebviewParaHost } from '../../contratos/mensagens';
import vsCodeApi from '../vscodeApi';

// ─── VS Code API ──────────────────────────────────────────────────────────────
function enviar(mensagem: MensagemWebviewParaHost): void {
  vsCodeApi.postMessage(mensagem);
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function stripAnsi(texto: string): string {
  // Remove ANSI escape sequences (colors, cursor moves, etc.)
  return texto.replace(/\x1b\[[0-9;]*[mGKHF]/g, '').replace(/\x1b\[[0-9;]*m/g, '');
}

type LogLineKind = 'success' | 'failure' | 'separator' | 'info' | 'timestamp' | 'run' | 'muted' | 'default';

function classifyLine(raw: string): LogLineKind {
  const t = raw.trim();
  if (!t) return 'muted';
  if (/^[✓✔]|PASS|\bpassed\b/i.test(t)) return 'success';
  if (/^[❌✗×]|FAIL|\bfailed\b|\berror\b/i.test(t)) return 'failure';
  if (/^─+$|^═+$|^[-─=]{4,}/.test(t)) return 'separator';
  if (/^\[?\d{2}:\d{2}:\d{2}/.test(t)) return 'timestamp';
  if (/^(RUN:|ID:|Inicio:|Suite|Executando|injected env)/i.test(t)) return 'run';
  if (/^(MedSystem|Paradigma|fluxo|para executar)/i.test(t)) return 'info';
  return 'default';
}

const QA_COLOR = {
  success: 'var(--qa-success)',
  successFaint: 'var(--qa-success-faint)',
  failure: 'var(--qa-error)',
  failureFaint: 'var(--qa-error-faint)',
  info: 'var(--qa-info)',
  infoFaint: 'var(--qa-info-faint)',
  warning: 'var(--qa-warning)',
  warningFaint: 'var(--qa-warning-faint)',
  link: 'var(--qa-link)',
  muted: 'var(--qa-muted)',
  border: 'var(--qa-border)',
  foreground: 'var(--qa-foreground)',
  surface: 'var(--qa-surface)',
  surfaceSubtle: 'var(--qa-surface-subtle)',
  surfaceStrong: 'var(--qa-surface-strong)',
  codeBg: 'var(--qa-code-bg)',
  codeBorder: 'var(--qa-code-border)',
  codeForeground: 'var(--qa-code-foreground)',
  background: 'var(--qa-bg)',
  backgroundMuted: 'var(--qa-bg-muted)',
  brandForeground: 'var(--qa-brand-foreground)',
} as const;

const LOG_COLORS: Record<LogLineKind, string> = {
  success: QA_COLOR.success,
  failure: QA_COLOR.failure,
  separator: QA_COLOR.border,
  info: QA_COLOR.info,
  timestamp: QA_COLOR.muted,
  run: QA_COLOR.link,
  muted: QA_COLOR.muted,
  default: QA_COLOR.codeForeground,
};

// ─── Pipeline Stage bar ───────────────────────────────────────────────────────

type StageStatus = 'idle' | 'done' | 'active' | 'error';

interface Stage {
  label: string;
  key: string;
}

const STAGES: Stage[] = [
  { key: 'preparando', label: 'PREPARANDO' },
  { key: 'executando', label: 'EXECUTANDO' },
  { key: 'analisando', label: 'ANALISANDO' },
  { key: 'concluido', label: 'CONCLUÍDO' },
];

function resolverEstagios(status: string): Record<string, StageStatus> {
  if (status === 'ocioso') {
    return { preparando: 'idle', executando: 'idle', analisando: 'idle', concluido: 'idle' };
  }
  if (status === 'executando') {
    return { preparando: 'done', executando: 'active', analisando: 'idle', concluido: 'idle' };
  }
  if (status === 'sucesso') {
    return { preparando: 'done', executando: 'done', analisando: 'done', concluido: 'done' };
  }
  if (status === 'erro') {
    return { preparando: 'done', executando: 'done', analisando: 'done', concluido: 'error' };
  }
  return { preparando: 'idle', executando: 'idle', analisando: 'idle', concluido: 'idle' };
}

const STAGE_COLORS: Record<StageStatus, { bg: string; text: string; border: string }> = {
  idle: { bg: 'transparent', text: QA_COLOR.muted, border: QA_COLOR.border },
  active: { bg: QA_COLOR.infoFaint, text: QA_COLOR.link, border: QA_COLOR.info },
  done: { bg: QA_COLOR.successFaint, text: QA_COLOR.success, border: 'color-mix(in srgb, var(--qa-success) 45%, var(--qa-border))' },
  error: { bg: QA_COLOR.failureFaint, text: QA_COLOR.failure, border: 'color-mix(in srgb, var(--qa-error) 45%, var(--qa-border))' },
};

const StageIcon: FC<{ status: StageStatus; pulsing?: boolean }> = ({ status, pulsing }) => {
  if (status === 'done') {
    return (
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="8" cy="8" r="7" fill={QA_COLOR.success} />
        <path d="M4.5 8L7 10.5L11.5 6" stroke={QA_COLOR.background} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === 'error') {
    return (
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="8" cy="8" r="7" fill={QA_COLOR.failure} />
        <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke={QA_COLOR.background} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (status === 'active' || pulsing) {
    return (
      <span
        style={{
          display: 'inline-block',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          border: '2px solid color-mix(in srgb, var(--qa-info) 30%, transparent)',
          borderTopColor: QA_COLOR.info,
          animation: 'qa-spin 0.7s linear infinite',
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <span
      style={{
        display: 'inline-block',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: QA_COLOR.border,
        flexShrink: 0,
      }}
    />
  );
};

const PipelineBar: FC<{ status: string }> = ({ status }) => {
  const estagios = resolverEstagios(status);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        padding: '10px 20px',
        borderBottom: '1px solid var(--qa-border)',
        background: QA_COLOR.surfaceStrong,
      }}
    >
      {STAGES.map((s, idx) => {
        const st = estagios[s.key] as StageStatus;
        const colors = STAGE_COLORS[st];
        return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 0, flex: idx < STAGES.length - 1 ? 1 : 'none' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '999px',
                border: `1px solid ${colors.border}`,
                background: colors.bg,
                color: colors.text,
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              <StageIcon status={st} />
              {s.label}
            </div>
            {idx < STAGES.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '1px',
                  margin: '0 4px',
                  background: estagios[STAGES[idx + 1].key] !== 'idle' ? QA_COLOR.success : QA_COLOR.border,
                  transition: 'background 0.3s ease',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Log Viewer ───────────────────────────────────────────────────────────────

const LogViewer: FC<{ logs: string }> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (!logs.trim()) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '8px',
          color: QA_COLOR.muted,
          fontSize: '12px',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="9" y1="9" x2="15" y2="9" />
          <line x1="9" y1="12" x2="15" y2="12" />
          <line x1="9" y1="15" x2="12" y2="15" />
        </svg>
        <span>Aguardando execução dos testes...</span>
      </div>
    );
  }

  const linhas = stripAnsi(logs).split('\n');

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        padding: '12px 16px',
        fontFamily: 'var(--vscode-editor-font-family, "Cascadia Code", "JetBrains Mono", ui-monospace, monospace)',
        fontSize: '11.5px',
        lineHeight: '1.7',
        color: QA_COLOR.codeForeground,
      }}
    >
      {linhas.map((linha, idx) => {
        const kind = classifyLine(linha);
        const color = LOG_COLORS[kind];
        if (kind === 'separator') {
          return (
            <div key={idx} style={{ height: '1px', background: QA_COLOR.border, margin: '6px 0' }} />
          );
        }
        return (
          <div
            key={idx}
            style={{
              color,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              padding: kind === 'failure' ? '1px 4px' : '0',
              background: kind === 'failure' ? QA_COLOR.failureFaint : 'transparent',
              borderLeft: kind === 'success' ? `2px solid ${QA_COLOR.success}` : kind === 'failure' ? `2px solid ${QA_COLOR.failure}` : '2px solid transparent',
              paddingLeft: kind === 'success' || kind === 'failure' ? '8px' : undefined,
              borderRadius: '2px',
            }}
          >
            {linha || '\u00a0'}
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
};

// ─── Metric Badge ─────────────────────────────────────────────────────────────

const MetricBadge: FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => {
  const metricStyle = { '--qa-runner-metric-accent': color } as CSSProperties;

  return (
  <div className="qa-runner__metric" style={metricStyle}>
    <span className="qa-runner__metric-value">
      {value}
    </span>
    <span className="qa-runner__metric-label">{label}</span>
  </div>
  );
};

// ─── Failure Card ─────────────────────────────────────────────────────────────

const FalhaCard: FC<{ falha: any; expandido: boolean; onToggle: () => void }> = ({ falha, expandido, onToggle }) => {
  return (
    <div
      style={{
        border: `1px solid color-mix(in srgb, var(--qa-error) 45%, var(--qa-border))`,
        borderRadius: '8px',
        background: QA_COLOR.surface,
        overflow: 'hidden',
      }}
    >
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: QA_COLOR.failureFaint,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <span
            style={{
              fontSize: '9px',
              background: QA_COLOR.failure,
              color: QA_COLOR.brandForeground,
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 700,
              fontFamily: 'monospace',
              flexShrink: 0,
            }}
          >
            {falha.id}
          </span>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: QA_COLOR.failure,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {falha.nome}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <span style={{ fontSize: '10.5px', color: QA_COLOR.muted, fontFamily: 'monospace' }}>⏱ {falha.duracao}</span>
          <span style={{ fontSize: '10px', color: QA_COLOR.muted }}>{expandido ? '▼' : '▶'}</span>
        </div>
      </div>

      {expandido && (
        <div style={{ padding: '12px 14px', borderTop: '1px solid color-mix(in srgb, var(--qa-error) 45%, var(--qa-border))', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: QA_COLOR.muted, paddingBottom: '4px', borderBottom: '1px solid var(--qa-border)' }}>
            Evidências e achados de QA:
          </div>
          {falha.findings && falha.findings.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {falha.findings.map((finding: string, idx: number) => {
                const isHigh = finding.includes('[HIGH]');
                const isMedium = finding.includes('[MEDIUM]');
                const isLow = finding.includes('[LOW]');
                let bg: string = 'transparent';
                let fg: string = QA_COLOR.codeForeground;
                let label = '';
                if (isHigh) { bg = QA_COLOR.failureFaint; fg = QA_COLOR.failure; label = 'HIGH'; }
                else if (isMedium) { bg = QA_COLOR.warningFaint; fg = QA_COLOR.warning; label = 'MEDIUM'; }
                else if (isLow) { bg = 'color-mix(in srgb, var(--qa-warning) 10%, transparent)'; fg = QA_COLOR.warning; label = 'LOW'; }

                const textoLimpo = finding.replace(/\[(HIGH|MEDIUM|LOW)\]\s*/i, '').trim();
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      background: bg,
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '11px',
                    }}
                  >
                    {label && (
                      <span
                        style={{
                          fontSize: '9px',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: '3px',
                          background: fg,
                          color: QA_COLOR.background,
                          flexShrink: 0,
                          marginTop: '1px',
                        }}
                      >
                        {label}
                      </span>
                    )}
                    <span style={{ color: fg, flex: 1 }}>{textoLimpo}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '11px', color: QA_COLOR.muted, fontStyle: 'italic' }}>Sem achados detalhados registrados.</p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── History Item ─────────────────────────────────────────────────────────────

const HistoricoItem: FC<{ run: any; onVerDetalhes?: (id: string) => void }> = ({ run, onVerDetalhes }) => {
  const [aberto, setAberto] = useState(false);
  const ok = run.status === 'sucesso';
  const temRelatorio = !!run.sumarioCaminho;
  const temAnalise = !!run.analiseIA;

  return (
    <div
      style={{
        borderRadius: '6px',
        border: `1px solid ${QA_COLOR.border}`,
        background: QA_COLOR.surface,
        overflow: 'hidden',
        transition: 'border-color 0.12s ease',
      }}
    >
      {/* Collapsed header — always visible */}
      <div
        onClick={() => setAberto((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          padding: '6px 8px', cursor: 'pointer', userSelect: 'none',
        }}
      >
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: ok ? QA_COLOR.success : QA_COLOR.failure, flexShrink: 0 }} />
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: QA_COLOR.muted, fontSize: '9.5px', flexShrink: 0 }}>#{run.id}</span>
        <span style={{ color: QA_COLOR.codeForeground, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, fontSize: '10.5px' }}>
          {run.nomeExecucao || run.categoria}
        </span>
        {temAnalise && (
          <span title="Análise de IA salva" style={{ fontSize: '9px', color: QA_COLOR.muted, flexShrink: 0 }}>◈</span>
        )}
        <span style={{ color: ok ? QA_COLOR.success : QA_COLOR.failure, fontWeight: 700, fontSize: '10px', flexShrink: 0 }}>
          {run.total}T{run.erros > 0 ? ` ${run.erros}F` : ''}
        </span>
        <span style={{ color: QA_COLOR.muted, fontSize: '9.5px', flexShrink: 0 }}>{run.segundos}s</span>
        <span style={{ color: QA_COLOR.muted, fontSize: '9px', flexShrink: 0 }}>{aberto ? '▼' : '▶'}</span>
      </div>

      {/* Expanded details */}
      {aberto && (
        <div style={{ borderTop: `1px solid ${QA_COLOR.border}`, padding: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ fontSize: '10px', color: QA_COLOR.muted }}>{run.dataHora}</div>
          {run.nomeExecucao && (
            <div style={{ fontSize: '10px', color: QA_COLOR.muted }}>Nome: <span style={{ color: QA_COLOR.codeForeground }}>{run.nomeExecucao}</span></div>
          )}
          {run.sumarioCaminho && (
            <div style={{ fontSize: '9.5px', color: QA_COLOR.muted, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={run.sumarioCaminho}>
              {run.sumarioCaminho}
            </div>
          )}
          {temAnalise && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: QA_COLOR.muted }}>
              <span style={{ fontSize: '9px' }}>◈</span> Análise de IA salva
            </div>
          )}
          {(temRelatorio || temAnalise) && onVerDetalhes && (
            <button
              type="button"
              className="secondary qa-runner__compact-button"
              onClick={(e) => { e.stopPropagation(); onVerDetalhes(run.id); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '2px' }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Carregar relatório
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Category Map ─────────────────────────────────────────────────────────────

const CATEGORIAS = [
  { value: 'todos', label: 'Todos os Testes de QA', grupo: '' },
  { value: 'PONTAPONTA', label: 'Todos os Fluxos Ponta a Ponta', grupo: 'E2E' },
  { value: 'VALIDACAO_BASICA', label: 'Smoke Tests', grupo: 'E2E' },
  { value: 'CAMINHO_FELIZ', label: 'Caminho Feliz (Gold)', grupo: 'E2E' },
  { value: 'EXCECOES', label: 'Exceções e Casos Limite', grupo: 'E2E' },
  { value: 'ADMIN', label: 'Área Administrativa', grupo: 'E2E' },
  { value: 'MOBILE', label: 'Mobile e Regressão', grupo: 'E2E' },
  { value: 'UNITARIO', label: 'Testes Unitários', grupo: 'Outros' },
  { value: 'COMPONENTE', label: 'Testes de Componentes', grupo: 'Outros' },
  { value: 'INTEGRACAO', label: 'Testes de Integração', grupo: 'Outros' },
  { value: 'USABILIDADE', label: 'Testes de Usabilidade', grupo: 'Outros' },
  { value: 'ACESSIBILIDADE', label: 'Testes de Acessibilidade', grupo: 'Outros' },
];

function labelDaCategoria(value: string): string {
  return CATEGORIAS.find((c) => c.value === value)?.label ?? value;
}

// ─── Markdown Notebook Helpers ────────────────────────────────────────────────

type SectionTheme = 'neutral' | 'success' | 'failure' | 'info' | 'warning';

interface MdSection {
  title: string;
  level: number;
  content: string;
  theme: SectionTheme;
}

function inferTheme(title: string, content: string): SectionTheme {
  const combined = (title + ' ' + content).toLowerCase();
  if (/falha|erro|failed|fail|❌/.test(combined)) return 'failure';
  if (/sucesso|passou|passed|✅|pass/.test(combined)) return 'success';
  if (/sumário|resumo|geral|summary|overview/.test(combined)) return 'info';
  if (/atenção|aviso|warning|⚠/.test(combined)) return 'warning';
  return 'neutral';
}

function parseMdSections(md: string): MdSection[] {
  const sections: MdSection[] = [];
  const lines = md.split('\n');
  let current: { title: string; level: number; content: string } | null = null;

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)/);
    const h3 = line.match(/^###\s+(.+)/);
    if (h2 || h3) {
      if (current) sections.push({ ...current, theme: inferTheme(current.title, current.content) });
      current = { title: (h2 ?? h3)![1].trim(), level: h2 ? 2 : 3, content: '' };
    } else if (!current) {
      const h1 = line.match(/^#\s+(.+)/);
      if (h1) current = { title: h1[1].trim(), level: 1, content: '' };
    } else {
      current.content += line + '\n';
    }
  }

  if (current) sections.push({ ...current, theme: inferTheme(current.title, current.content) });
  return sections;
}

const THEME_PALETTE: Record<SectionTheme, { accent: string; accentFaint: string; headerBg: string; border: string }> = {
  neutral: { accent: QA_COLOR.muted, accentFaint: 'color-mix(in srgb, var(--qa-muted) 14%, transparent)', headerBg: 'color-mix(in srgb, var(--qa-muted) 12%, transparent)', border: QA_COLOR.border },
  success: { accent: QA_COLOR.success, accentFaint: QA_COLOR.successFaint, headerBg: 'color-mix(in srgb, var(--qa-success) 18%, transparent)', border: 'color-mix(in srgb, var(--qa-success) 45%, var(--qa-border))' },
  failure: { accent: QA_COLOR.failure, accentFaint: QA_COLOR.failureFaint, headerBg: 'color-mix(in srgb, var(--qa-error) 18%, transparent)', border: 'color-mix(in srgb, var(--qa-error) 45%, var(--qa-border))' },
  info:    { accent: QA_COLOR.info, accentFaint: QA_COLOR.infoFaint, headerBg: 'color-mix(in srgb, var(--qa-info) 18%, transparent)', border: 'color-mix(in srgb, var(--qa-info) 45%, var(--qa-border))' },
  warning: { accent: QA_COLOR.warning, accentFaint: QA_COLOR.warningFaint, headerBg: 'color-mix(in srgb, var(--qa-warning) 18%, transparent)', border: 'color-mix(in srgb, var(--qa-warning) 45%, var(--qa-border))' },
};

function renderInlineMarkdown(text: string): ReactElement[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i} style={{ color: QA_COLOR.foreground }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2 && !part.startsWith('**')) {
      return <em key={i} style={{ color: QA_COLOR.codeForeground }}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return <code key={i} style={{ background: QA_COLOR.codeBg, border: `1px solid ${QA_COLOR.codeBorder}`, padding: '1px 5px', borderRadius: '4px', fontSize: '0.92em', color: QA_COLOR.foreground, fontFamily: 'monospace' }}>{part.slice(1, -1)}</code>;
    }
    return <span key={i}>{part}</span>;
  });
}

function renderMdTable(tableLines: string[], keyPrefix: number): ReactElement {
  const parseRow = (row: string) => row.split('|').slice(1, -1).map((c) => c.trim());
  const headerLine = tableLines[0];
  const dataLines = tableLines.slice(2);
  const headers = parseRow(headerLine);
  const rows = dataLines.map(parseRow);

  return (
    <div key={`tbl-${keyPrefix}`} style={{ overflowX: 'auto', margin: '8px 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{ padding: '5px 10px', textAlign: 'left', background: QA_COLOR.codeBg, color: QA_COLOR.muted, borderBottom: `1px solid ${QA_COLOR.border}`, fontWeight: 700, fontSize: '10.5px', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: `1px solid ${QA_COLOR.border}` }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: '5px 10px', color: QA_COLOR.codeForeground, verticalAlign: 'top', fontSize: '11.5px' }}>
                  {renderInlineMarkdown(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderSectionContent(content: string): ReactElement[] {
  const lines = content.split('\n');
  const elements: ReactElement[] = [];
  let tableBuffer: string[] = [];
  let listBuffer: string[] = [];
  let isNumberedList = false;

  const flushList = () => {
    if (listBuffer.length === 0) return;
    const Tag = isNumberedList ? 'ol' : 'ul';
    elements.push(
      <Tag key={`list-${elements.length}`} style={{ margin: '6px 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {listBuffer.map((item, i) => (
          <li key={i} style={{ fontSize: '12px', color: QA_COLOR.codeForeground, lineHeight: 1.55 }}>
            {renderInlineMarkdown(item)}
          </li>
        ))}
      </Tag>
    );
    listBuffer = [];
    isNumberedList = false;
  };

  const flushTable = () => {
    if (tableBuffer.length === 0) return;
    elements.push(renderMdTable(tableBuffer, elements.length));
    tableBuffer = [];
  };

  for (const line of lines) {
    if (line.startsWith('|')) {
      flushList();
      tableBuffer.push(line);
      continue;
    }
    if (tableBuffer.length > 0) flushTable();

    const listMatch = line.match(/^[-*]\s+(.+)/);
    const numListMatch = line.match(/^\d+\.\s+(.+)/);
    const hrMatch = /^---+$|^═{3,}$/.test(line.trim());

    if (listMatch) {
      flushTable();
      listBuffer.push(listMatch[1]);
    } else if (numListMatch) {
      flushTable();
      if (!isNumberedList && listBuffer.length > 0) flushList();
      isNumberedList = true;
      listBuffer.push(numListMatch[1]);
    } else {
      flushList();
      const t = line.trim();
      if (!t || hrMatch) continue;
      elements.push(
        <p key={`p-${elements.length}`} style={{ margin: '4px 0', fontSize: '12px', color: QA_COLOR.codeForeground, lineHeight: 1.6 }}>
          {renderInlineMarkdown(t)}
        </p>
      );
    }
  }

  flushList();
  flushTable();
  return elements;
}

// ─── Notebook Cell ────────────────────────────────────────────────────────────

const THEME_ICON: Record<SectionTheme, string> = {
  neutral: '○', success: '✓', failure: '✗', info: '◈', warning: '⚠',
};

const NotebookCell: FC<{ section: MdSection; index: number }> = ({ section, index }) => {
  const [collapsed, setCollapsed] = useState(false);
  const palette = THEME_PALETTE[section.theme];

  return (
    <div style={{ border: `1px solid ${palette.border}`, borderRadius: '10px', overflow: 'hidden', background: QA_COLOR.surface }}>
      <div
        onClick={() => setCollapsed((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px',
          background: palette.headerBg, cursor: 'pointer', userSelect: 'none',
          borderBottom: collapsed ? 'none' : `1px solid ${palette.border}`,
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 700, color: palette.accent, flexShrink: 0 }}>
          {THEME_ICON[section.theme]}
        </span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: QA_COLOR.foreground, flex: 1, letterSpacing: '-0.01em' }}>
          {section.title}
        </span>
        <span style={{ fontSize: '9px', background: palette.accentFaint, color: palette.accent, border: `1px solid ${palette.border}`, borderRadius: '4px', padding: '1px 6px', fontWeight: 700, letterSpacing: '0.04em', flexShrink: 0 }}>
          CELL {index + 1}
        </span>
        <span style={{ fontSize: '10px', color: palette.accent, opacity: 0.7, flexShrink: 0 }}>
          {collapsed ? '▶' : '▼'}
        </span>
      </div>
      {!collapsed && (
        <div style={{ padding: '14px 18px' }}>
          {renderSectionContent(section.content)}
        </div>
      )}
    </div>
  );
};

// ─── Mini Log Stream (left column) ───────────────────────────────────────────

// MiniLogStream removed — logs are shown full-screen in the right panel during execution

// ─── AI Analysis Cell (monochromatic, collapsible) ───────────────────────────

const AIAnaliseCell: FC<{ analise: { conteudo: string; geradoEm: string } }> = ({ analise }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ border: `1px solid ${QA_COLOR.border}`, borderRadius: '10px', overflow: 'hidden', background: QA_COLOR.surface }}>
      <div
        onClick={() => setCollapsed((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px',
          background: QA_COLOR.surfaceSubtle, cursor: 'pointer', userSelect: 'none',
          borderBottom: collapsed ? 'none' : `1px solid ${QA_COLOR.border}`,
        }}
      >
        <span style={{ fontSize: '11px', color: QA_COLOR.muted, flexShrink: 0 }}>◈</span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: QA_COLOR.codeForeground, flex: 1, letterSpacing: '-0.01em' }}>
          Análise de Falhas — Gemini
        </span>
        <span style={{ fontSize: '9px', background: QA_COLOR.codeBg, color: QA_COLOR.muted, border: `1px solid ${QA_COLOR.border}`, borderRadius: '4px', padding: '1px 6px', fontWeight: 700, letterSpacing: '0.04em', flexShrink: 0 }}>
          IA
        </span>
        <span style={{ fontSize: '9.5px', color: QA_COLOR.muted, flexShrink: 0 }}>{analise.geradoEm}</span>
        <span style={{ fontSize: '10px', color: QA_COLOR.muted, flexShrink: 0 }}>{collapsed ? '▶' : '▼'}</span>
      </div>
      {!collapsed && (
        <div className="qa-runner__analysis-body scroll-region compact">
          {renderSectionContent(analise.conteudo)}
        </div>
      )}
    </div>
  );
};

// ─── Notebook Relatorio (right panel) ────────────────────────────────────────

const NotebookRelatorio: FC<{ exec: NonNullable<EstadoPainel['execucaoTestes']> }> = ({ exec }) => {
  const executando = exec.status === 'executando';
  const sections = !executando && exec.sumarioConteudo ? parseMdSections(exec.sumarioConteudo) : [];

  // Show empty state only when truly idle with nothing to display
  if (exec.status === 'ocioso' && !exec.sumarioConteudo && !exec.analiseIA) {
    return (
      <div className="qa-runner__empty">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Nenhum relatório disponível</p>
        <p style={{ margin: 0, fontSize: '11.5px' }}>Rode os testes para gerar o SUMARIO_GERAL</p>
      </div>
    );
  }

  if (executando) {
    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="qa-runner__panel-head info">
          <span className="inline-spinner" style={{ width: '8px', height: '8px', color: QA_COLOR.info }} />
          <span className="qa-runner__panel-title info">
            execução em andamento — terminal ao vivo
          </span>
        </div>
        <LogViewer logs={exec.logs} />
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="qa-runner__panel-head info">
          <span className="qa-runner__panel-title">Saída do Terminal</span>
        </div>
        <LogViewer logs={exec.logs} />
      </div>
    );
  }

  // ── Notebook view
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Notebook header */}
      <div className="qa-runner__panel-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={QA_COLOR.info} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <span className="qa-runner__panel-title info" style={{ fontSize: '10.5px' }}>
            Relatório de Execução
          </span>
          <span style={{ fontSize: '10px', color: QA_COLOR.muted }}>
            {sections.length} {sections.length === 1 ? 'seção' : 'seções'}
          </span>
        </div>
        <div className="qa-runner__summary">
          <span className="info">Total <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{exec.totalCount}</strong></span>
          <span className="success">OK <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{exec.sucessosCount}</strong></span>
          <span className="error">Falhas <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{exec.errosCount}</strong></span>
        </div>
      </div>

      {/* Notebook cells */}
      <div className="qa-runner__panel-scroll scroll-region">

        {/* AI Analysis Cell — monochromatic, collapsible */}
        {exec.analiseIA?.conteudo && !exec.analiseIA?.carregando && (
          <AIAnaliseCell analise={exec.analiseIA} />
        )}

        {/* AI loading placeholder */}
        {exec.analiseIA?.carregando && (
          <div style={{ border: `1px solid ${QA_COLOR.border}`, borderRadius: '8px', padding: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: QA_COLOR.surfaceSubtle }}>
            <span className="inline-spinner" style={{ width: '12px', height: '12px', color: QA_COLOR.info }} />
            <span style={{ fontSize: '11.5px', color: QA_COLOR.muted, fontWeight: 600 }}>Gemini analisando falhas...</span>
          </div>
        )}

        {sections.map((section, i) => (
          <NotebookCell key={i} section={section} index={i} />
        ))}

        {/* Triage appended below notebook cells */}
        {exec.falhasDetalhes && exec.falhasDetalhes.length > 0 && (
          <div className="qa-runner__triage">
            <div className="qa-runner__triage-head">
              <span className="qa-runner__triage-badge">TRIAGE</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: QA_COLOR.failure }}>
                Falhas Estruturadas ({exec.falhasDetalhes.length})
              </span>
            </div>
            <div className="qa-runner__triage-grid">
              {exec.falhasDetalhes.map((falha: any, idx: number) => (
                <FalhaCard key={falha.id ?? idx} falha={falha} expandido={false} onToggle={() => {}} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ESTADO_INICIAL_ABA: Partial<EstadoPainel> & { execucaoTestes?: EstadoPainel['execucaoTestes'] } = {
  execucaoTestes: {
    categoriaAtiva: null,
    status: 'ocioso',
    logs: '',
    errosCount: 0,
    sucessosCount: 0,
    totalCount: 0,
    historico: [],
    falhasDetalhes: [],
    sumarioCaminhoRelativo: undefined,
    sumarioConteudo: undefined,
    nomeExecucao: undefined,
    analiseIA: undefined,
  },
};

export const TestRunnerAba: FC = () => {
  const [estado, setEstado] = useState<Partial<EstadoPainel>>(ESTADO_INICIAL_ABA);
  const [categoria, setCategoria] = useState('EXCECOES');
  const [nomeExecucao, setNomeExecucao] = useState('');

  const exec = estado.execucaoTestes;
  const executando = exec?.status === 'executando';

  useEffect(() => {
    const escutar = (evento: MessageEvent<MensagemHostParaWebview>) => {
      if (evento.data.tipo === 'estado.atualizado') {
        setEstado(evento.data.estado);
      }
    };
    window.addEventListener('message', escutar);
    enviar({ tipo: 'painel.carregado' });
    return () => window.removeEventListener('message', escutar);
  }, []);

  function rodarTestes() {
    enviar({ tipo: 'testes.executar', categoria, nomeExecucao: nomeExecucao.trim() || undefined });
  }

  function limpar() {
    enviar({ tipo: 'testes.limparHistorico' });
  }

  function minimizar() {
    enviar({ tipo: 'testes.fecharAba' });
  }

  function analisarComIA() {
    enviar({ tipo: 'testes.analisarComIA' });
  }

  function verRunDetalhes(runId: string) {
    enviar({ tipo: 'testes.verRunDetalhes', runId });
  }

  const chipCor = !exec || exec.status === 'ocioso'
    ? QA_COLOR.muted
    : exec.status === 'executando'
    ? QA_COLOR.info
    : exec.status === 'sucesso'
    ? QA_COLOR.success
    : QA_COLOR.failure;

  const chipLabel = !exec || exec.status === 'ocioso'
    ? 'Ocioso'
    : exec.status === 'executando'
    ? 'Executando'
    : exec.status === 'sucesso'
    ? 'Sucesso'
    : 'Falha';

  const chipClass = !exec || exec.status === 'ocioso'
    ? 'default'
    : exec.status === 'executando'
    ? 'info'
    : exec.status === 'sucesso'
    ? 'success'
    : 'error';

  return (
    <div className="qa-runner">

      {/* ── Top bar */}
      <div className="qa-runner__topbar">
        <div className="qa-runner__topbar-main">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--qa-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span className="qa-runner__title">QA Runner</span>
        </div>

        <div className="qa-runner__topbar-meta">

        {exec?.categoriaAtiva && (
          <span className="badge info" style={{ fontSize: '10px', padding: '2px 8px' }}>
            {labelDaCategoria(exec.categoriaAtiva)}
          </span>
        )}

        {exec?.nomeExecucao && (
          <span className="badge" style={{ fontSize: '10px', padding: '2px 8px' }}>
            {exec.nomeExecucao}
          </span>
        )}

        <div
          className={`qa-runner__status-chip ${chipClass} ${executando ? 'is-running' : ''}`}
        >
          {executando && (
            <span className="inline-spinner" style={{ width: '7px', height: '7px', color: chipCor }} />
          )}
          <span className="qa-runner__status-label">{chipLabel}</span>
        </div>
        </div>

        <div style={{ flex: 1 }} />

        <button
          type="button"
          className="secondary qa-runner__compact-button"
          onClick={minimizar}
          title="Minimizar"
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
          aria-label="Minimizar QA Runner"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 14 10 14 10 20" />
            <polyline points="20 10 14 10 14 4" />
            <line x1="10" y1="14" x2="3" y2="21" />
            <line x1="21" y1="3" x2="14" y2="10" />
          </svg>
          Minimizar
        </button>
      </div>

      {/* ── Pipeline bar */}
      <PipelineBar status={exec?.status ?? 'ocioso'} />

      {/* ── Body */}
      <div className="qa-runner__body">

        {/* LEFT COLUMN */}
        <div className="qa-runner__sidebar">
          <div className="qa-runner__sidebar-scroll scroll-region">
          {/* Categoria */}
          <div className="qa-runner__section">
            <label htmlFor="qa-cat" className="qa-runner__section-label">
              Categoria
            </label>
            <select
              id="qa-cat"
              className="qa-runner__control"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              disabled={executando}
            >
              <option value="todos">Todos os Testes</option>
              <optgroup label="── Ponta a Ponta">
                <option value="PONTAPONTA">Todos os Fluxos E2E</option>
                <option value="VALIDACAO_BASICA">Smoke Tests</option>
                <option value="CAMINHO_FELIZ">Caminho Feliz (Gold)</option>
                <option value="EXCECOES">Exceções e Casos Limite</option>
                <option value="ADMIN">Área Administrativa</option>
                <option value="MOBILE">Mobile e Regressão</option>
              </optgroup>
              <optgroup label="── Outros">
                <option value="UNITARIO">Testes Unitários</option>
                <option value="COMPONENTE">Testes de Componentes</option>
                <option value="INTEGRACAO">Testes de Integração</option>
                <option value="USABILIDADE">Testes de Usabilidade</option>
                <option value="ACESSIBILIDADE">Testes de Acessibilidade</option>
              </optgroup>
            </select>
          </div>

          {/* Nome da execução */}
          <div className="qa-runner__section">
            <label htmlFor="qa-nome" className="qa-runner__section-label">
              Nome da execução
            </label>
            <input
              id="qa-nome"
              className="qa-runner__control"
              type="text"
              value={nomeExecucao}
              onChange={(e) => setNomeExecucao(e.target.value)}
              placeholder="ex: sprint-42..."
              disabled={executando}
              onKeyDown={(e) => { if (e.key === 'Enter' && !executando) rodarTestes(); }}
            />
          </div>

          {/* Run button */}
          <button
            type="button"
            className="qa-runner__run-button"
            disabled={executando}
            onClick={rodarTestes}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              background: executando ? QA_COLOR.border : 'var(--qa-brand)',
              color: executando ? QA_COLOR.muted : 'var(--qa-brand-foreground)', border: 'none',
              fontSize: '12px', fontWeight: 700,
            }}
          >
            {executando ? (
              <>
                <span className="inline-spinner" style={{ width: '10px', height: '10px', color: 'var(--qa-brand-foreground)' }} />
                Executando...
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Rodar Testes
              </>
            )}
          </button>

          {/* Metrics */}
          {exec && exec.status !== 'ocioso' && (
            <div className="qa-runner__metric-grid">
              <MetricBadge label="Total" value={exec.totalCount} color={QA_COLOR.foreground} />
              <MetricBadge label="OK" value={exec.sucessosCount} color={QA_COLOR.success} />
              <MetricBadge label="Falhas" value={exec.errosCount} color={QA_COLOR.failure} />
            </div>
          )}

          {/* Actions */}
          {exec && exec.status !== 'ocioso' && !executando && (
            <div className="qa-runner__action-stack">
              {exec.sumarioCaminhoRelativo && (
                <button
                  type="button"
                  className="secondary qa-runner__compact-button"
                  onClick={() => enviar({ tipo: 'workspace.abrirCaminho', caminhoRelativo: exec.sumarioCaminhoRelativo! })}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', borderColor: 'color-mix(in srgb, var(--qa-success) 45%, var(--qa-border))', color: QA_COLOR.success }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Ver Relatório Raw
                </button>
              )}
              <button
                type="button"
                className="secondary qa-runner__compact-button"
                onClick={limpar}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                </svg>
                Limpar Painel
              </button>
            </div>
          )}

          {/* Analisar com IA button — monochromatic */}
          {exec && exec.errosCount > 0 && !executando && (
            <button
              type="button"
              className="secondary qa-runner__compact-button"
              disabled={exec.analiseIA?.carregando}
              onClick={analisarComIA}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                fontSize: '11px', fontWeight: 600,
                color: exec.analiseIA?.carregando ? QA_COLOR.muted : undefined,
              }}
            >
              {exec.analiseIA?.carregando ? (
                <>
                  <span className="inline-spinner" style={{ width: '9px', height: '9px', color: QA_COLOR.info }} />
                  Analisando...
                </>
              ) : (
                <>
                  <span style={{ fontSize: '11px' }}>◈</span>
                  {exec.analiseIA?.conteudo ? 'Reanalisar com IA' : 'Analisar Falhas com IA'}
                </>
              )}
            </button>
          )}

          {/* History — scrollable, all runs, collapsible items */}
          {exec?.historico && exec.historico.length > 0 && (
            <div className="qa-runner__section" style={{ minHeight: 0 }}>
              <div className="qa-runner__history-head">
                <p className="qa-runner__section-label" style={{ margin: 0 }}>
                  Histórico
                </p>
                <span className="badge" style={{ fontSize: '9px', padding: '1px 5px', fontFamily: 'monospace' }}>
                  {exec.historico.length} runs
                </span>
              </div>
              <div className="qa-runner__history-list scroll-region compact">
                {exec.historico.map((run: any) => (
                  <HistoricoItem
                    key={run.id}
                    run={run}
                    onVerDetalhes={(run.sumarioCaminho || run.analiseIA) ? verRunDetalhes : undefined}
                  />
                ))}
              </div>
            </div>
          )}
          </div>
        </div>

        {/* RIGHT PANEL — Notebook Relatorio */}
        <div className="qa-runner__content">
          {exec ? (
            <NotebookRelatorio exec={exec} />
          ) : (
            <div className="qa-runner__empty" style={{ fontSize: '12px' }}>
              Carregando estado...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
