import { buildQuery, request } from './client';

export function listarChamados(filtros = {}) {
  const query = buildQuery({
    status: filtros.status,
    categoria: filtros.categoria,
    produto: filtros.produto,
    agenteId: filtros.agenteId,
    grupoEmpresaId: filtros.grupoEmpresaId,
    semAgente: filtros.semAgente,
  });
  return request(`/chamados${query}`);
}

export function obterChamado(codigoPublico) {
  return request(`/chamados/${encodeURIComponent(codigoPublico)}`);
}

export function criarChamado({ produto, categoria, assunto, descricao }) {
  return request('/chamados', {
    method: 'POST',
    body: JSON.stringify({
      produto,
      categoria,
      mensagemInicial: descricao,
      titulo: assunto,
      descricao,
    }),
  });
}

export function responderChamado(codigoPublico, mensagem, tipo = 'Publica') {
  return request(`/chamados/${encodeURIComponent(codigoPublico)}/interacoes`, {
    method: 'POST',
    body: JSON.stringify({ mensagem, tipo }),
  });
}

export function mudarStatus(codigoPublico, novoStatus) {
  return request(`/chamados/${encodeURIComponent(codigoPublico)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ novoStatus }),
  });
}

export function atribuirAgente(codigoPublico, agenteId, automatico = false) {
  return request(`/chamados/${encodeURIComponent(codigoPublico)}/atribuir`, {
    method: 'PATCH',
    body: JSON.stringify({ agenteId: agenteId ?? null, automatico }),
  });
}
