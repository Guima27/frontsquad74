// Traduz os DTOs da API para o formato que a UI já usa (SupportPortal.jsx), e mantém
// um "diretório" de usuários, porque o backend devolve só ids (ver README -> pendências).
import { obterUsuario, listarUsuariosPorGrupo } from './endpoints';

export const STATUS_FROM_API = {
  Aberto: 'aberto', EmAndamento: 'em_andamento', AguardandoCliente: 'aguardando_cliente',
  Resolvido: 'resolvido', Fechado: 'fechado',
};
export const STATUS_TO_API = Object.fromEntries(Object.entries(STATUS_FROM_API).map(([k, v]) => [v, k]));
const PRIORIDADE_FROM_API = { Baixa: 'baixa', Media: 'media', Alta: 'alta', Urgente: 'urgente' };

// Espelha Chamado.MudarStatus (SupportAtos.Domain) — usado para só oferecer transições válidas.
export const TRANSICOES = {
  aberto: ['em_andamento', 'aguardando_cliente', 'resolvido', 'fechado'],
  em_andamento: ['aguardando_cliente', 'resolvido', 'fechado', 'aberto'],
  aguardando_cliente: ['em_andamento', 'resolvido', 'fechado'],
  resolvido: ['fechado', 'aberto', 'em_andamento'],
  fechado: ['aberto'],
};

const HORA = 3_600_000;

// A API manda UTC; se vier sem sufixo de fuso, o JS leria como horário local.
export function parseApiDate(v) {
  if (!v) return null;
  return new Date(/([zZ]|[+-]\d\d:?\d\d)$/.test(v) ? v : `${v}Z`);
}
export function fmtDate(v) {
  const d = parseApiDate(v);
  if (!d) return '';
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(', ', ' ');
}

export function createDirectory(session) {
  const cache = new Map(); // id -> UsuarioDto | null
  // GET /api/usuarios/{id} é restrito à equipe; cliente não consegue resolver nomes.
  const podeConsultar = session.role === 'agente';

  return {
    get: (id) => (id == null ? null : cache.get(id) ?? null),
    remember: (u) => cache.set(u.id, u),
    async prefetch(ids) {
      if (!podeConsultar) return;
      const faltando = [...new Set(ids)].filter((id) => id != null && !cache.has(id));
      await Promise.allSettled(faltando.map(async (id) => {
        try { cache.set(id, await obterUsuario(id)); } catch { cache.set(id, null); }
      }));
    },
    // Equipe + "eu" (a API não tem /usuarios/me; casamos pelo e-mail do token).
    async loadTeam() {
      const todos = await listarUsuariosPorGrupo(0); // não-Admin: o backend usa o grupo do próprio usuário
      todos.forEach((u) => cache.set(u.id, u));
      const equipe = todos.filter((u) => u.papel !== 'Cliente');
      const eu = equipe.find((u) => u.email.toLowerCase() === session.email.toLowerCase()) ?? null;
      return { equipe, eu };
    },
  };
}

export function toTicket(dto, session, dir) {
  const dono = dir.get(dto.usuarioId);
  const agenteU = dir.get(dto.agenteId);
  const criado = parseApiDate(dto.criadoEm);
  const prazo = parseApiDate(dto.slaPrazo);

  return {
    id: dto.codigoPublico, // a UI usa o código público como identificador
    usuarioId: dto.usuarioId,
    grupoEmpresaId: dto.grupoEmpresaId,
    empresa: session.role === 'cliente' ? session.empresa : (dono?.grupoEmpresaNome ?? `Grupo #${dto.grupoEmpresaId}`),
    contato: dono?.nome ?? (session.role === 'cliente' ? 'um usuário do seu grupo' : `Usuário #${dto.usuarioId}`),
    produto: dto.produto,
    categoria: dto.categoria,
    titulo: dto.titulo,
    descricao: dto.descricao,
    prioridade: PRIORIDADE_FROM_API[dto.prioridade] ?? 'media',
    status: STATUS_FROM_API[dto.status] ?? 'aberto',
    agenteId: dto.agenteId,
    agente: dto.agenteId == null ? null : (agenteU?.nome ?? (session.role === 'cliente' ? 'Equipe Atos Capital' : `Agente #${dto.agenteId}`)),
    slaTotal: Math.max(1, Math.round((prazo - criado) / HORA)),
    slaRestante: Math.round((prazo - Date.now()) / HORA), // negativo = estourado
    abertura: fmtDate(dto.criadoEm),
    atualizado: fmtDate(dto.atualizadoEm ?? dto.criadoEm),
    aguardandoDesde: fmtDate(dto.aguardandoDesde),
    prazoAutoEncerramento: null, // a API ainda não expõe esse prazo
    mensagens: [],
    notas: [],
    detalheCarregado: false,
  };
}

function autorDe(usuarioId, ticket, session, dir) {
  const u = dir.get(usuarioId);
  const ehCliente = usuarioId === ticket.usuarioId || u?.papel === 'Cliente';
  const nome = u?.nome
    ?? (usuarioId === ticket.usuarioId ? ticket.contato
      : ticket.agenteId === usuarioId && ticket.agente ? ticket.agente
      : session.role === 'cliente' ? 'Equipe Atos Capital' : `Usuário #${usuarioId}`);
  return { autor: nome, tipo: ehCliente ? 'cliente' : 'agente' };
}

// Detalhe (GET /chamados/{codigo}): separa conversa pública de notas internas.
export function applyDetalhe(ticket, detalhe, session, dir) {
  const mensagens = [];
  const notas = [];
  detalhe.interacoes.forEach((i) => {
    const base = { ...autorDe(i.usuarioId, ticket, session, dir), data: fmtDate(i.criadoEm), texto: i.mensagem, anexos: i.anexos };
    (i.tipo === 'NotaInterna' ? notas : mensagens).push(base);
  });
  return { ...ticket, mensagens, notas, detalheCarregado: true };
}
