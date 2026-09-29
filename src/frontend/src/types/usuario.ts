export type PapelUsuario = 'Cliente' | 'Agente' | 'Supervisor' | 'Admin';

export interface UsuarioDto {
  id: number;
  nome: string;
  email: string;
  grupoEmpresaId: number;
  grupoEmpresaNome: string | null;
  papel: PapelUsuario;
}

export interface SessaoUsuario {
  sub: string;
  email: string;
  nome: string;
  grupoEmpresaId: string;
  grupoEmpresaNome: string;
  papel: PapelUsuario;
  exp?: number;
}
