// Um wrapper por endpoint do backend (SupportAtos.Api). Nomes e payloads seguem os DTOs de
// SupportAtos.Application/DTOs; enums trafegam como string (JsonStringEnumConverter).
import { request, buildQuery } from './client';

const cod = (c) => encodeURIComponent(c);

export const listarChamados = (f = {}) =>
  request(`/chamados${buildQuery({
    status: f.status, categoria: f.categoria, produto: f.produto,
    agenteId: f.agenteId, grupoEmpresaId: f.grupoEmpresaId, semAgente: f.semAgente,
  })}`);

export const obterChamado = (codigo) => request(`/chamados/${cod(codigo)}`);

export const responderChamado = (codigo, mensagem, tipo = 'Publica') =>
  request(`/chamados/${cod(codigo)}/interacoes`, { method: 'POST', body: JSON.stringify({ mensagem, tipo }) });

export const mudarStatus = (codigo, novoStatus) =>
  request(`/chamados/${cod(codigo)}/status`, { method: 'PATCH', body: JSON.stringify({ novoStatus }) });

export const atribuirAgente = (codigo, agenteId = null, automatico = false) =>
  request(`/chamados/${cod(codigo)}/atribuir`, { method: 'PATCH', body: JSON.stringify({ agenteId, automatico }) });

export const obterUsuario = (id) => request(`/usuarios/${id}`);
export const listarUsuariosPorGrupo = (grupoEmpresaId = 0) =>
  request(`/usuarios?grupoEmpresaId=${grupoEmpresaId}`);
