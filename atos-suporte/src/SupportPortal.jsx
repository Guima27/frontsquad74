import React, { useState, useMemo, useEffect } from 'react';
import {
  Inbox, BarChart3, ChevronLeft, ChevronRight, Send, Lock, Search,
  AlertTriangle, CheckCircle2, ShieldCheck, LogOut, Loader2,
  Menu, Bell, X, RefreshCw, SlidersHorizontal, Download, Sun, Moon,
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

function LoginScreen({ onLogin, themeMode, setThemeMode }) {
  const [tab, setTab] = useState('cliente');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
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

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--surface-canvas)' }}>
      <div className="hidden md:flex md:w-2/5 flex-col justify-between px-12 py-14" style={{ background: 'var(--menu-gradient)' }}>
        <BrandMark onDark size="lg" />
        <div className="space-y-5">
          {[
            'Acompanhamento de chamados em tempo real',
            'Notificações automáticas a cada atualização',
            'SLA por prioridade e categoria de problema',
          ].map((txt) => (
            <div key={txt} className="flex items-start gap-2.5">
              <CheckCircle2 size={15} style={{ color: 'var(--menu-text)', marginTop: 2, flexShrink: 0, opacity: 0.85 }} />
              <span style={{ ...TYPE.body, color: 'var(--menu-text)', opacity: 0.9 }}>{txt}</span>
            </div>
          ))}
        </div>
        <p style={{ ...TYPE.helper, color: 'var(--menu-text)', opacity: 0.7 }}>
          Integrado a Joe SFA B1, SAP Business One e SAP S/4HANA.
        </p>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-end px-6 pt-6">
          <button
            type="button"
            onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
            aria-label="Alternar tema claro e escuro"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', ...TYPE.helper, fontSize: 12 }}
          >
            {themeMode === 'light' ? <Moon size={13} /> : <Sun size={13} />}
            {themeMode === 'light' ? 'Escuro' : 'Claro'}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          <div className="w-full max-w-sm">
            <div className="md:hidden mb-8"><BrandMark /></div>
            <div className="flex gap-6 mb-8" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              {[
                { id: 'cliente', label: 'Portal do cliente' },
                { id: 'agente', label: 'Equipe Atos Capital' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { setTab(t.id); setError(''); }}
                  className="pb-3"
                  style={{
                    ...TYPE.body,
                    color: tab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
                    borderBottom: tab === t.id ? '2px solid var(--brand-primary)' : '2px solid transparent',
                    fontWeight: tab === t.id ? 600 : 400,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'cliente' ? (
              <div>
                <h1 style={TYPE.h1} className="mb-2">Entrar no portal</h1>
                <p className="mb-6" style={{ ...TYPE.body, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Sua conta é sincronizada automaticamente a partir do login na Atos Capital.
                  Não é necessário criar uma senha aqui.
                </p>
                <button
                  type="button"
                  onClick={handleSso}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md"
                  style={{ background: 'var(--brand-primary)', color: 'var(--on-brand)', ...TYPE.body, fontWeight: 500, opacity: loading ? 0.75 : 1 }}
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
                  {loading ? 'Redirecionando para Atos Capital ID' : 'Entrar com Atos Capital ID'}
                </button>
                <p className="mt-4" style={TYPE.helper}>
                  Sem acesso? Fale com o administrador do seu grupo empresa.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAgentSubmit}>
                <h1 style={TYPE.h1} className="mb-2">Acesso da equipe</h1>
                <p className="mb-6" style={{ ...TYPE.body, color: 'var(--text-secondary)' }}>
                  Restrito à equipe de suporte da Atos Capital.
                </p>
                <Field label="E-mail corporativo">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome.sobrenome@atoscapital.com"
                    className="w-full px-3 py-2"
                    style={inputStyle}
                  />
                </Field>
                <Field label="Senha">
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2"
                    style={inputStyle}
                  />
                </Field>
                {error && <p className="mb-4" style={{ ...TYPE.helper, color: 'var(--error)' }}>{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md"
                  style={{ background: 'var(--text-primary)', color: 'var(--surface-base)', ...TYPE.body, fontWeight: 500, opacity: loading ? 0.75 : 1 }}
                >
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  {loading ? 'Entrando' : 'Entrar'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Sidebar / TopBar                                                         */
/* ---------------------------------------------------------------------- */

function Sidebar({ session, onLogout, view, setView, onClose, themeMode, setThemeMode }) {
  const clientNav = [
    { id: 'lista', label: 'Meus chamados', icon: Inbox },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
  ];
  const agentNav = [
    { id: 'lista', label: 'Fila de atendimento', icon: Inbox },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
  ];
  const nav = session.role === 'agente' ? agentNav : clientNav;

  return (
    <div className="w-64 shrink-0 flex flex-col justify-between" style={{ background: 'var(--menu-gradient)', minHeight: '100vh' }}>
      <div>
        <div className="px-5 pt-6 pb-5 flex items-start justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <BrandMark onDark />
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
                className="w-full flex items-center gap-2.5 px-5 py-2.5 text-left"
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

function TopBar({ notifications, unreadCount, onOpenNav, onMarkAllRead, onMarkOneRead }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-between px-6 md:px-10 py-4" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-soft)' }}>
      <button type="button" className="md:hidden -ml-1 p-1.5 rounded" aria-label="Abrir menu" onClick={onOpenNav}>
        <Menu size={20} color="var(--text-primary)" />
      </button>
      <div className="md:hidden"><BrandMark /></div>

      <div className="relative ml-auto">
        <button
          type="button"
          aria-label="Notificações"
          onClick={() => setOpen((o) => !o)}
          className="relative p-2 rounded-full"
        >
          <Bell size={18} color="var(--text-secondary)" />
          {unreadCount > 0 && (
            <span
              className="absolute rounded-full"
              style={{ top: 5, right: 5, width: 7, height: 7, background: 'var(--error)' }}
            />
          )}
        </button>
        {open && (
          <div
            className="absolute right-0 mt-1 w-80 rounded-md overflow-hidden z-50"
            style={{ background: 'var(--surface-base)', border: '1px solid var(--border-default)', boxShadow: '0 12px 28px rgba(0,0,0,0.16)' }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <p style={{ ...TYPE.fieldLabel, fontWeight: 600 }}>Notificações</p>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  style={{ ...TYPE.helper, fontSize: 12, color: 'var(--brand-primary)', fontWeight: 500 }}
                >
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
                className="w-full flex items-start gap-2.5 px-4 py-3 text-left"
                style={{ borderBottom: '1px solid var(--border-subtle)', background: n.lida ? 'transparent' : 'var(--surface-alt)' }}
              >
                <span
                  className="rounded-full shrink-0"
                  style={{ width: 7, height: 7, marginTop: 5, background: n.lida ? 'transparent' : 'var(--brand-primary)' }}
                />
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

function TicketList({ tickets, role, user, onOpen }) {
  const [status, setStatus] = useState('todos');
  const [produto, setProduto] = useState('todos');
  const [q, setQ] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const scoped = role === 'cliente' ? tickets.filter((t) => t.empresa === user.empresa) : tickets;

  const filtered = useMemo(() => scoped.filter((t) => {
    if (status !== 'todos' && t.status !== status) return false;
    if (produto !== 'todos' && t.produto !== produto) return false;
    if (q && !(`${t.id} ${t.empresa} ${t.categoria}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  }), [scoped, status, produto, q]);

  const openCount = scoped.filter((t) => !['resolvido', 'fechado'].includes(t.status)).length;
  const riskCount = scoped.filter((t) => t.slaRestante / t.slaTotal < 0.2 && !['resolvido', 'fechado'].includes(t.status)).length;

  const activeFilters = [
    status !== 'todos' && { key: 'status', label: STATUS[status].label, clear: () => setStatus('todos') },
    produto !== 'todos' && { key: 'produto', label: produto, clear: () => setProduto('todos') },
    q && { key: 'q', label: `"${q}"`, clear: () => setQ('') },
  ].filter(Boolean);

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <div className="max-w-5xl">
      <h1 className="mb-1" style={TYPE.h1}>
        {role === 'cliente' ? 'Meus chamados' : 'Fila de atendimento'}
      </h1>
      <p className="mb-5" style={{ ...TYPE.body, color: 'var(--text-secondary)' }}>
        {role === 'cliente' ? 'Acompanhe o andamento e o SLA dos seus chamados.' : 'Priorize pelo SLA e pela categoria do problema.'}
      </p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Total de chamados" value={scoped.length} />
        <StatCard label="Em aberto" value={openCount} tone="var(--info)" />
        <StatCard label="Próximos do SLA" value={riskCount} tone={riskCount ? 'var(--error)' : undefined} />
      </div>

      {/* Options bar */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Buscar chamados"
            placeholder="Buscar por número, empresa ou categoria"
            className="w-full pl-8 pr-3 py-2 rounded-md"
            style={inputStyle}
          />
        </div>

        <button
          type="button"
          onClick={refresh}
          aria-label="Atualizar lista"
          className="p-2 rounded-md"
          style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          aria-label="Filtros"
          aria-expanded={filtersOpen}
          className="p-2 rounded-md"
          style={{
            border: '1px solid var(--border-default)',
            color: activeFilters.length ? 'var(--brand-primary)' : 'var(--text-secondary)',
            background: filtersOpen ? 'var(--surface-alt)' : 'transparent',
          }}
        >
          <SlidersHorizontal size={16} />
        </button>
        <button
          type="button"
          aria-label="Exportar"
          className="p-2 rounded-md"
          style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
        >
          <Download size={16} />
        </button>
      </div>

      {filtersOpen && (
        <div className="flex flex-wrap gap-3 mb-3 p-3 rounded-md" style={{ background: 'var(--surface-alt)', border: '1px solid var(--border-subtle)' }}>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 rounded-md" style={inputStyle}>
            <option value="todos">Todos os status</option>
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={produto} onChange={(e) => setProduto(e.target.value)} className="px-3 py-2 rounded-md" style={inputStyle}>
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

      {/* TableGrid */}
      {scoped.length === 0 ? (
        <div className="py-16 text-center rounded-md" style={{ border: '1px solid var(--border-subtle)' }}>
          <Inbox size={26} style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
          <p style={{ ...TYPE.body, fontWeight: 500, color: 'var(--text-primary)' }}>
            {role === 'cliente' ? 'Você ainda não abriu nenhum chamado' : 'Nenhum chamado na fila'}
          </p>
          <p className="mt-1" style={{ ...TYPE.body, color: 'var(--text-muted)' }}>
            {role === 'cliente' ? 'Assim que um chamado for aberto para sua empresa, ele aparece aqui.' : 'Bom trabalho, tudo em dia.'}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center rounded-md" style={{ border: '1px solid var(--border-subtle)' }}>
          <Search size={22} style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
          <p style={{ ...TYPE.body, fontWeight: 500, color: 'var(--text-primary)' }}>Nenhum chamado encontrado</p>
          <p className="mt-1" style={{ ...TYPE.body, color: 'var(--text-muted)' }}>Tente ajustar os filtros aplicados.</p>
          <button
            type="button"
            onClick={() => { setStatus('todos'); setProduto('todos'); setQ(''); }}
            className="mt-4 px-4 py-2 rounded-md"
            style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)', ...TYPE.body }}
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
          <div
            className="hidden md:flex items-center gap-4 px-4 py-2.5"
            style={{ background: 'var(--table-header-bg)', ...TYPE.fieldLabel, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}
          >
            <span className="w-28 shrink-0">Chamado</span>
            <span className="flex-1">Categoria e produto</span>
            {role === 'agente' && <span className="w-32 shrink-0">Empresa</span>}
            <span className="w-16 shrink-0">Prioridade</span>
            <span className="w-28 shrink-0">Agente</span>
            <span className="w-36 shrink-0">Status</span>
            <span className="w-5 shrink-0" />
          </div>
          {filtered.map((t, i) => {
            const risk = t.slaRestante / t.slaTotal < 0.2 && !['resolvido', 'fechado'].includes(t.status);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onOpen(t.id)}
                className="w-full text-left flex items-center gap-4 px-4 py-3"
                style={{
                  background: i % 2 === 1 ? 'var(--table-row-alt)' : 'var(--surface-base)',
                  borderTop: '1px solid var(--border-subtle)',
                  borderLeft: risk ? '3px solid var(--error)' : '3px solid transparent',
                }}
              >
                <span className="w-28 shrink-0" style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-muted)' }}>{t.id}</span>
                <span className="flex-1 min-w-0 truncate" style={{ ...TYPE.body, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {t.categoria} · {t.produto}
                </span>
                {role === 'agente' && (
                  <span className="w-32 shrink-0 truncate" style={{ ...TYPE.body, fontSize: 13, color: 'var(--text-secondary)' }}>{t.empresa}</span>
                )}
                <span className="w-16 shrink-0"><PriorityMark level={t.prioridade} /></span>
                <span className="w-28 shrink-0 truncate" style={{ ...TYPE.body, fontSize: 13, color: 'var(--text-secondary)' }}>
                  {t.agente || 'Sem agente'}
                </span>
                <span className="w-36 shrink-0"><StatusTag status={t.status} /></span>
                <span className="w-5 shrink-0 flex justify-end"><ChevronRight size={15} color="var(--text-muted)" /></span>
              </button>
            );
          })}
        </div>
      )}
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
  const logout = () => { setSession(null); setView('lista'); setSelectedId(null); };

  if (!session) {
    return <LoginScreen onLogin={setSession} themeMode={themeMode} setThemeMode={setThemeMode} />;
  }

  const role = session.role;
  const selected = tickets.find((t) => t.id === selectedId);

  return (
    <div style={{ background: 'var(--surface-canvas)', minHeight: '100vh' }}>
      <div className="md:flex">
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

        <div className="flex-1 flex flex-col min-w-0">
          <TopBar
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
                {view === 'lista' && <TicketList tickets={tickets} role={role} user={session} onOpen={openTicket} />}
                {view === 'relatorios' && <Reports tickets={tickets} role={role} user={session} />}
                {view === 'detalhe' && selected && (
                  <TicketDetail ticket={selected} role={role} user={session} onBack={() => changeView('lista')} onUpdate={updateTicket} notify={notify} />
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <Toast message={toast} />
    </div>
  );
}
