# Documentation Deploy

> Use este arquivo como prompt/base para qualquer pessoa ou agente que for atualizar o SupportAtos e realizar deploy.

## Papel

Você é um engenheiro responsável por evoluir o backend e o frontend do SupportAtos sem quebrar autenticação, banco ou integrações.

Antes de alterar código:

1. leia este documento;
2. identifique o contrato da API afetado;
3. verifique impacto em banco, autenticação, CORS e variáveis de ambiente;
4. implemente;
5. rode build e testes;
6. só então prepare o deploy.

## Objetivo

Permitir atualizações independentes de backend e frontend, com deploy seguro usando:

- API .NET na Vercel, via container Docker;
- frontend React/Vite na Netlify;
- PostgreSQL no Supabase;
- autenticação SSO/JWT para a equipe;
- API keys para portal e automação.

Backend, frontend e banco são serviços separados. Atualizar um não deve exigir redeploy dos outros, desde que os contratos entre eles sejam mantidos.

## Contexto obrigatório

Stack atual:

- Backend: C#/.NET 10, ASP.NET Core, EF Core, PostgreSQL.
- Frontend: React 18, Vite, Material UI.
- Autenticação: JWT RS256 do SSO + API keys com escopo.
- Testes: xUnit, integração com PostgreSQL e suíte QA.

Topologia de produção:

```text
Frontend React/Vite  -> Netlify
API .NET             -> Vercel Functions com Docker
Banco PostgreSQL     -> Supabase
SSO                  -> provedor externo de identidade
Automações           -> n8n ou outro cliente com API key
```

## Regras de autenticação

Não altere o comportamento abaixo sem atualizar testes e documentação.

### JWT da equipe

- Header: `Authorization: Bearer <token>`.
- Assinatura: RS256.
- Validação: issuer, audience, expiração, assinatura e clock skew.
- Claims obrigatórias:
  - `sub`
  - `email`
  - `name`
  - `grupo_empresa_id`
  - `grupo_empresa_nome`
  - `role`
- O provisionamento cria/atualiza usuário e grupo.
- O papel do token é convertido para `PapelUsuario` e regravado com o nome canônico.
- Falha de infraestrutura/provisionamento deve retornar `500`, não `401`.

### API key do portal

- Header: `X-Api-Key`.
- Escopo: `portal`.
- Também exige:
  - `X-Portal-User-Id`
  - `X-Portal-Group-Id`
- O usuário e o grupo devem existir e pertencer ao mesmo grupo.
- A API key é comparada por hash SHA-256 em tempo constante.

Exceção: `POST /api/chamados` não usa headers de portal. O corpo contém `usuario` e `grupoEmpresa`, e o provisionamento cria/atualiza os dados. Usuário novo sempre nasce como `Cliente`; o portal nunca promove papel.

### API key de automação

- Header: `X-Api-Key`.
- Escopo: `automacao`.
- Endpoints: `/api/automacao/*` e `/api/webhooks/test`.
- Não cria contexto de usuário do portal.
- A chave de automação deve ser diferente da chave do portal.

### Policies existentes

| Policy | Regra |
|---|---|
| `Portal` | API key com `scope=portal` |
| `Automacao` | API key com `scope=automacao` |
| `Jwt` | JWT válido |
| `Equipe` | Admin, Supervisor ou Agente |
| `EquipeAdmin` | Admin |
| `PortalOuEquipe` | Portal ou equipe |

A `FallbackPolicy` exige autenticação. Apenas `/health` é anônimo.

## Regras de banco e Supabase

- O Supabase será usado apenas como PostgreSQL.
- Não usar Supabase Auth sem adaptar o backend.
- O backend atual espera JWT RS256 e claims customizadas; o Supabase Auth padrão não fornece essas claims.
- Não expor credenciais do banco no frontend.
- Não depender de RLS para proteger dados se o frontend não acessa o banco diretamente.
- Usar SSL na conexão.
- Para runtime serverless, usar o connection pooler do Supabase.
- Para migrations, preferir conexão direta ou session pooler.
- Manter o pool pequeno em ambiente serverless.
- Rodar migrations fora do startup da API.
- Migrations devem ser compatíveis com a versão anterior durante o deploy.

Exemplo de connection string:

```text
ConnectionStrings__DefaultConnection=Host=...;Port=6543;Database=postgres;Username=postgres.<ref>;Password=...;SSL Mode=Require;Maximum Pool Size=20
```

Comando de migration:

```powershell
dotnet ef database update --project src/SupportAtos.Infrastructure --startup-project src/SupportAtos.Api
```

## Regras do backend na Vercel

A Vercel não tem runtime .NET nativo. A API deve ser publicada como container Docker.

Regras:

- O projeto da Vercel deve apontar para `src/backend`.
- Criar `Dockerfile.vercel` na raiz de `src/backend`.
- O Dockerfile deve conseguir compilar a solução inteira, incluindo `Application`, `Infrastructure` e `Domain`.
- A aplicação deve escutar em `0.0.0.0`.
- Configurar `PORT=8080` na Vercel ou fazer o `Program.cs` ler `PORT`.
- Não usar `localhost` no bind.
- Configurar forwarded headers por causa do proxy da Vercel.
- Manter HSTS/HTTPS apenas se o redirecionamento estiver funcionando atrás do proxy.
- Swagger fica desativado em `Production`; testar por endpoints ou ambiente separado.
- Não usar filesystem do container para dados persistentes.
- A Vercel limita corpo de requisição/resposta a cerca de 4,5 MB.
- Uploads reais devem ir para Blob/S3/outro storage; a API deve receber apenas metadados/URLs.
- Processos em background não são confiáveis entre requisições. Usar Cron, Workflows ou worker separado.
- Rate limiter e cache de provisionamento são em memória. Com múltiplas instâncias, usar Redis para limites globais.

## Regras do frontend na Netlify

- Build command: `npm run build`.
- Publish directory: `dist`.
- Configurar SPA fallback em `netlify.toml`.
- Configurar `VITE_API_URL` com a URL pública da API.
- Nunca configurar segredos em variáveis `VITE_*`; elas ficam públicas no bundle.
- Nunca colocar API key do portal ou automação no frontend.
- Em produção, obter JWT do SSO e enviar em `Authorization: Bearer <token>`.
- `VITE_API_TOKEN` é apenas para desenvolvimento local.
- Ao trocar o domínio do frontend, atualizar CORS e callbacks/origens no SSO.

Exemplo de `netlify.toml`:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Variáveis de ambiente

### Backend

```text
ASPNETCORE_ENVIRONMENT=Production
PORT=8080

ConnectionStrings__DefaultConnection=Host=...;Port=6543;Database=postgres;Username=...;Password=...;SSL Mode=Require;Maximum Pool Size=20

Sso__Issuer=https://seu-sso
Sso__Audience=supportatos-api
Sso__JwksUrl=https://seu-sso/.well-known/jwks.json

ApiKeys__Portal__PrimaryHash=<hash>
ApiKeys__Automacao__PrimaryHash=<hash>

Webhooks__PortalUrl=https://...
Webhooks__ApiKey=<chave-de-saida-com-32-ou-mais-caracteres>

Cors__AllowedOrigins__0=https://seu-site.netlify.app
```

Regras:

- Em produção, usar `Sso__JwksUrl`.
- `Sso__PublicKeyPem` é apenas para desenvolvimento/teste.
- Não versionar segredos.
- A API key em texto puro vai para o cliente; na API fica apenas o hash.
- Rotação de chave deve usar `PrimaryHash` e `SecondaryHash`.

Gerar API key:

```powershell
dotnet run --project src/backend/src/SupportAtos.Api -- --generate-api-key --escopo portal
```

### Frontend

```text
VITE_API_URL=https://sua-api.vercel.app
```

Não definir `VITE_API_TOKEN` em produção.

## CORS

- Usar origens exatas.
- Configurar o domínio principal da Netlify.
- Configurar também domínio próprio, se existir.
- Previews da Netlify usam URLs diferentes; o código atual não aceita wildcard automaticamente.
- Para previews, ajustar a política de CORS ou usar um domínio fixo de homologação.

## Ordem de atualização e deploy

### Atualização compatível

1. Rodar migrations compatíveis no Supabase.
2. Fazer deploy do backend.
3. Validar `/health` e endpoints principais.
4. Fazer deploy do frontend.
5. Validar login, abertura de chamado e consulta.

### Adicionar campo novo na API

1. Backend primeiro, mantendo o campo opcional.
2. Frontend depois.

### Remover ou renomear campo

1. Frontend primeiro, parando de usar o campo antigo.
2. Backend depois.
3. Se for breaking change, versionar a rota ou manter compatibilidade temporária.

### Trocar domínio do frontend

1. Atualizar CORS no backend.
2. Atualizar origens/callbacks no SSO.
3. Atualizar `VITE_API_URL` se a API mudou.
4. Fazer deploy do frontend.
5. Testar login e requisições autenticadas.

## Segurança

- Nunca commitar segredos, chaves privadas, connection strings ou API keys.
- Nunca colocar chave de API no bundle do frontend.
- Usar user-secrets em desenvolvimento e variáveis de ambiente em produção.
- Usar HTTPS em todos os serviços.
- Manter a API key do webhook diferente das chaves de entrada.
- Validar permissões por policy; não criar endpoints anônimos sem justificativa.
- Não enfraquecer a `FallbackPolicy`.
- Não logar tokens, senhas ou API keys.
- Manter mensagens de erro sem detalhes internos de infraestrutura.

## Testes obrigatórios antes do deploy

Executar:

```powershell
dotnet build src/backend/SupportAtos.slnx
dotnet test src/backend/SupportAtos.slnx
.\src\backend\tests\SupportAtos.Qa.Tests\run-qa.ps1 -Group ALL
```

Não considerar a atualização concluída se:

- build falhar;
- testes de aplicação falharem;
- testes de integração falharem;
- suíte QA falhar;
- `/health` não responder;
- login JWT não funcionar;
- API key do portal não funcionar;
- CORS bloquear o frontend.

## Checklist de conclusão

- [ ] Código compila sem warnings novos.
- [ ] Testes de aplicação passam.
- [ ] Testes de integração passam.
- [ ] QA passa.
- [ ] Migration aplicada no Supabase.
- [ ] Backend publicado com variáveis corretas.
- [ ] Frontend publicado com `VITE_API_URL` correto.
- [ ] CORS configurado para o domínio da Netlify.
- [ ] JWT validando com `Sso__JwksUrl`.
- [ ] API keys configuradas apenas como hash.
- [ ] `/health` retorna `200`.
- [ ] Login e chamadas autenticadas testados.
- [ ] Nenhum segredo commitado.

## O que não fazer

- Não publicar a API na Vercel sem Docker.
- Não usar Supabase Auth sem adaptar claims e validação.
- Não usar a chave pública de desenvolvimento em produção.
- Não colocar API key no frontend.
- Não rodar migrations no startup da API em produção.
- Não usar filesystem da Vercel para persistência.
- Não confiar em rate limiter/cache em memória com múltiplas instâncias.
- Não fazer deploy de breaking change sem compatibilidade ou versionamento.
- Não alterar autenticação sem atualizar testes e documentação.
