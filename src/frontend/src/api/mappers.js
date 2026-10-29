import { listarChamados, obterChamado } from './chamados';
import { carregarUsuariosPorIds } from './usuarios';

const STATUS_PARA_FRONT = {
  Aberto: 'aberto',
  EmAndamento: 'em_andamento',
  AguardandoCliente: 'aguardando_cliente',
  Resolvido: 'resolvido',
  Fechado: 'fechado',
};

const STATUS_PARA_BACKEND = {
  aberto: 'Aberto',
  em_andamento: 'EmAndamento',
  aguardando_cliente: 'AguardandoCliente',
  resolvido: 'Resolvido',
  fechado: 'Fechado',
};

const PRIORIDADE_PARA_FRONT = {
  Baixa: 'baixa',
  Media: 'media',
  Alta: 'alta',
  Urgente: 'urgente',
};

export function statusParaBackend(status) {
  return STATUS_PARA_BACKEND[status] || 'Aberto';
}

export function formatarDataHora(valor) {
  if (!valor) return '-';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(data);
}

export function formatarDuracaoMinutos(minutos) {
  const valor = Number(minutos);
  if (!Number.isFinite(valor) || valor <= 0) return '0min';
  if (valor >= 60) return `${Math.round(valor / 60)}h`;
  return `${Math.round(valor)}min`;
}

function diferencaEmMinutos(inicio, fim) {
  const a = Date.parse(inicio);
  const b = Date.parse(fim);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return (b - a) / 60000;
}

function nomeDoUsuario(usuarios, id, prefixo) {
  return usuarios.get(id)?.nome || `${prefixo} #${id}`;
}

function nomeDoGrupo(usuario, grupoEmpresaId) {
  return usuario?.grupoEmpresaNome || `Grupo #${grupoEmpresaId}`;
}

export function mapearChamado(dto, usuarios = new Map()) {
  const usuario = usuarios.get(dto.usuarioId);
  const agente = dto.agenteId ? usuarios.get(dto.agenteId) : null;
  const totalMinutos = Math.max(1, Math.round(diferencaEmMinutos(dto.criadoEm, dto.slaPrazo)));
  const restanteMinutos = Math.max(0, Math.round(diferencaEmMinutos(new Date().toISOString(), dto.slaPrazo)));

  return {
    id: dto.codigoPublico,
    backendId: dto.id,
    empresa: nomeDoGrupo(usuario, dto.grupoEmpresaId),
    grupoEmpresaId: dto.grupoEmpresaId,
    contato: nomeDoUsuario(usuarios, dto.usuarioId, 'Usuario'),
    usuarioId: dto.usuarioId,
    produto: dto.produto,
    categoria: dto.categoria,
    assunto: dto.titulo || '',
    descricao: dto.descricao || '',
    prioridade: PRIORIDADE_PARA_FRONT[dto.prioridade] || 'media',
    status: STATUS_PARA_FRONT[dto.status] || 'aberto',
    agente: agente?.nome || null,
    agenteId: dto.agenteId ?? null,
    slaTotal: totalMinutos,
    slaRestante: restanteMinutos,
    abertura: formatarDataHora(dto.criadoEm),
    criadoEm: dto.criadoEm,
    slaPrazo: dto.slaPrazo,
    aguardandoDesde: dto.aguardandoDesde ? formatarDataHora(dto.aguardandoDesde) : null,
    prazoAutoEncerramento: formatarDataHora(dto.slaPrazo),
    mensagens: [],
    notas: [],
    atualizadoEm: dto.atualizadoEm,
    fechadoEm: dto.fechadoEm,
  };
}

export function mapearDetalhe(detalhe, usuarios = new Map()) {
  const chamado = mapearChamado(detalhe.chamado, usuarios);
  const interacoes = detalhe.interacoes || [];

  chamado.mensagens = interacoes
    .filter((interacao) => interacao.tipo !== 'NotaInterna')
    .map((interacao) => ({
      autor: nomeDoUsuario(usuarios, interacao.usuarioId, 'Usuario'),
      tipo: interacao.usuarioId === detalhe.chamado.usuarioId ? 'cliente' : 'agente',
      data: formatarDataHora(interacao.criadoEm),
      texto: interacao.mensagem,
    }));

  chamado.notas = interacoes
    .filter((interacao) => interacao.tipo === 'NotaInterna')
    .map((interacao) => ({
      autor: nomeDoUsuario(usuarios, interacao.usuarioId, 'Usuario'),
      data: formatarDataHora(interacao.criadoEm),
      texto: interacao.mensagem,
    }));

  return chamado;
}

export async function carregarChamadosMapeados() {
  const chamados = await listarChamados();
  const idsUsuarios = chamados.flatMap((chamado) => [chamado.usuarioId, chamado.agenteId]);
  const usuarios = await carregarUsuariosPorIds(idsUsuarios);
  return chamados.map((chamado) => mapearChamado(chamado, usuarios));
}

export async function carregarDetalheMapeado(codigoPublico) {
  const detalhe = await obterChamado(codigoPublico);
  const idsUsuarios = [
    detalhe.chamado.usuarioId,
    detalhe.chamado.agenteId,
    ...(detalhe.interacoes || []).map((interacao) => interacao.usuarioId),
  ];
  const usuarios = await carregarUsuariosPorIds(idsUsuarios);
  return mapearDetalhe(detalhe, usuarios);
}
