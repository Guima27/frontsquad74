// Sessão a partir do JWT RS256 emitido pelo portal (em dev: tools/SupportAtos.TokenMinter).
// O front só LÊ as claims para montar a UI; quem valida assinatura/validade é a API.

export const DEV_TOKENS = {
  agente: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZy0xIiwiZW1haWwiOiJhZ2VudGVAYXRvcy5jb20iLCJuYW1lIjoiTWFyaW5hIEFsdmVzIiwiZ3J1cG9fZW1wcmVzYV9pZCI6ImctYXRvcyIsImdydXBvX2VtcHJlc2Ffbm9tZSI6IkF0b3MgQ2FwaXRhbCIsInJvbGUiOiJBZ2VudGUiLCJpc3MiOiJzdXBwb3J0YXRvcy1kZXYiLCJhdWQiOiJzdXBwb3J0YXRvcy1hcGkiLCJuYmYiOjE3OTIxODMxODgsImlhdCI6MTc5MjE4MzQ4OCwiZXhwIjoxNzk0Nzc1NDg4LCJqdGkiOiI4Zjg5YWFkOWM2N2E0ODlmYjI1OWU1MmZmOWQ1MDNjZiJ9.Iuieia_H7UjZI8a-CUau1DFH0SInp1a0LQxsf-EE0gIvejpfwTHP32A0QZCwcFL8rKm3_cATu0J_C8nml8KLt-DysbG_uBQZmDjFJvtVHzpoOCulA2VvDpjJvF78QIcyLnOnwEF7B67yxYdQjulvb7IowELQ9DifaUOaoGeIz68QLE3xM0EZ1LdPPDPuT0bJdqbgqhYMbLy6DLfigideBLvQ6q8tcDvcgwqhB63Ubd7TUt828diSQLVHRCjy8av0X5hyjlCarBZgjxsuFIudEa0t1yDZYRRswNBxitN_1ioYTJ-wCqMqLj22DQvIo4G9vxaRBqSrp7DaCdPR77CDwQ',
  cliente: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbGktMSIsImVtYWlsIjoiZmVybmFuZGFAYmMuY29tIiwibmFtZSI6IkZlcm5hbmRhIER1YXJ0ZSIsImdydXBvX2VtcHJlc2FfaWQiOiJnLWJjIiwiZ3J1cG9fZW1wcmVzYV9ub21lIjoiQmFuY28gQ29uZmlhblx1MDBFN2EiLCJyb2xlIjoiQ2xpZW50ZSIsImlzcyI6InN1cHBvcnRhdG9zLWRldiIsImF1ZCI6InN1cHBvcnRhdG9zLWFwaSIsIm5iZiI6MTc5MjE4MzE4NCwiaWF0IjoxNzkyMTgzNDg0LCJleHAiOjE3OTQ3NzU0ODQsImp0aSI6IjUwZDVkNDkxZDhhZDRiOGM4NTA5MTY2MjdhNDMzYTRhIn0.HT3jyd6VuBIiR8EVIz_tc_gb1sla8F1--njTLTngg1iFrJw86wRKu9zaDFVC8gx-JMu50J_B1IYh4Olq3NruLeDt7WsMtoZzx0AElWN-rIHchaIf2xrQFa0KGgEYr8rjxpBwuYN1-Y1O9IOc1X1x3IzsH0oAM5gTLw7YWMm9CN5k3XAgTG7830wFQ7ObJ7QgR64CXrDUGOKFxjlE7i0HNgseh_kmbYZ5ESQM_JKML3oCIP_SjsHmgPe6Jl1vSpMIhOg5Q3MoiJS_8n2TxdKrcQDpEKfN5fPw3kHsImYEq1v6cJ48kiuh3Ui5VK2OgZTnnds2DENm4z_myDY8Anr1kA',
  agente2: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZy0yIiwiZW1haWwiOiJkaWVnb0BhdG9zLmNvbSIsIm5hbWUiOiJEaWVnbyBSYW1vcyIsImdydXBvX2VtcHJlc2FfaWQiOiJnLWF0b3MiLCJncnVwb19lbXByZXNhX25vbWUiOiJBdG9zIENhcGl0YWwiLCJyb2xlIjoiQWdlbnRlIiwiaXNzIjoic3VwcG9ydGF0b3MtZGV2IiwiYXVkIjoic3VwcG9ydGF0b3MtYXBpIiwibmJmIjoxNzkyMTgzMTkyLCJpYXQiOjE3OTIxODM0OTIsImV4cCI6MTc5NDc3NTQ5MiwianRpIjoiOWFiYTczMDk3Yzk4NDQ5ZmI2MGI5MjUzYzZmYWEzOTMifQ.FNtafzOqa1pYZb3nuYKtDxELL9wvNHFEPW9-4H-58N1J3KvZITR9fTQcx51ss0B0ftt9LmsGLDJjRxKUWk3R4YXb9AQWaQCyVwnhTnJ1VJIgIMW5V30XF97ybpQL13taB7b5-p0KGJ3RI19qaRnnMljpgK7S4HvyLYHLJQnJhFVmw9bZ0jtLkQt3YE-8FZi8hQG4FHG0PP2ReD0TtpsHB-hh_kMYtZKUCXafotw8tHVZY9ffkQcp7PKkrX1-aNqaYjyyah9bgY-MOZwHPNlXZ-vDgQP06GiS_iTWwUo7vaEj97YyVfjfAJQOpfyt09U3Uwj98BbVtvj75TJrBoXmYw',
};

export function cleanJwt(raw) {
  if (!raw) return '';
  // Limpa quebras de linha, aspas, espaços e prefixos como export TOKEN_...= ou Bearer
  const trimmed = String(raw).trim();
  const match = trimmed.match(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/);
  if (match) return match[0];
  return trimmed.replace(/^Bearer\s+/i, '').replace(/[\r\n\s'"]/g, '');
}

export function sessionFromToken(raw) {
  const token = cleanJwt(raw);
  const parts = token.split('.');
  if (parts.length < 2 || !parts[1]) {
    throw new Error('Token inválido: cole o JWT completo.');
  }

  const payload = parts[1];
  let json;
  try {
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const binStr = atob(b64);
    const bytes = Uint8Array.from(binStr, (c) => c.charCodeAt(0));
    json = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new Error('Token inválido: não foi possível ler o payload.');
  }

  const papel = String(json.role ?? json.papel ?? '');
  if (!['Cliente', 'Agente', 'Supervisor', 'Admin'].includes(papel)) {
    throw new Error('O token não tem uma claim "role" válida (Cliente, Agente, Supervisor ou Admin).');
  }
  if (typeof json.exp === 'number' && json.exp * 1000 < Date.now()) {
    throw new Error('Token expirado. Gere outro com o mint-token.ps1.');
  }

  return {
    token,
    papel,
    role: papel === 'Cliente' ? 'cliente' : 'agente', // visão da UI
    nome: String(json.name ?? json.nome ?? ''),
    email: String(json.email ?? ''),
    empresa: String(json.grupo_empresa_nome ?? ''),
    exp: json.exp,
  };
}
