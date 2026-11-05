// Aplicação: estado global (sessão, chamados, notificações), tema MUI e roteamento simples por view.
import React, { useMemo, useState } from 'react';
import { Box, CssBaseline, Skeleton, Stack, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { enUS, esES, ptBR } from '@mui/x-date-pickers/locales';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'sonner';
import { buildTheme } from './theme';
import { seed, seedNotifications } from './data';
import i18n, { DAYJS_LOCALE, LANGS } from './i18n';
import type { Lang } from './i18n';
import LoginScreen from './components/Login';
import { Sidebar, TopBar } from './components/Layout';
import TicketList, { NewTicketModal } from './components/TicketList';
import TicketDetail from './components/TicketDetail';
import Reports from './components/Reports';
import UserAdmin from './components/UserAdmin';
import type { AppNotification, Session, ThemeMode, Ticket, ViewId } from './types';

// Textos dos seletores de data (x-date-pickers) por idioma da interface.
const PICKER_TEXT = {
  pt: ptBR.components.MuiLocalizationProvider.defaultProps.localeText,
  en: enUS.components.MuiLocalizationProvider.defaultProps.localeText,
  es: esES.components.MuiLocalizationProvider.defaultProps.localeText,
};

function ViewSkeleton() {
  return (
    <Box sx={{ maxWidth: 1152 }} aria-hidden>
      <Skeleton width={220} height={34} />
      <Skeleton width={320} height={22} sx={{ mb: 4 }} />
      <Stack spacing={1.5}>{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rounded" height={48} />)}</Stack>
    </Box>
  );
}

export default function SupportPortal() {
  const { i18n: i18nInstance } = useTranslation();
  const lang: Lang = (LANGS as readonly string[]).includes(i18nInstance.language) ? (i18nInstance.language as Lang) : 'pt';
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const theme = useMemo(() => buildTheme(themeMode), [themeMode]);

  const [session, setSession] = useState<Session | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>(seed);
  const [view, setView] = useState<ViewId>('lista');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingView, setLoadingView] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(seedNotifications);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const unreadCount = notifications.filter((n) => !n.lida).length;

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })));
  const markOneRead = (id: number) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));

  const changeView = (v: ViewId) => {
    setMobileNavOpen(false);
    setLoadingView(true);
    setView(v);
    setSelectedId(null);
    window.setTimeout(() => setLoadingView(false), 450);
  };
  const openTicket = (id: string) => {
    setLoadingView(true);
    setSelectedId(id);
    setView('detalhe');
    window.setTimeout(() => setLoadingView(false), 400);
  };
  const updateTicket = (updated: Ticket) => setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  const createTicket = (t: Ticket) => {
    setTickets((prev) => [t, ...prev]);
    setNotifications((prev) => [{ id: Date.now(), texto: i18n.t('notifications.ticketRegistered', { id: t.id }), data: i18n.t('notifications.now'), lida: false }, ...prev]);
    setShowNewTicket(false);
  };
  const login = (s: Session) => { setSession(s); setView('lista'); setSelectedId(null); };
  const logout = () => { setSession(null); setView('lista'); setSelectedId(null); setShowNewTicket(false); };

  const role = session?.role;
  const selected = tickets.find((t) => t.id === selectedId);

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={DAYJS_LOCALE[lang]} localeText={PICKER_TEXT[lang]}>
      <CssBaseline />
      {!session ? (
        <LoginScreen onLogin={login} themeMode={themeMode} setThemeMode={setThemeMode} />
      ) : (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
          <Sidebar
            session={session} view={view} setView={changeView} onLogout={logout}
            themeMode={themeMode} setThemeMode={setThemeMode}
            mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)}
          />
          <Box sx={{ flex: 1, minWidth: 0, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <TopBar
              session={session} themeMode={themeMode} notifications={notifications} unreadCount={unreadCount}
              onOpenNav={() => setMobileNavOpen(true)} onMarkAllRead={markAllRead} onMarkOneRead={markOneRead}
            />
            <Box component="main" sx={{ flex: 1, px: { xs: 2.5, md: 5 }, py: { xs: 3, md: 4 } }}>
              {loadingView ? (
                <ViewSkeleton />
              ) : (
                <>
                  {view === 'usuarios' && role === 'admin' && <UserAdmin />}
                  {view === 'lista' && <TicketList tickets={tickets} role={session.role} user={session} onOpen={openTicket} onNew={() => setShowNewTicket(true)} />}
                  {view === 'relatorios' && <Reports tickets={tickets} role={session.role} user={session} />}
                  {view === 'detalhe' && selected && (
                    <TicketDetail ticket={selected} role={session.role} user={session} onBack={() => changeView('lista')} onUpdate={updateTicket} />
                  )}
                </>
              )}
            </Box>
          </Box>
          {showNewTicket && role === 'cliente' && <NewTicketModal user={session} onClose={() => setShowNewTicket(false)} onCreate={createTicket} />}
        </Box>
      )}
      {/* Notificações: sonner (toast.success / toast.error / toast.warning). */}
      <Toaster position="bottom-center" richColors closeButton theme={themeMode} />
      </LocalizationProvider>
    </ThemeProvider>
  );
}
