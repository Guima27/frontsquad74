// Aplicacao: estado global (sessao, chamados, notificacoes), tema MUI e roteamento simples por view.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, CssBaseline, Skeleton, Snackbar, Stack, ThemeProvider } from '@mui/material';
import { buildTheme } from './theme';
import { STATUS, seedNotifications } from './data';
import LoginScreen from './components/Login';
import { Sidebar, TopBar } from './components/Layout';
import TicketList, { NewTicketModal } from './components/TicketList';
import TicketDetail from './components/TicketDetail';
import Reports from './components/Reports';
import { carregarChamadosMapeados, carregarDetalheMapeado, statusParaBackend } from './api/mappers';
import { atribuirAgente, criarChamado, mudarStatus, responderChamado } from './api/chamados';
import { obterSessao } from './api/usuarios';

function ViewSkeleton() {
  return (
    <Box sx={{ maxWidth: 1152 }} aria-hidden>
      <Skeleton width={220} height={34} />
      <Skeleton width={320} height={22} sx={{ mb: 4 }} />
      <Stack spacing={1.5}>{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rounded" height={48} />)}</Stack>
    </Box>
  );
}

// [AUTH-DESATIVADA] Sessao inicial mockada para abrir as telas direto, sem token.
// Motivo: autenticacao temporariamente desligada. O backend usa o mesmo usuario mock (id 4 / grupo 3).
// Para reativar, remova a constante e descomente a linha original de useState(null) abaixo.
const SESSAO_MOCK = {
  role: 'agente',
  nome: 'Admin',
  email: 'admin@atos.com',
  empresa: 'Grupo Norte',
  usuarioId: 4,
  grupoEmpresaId: 3,
  papel: 'Admin',
};

function mapearSessao(dto) {
  return {
    role: dto.papel === 'Cliente' ? 'cliente' : 'agente',
    nome: dto.nome,
    email: dto.email,
    empresa: dto.grupoEmpresaNome,
    usuarioId: dto.usuarioId,
    grupoEmpresaId: dto.grupoEmpresaId,
    papel: dto.papel,
  };
}

export default function SupportPortal() {
  const [themeMode, setThemeMode] = useState('light');
  const theme = useMemo(() => buildTheme(themeMode), [themeMode]);

  // [AUTH-DESATIVADA] Sessao comeca preenchida para nao passar pela tela de login.
  // const [session, setSession] = useState(null);
  const [session, setSession] = useState(SESSAO_MOCK);
  const [tickets, setTickets] = useState([]);
  const [view, setView] = useState('lista');
  const [selectedId, setSelectedId] = useState(null);
  const [loadingView, setLoadingView] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [notifications, setNotifications] = useState(seedNotifications);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const unreadCount = notifications.filter((n) => !n.lida).length;

  const notify = (texto, severity = 'success') => setToast({ texto, severity });
  const tratarErro = useCallback((error) => {
    const mensagem = error?.message || 'Nao foi possivel concluir a operacao.';
    setErro(mensagem);
    notify(mensagem, 'error');
  }, []);

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })));
  const markOneRead = (id) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));

  const recarregarLista = useCallback(async () => {
    const lista = await carregarChamadosMapeados();
    setTickets(lista);
    return lista;
  }, []);

  const recarregarDetalhe = useCallback(async (id) => {
    const detalhe = await carregarDetalheMapeado(id);
    setTickets((prev) => prev.map((ticket) => (ticket.id === id ? detalhe : ticket)));
    return detalhe;
  }, []);

  useEffect(() => {
    let ativo = true;
    (async () => {
      setCarregando(true);
      setErro('');
      try {
        const [lista, sessao] = await Promise.all([
          carregarChamadosMapeados(),
          obterSessao().catch(() => null),
        ]);
        if (!ativo) return;
        setTickets(lista);
        if (sessao) setSession(mapearSessao(sessao));
      } catch (error) {
        if (ativo) tratarErro(error);
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => { ativo = false; };
  }, [tratarErro]);

  const changeView = (v) => {
    setMobileNavOpen(false);
    setLoadingView(true);
    setView(v);
    setSelectedId(null);
    window.setTimeout(() => setLoadingView(false), 450);
  };

  const openTicket = async (id) => {
    setLoadingView(true);
    setSelectedId(id);
    setView('detalhe');
    try {
      await recarregarDetalhe(id);
    } catch (error) {
      tratarErro(error);
    } finally {
      setLoadingView(false);
    }
  };

  const createTicket = async (dados) => {
    const criado = await criarChamado(dados);
    await recarregarLista();
    setNotifications((prev) => [
      { id: Date.now(), texto: `Chamado ${criado.codigoPublico} registrado com sucesso.`, data: 'agora', lida: false },
      ...prev,
    ]);
    setShowNewTicket(false);
    notify(`Chamado ${criado.codigoPublico} registrado.`);
    return criado;
  };

  const handleReply = async (ticket, mensagem) => {
    try {
      await responderChamado(ticket.id, mensagem, 'Publica');
      await recarregarDetalhe(ticket.id);
      notify(session.role === 'agente' ? 'Resposta enviada ao cliente.' : 'Atualizacao enviada a equipe de suporte.');
    } catch (error) {
      tratarErro(error);
    }
  };

  const handleNote = async (ticket, mensagem) => {
    try {
      await responderChamado(ticket.id, mensagem, 'NotaInterna');
      await recarregarDetalhe(ticket.id);
      notify('Nota interna salva.');
    } catch (error) {
      tratarErro(error);
    }
  };

  const handleStatus = async (ticket, status) => {
    try {
      await mudarStatus(ticket.id, statusParaBackend(status));
      await recarregarDetalhe(ticket.id);
      notify(`Status atualizado para "${STATUS[status]?.label || status}".`);
    } catch (error) {
      tratarErro(error);
    }
  };

  const handleAssign = async (ticket, agente) => {
    if (!agente?.id) return;
    try {
      await atribuirAgente(ticket.id, agente.id);
      await recarregarDetalhe(ticket.id);
      notify(agente.id === session.usuarioId ? 'Voce assumiu o chamado.' : `Chamado repassado para ${agente.nome}.`);
    } catch (error) {
      tratarErro(error);
    }
  };

  // [AUTH-DESATIVADA] Logout volta para a tela de login simulada; nao ha token para limpar.
  const logout = () => { setSession(null); setView('lista'); setSelectedId(null); setShowNewTicket(false); };

  const role = session?.role;
  const selected = tickets.find((t) => t.id === selectedId);
  const agents = useMemo(() => {
    const mapa = new Map();
    tickets.forEach((ticket) => {
      if (ticket.agenteId && ticket.agente) mapa.set(ticket.agenteId, { id: ticket.agenteId, nome: ticket.agente });
    });
    if (session?.usuarioId) mapa.set(session.usuarioId, { id: session.usuarioId, nome: session.nome });
    return [...mapa.values()].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [tickets, session]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!session ? (
        <LoginScreen onLogin={setSession} themeMode={themeMode} setThemeMode={setThemeMode} />
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
              {erro && <Alert severity="error" onClose={() => setErro('')} sx={{ mb: 3, maxWidth: 1152 }}>{erro}</Alert>}
              {loadingView || carregando ? (
                <ViewSkeleton />
              ) : (
                <>
                  {view === 'lista' && <TicketList tickets={tickets} role={role} user={session} onOpen={openTicket} onNew={() => setShowNewTicket(true)} />}
                  {view === 'relatorios' && <Reports tickets={tickets} role={role} user={session} />}
                  {view === 'detalhe' && selected && (
                    <TicketDetail
                      ticket={selected}
                      role={role}
                      user={session}
                      agents={agents}
                      onBack={() => changeView('lista')}
                      onReply={handleReply}
                      onNote={handleNote}
                      onChangeStatus={handleStatus}
                      onAssign={handleAssign}
                    />
                  )}
                </>
              )}
            </Box>
          </Box>
          {showNewTicket && role === 'cliente' && <NewTicketModal user={session} onClose={() => setShowNewTicket(false)} onCreate={createTicket} />}
        </Box>
      )}
      <Snackbar open={Boolean(toast)} autoHideDuration={3500} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast?.severity || 'success'} variant="filled" onClose={() => setToast(null)} sx={{ alignItems: 'center' }}>
          {toast?.texto}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
