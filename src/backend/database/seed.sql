-- Dados de exemplo para testes manuais da API.
-- Execute APÓS o banco estar com o schema criado (dotnet ef database update).

INSERT INTO grupo_empresa (nome) VALUES ('Empresa Demo') ON CONFLICT DO NOTHING;

INSERT INTO sla_config (produto, categoria, prioridade, tempo_resposta_min, tempo_resolucao_min, ativo)
VALUES
    ('Portal', 'Login', 'Alta', 60, 240, true),
    ('Portal', 'Erro de sistema', 'Media', 120, 480, true),
    ('Portal', 'Duvida', 'Baixa', 240, 1440, true)
ON CONFLICT DO NOTHING;

INSERT INTO usuario (nome, email, grupo_empresa_id, papel)
VALUES ('Cliente Demo', 'cliente@demo.com', 1, 'Cliente')
ON CONFLICT (email) DO NOTHING;