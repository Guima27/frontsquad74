import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, TextField } from '@mui/material';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';
import { PageHeader } from '../components/feedback';

const DEV_TOKENS = {
  marina: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZy0xIiwiZW1haWwiOiJhZ2VudGVAYXRvcy5jb20iLCJuYW1lIjoiTWFyaW5hIEFsdmVzIiwiZ3J1cG9fZW1wcmVzYV9pZCI6ImctYXRvcyIsImdydXBvX2VtcHJlc2Ffbm9tZSI6IkF0b3MgQ2FwaXRhbCIsInJvbGUiOiJBZ2VudGUiLCJpc3MiOiJzdXBwb3J0YXRvcy1kZXYiLCJhdWQiOiJzdXBwb3J0YXRvcy1hcGkiLCJuYmYiOjE3OTIxODMxODgsImlhdCI6MTc5MjE4MzQ4OCwiZXhwIjoxNzk0Nzc1NDg4LCJqdGkiOiI4Zjg5YWFkOWM2N2E0ODlmYjI1OWU1MmZmOWQ1MDNjZiJ9.Iuieia_H7UjZI8a-CUau1DFH0SInp1a0LQxsf-EE0gIvejpfwTHP32A0QZCwcFL8rKm3_cATu0J_C8nml8KLt-DysbG_uBQZmDjFJvtVHzpoOCulA2VvDpjJvF78QIcyLnOnwEF7B67yxYdQjulvb7IowELQ9DifaUOaoGeIz68QLE3xM0EZ1LdPPDPuT0bJdqbgqhYMbLy6DLfigideBLvQ6q8tcDvcgwqhB63Ubd7TUt828diSQLVHRCjy8av0X5hyjlCarBZgjxsuFIudEa0t1yDZYRRswNBxitN_1ioYTJ-wCqMqLj22DQvIo4G9vxaRBqSrp7DaCdPR77CDwQ',
  diego: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZy0yIiwiZW1haWwiOiJkaWVnb0BhdG9zLmNvbSIsIm5hbWUiOiJEaWVnbyBSYW1vcyIsImdydXBvX2VtcHJlc2FfaWQiOiJnLWF0b3MiLCJncnVwb19lbXByZXNhX25vbWUiOiJBdG9zIENhcGl0YWwiLCJyb2xlIjoiQWdlbnRlIiwiaXNzIjoic3VwcG9ydGF0b3MtZGV2IiwiYXVkIjoic3VwcG9ydGF0b3MtYXBpIiwibmJmIjoxNzkyMTgzMTkyLCJpYXQiOjE3OTIxODM0OTIsImV4cCI6MTc5NDc3NTQ5MiwianRpIjoiOWFiYTczMDk3Yzk4NDQ5ZmI2MGI5MjUzYzZmYWEzOTMifQ.FNtafzOqa1pYZb3nuYKtDxELL9wvNHFEPW9-4H-58N1J3KvZITR9fTQcx51ss0B0ftt9LmsGLDJjRxKUWk3R4YXb9AQWaQCyVwnhTnJ1VJIgIMW5V30XF97ybpQL13taB7b5-p0KGJ3RI19qaRnnMljpgK7S4HvyLYHLJQnJhFVmw9bZ0jtLkQt3YE-8FZi8hQG4FHG0PP2ReD0TtpsHB-hh_kMYtZKUCXafotw8tHVZY9ffkQcp7PKkrX1-aNqaYjyyah9bgY-MOZwHPNlXZ-vDgQP06GiS_iTWwUo7vaEj97YyVfjfAJQOpfyt09U3Uwj98BbVtvj75TJrBoXmYw',
};

export function Login() {
  const { entrar } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: string } };
  const [jwt, setJwt] = useState('');
  const [erro, setErro] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      entrar(jwt);
      toast.success('Sessão iniciada.');
      nav(loc.state?.from || '/fila', { replace: true });
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Token inválido.');
    }
  }

  return (
    <Box maxWidth={560} mx="auto" mt={6}>
      <PageHeader titulo="Entrar — Painel do Atendente" subtitulo="Cole o JWT de desenvolvimento (script mint-token.ps1). Em produção, virá do SSO do portal." />
      <Card>
        <CardContent>
          <form onSubmit={onSubmit}>
            <TextField
              label="JWT (Bearer)"
              multiline
              rows={4}
              fullWidth
              value={jwt}
              onChange={(e) => setJwt(e.target.value)}
              placeholder="eyJhbGciOi..."
              aria-label="Token JWT"
              required
            />
            {erro && (
              <Alert severity="error" sx={{ mt: 2 }} role="alert">
                {erro}
              </Alert>
            )}
            <Alert severity="info" sx={{ mt: 2 }}>
              Gere com: <code>.\scripts\mint-token.ps1 -Sub portal-agente -Email agente@atos.com -Name &quot;Agente&quot; -GrupoId grupo-1 -GrupoNome &quot;Grupo Norte&quot;</code>
              <br />
              Token fica só em memória (não persiste no disco).
            </Alert>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined" onClick={() => { setJwt(DEV_TOKENS.marina); setErro(''); }}>
                Preencher Marina (Agente)
              </Button>
              <Button size="small" variant="outlined" onClick={() => { setJwt(DEV_TOKENS.diego); setErro(''); }}>
                Preencher Diego (Agente)
              </Button>
            </Box>
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
