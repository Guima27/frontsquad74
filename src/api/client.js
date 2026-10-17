// Cliente HTTP único do front. Em dev, o Vite faz proxy de /api -> http://localhost:5177
// (ver vite.config.js), então não há problema de CORS. Em outro ambiente, defina VITE_API_URL.
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

let tokenEmMemoria = null;
let aoNaoAutorizado = null;

export const setToken = (t) => { tokenEmMemoria = t; };
export const setUnauthorizedHandler = (fn) => { aoNaoAutorizado = fn; };

export class ApiError extends Error {
  constructor(status, message, detail, errors) {
    super(message);
    this.status = status;
    this.detail = detail;
    this.errors = errors;
  }
}

function mensagemAmigavel(status, fallback) {
  if (status === 0) return 'Não foi possível conectar ao servidor. Confira se a API está rodando.';
  if (status === 400) return fallback || 'Dados inválidos.';
  if (status === 401) return 'Sessão expirada ou inválida. Faça login novamente.';
  if (status === 403) return 'Você não tem permissão para esta ação.';
  if (status === 404) return 'Registro não encontrado.';
  if (status === 409) return fallback || 'Conflito: registro duplicado.';
  if (status >= 500) return 'Erro interno do servidor. Tente novamente.';
  return fallback || `Erro na requisição (${status}).`;
}

export async function request(path, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const headers = { 'Content-Type': 'application/json', ...(init.headers || {}) };
    if (tokenEmMemoria) headers.Authorization = `Bearer ${tokenEmMemoria}`;

    const res = await fetch(`${BASE_URL}${path}`, { ...init, headers, signal: controller.signal });
    if (res.status === 204) return undefined;

    const text = await res.text();
    let body;
    try { body = text ? JSON.parse(text) : undefined; } catch { body = undefined; }

    if (!res.ok) {
      const b = body || {};
      const errors = Array.isArray(b.errors) ? b.errors : b.errors ? Object.values(b.errors).flat() : undefined;
      const detail = b.detail || b.title;
      if (res.status === 401 && tokenEmMemoria && aoNaoAutorizado) aoNaoAutorizado();
      throw new ApiError(res.status, mensagemAmigavel(res.status, detail || `Erro ${res.status}`), detail, errors);
    }
    return body;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if (e && e.name === 'AbortError') throw new ApiError(0, 'Tempo esgotado ao falar com o servidor.');
    throw new ApiError(0, mensagemAmigavel(0));
  } finally {
    clearTimeout(timeout);
  }
}

export function buildQuery(params) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.append(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}
