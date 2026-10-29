import { request } from './client';

const cacheUsuarios = new Map();

export async function obterSessao() {
  return request('/usuarios/me', { cache: 'no-store' });
}

export async function obterUsuario(id) {
  if (!id) return null;
  if (cacheUsuarios.has(id)) return cacheUsuarios.get(id);

  try {
    const usuario = await request(`/usuarios/${id}`);
    cacheUsuarios.set(id, usuario);
    return usuario;
  } catch {
    return null;
  }
}

export async function carregarUsuariosPorIds(ids) {
  const unicos = [...new Set(ids.filter(Boolean))];
  const usuarios = await Promise.all(unicos.map((id) => obterUsuario(id)));
  return new Map(usuarios.filter(Boolean).map((usuario) => [usuario.id, usuario]));
}

export async function listarUsuariosPorGrupo(grupoEmpresaId) {
  return request(`/usuarios?grupoEmpresaId=${encodeURIComponent(grupoEmpresaId)}`);
}

export function limparCacheUsuarios() {
  cacheUsuarios.clear();
}
