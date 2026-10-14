import React, { useState, useMemo, useEffect } from 'react';
import {
  Inbox, BarChart3, ChevronLeft, ChevronRight, Send, Lock, Search,
  AlertTriangle, CheckCircle2, ShieldCheck, LogOut, Loader2,
  Menu, Bell, X, RefreshCw, SlidersHorizontal, Download, Sun, Moon,
  Eye, EyeOff, Mail, ArrowRight, Plus, Clock, Headphones, Ticket as TicketIcon,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

/* ---------------------------------------------------------------------- */
/* Design tokens — Atos Capital design system                             */
/* ---------------------------------------------------------------------- */

const THEME = {
  light: {
    brandPrimary: '#bf152c', brandPrimaryHover: '#a01024',
    brandPrimaryStrong: '#893939', brandPrimaryMuted: '#7A2828', onBrand: '#ffffff',
    brandPrimaryShadow: 'rgba(191,21,44,0.28)',
    surfaceCanvas: '#f9f9f9', surfaceSoft: '#fbf9f9', surfaceBase: '#ffffff', surfaceAlt: '#fafafa',
    surfaceOverlay: 'rgba(0,0,0,0.45)',
    borderSubtle: '#ececec', borderDefault: '#e0e0e0', borderStrong: '#bdbdbd',
    textPrimary: '#212121', textSecondary: '#555555', textMuted: '#939393', textInverse: '#ffffff',
    success: '#2e7d32', successBg: 'rgba(21,163,9,0.20)',
    warning: '#ff9800', warningBg: 'rgba(255,152,0,0.20)',
    error: '#d32f2f', errorBg: 'rgba(211,47,47,0.20)',
    info: '#1976d2', infoBg: 'rgba(33,150,243,0.20)',
    purple: '#7b1fa2', purpleBg: 'rgba(123,31,162,0.16)',
    menuGradient: 'linear-gradient(0deg, #7A2828, #893939)', menuText: '#ffffff',
    tableHeaderBg: '#ECEFF1', tableRowAlt: '#fafafa', scrollbarThumb: '#e5e5e5',
  },
  dark: {
    brandPrimary: '#e85a72', brandPrimaryHover: '#f07686',
    brandPrimaryStrong: '#bf3a4f', brandPrimaryMuted: '#8a2a3a', onBrand: '#ffffff',
    brandPrimaryShadow: 'rgba(232,90,114,0.35)',
    surfaceCanvas: '#0a0a0a', surfaceSoft: '#0f0f0f', surfaceBase: '#1a1a1a', surfaceAlt: '#212121',
    surfaceOverlay: 'rgba(0,0,0,0.65)',
    borderSubtle: '#252525', borderDefault: '#2e2e2e', borderStrong: '#3d3d3d',
    textPrimary: '#f5f5f5', textSecondary: '#c4c4c4', textMuted: '#8a8a8a', textInverse: '#212121',
    success: '#66bb6a', successBg: 'rgba(21,163,9,0.20)',
    warning: '#ffa726', warningBg: 'rgba(255,152,0,0.20)',
    error: '#ef5350', errorBg: 'rgba(211,47,47,0.20)',
    info: '#42a5f5', infoBg: 'rgba(33,150,243,0.20)',
    purple: '#ba68c8', purpleBg: 'rgba(123,31,162,0.16)',
    menuGradient: 'linear-gradient(0deg, #2a0e0e, #3a1818)', menuText: '#f5f5f5',
    tableHeaderBg: '#212121', tableRowAlt: '#1f1f1f', scrollbarThumb: '#3a3a3a',
  },
};

function toCssVars(t) {
  return {
    '--brand-primary': t.brandPrimary, '--brand-primary-hover': t.brandPrimaryHover,
    '--brand-primary-strong': t.brandPrimaryStrong, '--brand-primary-muted': t.brandPrimaryMuted,
    '--brand-primary-shadow': t.brandPrimaryShadow,
    '--on-brand': t.onBrand,
    '--surface-canvas': t.surfaceCanvas, '--surface-soft': t.surfaceSoft,
    '--surface-base': t.surfaceBase, '--surface-alt': t.surfaceAlt, '--surface-overlay': t.surfaceOverlay,
    '--border-subtle': t.borderSubtle, '--border-default': t.borderDefault, '--border-strong': t.borderStrong,
    '--text-primary': t.textPrimary, '--text-secondary': t.textSecondary,
    '--text-muted': t.textMuted, '--text-inverse': t.textInverse,
    '--success': t.success, '--success-bg': t.successBg,
    '--warning': t.warning, '--warning-bg': t.warningBg,
    '--error': t.error, '--error-bg': t.errorBg,
    '--info': t.info, '--info-bg': t.infoBg,
    '--purple': t.purple, '--purple-bg': t.purpleBg,
    '--menu-gradient': t.menuGradient, '--menu-text': t.menuText,
    '--table-header-bg': t.tableHeaderBg, '--table-row-alt': t.tableRowAlt,
    '--scrollbar-thumb': t.scrollbarThumb,
  };
}

const FONT = 'IBM Plex Sans';
const MONO = 'IBM Plex Mono';

const TYPE = {
  h1: { fontFamily: FONT, fontSize: 24, fontWeight: 600 },
  modalTitle: { fontFamily: FONT, fontSize: 16, fontWeight: 600 },
  sectionLabel: { fontFamily: FONT, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--brand-primary)' },
  body: { fontFamily: FONT, fontSize: 14, fontWeight: 400 },
  fieldLabel: { fontFamily: FONT, fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' },
  badge: { fontFamily: FONT, fontSize: 12, fontWeight: 600 },
  helper: { fontFamily: FONT, fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' },
};

const STATUS = {
  aberto: { label: 'Aberto', color: 'var(--info)', bg: 'var(--info-bg)' },
  em_andamento: { label: 'Em andamento', color: 'var(--warning)', bg: 'var(--warning-bg)' },
  aguardando_cliente: { label: 'Aguardando cliente', color: 'var(--purple)', bg: 'var(--purple-bg)' },
  resolvido: { label: 'Resolvido', color: 'var(--success)', bg: 'var(--success-bg)' },
  fechado: { label: 'Fechado', color: 'var(--text-muted)', bg: 'var(--border-subtle)' },
};

const PRIORITY = {
  alta: { label: 'Alta', color: 'var(--error)' },
  media: { label: 'Média', color: 'var(--warning)' },
  baixa: { label: 'Baixa', color: 'var(--text-secondary)' },
};

const STAGES = ['aberto', 'em_andamento', 'resolvido', 'fechado'];
const PRODUCTS = ['Joe SFA B1', 'Portal Atos Capital', 'SAP Business One', 'SAP S/4HANA'];
const CATEGORIES = [
  'Sincronização SSO', 'Integração ERP', 'Erro de sistema',
  'Dúvida de uso', 'Solicitação de acesso', 'Performance',
];
const EMPRESAS = ['Banco Confiança', 'Cooperativa Vale', 'Financeira Sul', 'Investa Corretora'];
const AGENTES = ['Marina Alves', 'Diego Ramos'];

/* ---------------------------------------------------------------------- */
/* Mock data                                                               */
/* ---------------------------------------------------------------------- */

const seed = [
  {
    id: 'AC-2026-00214', empresa: 'Banco Confiança', contato: 'Fernanda Duarte',
    produto: 'SAP Business One', categoria: 'Integração ERP', prioridade: 'alta',
    status: 'em_andamento', agente: 'Marina Alves',
    slaTotal: 24, slaRestante: 3, abertura: '12/09 09:14',
    mensagens: [
      { autor: 'Fernanda Duarte', tipo: 'cliente', data: '12/09 09:14', texto: 'A sincronização de pedidos do Business One parou de refletir no portal desde ontem à noite. Já verificamos a conexão local e está normal.' },
      { autor: 'Marina Alves', tipo: 'agente', data: '12/09 10:02', texto: 'Obrigada pelo detalhamento, Fernanda. Estamos analisando os logs da fila de integração do grupo Banco Confiança agora.' },
      { autor: 'Marina Alves', tipo: 'agente', data: '14/09 08:40', texto: 'Identificamos um travamento no job de sincronização. Aplicando correção e reprocessando os pedidos pendentes.' },
    ],
    notas: [
      { autor: 'Marina Alves', data: '14/09 08:31', texto: 'Job de sync com trava de conexão desde 13/09 23:47. Reiniciar worker e reprocessar fila antes de confirmar ao cliente.' },
    ],
  },
  {
    id: 'AC-2026-00213', empresa: 'Cooperativa Vale', contato: 'Rogério Nunes',
    produto: 'Joe SFA B1', categoria: 'Erro de sistema', prioridade: 'alta',
    status: 'aberto', agente: null,
    slaTotal: 24, slaRestante: 20, abertura: '14/09 07:52',
    mensagens: [
      { autor: 'Rogério Nunes', tipo: 'cliente', data: '14/09 07:52', texto: 'Ao tentar fechar uma visita no Joe SFA B1, o aplicativo apresenta erro e a visita não é salva.' },
    ],
    notas: [],
  },
  {
    id: 'AC-2026-00212', empresa: 'Banco Confiança', contato: 'Fernanda Duarte',
    produto: 'Portal Atos Capital', categoria: 'Sincronização SSO', prioridade: 'media',
    status: 'aguardando_cliente', agente: 'Diego Ramos',
    slaTotal: 48, slaRestante: 30, abertura: '10/09 14:20',
    aguardandoDesde: '12/09 16:05', prazoAutoEncerramento: '15/09 16:05',
    mensagens: [
      { autor: 'Fernanda Duarte', tipo: 'cliente', data: '10/09 14:20', texto: 'Um novo usuário da filial não está sendo criado automaticamente no portal após o login via SSO.' },
      { autor: 'Diego Ramos', tipo: 'agente', data: '12/09 16:05', texto: 'Poderia confirmar o e-mail corporativo exato usado no login e o grupo empresa esperado (matriz ou filial)? Vamos verificar o registro de sincronização.' },
    ],
    notas: [
      { autor: 'Diego Ramos', data: '12/09 16:06', texto: 'Aguardando confirmação do e-mail para checar upsert na base de usuários. Encerramento automático programado caso não haja resposta.' },
    ],
  },
  {
    id: 'AC-2026-00211', empresa: 'Financeira Sul', contato: 'Paula Menezes',
    produto: 'SAP S/4HANA', categoria: 'Dúvida de uso', prioridade: 'baixa',
    status: 'resolvido', agente: 'Marina Alves',
    slaTotal: 120, slaRestante: 64, abertura: '08/09 11:00',
    mensagens: [
      { autor: 'Paula Menezes', tipo: 'cliente', data: '08/09 11:00', texto: 'Como configuramos o mapeamento de centro de custo entre o S/4HANA e o portal?' },
      { autor: 'Marina Alves', tipo: 'agente', data: '08/09 15:22', texto: 'Enviei o passo a passo por e-mail e deixei um modelo de mapeamento anexado. Ficou claro?' },
      { autor: 'Paula Menezes', tipo: 'cliente', data: '09/09 09:10', texto: 'Perfeito, funcionou. Obrigada!' },
    ],
    notas: [],
  },
  {
    id: 'AC-2026-00210', empresa: 'Banco Confiança', contato: 'Fernanda Duarte',
    produto: 'Joe SFA B1', categoria: 'Performance', prioridade: 'media',
    status: 'fechado', agente: 'Diego Ramos',
    slaTotal: 48, slaRestante: 0, abertura: '02/09 08:00',
    mensagens: [
      { autor: 'Fernanda Duarte', tipo: 'cliente', data: '02/09 08:00', texto: 'O carregamento da carteira de clientes no app está muito lento nos últimos dias.' },
      { autor: 'Diego Ramos', tipo: 'agente', data: '03/09 10:00', texto: 'Aplicamos um ajuste de índice na base de clientes. Pode validar o carregamento agora?' },
      { autor: 'Fernanda Duarte', tipo: 'cliente', data: '03/09 14:30', texto: 'Melhorou bastante, pode encerrar.' },
    ],
    notas: [],
  },
  {
    id: 'AC-2026-00209', empresa: 'Cooperativa Vale', contato: 'Rogério Nunes',
    produto: 'SAP Business One', categoria: 'Solicitação de acesso', prioridade: 'baixa',
    status: 'em_andamento', agente: 'Marina Alves',
    slaTotal: 120, slaRestante: 80, abertura: '13/09 13:00',
    mensagens: [
      { autor: 'Rogério Nunes', tipo: 'cliente', data: '13/09 13:00', texto: 'Precisamos liberar o perfil de analista financeiro para dois novos usuários da filial.' },
      { autor: 'Marina Alves', tipo: 'agente', data: '13/09 16:40', texto: 'Poderia confirmar os e-mails corporativos dos dois usuários para liberarmos o perfil?' },
    ],
    notas: [],
  },
  {
    id: 'AC-2026-00208', empresa: 'Investa Corretora', contato: 'Bianca Lopes',
    produto: 'Portal Atos Capital', categoria: 'Erro de sistema', prioridade: 'alta',
    status: 'aberto', agente: null,
    slaTotal: 24, slaRestante: 2, abertura: '14/09 06:10',
    mensagens: [
      { autor: 'Bianca Lopes', tipo: 'cliente', data: '14/09 06:10', texto: 'O portal está retornando erro 500 ao tentar gerar o relatório de conciliação diária.' },
    ],
    notas: [],
  },
  {
    id: 'AC-2026-00207', empresa: 'Financeira Sul', contato: 'Paula Menezes',
    produto: 'SAP Business One', categoria: 'Integração ERP', prioridade: 'media',
    status: 'resolvido', agente: 'Diego Ramos',
    slaTotal: 48, slaRestante: 12, abertura: '11/09 09:30',
    mensagens: [
      { autor: 'Paula Menezes', tipo: 'cliente', data: '11/09 09:30', texto: 'Notas fiscais emitidas no Business One não estão chegando ao portal.' },
      { autor: 'Diego Ramos', tipo: 'agente', data: '11/09 17:00', texto: 'Corrigido um mapeamento de campo na integração. As notas de hoje já devem aparecer.' },
    ],
    notas: [],
  },
  {
    id: 'AC-2026-00206', empresa: 'Investa Corretora', contato: 'Bianca Lopes',
    produto: 'Joe SFA B1', categoria: 'Sincronização SSO', prioridade: 'alta',
    status: 'fechado', agente: 'Marina Alves',
    slaTotal: 24, slaRestante: 0, abertura: '05/09 10:00',
    mensagens: [
      { autor: 'Bianca Lopes', tipo: 'cliente', data: '05/09 10:00', texto: 'Um usuário não conseguiu logar via SSO no app mobile.' },
      { autor: 'Marina Alves', tipo: 'agente', data: '05/09 12:15', texto: 'Reprocessamos o vínculo do usuário com o grupo empresa. Já pode tentar novamente.' },
    ],
    notas: [],
  },
];

const seedNotifications = [
  { id: 1, texto: 'Chamado AC-2026-00214 recebeu uma atualização de Marina Alves.', data: 'há 5 min', lida: false },
  { id: 2, texto: 'Chamado AC-2026-00212 está aguardando retorno do cliente.', data: 'há 2 h', lida: false },
  { id: 3, texto: 'Chamado AC-2026-00208 está próximo de estourar o SLA.', data: 'há 3 h', lida: false },
  { id: 4, texto: 'Chamado AC-2026-00211 foi marcado como resolvido.', data: 'ontem', lida: true },
];

/* ---------------------------------------------------------------------- */
/* Small building blocks                                                   */
/* ---------------------------------------------------------------------- */

function BrandMark({ onDark, size = 'md' }) {
  const widths = { sm: 118, md: 150, lg: 230 };
  return (
    <img
      src={onDark ? '/atos-capital-logo-white.png' : '/atos-capital-logo.png'}
      alt="Atos Capital"
      style={{ width: widths[size], height: 'auto', display: 'block' }}
    />
  );
}

function StatusTag({ status }) {
  const s = STATUS[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full"
      style={{ ...TYPE.badge, background: s.bg, color: s.color }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 9999, background: s.color, display: 'inline-block' }} />
      {s.label}
    </span>
  );
}

function PriorityMark({ level }) {
  const p = PRIORITY[level];
  return <span style={{ ...TYPE.badge, color: p.color }}>{p.label}</span>;
}

function SlaBar({ ticket }) {
  const pct = Math.max(0, Math.min(100, (ticket.slaRestante / ticket.slaTotal) * 100));
  const risk = pct < 20 && !['resolvido', 'fechado'].includes(ticket.status);
  const done = ['resolvido', 'fechado'].includes(ticket.status);
  const color = risk ? 'var(--error)' : done ? 'var(--text-muted)' : 'var(--brand-primary)';
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span style={TYPE.fieldLabel}>Prazo de SLA</span>
        <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 500, color }}>
          {ticket.status === 'fechado' ? 'concluído' : ticket.status === 'resolvido' ? 'cumprido' : `${ticket.slaRestante}h restantes`}
        </span>
      </div>
      <div className="rounded-full overflow-hidden" style={{ height: 6, background: 'var(--border-subtle)', width: '100%' }}>
        <div style={{ height: 6, width: `${pct}%`, background: color, transition: 'width .3s' }} />
      </div>
      {risk && (
        <p className="mt-2 flex items-center gap-1.5" style={{ ...TYPE.helper, color: 'var(--error)' }}>
          <AlertTriangle size={12} /> Próximo de estourar o prazo
        </p>
      )}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block mb-4">
      <span className="block mb-1.5" style={TYPE.fieldLabel}>{label}</span>
      {children}
      {hint && <span className="block mt-1" style={TYPE.helper}>{hint}</span>}
    </label>
  );
}

const inputStyle = {
  ...TYPE.body,
  borderRadius: 6,
  border: '1px solid var(--border-default)',
  background: 'var(--surface-base)',
  color: 'var(--text-primary)',
};

function StatCard({ label, value, tone }) {
  return (
    <div className="px-4 py-3 rounded-md" style={{ background: 'var(--surface-base)', border: '1px solid var(--border-subtle)' }}>
      <p style={{ ...TYPE.helper, marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: FONT, fontSize: 22, fontWeight: 600, color: tone || 'var(--text-primary)' }}>{value}</p>
    </div>
  );
}

function Chip({ children, onRemove }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full"
      style={{ background: 'var(--surface-alt)', border: '1px solid var(--border-default)', ...TYPE.helper, color: 'var(--text-secondary)', fontSize: 12 }}
    >
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remover filtro ${children}`}
        className="rounded-full flex items-center justify-center"
        style={{ width: 14, height: 14, color: 'var(--text-muted)' }}
      >
        <X size={11} />
      </button>
    </span>
  );
}

function Toast({ message }) {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] transition-all duration-300"
      style={{
        opacity: message ? 1 : 0,
        transform: message ? 'translate(-50%, 0)' : 'translate(-50%, 8px)',
        pointerEvents: 'none',
      }}
    >
      {message && (
        <div
          className="px-4 py-2.5 rounded-md flex items-center gap-2"
          style={{ background: 'var(--text-primary)', color: 'var(--surface-base)', ...TYPE.body, fontSize: 13, boxShadow: '0 8px 24px rgba(0,0,0,0.22)' }}
        >
          <CheckCircle2 size={15} style={{ color: 'var(--brand-primary)' }} />
          {message}
        </div>
      )}
    </div>
  );
}

function ViewSkeleton() {
  return (
    <div className="max-w-5xl animate-pulse" aria-hidden="true">
      <div className="rounded-md mb-2" style={{ height: 26, width: 220, background: 'var(--border-subtle)' }} />
      <div className="rounded-md mb-8" style={{ height: 14, width: 300, background: 'var(--border-subtle)' }} />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-md" style={{ height: 48, background: 'var(--border-subtle)', opacity: 0.6 }} />
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Login                                                                    */
/* ---------------------------------------------------------------------- */

function ProductPreview() {
  const rows = [
    { id: '#00214', status: 'em_andamento' },
    { id: '#00212', status: 'aguardando_cliente' },
    { id: '#00211', status: 'resolvido' },
  ];
  const tagColor = {
    em_andamento: ['rgba(255,152,0,0.2)', '#ffa726'],
    aguardando_cliente: ['rgba(186,104,200,0.2)', '#ba68c8'],
    resolvido: ['rgba(102,187,106,0.2)', '#66bb6a'],
  };
  return (
    <div className="atos-mock" aria-hidden="true">
      <div className="atos-mock-top">
        <div className="atos-mock-dots"><i /><i /><i /></div>
        <span>app.atoscapital.com/suporte</span>
        <span />
      </div>
      <div className="atos-mock-body">
        <aside className="atos-mock-aside">
          <span className="atos-mock-logo">A</span>
          <i className="on" /><i /><i /><i />
        </aside>
        <div className="atos-mock-main">
          <small>Visão geral</small>
          <strong>Fila de atendimento</strong>
          <div className="atos-mock-stats">
            <div><span>Em aberto</span><b>6</b></div>
            <div><span>Próximos do SLA</span><b style={{ color: '#ef5350' }}>3</b></div>
            <div><span>Resolvidos</span><b style={{ color: '#66bb6a' }}>12</b></div>
          </div>
          {rows.map((r) => (
            <div key={r.id} className="atos-mock-row">
              <span className="id">{r.id}</span>
              <span className="bar" />
              <span className="tag" style={{ background: tagColor[r.status][0], color: tagColor[r.status][1] }}>
                {STATUS[r.status].label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin, themeMode, setThemeMode }) {
  const [tab, setTab] = useState('cliente');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [error, setError] = useState('');

  const handleSso = () => {
    setLoading(true);
    setTimeout(() => {
      onLogin({ role: 'cliente', nome: 'Fernanda Duarte', empresa: 'Banco Confiança' });
    }, 900);
  };

  const handleAgentSubmit = (e) => {
    e.preventDefault();
    if (!email.includes('@') || senha.length < 4) {
      setError('Informe um e-mail corporativo válido e uma senha com pelo menos 4 caracteres.');
      return;
    }
    setError('');
    setLoading(true);
    const nome = email.split('@')[0].split('.').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    setTimeout(() => {
      onLogin({ role: 'agente', nome, empresa: null, email });
    }, 700);
  };

  const isClient = tab === 'cliente';

  return (
    <div className="atos-login">
      <section className="atos-showcase">
        <div className="atos-orb atos-orb-one" />
        <div className="atos-orb atos-orb-two" />
        <header>
          <BrandMark onDark size="md" />
          <span className="atos-security-label"><ShieldCheck size={14} /> Ambiente seguro</span>
        </header>

        <div className="atos-showcase-content">
          <span className="atos-eyebrow">Central de atendimento</span>
          <h1>
            Chamados resolvidos<br />com prazo e <em>clareza.</em>
          </h1>
          <p>
            Acompanhe cada chamado, o SLA e as notificações em um único ambiente,
            integrado aos sistemas que a sua operação já usa.
          </p>
          <ProductPreview />
          <div className="atos-trust">
            <span>Integrado a</span>
            <span className="atos-chip-dark">Joe SFA B1</span>
            <span className="atos-chip-dark">SAP Business One</span>
            <span className="atos-chip-dark">SAP S/4HANA</span>
          </div>
        </div>

        <footer>
          <span>© 2026 Atos Capital</span>
          <span>Privacidade</span>
          <span>Segurança</span>
        </footer>
      </section>

      <main className="atos-login-area">
        <div className="atos-mobile-brand"><BrandMark onDark={themeMode === 'dark'} size="sm" /></div>
        <button
          type="button"
          className="atos-theme-btn"
          onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
          aria-label="Alternar tema claro e escuro"
        >
          {themeMode === 'light' ? <Moon size={13} /> : <Sun size={13} />}
          {themeMode === 'light' ? 'Escuro' : 'Claro'}
        </button>

        <div className="atos-card atos-fade-up">
          <div className="atos-seg" role="tablist">
            <button type="button" role="tab" aria-selected={isClient} className={isClient ? 'on' : ''} onClick={() => { setTab('cliente'); setError(''); }}>
              Portal do cliente
            </button>
            <button type="button" role="tab" aria-selected={!isClient} className={!isClient ? 'on' : ''} onClick={() => { setTab('agente'); setError(''); }}>
              Equipe Atos Capital
            </button>
          </div>

          <div className="atos-intro">
            <span className="atos-welcome-icon"><ShieldCheck size={20} /></span>
            <div>
              <span className="atos-eyebrow-sm">{isClient ? 'Portal do cliente' : 'Acesso da equipe'}</span>
              <h2>Bem-vindo de volta</h2>
              <p>{isClient ? 'Acesse com a sua conta Atos Capital.' : 'Entre para atender os chamados.'}</p>
            </div>
          </div>

          {isClient ? (
            <div>
              <button type="button" className="atos-submit" style={{ marginTop: 0 }} onClick={handleSso} disabled={loading}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                {loading ? 'Redirecionando para Atos Capital ID' : 'Entrar com Atos Capital ID'}
                {!loading && <ArrowRight size={16} />}
              </button>
              <p className="atos-note">
                Sua conta é sincronizada automaticamente a partir do login na Atos Capital.
                Não é necessário criar uma senha aqui.
              </p>
              <p className="atos-note" style={{ marginTop: 10 }}>
                Ainda não tem acesso? <button type="button" className="atos-link">Fale com o administrador do seu grupo empresa</button>
              </p>
            </div>
          ) : (
            <form onSubmit={handleAgentSubmit}>
              <label className="atos-label" htmlFor="login-email">E-mail corporativo</label>
              <div className="atos-field">
                <Mail size={16} className="lead" />
                <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome.sobrenome@atoscapital.com" autoComplete="username" />
              </div>

              <div className="atos-label-row">
                <label className="atos-label" htmlFor="login-senha">Senha</label>
                <button type="button" className="atos-link">Esqueci minha senha</button>
              </div>
              <div className="atos-field">
                <Lock size={16} className="lead" />
                <input id="login-senha" type={showSenha ? 'text' : 'password'} value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Digite sua senha" autoComplete="current-password" />
                <button type="button" className="toggle" onClick={() => setShowSenha((s) => !s)} aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}>
                  {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <label className="atos-remember">
                <input type="checkbox" />
                <span>Manter conectado neste dispositivo</span>
              </label>

              {error && <p className="atos-error">{error}</p>}

              <button type="submit" className="atos-submit" disabled={loading}>
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Entrando' : 'Entrar no portal'}
                {!loading && <ArrowRight size={16} />}
              </button>
              <p className="atos-note">Acesso restrito à equipe de suporte da Atos Capital.</p>
            </form>
          )}
        </div>

        <div className="atos-login-footer">
          <ShieldCheck size={13} />
          <span>Ambiente seguro. Acesso restrito a usuários autorizados.</span>
        </div>
      </main>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Sidebar / TopBar                                                         */
/* ---------------------------------------------------------------------- */

function Sidebar({ session, onLogout, view, setView, onClose, themeMode, setThemeMode }) {
  const clientNav = [
    { id: 'lista', label: 'Meus chamados', icon: TicketIcon },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
  ];
  const agentNav = [
    { id: 'lista', label: 'Fila de atendimento', icon: Headphones },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
  ];
  const nav = session.role === 'agente' ? agentNav : clientNav;

  return (
    <div className="w-64 shrink-0 flex flex-col justify-between" style={{ background: 'var(--menu-gradient)', height: '100vh' }}>
      <div>
        <div className="px-5 pt-6 pb-5 flex items-start justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <div>
            <BrandMark onDark />
            <span className="mt-3 flex items-center gap-1.5" style={{ ...TYPE.helper, fontSize: 10, color: 'var(--menu-text)', opacity: 0.66 }}>
              <ShieldCheck size={12} /> Ambiente seguro
            </span>
          </div>
          {onClose && (
            <button type="button" onClick={onClose} aria-label="Fechar menu" className="p-1 -mt-1 -mr-1 rounded">
              <X size={18} color="var(--menu-text)" />
            </button>
          )}
        </div>
        <nav className="mt-3">
          {nav.map((item) => {
            const active = view === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className="ac-nav w-full flex items-center gap-2.5 px-5 py-2.5 text-left"
                style={{
                  ...TYPE.body,
                  color: 'var(--menu-text)',
                  opacity: active ? 1 : 0.72,
                  background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                  borderLeft: active ? '2px solid var(--menu-text)' : '2px solid transparent',
                }}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="px-5 py-5" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        <button
          type="button"
          onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
          className="w-full flex items-center gap-2 mb-4 px-2.5 py-1.5 rounded-md"
          style={{ ...TYPE.helper, fontSize: 12, color: 'var(--menu-text)', opacity: 0.85, border: '1px solid rgba(255,255,255,0.18)' }}
        >
          {themeMode === 'light' ? <Moon size={13} /> : <Sun size={13} />}
          {themeMode === 'light' ? 'Tema escuro' : 'Tema claro'}
        </button>

        <div className="mb-2 flex items-center gap-1.5" style={{ ...TYPE.helper, fontSize: 11, color: 'var(--menu-text)', opacity: 0.65 }}>
          {session.role === 'cliente' ? (<><ShieldCheck size={13} /> Sincronizado via SSO</>) : 'Equipe de suporte'}
        </div>
        <div style={{ ...TYPE.body, fontWeight: 500, color: 'var(--menu-text)' }}>{session.nome}</div>
        <div className="mb-4 truncate" style={{ ...TYPE.helper, fontSize: 12, color: 'var(--menu-text)', opacity: 0.65 }}>
          {session.role === 'cliente' ? session.empresa : session.email}
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md"
          style={{ ...TYPE.helper, fontSize: 12, color: 'var(--menu-text)', border: '1px solid rgba(255,255,255,0.25)' }}
        >
          <LogOut size={13} /> Sair
        </button>
      </div>
    </div>
  );
}

function TopBar({ session, notifications, unreadCount, onOpenNav, onMarkAllRead, onMarkOneRead }) {
  const [open, setOpen] = useState(false);
  const initials = session.nome.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
  const context = session.role === 'cliente' ? session.empresa : 'Equipe de suporte';
  return (
    <div className="flex items-center justify-between gap-4 px-6 md:px-10 sticky top-0 z-10" style={{ height: 66, borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-base)' }}>
      <button type="button" className="md:hidden -ml-1 p-1.5 rounded" aria-label="Abrir menu" onClick={onOpenNav}>
        <Menu size={20} color="var(--text-primary)" />
      </button>
      <div className="md:hidden"><BrandMark onDark={false} size="sm" /></div>

      <div className="hidden md:flex items-center gap-2.5" style={{ ...TYPE.helper, fontSize: 12 }}>
        <span>Central de atendimento</span>
        <i style={{ width: 3, height: 3, borderRadius: 9999, background: 'var(--brand-primary)' }} />
        <strong style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{context}</strong>
      </div>

      <div className="relative ml-auto flex items-center gap-3">
        <button
          type="button"
          aria-label="Notificações"
          onClick={() => setOpen((o) => !o)}
          className="ac-icon-btn relative"
          style={{ width: 36, height: 36 }}
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute rounded-full" style={{ top: 7, right: 8, width: 7, height: 7, background: 'var(--brand-primary)', border: '1px solid var(--surface-base)' }} />
          )}
        </button>
        <span className="grid place-items-center rounded-full" style={{ width: 32, height: 32, color: '#fff', fontSize: 11, fontWeight: 700, background: 'linear-gradient(145deg, var(--brand-primary-strong), var(--brand-primary-muted))' }}>
          {initials}
        </span>
        <div className="hidden sm:flex flex-col" style={{ gap: 2 }}>
          <strong style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{session.nome}</strong>
          <small style={{ ...TYPE.helper, fontSize: 10 }}>{session.role === 'cliente' ? 'Cliente Atos Capital' : 'Equipe de suporte'}</small>
        </div>

        {open && (
          <div
            className="absolute right-0 top-full mt-2 w-80 rounded-md overflow-hidden z-50"
            style={{ background: 'var(--surface-base)', border: '1px solid var(--border-default)', boxShadow: '0 12px 28px rgba(0,0,0,0.16)' }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <p style={{ ...TYPE.fieldLabel, fontWeight: 600 }}>Notificações</p>
              {unreadCount > 0 && (
                <button type="button" onClick={onMarkAllRead} className="ac-text-btn" style={{ fontSize: 12, fontWeight: 500 }}>
                  Marcar tudo como lido
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center" style={{ ...TYPE.body, color: 'var(--text-muted)' }}>Nenhuma notificação.</p>
            ) : notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => onMarkOneRead(n.id)}
                className="ac-row w-full flex items-start gap-2.5 px-4 py-3 text-left"
                style={{ borderBottom: '1px solid var(--border-subtle)', background: n.lida ? 'transparent' : 'var(--surface-alt)' }}
              >
                <span className="rounded-full shrink-0" style={{ width: 7, height: 7, marginTop: 5, background: n.lida ? 'transparent' : 'var(--brand-primary)' }} />
                <div className="min-w-0">
                  <p style={{ ...TYPE.body, fontSize: 13, fontWeight: n.lida ? 400 : 600, color: 'var(--text-primary)' }}>{n.texto}</p>
                  <p className="mt-0.5" style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)' }}>{n.data}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Ticket list (TableGrid)                                                  */
/* ---------------------------------------------------------------------- */

function StatTile({ label, value, detail, tone = 'neutral', icon: IconCmp }) {
  const tones = {
    neutral: { fg: 'var(--text-primary)', ibg: 'var(--surface-alt)', ifg: 'var(--text-secondary)' },
    info: { fg: 'var(--info)', ibg: 'var(--info-bg)', ifg: 'var(--info)' },
    error: { fg: 'var(--error)', ibg: 'var(--error-bg)', ifg: 'var(--error)' },
  };
  const t = tones[tone];
  return (
    <article className="ac-card flex items-start justify-between" style={{ padding: '18px 19px', minHeight: 112 }}>
      <div className="flex flex-col">
        <span style={TYPE.fieldLabel}>{label}</span>
        <strong style={{ fontFamily: FONT, fontSize: 26, fontWeight: 600, color: t.fg, margin: '6px 0 2px', letterSpacing: '-0.6px' }}>{value}</strong>
        <small style={TYPE.helper}>{detail}</small>
      </div>
      <div className="grid place-items-center rounded-lg shrink-0" style={{ width: 38, height: 38, background: t.ibg, color: t.ifg }}>
        <IconCmp size={19} />
      </div>
    </article>
  );
}

function CustomerInsights({ tickets }) {
  const doing = tickets.filter((t) => ['aberto', 'em_andamento'].includes(t.status)).length;
  const waiting = tickets.filter((t) => t.status === 'aguardando_cliente').length;
  const done = tickets.filter((t) => ['resolvido', 'fechado'].includes(t.status)).length;
  const groups = [
    { label: 'Em atendimento', value: doing, color: 'var(--warning)' },
    { label: 'Aguardando você', value: waiting, color: 'var(--purple)' },
    { label: 'Concluídos', value: done, color: 'var(--text-muted)' },
  ];
  const total = Math.max(1, doing + waiting + done);
  const updates = tickets.slice(0, 2).map((t) => {
    const last = t.mensagens[t.mensagens.length - 1];
    return { id: t.id, titulo: last ? `${last.autor.split(' ')[0]} ${last.tipo === 'agente' ? 'respondeu' : 'escreveu'}` : 'Chamado registrado', quando: last ? last.data : t.abertura, agente: last && last.tipo === 'agente' };
  });

  return (
    <section className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-6" aria-label="Resumo dos chamados">
      <article className="ac-card lg:col-span-2" style={{ padding: 20 }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="ac-eyebrow">Visão geral</span>
            <h2 style={TYPE.modalTitle}>Chamados por status</h2>
          </div>
          <div className="grid place-items-center rounded-lg" style={{ width: 36, height: 36, background: 'var(--error-bg)', color: 'var(--brand-primary)' }}>
            <BarChart3 size={18} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2.5 mt-5">
          {groups.map((g) => (
            <div key={g.label} className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5" style={{ ...TYPE.helper, fontSize: 11 }}>
                <i style={{ width: 6, height: 6, borderRadius: 9999, background: g.color }} /> {g.label}
              </span>
              <strong style={{ fontFamily: FONT, fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>{g.value}</strong>
            </div>
          ))}
        </div>
        <div className="flex gap-1 mt-4 overflow-hidden rounded-full" style={{ height: 6 }} aria-hidden="true">
          {groups.map((g) => (g.value > 0 ? <i key={g.label} style={{ flex: g.value / total, background: g.color }} /> : null))}
        </div>
      </article>

      <article className="ac-card lg:col-span-3" style={{ padding: 20 }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="ac-eyebrow">Acompanhamento</span>
            <h2 style={TYPE.modalTitle}>Atualizações recentes</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
          {updates.length === 0 && <p style={{ ...TYPE.body, color: 'var(--text-muted)' }}>Nenhuma atualização ainda.</p>}
          {updates.map((u) => (
            <div key={u.id} className="flex items-center gap-2.5 p-3 rounded-lg" style={{ background: 'var(--surface-alt)' }}>
              <span className="grid place-items-center rounded-full shrink-0" style={{ width: 30, height: 30, background: u.agente ? 'var(--warning-bg)' : 'var(--success-bg)', color: u.agente ? 'var(--warning)' : 'var(--success)' }}>
                {u.agente ? <Clock size={15} /> : <CheckCircle2 size={15} />}
              </span>
              <p className="flex flex-col min-w-0" style={{ gap: 3 }}>
                <strong className="truncate" style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{u.titulo}</strong>
                <span style={{ ...TYPE.helper, fontSize: 11 }}>{u.id} · {u.quando}</span>
              </p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function NewTicketModal({ user, onClose, onCreate }) {
  const [categoria, setCategoria] = useState('');
  const [produto, setProduto] = useState(PRODUCTS[0]);
  const [assunto, setAssunto] = useState('');
  const [descricao, setDescricao] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = (e) => {
    e.preventDefault();
    if (!categoria || !assunto.trim() || !descricao.trim()) {
      setError('Preencha categoria, assunto e descrição.');
      return;
    }
    setError('');
    setSubmitting(true);
    setTimeout(() => {
      const id = `AC-2026-${String(Math.floor(215 + Math.random() * 700)).padStart(5, '0')}`;
      onCreate({
        id, empresa: user.empresa, contato: user.nome, produto, categoria, assunto: assunto.trim(),
        prioridade: 'media', status: 'aberto', agente: null, slaTotal: 48, slaRestante: 48, abertura: 'agora',
        mensagens: [{ autor: user.nome, tipo: 'cliente', data: 'agora', texto: descricao.trim() }],
        notas: [],
      });
    }, 500);
  };

  return (
    <div className="ac-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="ac-modal" role="dialog" aria-modal="true" aria-labelledby="novo-chamado-titulo" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className="ac-eyebrow">Novo atendimento</span>
            <h2 id="novo-chamado-titulo" style={{ ...TYPE.modalTitle, fontSize: 18 }}>Abrir chamado</h2>
          </div>
          <button type="button" aria-label="Fechar" className="ac-icon-btn" style={{ width: 36, height: 36 }} onClick={onClose}><X size={17} /></button>
        </div>
        <form onSubmit={submit}>
          <Field label="Categoria">
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="atos-input w-full px-3 py-2.5 rounded-md" style={inputStyle} autoFocus>
              <option value="" disabled>Selecione uma categoria</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Produto ou módulo">
            <select value={produto} onChange={(e) => setProduto(e.target.value)} className="atos-input w-full px-3 py-2.5 rounded-md" style={inputStyle}>
              {PRODUCTS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Assunto">
            <input value={assunto} onChange={(e) => setAssunto(e.target.value)} placeholder="Resuma o que está acontecendo" className="atos-input w-full px-3 py-2.5 rounded-md" style={inputStyle} />
          </Field>
          <Field label="Descrição">
            <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={4} placeholder="Descreva o problema com o máximo de detalhes" className="atos-input w-full px-3 py-2.5 rounded-md" style={inputStyle} />
          </Field>
          {error && <p className="mb-3" style={{ ...TYPE.helper, color: 'var(--error)' }}>{error}</p>}
          <div className="flex justify-end gap-2.5 mt-2">
            <button type="button" className="ac-btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="ac-btn-primary" disabled={submitting}>
              {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
              {submitting ? 'Enviando' : 'Enviar chamado'}
              {!submitting && <ChevronRight size={16} />}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function TicketList({ tickets, role, user, onOpen, onNew }) {
  const [status, setStatus] = useState('todos');
  const [produto, setProduto] = useState('todos');
  const [q, setQ] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const scoped = role === 'cliente' ? tickets.filter((t) => t.empresa === user.empresa) : tickets;

  const filtered = useMemo(() => scoped.filter((t) => {
    if (status !== 'todos' && t.status !== status) return false;
    if (produto !== 'todos' && t.produto !== produto) return false;
    if (q && !(`${t.id} ${t.empresa} ${t.categoria} ${t.produto} ${t.assunto || ''}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  }), [scoped, status, produto, q]);

  const isOpen = (t) => !['resolvido', 'fechado'].includes(t.status);
  const openCount = scoped.filter(isOpen).length;
  const inService = scoped.filter((t) => t.status === 'em_andamento').length;
  const riskCount = scoped.filter((t) => t.slaRestante / t.slaTotal < 0.2 && isOpen(t)).length;

  const activeFilters = [
    status !== 'todos' && { key: 'status', label: STATUS[status].label, clear: () => setStatus('todos') },
    produto !== 'todos' && { key: 'produto', label: produto, clear: () => setProduto('todos') },
    q && { key: 'q', label: `"${q}"`, clear: () => setQ('') },
  ].filter(Boolean);

  const refresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 500); };

  return (
    <div className="max-w-6xl">
      <section className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <span className="ac-eyebrow">{role === 'cliente' ? 'Central de atendimento' : 'Operação de suporte'}</span>
          <h1 style={{ ...TYPE.h1, fontSize: 30, fontWeight: 600, letterSpacing: '-0.8px' }}>
            {role === 'cliente' ? 'Meus chamados' : 'Fila de atendimento'}
          </h1>
          <p className="mt-2" style={{ ...TYPE.body, color: 'var(--text-secondary)' }}>
            {role === 'cliente' ? 'Acompanhe o andamento, o SLA e as atualizações dos seus chamados.' : 'Priorize os atendimentos pelo SLA e pela categoria do problema.'}
          </p>
        </div>
        {role === 'cliente' && onNew && (
          <button type="button" className="ac-btn-primary" onClick={onNew}>
            <Plus size={16} /> Abrir novo chamado
          </button>
        )}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6" aria-label="Indicadores dos chamados">
        <StatTile label="Total de chamados" value={scoped.length} detail={role === 'cliente' ? 'na sua empresa' : 'todos os clientes'} icon={TicketIcon} />
        <StatTile label="Em aberto" value={openCount} tone="info" detail={`${inService} em atendimento`} icon={Headphones} />
        <StatTile label="Próximos do SLA" value={riskCount} tone={riskCount ? 'error' : 'neutral'} detail="menos de 20% do prazo restante" icon={Clock} />
      </section>

      <div className="flex items-center gap-2.5 mb-2.5">
        <label className="ac-search">
          <Search size={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar chamados" placeholder="Buscar por número, empresa ou categoria" type="search" />
        </label>
        <button type="button" onClick={refresh} aria-label="Atualizar lista" title="Atualizar" className="ac-icon-btn">
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>
        <button type="button" onClick={() => setFiltersOpen((o) => !o)} aria-label="Filtros" title="Filtros" aria-expanded={filtersOpen} className={`ac-icon-btn ${filtersOpen || activeFilters.length ? 'on' : ''}`}>
          <SlidersHorizontal size={16} />
        </button>
        <button type="button" aria-label="Exportar" title="Exportar" className="ac-icon-btn">
          <Download size={16} />
        </button>
      </div>

      {filtersOpen && (
        <div className="flex flex-wrap gap-3 mb-3 p-3 rounded-md" style={{ background: 'var(--surface-alt)', border: '1px solid var(--border-subtle)' }}>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="atos-input px-3 py-2 rounded-md" style={inputStyle}>
            <option value="todos">Todos os status</option>
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={produto} onChange={(e) => setProduto(e.target.value)} className="atos-input px-3 py-2 rounded-md" style={inputStyle}>
            <option value="todos">Todos os produtos</option>
            {PRODUCTS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      )}

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap justify-end gap-2 mb-3">
          {activeFilters.map((f) => <Chip key={f.key} onRemove={f.clear}>{f.label}</Chip>)}
        </div>
      )}

      {scoped.length === 0 ? (
        <div className="ac-card py-16 text-center">
          <Inbox size={26} style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
          <p style={{ ...TYPE.body, fontWeight: 500, color: 'var(--text-primary)' }}>
            {role === 'cliente' ? 'Você ainda não abriu nenhum chamado' : 'Nenhum chamado na fila'}
          </p>
          <p className="mt-1" style={{ ...TYPE.body, color: 'var(--text-muted)' }}>
            {role === 'cliente' ? 'Quando precisar de ajuda, abra um chamado e acompanhe por aqui.' : 'Bom trabalho, tudo em dia.'}
          </p>
          {role === 'cliente' && onNew && (
            <button type="button" className="ac-btn-primary mt-4" onClick={onNew}><Plus size={16} /> Abrir novo chamado</button>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div className="ac-card py-16 text-center">
          <Search size={22} style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
          <p style={{ ...TYPE.body, fontWeight: 500, color: 'var(--text-primary)' }}>Nenhum chamado encontrado</p>
          <p className="mt-1" style={{ ...TYPE.body, color: 'var(--text-muted)' }}>Tente buscar por outro número, empresa ou categoria.</p>
          <button type="button" onClick={() => { setStatus('todos'); setProduto('todos'); setQ(''); }} className="ac-btn-secondary mt-4">Limpar filtros</button>
        </div>
      ) : (
        <div className="ac-card overflow-hidden">
          <div className="hidden md:flex items-center gap-4 px-4" style={{ minHeight: 38, background: 'var(--table-header-bg)', ...TYPE.fieldLabel, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <span className="w-28 shrink-0">Chamado</span>
            <span className="flex-1">Categoria e produto</span>
            {role === 'agente' && <span className="w-32 shrink-0">Empresa</span>}
            <span className="w-16 shrink-0">Prioridade</span>
            <span className="w-28 shrink-0">Agente</span>
            <span className="w-36 shrink-0">Status</span>
            <span className="w-5 shrink-0" />
          </div>
          {filtered.map((t, i) => {
            const risk = t.slaRestante / t.slaTotal < 0.2 && isOpen(t);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onOpen(t.id)}
                className="ac-row w-full text-left flex items-center gap-4 px-4 py-3"
                style={{
                  background: i % 2 === 1 ? 'var(--table-row-alt)' : 'var(--surface-base)',
                  borderTop: '1px solid var(--border-subtle)',
                  borderLeft: risk ? '3px solid var(--brand-primary)' : '3px solid transparent',
                }}
              >
                <span className="w-28 shrink-0" style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)' }}>{t.id}</span>
                <span className="flex-1 min-w-0 truncate" style={{ ...TYPE.body, fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                  {t.categoria} · {t.produto}
                </span>
                {role === 'agente' && (
                  <span className="w-32 shrink-0 truncate" style={{ ...TYPE.body, fontSize: 13, color: 'var(--text-secondary)' }}>{t.empresa}</span>
                )}
                <span className="w-16 shrink-0"><PriorityMark level={t.prioridade} /></span>
                <span className="w-28 shrink-0 truncate" style={{ ...TYPE.body, fontSize: 13, color: 'var(--text-secondary)' }}>{t.agente || 'Sem agente'}</span>
                <span className="w-36 shrink-0"><StatusTag status={t.status} /></span>
                <span className="w-5 shrink-0 flex justify-end"><ChevronRight size={15} color="var(--text-muted)" /></span>
              </button>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="mt-3" style={{ ...TYPE.helper, fontSize: 12 }}>Mostrando {filtered.length} de {scoped.length} chamados</p>
      )}

      {role === 'cliente' && scoped.length > 0 && <CustomerInsights tickets={scoped} />}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Ticket detail                                                            */
/* ---------------------------------------------------------------------- */

function TicketDetail({ ticket, role, user, onBack, onUpdate, notify }) {
  const [reply, setReply] = useState('');
  const [note, setNote] = useState('');
  const [tab, setTab] = useState('conversa');

  const stageIndex = STAGES.indexOf(ticket.status === 'aguardando_cliente' ? 'em_andamento' : ticket.status);

  const send = () => {
    if (!reply.trim()) return;
    const msg = {
      autor: role === 'agente' ? (ticket.agente || 'Equipe de suporte') : user.nome,
      tipo: role === 'agente' ? 'agente' : 'cliente',
      data: 'agora', texto: reply,
    };
    const status = role === 'agente' ? 'aguardando_cliente' : 'em_andamento';
    onUpdate({ ...ticket, mensagens: [...ticket.mensagens, msg], status });
    setReply('');
    notify(role === 'agente' ? 'Resposta enviada ao cliente.' : 'Atualização enviada à equipe de suporte.');
  };

  const addNote = () => {
    if (!note.trim()) return;
    onUpdate({ ...ticket, notas: [...ticket.notas, { autor: ticket.agente || 'Agente', data: 'agora', texto: note }] });
    setNote('');
    notify('Nota interna salva.');
  };

  const setStatus = (s) => { onUpdate({ ...ticket, status: s }); notify(`Status atualizado para "${STATUS[s].label}".`); };
  const assign = (a) => {
    onUpdate({ ...ticket, agente: a, status: ticket.status === 'aberto' ? 'em_andamento' : ticket.status });
    if (!a) notify('Atribuição removida.');
    else if (a === user.nome) notify('Você assumiu o chamado.');
    else notify(`Chamado repassado para ${a}.`);
  };
  const team = Array.from(new Set([user.nome, ...AGENTES]));
  const isMine = ticket.agente === user.nome;

  return (
    <div className="max-w-5xl">
      <button type="button" onClick={onBack} className="flex items-center gap-1 mb-4" style={{ ...TYPE.body, fontSize: 13, color: 'var(--text-secondary)' }}>
        <ChevronLeft size={15} /> Voltar
      </button>

      <div className="flex items-start justify-between mb-1 gap-4">
        <div>
          <p className="mb-1" style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-muted)' }}>{ticket.id}</p>
          <h1 style={TYPE.h1}>{ticket.categoria} · {ticket.produto}</h1>
          {ticket.assunto && <p className="mt-1" style={{ ...TYPE.body, color: 'var(--text-secondary)' }}>{ticket.assunto}</p>}
        </div>
        <StatusTag status={ticket.status} />
      </div>
      <p className="mb-6" style={{ ...TYPE.body, color: 'var(--text-secondary)' }}>
        {ticket.empresa} — aberto por {ticket.contato} em {ticket.abertura}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {role === 'agente' && (
            <div className="flex gap-4 mb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                onClick={() => setTab('conversa')}
                className="pb-2"
                style={{ ...TYPE.body, fontSize: 13, color: tab === 'conversa' ? 'var(--text-primary)' : 'var(--text-muted)', borderBottom: tab === 'conversa' ? '2px solid var(--brand-primary)' : 'none' }}
              >
                Conversa com o cliente
              </button>
              <button
                type="button"
                onClick={() => setTab('notas')}
                className="pb-2 flex items-center gap-1"
                style={{ ...TYPE.body, fontSize: 13, color: tab === 'notas' ? 'var(--text-primary)' : 'var(--text-muted)', borderBottom: tab === 'notas' ? '2px solid var(--brand-primary)' : 'none' }}
              >
                <Lock size={12} /> Notas internas
              </button>
            </div>
          )}

          {tab === 'conversa' ? (
            <>
              <div className="space-y-4 mb-4">
                {ticket.mensagens.map((m, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-md"
                    style={{ background: m.tipo === 'agente' ? 'var(--surface-alt)' : 'var(--surface-base)', border: '1px solid var(--border-subtle)' }}
                  >
                    <div className="flex justify-between mb-1.5">
                      <span style={{ ...TYPE.body, fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{m.autor}</span>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)' }}>{m.data}</span>
                    </div>
                    <p style={{ ...TYPE.body, color: 'var(--text-primary)', lineHeight: 1.55 }}>{m.texto}</p>
                  </div>
                ))}
              </div>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                placeholder={role === 'agente' ? 'Responder ao cliente' : 'Adicionar uma atualização ao chamado'}
                className="w-full px-3 py-2 rounded-md mb-2"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={send}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md"
                style={{ background: 'var(--brand-primary)', color: 'var(--on-brand)', ...TYPE.body, fontSize: 13 }}
              >
                <Send size={13} /> Enviar
              </button>
            </>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {ticket.notas.length === 0 ? (
                  <div className="py-8 text-center rounded-md" style={{ border: '1px solid var(--border-subtle)' }}>
                    <Lock size={18} style={{ margin: '0 auto 8px', color: 'var(--text-muted)' }} />
                    <p style={{ ...TYPE.body, fontSize: 13, color: 'var(--text-muted)' }}>Nenhuma nota interna registrada.</p>
                  </div>
                ) : ticket.notas.map((n, i) => (
                  <div key={i} className="p-4 rounded-md" style={{ background: 'var(--surface-alt)', borderLeft: '3px solid var(--text-muted)' }}>
                    <div className="flex justify-between mb-1.5">
                      <span style={{ ...TYPE.body, fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{n.autor}</span>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)' }}>{n.data}</span>
                    </div>
                    <p style={{ ...TYPE.body, color: 'var(--text-primary)', lineHeight: 1.55 }}>{n.texto}</p>
                  </div>
                ))}
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Nota visível apenas para a equipe de suporte"
                className="w-full px-3 py-2 rounded-md mb-2"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={addNote}
                className="px-4 py-2 rounded-md"
                style={{ background: 'var(--text-primary)', color: 'var(--surface-base)', ...TYPE.body, fontSize: 13 }}
              >
                Salvar nota
              </button>
            </>
          )}
        </div>

        <div>
          <div className="p-4 mb-4 rounded-md" style={{ border: '1px solid var(--border-subtle)' }}>
            <SlaBar ticket={ticket} />
          </div>

          {ticket.status === 'aguardando_cliente' && (
            <div className="p-4 mb-4 rounded-md" style={{ background: 'var(--purple-bg)', ...TYPE.body, fontSize: 13, color: 'var(--text-primary)' }}>
              Aguardando retorno desde {ticket.aguardandoDesde}. Sem resposta até {ticket.prazoAutoEncerramento}, o chamado será encerrado automaticamente.
            </div>
          )}

          <div className="p-4 mb-4 rounded-md" style={{ border: '1px solid var(--border-subtle)' }}>
            <p className="mb-3" style={TYPE.fieldLabel}>Ciclo de vida</p>
            <div className="space-y-2">
              {STAGES.map((s, i) => {
                const active = i <= stageIndex;
                return (
                  <div key={s} className="flex items-center gap-2" style={{ ...TYPE.body, fontSize: 13, color: active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {active
                      ? <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
                      : <span style={{ width: 14, height: 14, border: '1px solid var(--border-default)', borderRadius: 9999, display: 'inline-block' }} />}
                    {STATUS[s].label}
                  </div>
                );
              })}
            </div>
          </div>

          {role === 'agente' && (
            <div className="p-4 rounded-md" style={{ border: '1px solid var(--border-subtle)' }}>
              <p className="mb-3" style={TYPE.fieldLabel}>Gestão do chamado</p>

              <div className="mb-3">
                <span style={TYPE.helper}>Responsável atual</span>
                <p style={{ ...TYPE.body, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {ticket.agente || 'Sem agente'}
                  {isMine && <span style={{ color: 'var(--success)' }}> (você)</span>}
                </p>
              </div>

              {!isMine && (
                <button
                  type="button"
                  onClick={() => assign(user.nome)}
                  className="w-full mb-3 px-3 py-2 rounded-md"
                  style={{ background: 'var(--brand-primary)', color: 'var(--on-brand)', ...TYPE.body, fontSize: 13, fontWeight: 500 }}
                >
                  Assumir chamado
                </button>
              )}

              <Field label="Repassar para">
                <select
                  key={ticket.agente || 'sem-agente'}
                  defaultValue=""
                  onChange={(e) => {
                    const v = e.target.value;
                    if (!v) return;
                    assign(v === '__none__' ? '' : v);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-md"
                  style={inputStyle}
                >
                  <option value="">Selecionar colega…</option>
                  {team.filter((a) => a !== ticket.agente).map((a) => <option key={a} value={a}>{a}</option>)}
                  {ticket.agente && <option value="__none__">Deixar sem agente</option>}
                </select>
              </Field>

              <Field label="Status">
                <select value={ticket.status} onChange={(e) => setStatus(e.target.value)} className="w-full px-2.5 py-1.5 rounded-md" style={inputStyle}>
                  {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </Field>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Reports                                                                   */
/* ---------------------------------------------------------------------- */

function Reports({ tickets, role, user }) {
  const [empresa, setEmpresa] = useState(role === 'cliente' ? user.empresa : 'todas');

  const scoped = useMemo(() => tickets.filter((t) => empresa === 'todas' || t.empresa === empresa), [tickets, empresa]);

  const porProduto = PRODUCTS.map((p) => ({ nome: p, total: scoped.filter((t) => t.produto === p).length }));
  const porCategoria = CATEGORIES
    .map((c) => ({ nome: c, total: scoped.filter((t) => t.categoria === c).length }))
    .sort((a, b) => b.total - a.total);
  const resolvidos = scoped.filter((t) => t.status === 'resolvido' || t.status === 'fechado').length;
  const emRisco = scoped.filter((t) => t.slaRestante / t.slaTotal < 0.2 && !['resolvido', 'fechado'].includes(t.status));

  return (
    <div className="max-w-5xl">
      <span className="ac-eyebrow">Inteligência operacional</span>
      <h1 className="mb-1" style={TYPE.h1}>Relatórios</h1>
      <p className="mb-6" style={{ ...TYPE.body, color: 'var(--text-secondary)' }}>
        Panorama de chamados por produto, categoria e proximidade do SLA.
      </p>

      {role === 'agente' && (
        <div className="mb-5">
          <select value={empresa} onChange={(e) => setEmpresa(e.target.value)} className="px-3 py-2 rounded-md" style={inputStyle}>
            <option value="todas">Todos os grupos empresa</option>
            {EMPRESAS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-8">
        <StatCard label="Chamados no período" value={scoped.length} />
        <StatCard label="Resolvidos ou fechados" value={resolvidos} tone="var(--success)" />
        <StatCard label="Próximos do SLA" value={emRisco.length} tone={emRisco.length ? 'var(--error)' : undefined} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <p className="mb-3" style={TYPE.sectionLabel}>Chamados por produto</p>
          <div style={{ height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={porProduto} margin={{ left: -20 }}>
                <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="nome" tick={{ fontSize: 10, fontFamily: FONT, fill: 'var(--text-secondary)' }} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11, fontFamily: FONT, fill: 'var(--text-secondary)' }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontFamily: FONT, fontSize: 12, border: '1px solid var(--border-default)', background: 'var(--surface-base)' }} />
                <Bar dataKey="total" fill="var(--brand-primary)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <p className="mb-3" style={TYPE.sectionLabel}>Chamados recorrentes por categoria</p>
          <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
            {porCategoria.map((c, i) => (
              <div
                key={c.nome}
                className="flex items-center justify-between px-3 py-2.5"
                style={{ background: i % 2 === 1 ? 'var(--table-row-alt)' : 'var(--surface-base)', borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)', ...TYPE.body, fontSize: 13 }}
              >
                <span style={{ color: 'var(--text-primary)' }}>{c.nome}</span>
                <span style={{ fontFamily: MONO, color: 'var(--text-secondary)' }}>{c.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p className="mb-3" style={TYPE.sectionLabel}>Chamados próximos do SLA</p>
        {emRisco.length === 0 ? (
          <div className="flex items-center gap-2 py-4" style={{ ...TYPE.body, color: 'var(--text-secondary)' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> Nenhum chamado em risco no momento.
          </div>
        ) : (
          <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
            {emRisco.map((t, i) => (
              <div
                key={t.id}
                className="flex items-center gap-4 px-3 py-2.5"
                style={{ background: i % 2 === 1 ? 'var(--table-row-alt)' : 'var(--surface-base)', borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}
              >
                <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-muted)', width: 120 }}>{t.id}</span>
                <span className="flex-1" style={{ ...TYPE.body, fontSize: 13, color: 'var(--text-primary)' }}>{t.categoria} — {t.empresa}</span>
                <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--error)' }}>{t.slaRestante}h restantes</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* App                                                                      */
/* ---------------------------------------------------------------------- */

export default function SupportPortal() {
  const [themeMode, setThemeMode] = useState('light');
  const [session, setSession] = useState(null);
  const [tickets, setTickets] = useState(seed);
  const [view, setView] = useState('lista');
  const [selectedId, setSelectedId] = useState(null);
  const [loadingView, setLoadingView] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [notifications, setNotifications] = useState(seedNotifications);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const unreadCount = notifications.filter((n) => !n.lida).length;

  useEffect(() => {
    const vars = toCssVars(THEME[themeMode]);
    Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
    document.documentElement.style.colorScheme = themeMode;
  }, [themeMode]);

  const notify = (msg) => {
    setToast(msg);
    window.clearTimeout(notify._t);
    notify._t = window.setTimeout(() => setToast(null), 3000);
  };

  const markAllNotificationsRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })));
  const markOneNotificationRead = (id) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));

  const changeView = (v) => {
    setMobileNavOpen(false);
    setLoadingView(true);
    setView(v);
    setSelectedId(null);
    window.setTimeout(() => setLoadingView(false), 450);
  };

  const openTicket = (id) => {
    setLoadingView(true);
    setSelectedId(id);
    setView('detalhe');
    window.setTimeout(() => setLoadingView(false), 400);
  };

  const updateTicket = (updated) => setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  const createTicket = (t) => {
    setTickets((prev) => [t, ...prev]);
    setNotifications((prev) => [{ id: Date.now(), texto: `Chamado ${t.id} registrado com sucesso.`, data: 'agora', lida: false }, ...prev]);
    setShowNewTicket(false);
    notify(`Chamado ${t.id} registrado.`);
  };
  const logout = () => { setSession(null); setView('lista'); setSelectedId(null); setShowNewTicket(false); };

  if (!session) {
    return <LoginScreen onLogin={setSession} themeMode={themeMode} setThemeMode={setThemeMode} />;
  }

  const role = session.role;
  const selected = tickets.find((t) => t.id === selectedId);

  return (
    <div style={{ background: 'var(--surface-canvas)', height: '100vh', overflow: 'hidden' }}>
      <div className="md:flex" style={{ height: '100%' }}>
        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
            <button
              type="button"
              aria-label="Fechar menu"
              className="absolute inset-0"
              style={{ background: 'var(--surface-overlay)' }}
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="relative z-50">
              <Sidebar session={session} onLogout={logout} view={view} setView={changeView} onClose={() => setMobileNavOpen(false)} themeMode={themeMode} setThemeMode={setThemeMode} />
            </div>
          </div>
        )}
        <div className="hidden md:block">
          <Sidebar session={session} onLogout={logout} view={view} setView={changeView} themeMode={themeMode} setThemeMode={setThemeMode} />
        </div>

        <div className="flex-1 flex flex-col min-w-0" style={{ height: '100%', overflowY: 'auto' }}>
          <TopBar
            session={session}
            notifications={notifications}
            unreadCount={unreadCount}
            onOpenNav={() => setMobileNavOpen(true)}
            onMarkAllRead={markAllNotificationsRead}
            onMarkOneRead={markOneNotificationRead}
          />
          <main className="flex-1 px-6 md:px-10 py-6 md:py-8">
            {loadingView ? (
              <ViewSkeleton />
            ) : (
              <>
                {view === 'lista' && <TicketList tickets={tickets} role={role} user={session} onOpen={openTicket} onNew={() => setShowNewTicket(true)} />}
                {view === 'relatorios' && <Reports tickets={tickets} role={role} user={session} />}
                {view === 'detalhe' && selected && (
                  <TicketDetail ticket={selected} role={role} user={session} onBack={() => changeView('lista')} onUpdate={updateTicket} notify={notify} />
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {showNewTicket && role === 'cliente' && (
        <NewTicketModal user={session} onClose={() => setShowNewTicket(false)} onCreate={createTicket} />
      )}

      <Toast message={toast} />
    </div>
  );
}
