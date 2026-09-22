# SupportAtos API

Backend de um sistema de suporte técnico multiplataforma (portal, e-mail e WhatsApp — **apenas o portal está no escopo desta fase**).

Stack: **C# / .NET 10**, **Clean Architecture**, **EF Core 10** + **PostgreSQL**.

## Requisitos

- .NET SDK 10
- PostgreSQL local (instalação nativa) **ou** Docker (para o `docker-compose.yml` opcional)
- `dotnet-ef` global tool:

```bash
dotnet tool install --global dotnet-ef
```

## Como rodar (do zero, passo a passo)

### 1. Criar o banco de dados

Com um PostgreSQL nativo rodando, crie o banco que a API usa:

```bash
psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE supportatos;"
```

> Já existe um `docker-compose.yml` (porta 5433, usuário `admin`, senha padrão `supportatos` — sobrescreva com `POSTGRES_PASSWORD=...`) como alternativa ao Postgres nativo. A connection string fica em `appsettings.json` (`DefaultConnection`) e é **sobrescrita em dev** por `appsettings.Development.json` com os dados do seu Postgres local.

### 2. Configurar a connection string (dev)

O `appsettings.Development.json` versionado mantém a estrutura com **placeholders** (`__SUA_SENHA__`, `__SUA_API_KEY__`). Preencha os valores reais via **User Secrets** (ficam fora do repositório, na sua máquina):

```bash
# Crie a secret id (já existe se você clonou depois do passo da API)
cd src/SupportAtos.Api
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=supportatos;Username=postgres;Password=SUA_SENHA"
dotnet user-secrets set "Sso:ApiKey" "SUA_API_KEY"
```

> A API carrega User Secrets automaticamente quando roda em `Development`.

### 3. Aplicar as migrations

```bash
dotnet ef database update --project src/SupportAtos.Infrastructure --startup-project src/SupportAtos.Api
```

### 4. Rodar a aplicação

```bash
dotnet run --project src/SupportAtos.Api
```

O Swagger fica em `http://localhost:5177/swagger` (dev, perfil `http` do `dotnet run`; o perfil `https` usa a porta 5176).

### 5. Seed (automático em ambiente Development)

Ao iniciar em `Development`, um seeder insere **grupos de empresa** de teste (ids `1` e `2`) se a tabela estiver vazia (`DevelopmentDbSeeder`). Existe também `database/seed.sql` (manual) com grupo, SLAs e um usuário de exemplo.

## Endpoints

| Método | Rota                     | Descrição                                          |
| ------ | ------------------------ | -------------------------------------------------- |
| POST   | `/api/usuarios`          | Cadastra usuário (`nome`, `email`, `grupoEmpresaId`, `papel`) |
| GET    | `/api/usuarios/{id}`     | Consulta usuário por id (inclui nome do grupo)     |
| GET    | `/api/usuarios?grupoEmpresaId={id}` | Lista usuários de um grupo empresa         |
| POST   | `/api/chamados`          | Abre chamado (`produto`, `categoria`, `mensagemInicial`) |
| GET    | `/api/chamados/{codigoPublico}` | Consulta chamado + interações públicas       |

## Autenticação

- **JWT RS256 (SSO do portal)** — token enviado no header `Authorization: Bearer <token>`. Valida assinatura (chave PEM em `Sso:PublicKeyPem` ou JWKS em `Sso:JwksUrl`), `iss`, `aud` e validade. No primeiro acesso, o usuário/grupo da empresa do portal são **provisionados** automaticamente a partir das claims `sub`, `email`, `name`, `grupo_empresa_id`, `grupo_empresa_nome`, `role`.
- **API Key (máquina a máquina)** — header `X-Api-Key`, para integrações (ex.: n8n). Se o header existir, ele tem precedência sobre o JWT.
- **Authorization:** `FallbackPolicy` exige autenticação em todas as rotas; papéis administrativos via `[Authorize(Roles = ...)]` (`Admin`, `Supervisor`, `Agente`); `POST /api/chamados` exige a policy `UsuarioPortal`.

### Gerar token de dev para o Swagger

O tool `tools/SupportAtos.TokenMinter` gera o keypair e emite JWT com as claims esperadas pela API:

```bash
# 1) (uma vez) gera tools/SupportAtos.TokenMinter/keys/dev-private.pem e dev-public.pem,
#    e mostra a chave pública em PUBLIC_PEM_BEGIN/END
dotnet run --project tools/SupportAtos.TokenMinter -- generate

# 2) copie a chave pública exibida para Sso:PublicKeyPem no appsettings.Development.json
#    (o script abaixo já imprime o token)
.\scripts\mint-token.ps1 -Sub portal-admin -Email admin@atos.com -Name "Admin" -GrupoId grupo-1 -GrupoNome "Grupo Norte" -Admin
```

> A **chave privada** (`keys/dev-private.pem`) não deve ser versionada (está no `.gitignore`). Cada dev pode gerar o seu próprio keypair; se regenerar, atualize também o `Sso:PublicKeyPem`.

Observações:

- Códigos HTTP: `201` criação, `400` validação (**inclui `grupoEmpresaId` inexistente no POST** e enum inválido), `401` não autenticado, `403` sem papel, `404` não encontrado, `409` conflito (e-mail duplicado). Erros retornam `ProblemDetails`.

## Estrutura de pastas

```
SupportAtos.slnx
├── src/
│   ├── SupportAtos.Domain/           # Entidades ricas, enums, exceções de domínio. Não depende de nada.
│   │   └── Entities/                 # Usuario, GrupoEmpresa, Chamado, Interacao, Anexo, SlaCategoria, LogAuditoria
│   │   └── Enums/                    # PapelUsuario, StatusChamado, TipoInteracao, Prioridade
│   ├── SupportAtos.Application/      # Casos de uso, DTOs, interfaces (repositórios, unit of work, ICurrentUserProvider). Depende só de Domain.
│   │   └── UseCases/                 # CriarChamadoUseCase, ConsultarChamadoUseCase, CadastrarUsuarioUseCase, ConsultarUsuarioUseCase, ListarUsuariosPorGrupoUseCase
│   │   └── Ports/                    # IChamadoRepository, IUsuarioRepository, IGrupoEmpresaRepository, ISlaCategoriaRepository
│   ├── SupportAtos.Infrastructure/   # EF Core, Migrations, repositórios. Depende de Application e Domain.
│   │   └── Persistence/              # SupportAtosDbContext, Configurations (Fluent API), Migrations
│   │   └── Repositories/             # Implementações concretas dos repositórios + UnitOfWork
│   └── SupportAtos.Api/              # Controllers, Program.cs, DI, Swagger, middlewares. Só orquestra casos de uso.
│       └── Controllers/              # ChamadosController, UsuariosController
│       └── Authentication/           # JWT RS256 (SSO) + API key, leitura de claims, provisionamento do usuário do portal
│       └── Providers/                # JwtCurrentUserProvider (usuário atual via claims do JWT)
│       └── Middleware/               # ExceptionHandlingMiddleware (traduz exceções para ProblemDetails)
├── tools/
│   └── SupportAtos.TokenMinter/      # Gera keypair RSA e emite/verifica JWT de dev (generate/token/verify)
├── scripts/
│   └── mint-token.ps1                # Emite um JWT de dev e copia para a área de transferência
└── tests/
    └── SupportAtos.Application.Tests # Testes de domínio e de casos de uso (xUnit, sem mock — fakes simples)
    └── SupportAtos.Integration.Tests # Testes de integração da API (WebApplicationFactory + Postgres)
```

## Regras de dependência (Clean Architecture)

- `Domain` não depende de nada.
- `Application` depende apenas de `Domain`.
- `Infrastructure` depende de `Application` e `Domain`.
- `Api` depende de todos na camada de registro (DI), mas os Controllers **nunca chamam `Infrastructure` diretamente** — eles recebem casos de uso por injeção de dependência.

## Onde colocar cada tipo de código

| Tipo de código                                  | Camada                              |
| ----------------------------------------------- | ----------------------------------- |
| Regra de negócio pura (status, prazos, validações de domínio) | `Domain/Entities`                  |
| Enum dos valores fixos (papel, status, prioridade, tipo)       | `Domain/Enums`                     |
| Ação de negócio orquestrada (ex.: "abrir chamado")             | `Application/UseCases`             |
| DTO de entrada/saída da API                     | `Application/DTOs`                  |
| Contrato que o EF/banco precisa implementar      | `Application/Ports`                |
| Mapeamento de tabela/coluna (Fluent API)         | `Infrastructure/Persistence/Configurations` |
| Query SQL / acesso a dados usando EF             | `Infrastructure/Repositories`      |
| Endpoint HTTP (rotas, status codes)              | `Api/Controllers`                  |
| Configuração de DI do projeto                   | `DependencyInjection.cs` de cada camada |

## Convenções

- Nomes de tabelas e colunas em **snake_case** (idênticos ao schema de referência).
- Enums persistidos como **string** no banco (`Aberto`, `Cliente`, `Publica`, ...).
- Código público do chamado no formato `SA-XXXXXXXXX` (gerado automaticamente).
- `sla_prazo = criado_em + tempo_resolucao` (horas).

## Fora do escopo desta fase (pontos de extensão)

Validação do JWT por **JWKS em produção** (hoje usa `Sso:PublicKeyPem` em dev; o suporte a `Sso:JwksUrl` já existe no `AuthenticationSetup`), rotação de chaves, webhooks, jobs de SLA, upload de anexos, canais e-mail/WhatsApp e n8n.

## Segredos / boas práticas para o GitHub

- **Nunca commitar:** senhas, API keys, connection strings reais ou a chave privada RSA de dev (`tools/SupportAtos.TokenMinter/keys/`). Tudo isso está no `.gitignore`.
- Em **dev** os valores reais vão para User Secrets (`dotnet user-secrets set ...`) — ver seção "Configurar a connection string (dev)".
- Em **outros ambientes** use variáveis de ambiente configuradas na plataforma de deploy (ex.: `ConnectionStrings__DefaultConnection`, `Sso__ApiKey`).
- Testes de integração: a conexão aponta para o Postgres do docker-compose (porta 5433) ou sobrescreva com a variável `SUPPORTATOS_TEST_CONNECTION`.

## Comandos úteis

```bash
# Nova migration (após alterar entidades/mapeamentos)
dotnet ef migrations add NomeDaMigration --project src/SupportAtos.Infrastructure --startup-project src/SupportAtos.Api

# Aplicar migrations
dotnet ef database update --project src/SupportAtos.Infrastructure --startup-project src/SupportAtos.Api

# Rodar a API (dev)
dotnet run --project src/SupportAtos.Api

# Gerar keypair de dev e emitir token para o Swagger
dotnet run --project tools/SupportAtos.TokenMinter -- generate
.\scripts\mint-token.ps1 -Sub portal-admin -Email admin@atos.com -Name "Admin" -GrupoId grupo-1 -GrupoNome "Grupo Norte" -Admin

# Rodar os testes (integração precisa do Postgres, ver "Segredos")
dotnet test
```