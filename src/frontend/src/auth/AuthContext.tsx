import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { setToken } from '../api/client';
import type { PapelUsuario, SessaoUsuario } from '../types/usuario';

export function limparToken(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/);
  if (match) return match[0];
  return trimmed.replace(/^Bearer\s+/i, '').replace(/[\r\n\s'"]/g, '');
}

function decodificarJwt(token: string): SessaoUsuario {
  const t = limparToken(token);
  const [, payload] = t.split('.');
  if (!payload) throw new Error('Token inválido: sem payload.');
  const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  const papel = String(json.role ?? json.papel ?? '') as PapelUsuario;
  if (!['Agente', 'Supervisor', 'Admin', 'Cliente'].includes(papel)) {
    throw new Error('Claim role inválida no token.');
  }
  return {
    sub: String(json.sub ?? ''),
    email: String(json.email ?? ''),
    nome: String(json.name ?? json.nome ?? ''),
    grupoEmpresaId: String(json.grupo_empresa_id ?? ''),
    grupoEmpresaNome: String(json.grupo_empresa_nome ?? ''),
    papel,
    exp: typeof json.exp === 'number' ? json.exp : undefined,
  };
}

interface AuthState {
  token: string | null;
  sessao: SessaoUsuario | null;
  entrar: (token: string) => void;
  sair: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTok] = useState<string | null>(null);
  const [sessao, setSessao] = useState<SessaoUsuario | null>(null);

  const entrar = useCallback((raw: string) => {
    const t = limparToken(raw);
    const s = decodificarJwt(t);
    if (s.exp && s.exp * 1000 < Date.now()) throw new Error('Token expirado.');
    if (s.papel === 'Cliente') {
      throw new Error('Este painel é para a equipe interna (Agente/Supervisor/Admin).');
    }
    setToken(t);
    setTok(t);
    setSessao(s);
  }, []);

  const sair = useCallback(() => {
    setToken(null);
    setTok(null);
    setSessao(null);
  }, []);

  const value = useMemo(() => ({ token, sessao, entrar, sair }), [token, sessao, entrar, sair]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth fora do AuthProvider');
  return ctx;
}

export function podeAtribuir(papel?: PapelUsuario | null): boolean {
  return papel === 'Admin' || papel === 'Supervisor' || papel === 'Agente';
}
export function ehAdmin(papel?: PapelUsuario | null): boolean {
  return papel === 'Admin';
}
