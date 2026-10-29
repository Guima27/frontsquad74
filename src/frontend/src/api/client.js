// Cliente HTTP unico do frontend. A URL base vem de VITE_API_URL (.env).
const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(status, message, detail) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

function mensagemAmigavel(status, fallback) {
  if (status === 0) return 'Nao foi possivel conectar ao servidor. Confira se a API esta rodando.';
  if (status === 400) return fallback || 'Dados invalidos.';
  if (status === 401) return 'Sessao expirada ou invalida.';
  if (status === 403) return 'Voce nao tem permissao para esta acao.';
  if (status === 404) return 'Registro nao encontrado.';
  if (status === 409) return fallback || 'Conflito: registro duplicado.';
  if (status >= 500) return 'Erro interno do servidor. Tente novamente.';
  return fallback || `Erro na requisicao (${status}).`;
}

export async function request(path, init = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(init.headers || {}),
  };

  // [AUTH-DESATIVADA] Header Authorization nao e mais enviado enquanto a autenticacao esta desligada.
  // Motivo: front e back devem funcionar sem token durante a integracao temporaria.
  // Para reativar, descomente as linhas abaixo e volte a preencher o token na sessao.
  // const token = obterTokenDaSessao();
  // if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, mensagemAmigavel(0));
  }

  if (response.status === 204) return undefined;

  const texto = await response.text();
  let body;
  try {
    body = texto ? JSON.parse(texto) : undefined;
  } catch {
    if (response.ok) throw new ApiError(502, 'Resposta invalida do servidor.');
  }

  if (!response.ok) {
    const detalhe = body?.detail || body?.title;
    const erros = Array.isArray(body?.errors)
      ? body.errors
      : body?.errors
        ? Object.values(body.errors).flat()
        : undefined;
    throw new ApiError(response.status, mensagemAmigavel(response.status, detalhe), erros?.[0] || detalhe);
  }

  return body;
}

export function buildQuery(params) {
  const query = new URLSearchParams();
  for (const [chave, valor] of Object.entries(params)) {
    if (valor !== undefined && valor !== null && valor !== '') {
      query.append(chave, String(valor));
    }
  }
  const texto = query.toString();
  return texto ? `?${texto}` : '';
}
