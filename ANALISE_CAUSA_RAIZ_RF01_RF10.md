# Análise de causa raiz de RF01 e RF10 — Atos Capital

## 1. Resumo executivo

A implementação explica as quatro não conformidades da segunda bateria de QA: a autenticação está desativada; o contrato de abertura não recebe nem valida identidade do portal; um provider simulado fornece sempre usuário 4/grupo 3; e o provisionamento existente não participa desse fluxo. Além disso, o provisionamento foi construído para códigos externos separados de IDs internos gerados pelo banco, divergindo da preservação dos IDs reais exigida pela v3.

Foram identificadas **5 causas confirmadas, 0 causas prováveis e 0 causas não determinadas**, contadas pelos identificadores C1–C5 deste documento. São mecanismos técnicos compartilhados, não uma contagem de testes reprovados nem uma equivalência de uma causa por NC. C5 é uma incompatibilidade confirmada da estratégia existente, mas não foi o mecanismo executado nos testes: os resultados de associação 4/3 decorreram de C2/C3 e a ausência de sincronização no fluxo ativo, de C4.

A análise foi exclusivamente estática e documental em 03/11/2026. Não foram executados testes, compilação, API, containers ou comandos de banco; não houve correção de código. O HEAD consultado foi `dc916a6ecb072b3f4da98776c008111acea64954`. Não há diferenças em `src/`, inclusive backend, entre esse HEAD e a revisão testada `97baa8c604a1d69d5636d3577d280ce89078a213`, nem alterações locais prévias indicadas pelo Git.

## 2. Documentação analisada

**Fonte normativa única:** [Termo_Referencia_Residencia_Software.v3.docx](Especificacao%20do%20desafio/Termo_Referencia_Residencia_Software.v3.docx). Foram lidos o texto e as tabelas do OOXML do documento, inclusive a tabela de requisitos da seção 4. A v2 não foi consultada.

| Localizador normativo | Comportamento esperado |
|---|---|
| §2.1, página 3 indicada na solicitação | Abertura via API com dados de usuário e grupo vinculados, integração servidor-a-servidor autenticada por API Key e identificador público imediato. |
| §2.5, página 4 indicada | Criar ou atualizar usuário e grupo automaticamente ao receber chamado, usando o próprio ID do portal como ID, sem cadastro prévio. |
| §4, RF01, página 4 indicada | Criar chamado via API associando usuário logado e grupo empresa. A interpretação de identidade vem do §6.2. |
| §4, RF10, página 4 indicada | Sincronizar usuário e grupo na abertura, com upsert e autenticação por API Key. |
| §6.2, página 5 indicada | Backend do portal envia chave no header e identidade no corpo: usuário com identificador, nome e e-mail; grupo com identificador e nome. Não há SSO, login na ferramenta ou validação de JWT. Chave ausente/inválida exige 401. IDs não são gerados pela ferramenta. |
| §8, página 6 indicada | Demonstrar abertura integrada e criação/atualização automática de usuário e grupo autenticada por API Key. |

Os números de página acima são os informados na solicitação; não houve nova renderização para conferir paginação. As seções e conteúdos foram verificados diretamente no DOCX. `X-Api-Key` é o exemplo do §6.2 e o nome efetivamente implementado. A v3 não fixa nomes ou aninhamento das propriedades JSON de identidade e não estabelece um HTTP específico para identidade ausente.

**Evidências históricas:** pasta [qa-v3-rf01-rf10-20261103](qa-v3-rf01-rf10-20261103/), com leitura de `RELATORIO.md`, `MATRIZ_TESTES.md`, `NAO_CONFORMIDADES.md`, `CONTRATO_HTTP.md`, `results.json`, trechos relevantes de `api.log` e JSON individuais AUTH-02/03/04/05/06/08, RF01-01/08/09/10/13/14, RF10-01/03/04/05/06/10 e INT-05. Foram também consultados os snapshots nesses JSON e `final-state.json`.

Os arquivos individuais registram requisição, resposta e snapshots/diferenças SQL. A bateria informa 40 cenários: 14 aprovados, 24 reprovados e 2 não verificados; 35 criações e 35 interações finais. A leitura do snapshot final confirmou que todos os chamados têm `usuario_id=4`, `grupo_empresa_id=3` e todas as interações têm `autor_id=4`.

Foi feita comparação somente de leitura por `git diff 97baa8c604a1d69d5636d3577d280ce89078a213 HEAD -- src` e inspeção do histórico. O único commit posterior listado é `dc916a6 testes RF-01/RF-10`; suas mudanças adicionam evidências de QA e a v3 e retiram a v2, sem mudar fontes em `src/`. Não se atribuem resultados a uma implementação modificada: neste caso, os fontes relevantes coincidem.

As referências de código a seguir são caminhos relativos à raiz e linhas físicas dos arquivos atuais, iguais aos da revisão testada no escopo analisado. Para abreviar tabelas, **API**, **APP**, **DOM** e **INF** significam, respectivamente, `src/backend/src/SupportAtos.Api`, `src/backend/src/SupportAtos.Application`, `src/backend/src/SupportAtos.Domain` e `src/backend/src/SupportAtos.Infrastructure`.

## 3. Arquitetura do fluxo de criação

O caminho ativo de `POST /api/chamados` até o PostgreSQL é:

1. **Inicialização:** `API/Program.cs`, classe `Program` (instruções de nível superior), linhas 27–29, registra controllers e conversor de enums JSON. Linhas 76–77 ativam `AddApplication()` e `AddInfrastructure()`. Linhas 93–95 registram `ICurrentUser` como `MockCurrentUserProvider` sem condicionar ao ambiente. Linhas 78–91 e 108–111 deixam autenticação, políticas e middlewares comentados. Linhas 99–113 instalam tratamento de exceções, CORS e mapeiam controllers.
2. **Entrada e binding:** `API/Controllers/ChamadosController.cs`, classe `ChamadosController`, linhas 10–14 e método `CriarChamado`, 39–46, mapeia a rota e recebe `[FromBody] CriarChamadoInput input`. A ação chama `await _criarChamadoUseCase.Handle(input, cancellationToken)`. A proteção `[Authorize(...)]` da classe está comentada na linha 12.
3. **Contrato recebido:** `APP/DTOs/CriarChamadoInput.cs`, record `CriarChamadoInput`, linhas 3–8, contém somente produto, categoria, mensagem inicial, título e descrição. Identidade adicional não se torna propriedade desse input.
4. **Caso de uso:** `APP/UseCases/CriarChamadoUseCase.cs`, classe `CriarChamadoUseCase`, método `Handle`, linhas 30–69, valida produto/categoria/mensagem (32–45), lê `_currentUser.UsuarioAtual` (47), consulta SLA (49–51), gera código público (53; método `GerarCodigoPublicoUnicoAsync`, 72–83), cria chamado (55–63) e interação pública (64). Não consulta nem sincroniza usuário/grupo.
5. **Identidade:** `API/Providers/MockCurrentUserProvider.cs`, classe `MockCurrentUserProvider`, constantes e inicializador 13–25, retorna sempre o contexto 4/3 pela propriedade `UsuarioAtual` (34–49). `APP/Abstractions/ICurrentUser.cs`, interface `ICurrentUser`, linhas 3–7, apenas expõe `IsAutenticado` e `UsuarioAtual`; não determina a origem dos dados.
6. **Domínio:** `DOM/Entities/Chamado.cs`, classe `Chamado`, método `Criar` (87–130) e construtor (60–84), valida IDs positivos e copia `UsuarioId = usuarioId; GrupoEmpresaId = grupoEmpresaId;` (72–73). `AdicionarInteracao` (133–148) adiciona a interação à coleção; recebe novamente usuário 4 da linha 64 do caso de uso.
7. **Persistência:** `INF/Repositories/ChamadoRepository.cs`, classe `ChamadoRepository`, método `AddAsync`, linhas 34–35: `await _context.Chamados.AddAsync(chamado, cancellationToken)`. `INF/Repositories/UnitOfWork.cs`, classe `UnitOfWork`, método `SaveChangesAsync`, 15–16: `_context.SaveChangesAsync(cancellationToken)`. O agregado inclui a interação inicial.
8. **Banco e relações:** `INF/DependencyInjection.cs`, classe `DependencyInjection`, método `AddInfrastructure`, 15–26, lê a conexão, usa `options.UseNpgsql(connectionString)` e registra repositórios/unit of work. `INF/Persistence/SupportAtosDbContext.cs`, classe `SupportAtosDbContext`, propriedades 24–38 e `OnModelCreating` 40–42, expõe entidades e aplica configurações. `ChamadoConfiguration.Configure` mapeia `UsuarioId`/`GrupoEmpresaId` nas linhas 25–29 e FKs nas linhas 94–102; `InteracaoConfiguration.Configure` mapeia `UsuarioId` para `autor_id` nas linhas 18–20 e FK do autor nas linhas 41–44.
9. **Resposta:** após salvar, `CriarChamadoUseCase.Handle` retorna DTO (69) e `ChamadosController.CriarChamado` responde `CreatedAtAction(...)` (46), produzindo 201. Se o banco lançar erro não mapeado, `API/Middleware/ExceptionHandlingMiddleware.cs`, classe `ExceptionHandlingMiddleware`, métodos `InvokeAsync` (18–27) e `HandleExceptionAsync` (30–50), capturam a exceção e a convertem em 500 no ramo genérico (39–45).

O caminho está coerente com os INSERTs e a pilha histórica de `api.log`: a exceção de RF10-01 passa por `CriarChamadoUseCase.Handle`, linha 67 (log, linha 155). Não há etapa ativa entre a entrada e a gravação que autentique a chave ou sincronize identidade do corpo.

## 4. Investigação NC-01

### C1 — Autenticação e exigência de credenciais fora do fluxo ativo

**CAUSA CONFIRMADA.** A implementação possui comparação de API Key, mas ela não é registrada nem exigida no endpoint executado.

| Arquivo e classe | Método/propriedade e linhas | Trecho relevante | Efeito |
|---|---|---|---|
| `API/Program.cs`, `Program` | Inicialização, 78–91 | `// builder.Services.AddSsoAuthentication(builder.Configuration);` | Desativa a chamada que registraria os esquemas e as opções SSO; o bloco de políticas também está comentado. |
| Mesmo arquivo/classe | Pipeline, 108–113 | `// app.UseAuthentication();` e `// app.UseAuthorization();` | Nenhum desses middlewares está explicitamente ativo; o mapeamento de controllers permanece ativo. |
| `API/Controllers/ChamadosController.cs`, `ChamadosController` | Atributos da classe, 10–14; `CriarChamado`, 39–46 | `// [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "UsuarioPortal")]` | A ação não exige autenticação nem tem filtro próprio de API Key. |
| `API/Authentication/AuthenticationSetup.cs`, `AuthenticationSetup` | `AddSsoAuthentication`, 19–23, 45–51 e 172 | `.AddScheme<ApiKeyAuthenticationOptions, ApiKeyAuthenticationHandler>(...)` | O registro real do handler está dentro da extensão não chamada. |
| `API/Authentication/ApiKeyAuthenticationHandler.cs`, `ApiKeyAuthenticationHandler` | `HandleAuthenticateAsync`, 29–45; `FixedTimeEquals`, 56–62 | `var esperada = _sso.CurrentValue.ApiKey;` / `Request.Headers.TryGetValue(...)` / `if (!FixedTimeEquals(esperada, recebida))` | Há leitura da configuração, leitura do header e comparação dos hashes SHA-256 em tempo constante. Esse código existe, mas não é executado pelo fluxo ativo analisado. |

O handler retorna `NoResult()` para chave configurada ausente ou header ausente (linhas 32–39), `Fail(...)` para chave diferente (43–45) e sucesso para chave correspondente (48–53). Resultado de autenticação não equivale por si só a uma rejeição HTTP: é preciso uma exigência ativa de autenticação/challenge no endpoint. Aqui faltam tanto a ativação quanto a exigência.

O valor configurado **não é efetivamente comparado na criação atual**. Uma definição de segurança no Swagger (`Program.cs`, 34–51) descreve mecanismos, mas não os executa. CORS (`Program.cs`, 68–73, 100) também não valida credenciais do backend do portal.

**Busca de mecanismos alternativos:** inspeção de `API/Authentication`, `API/Middleware`, controllers, `Program.cs` e DI, com busca em `src/backend/src` excluindo `bin/obj` por `ApiKey`, `X-Api-Key`, `AddAuthentication`, `Authorize`, `UseMiddleware`, filtros de autorização/ação e registros. O middleware localizado é `ExceptionHandlingMiddleware`; não foi localizado middleware ou filtro ativo de API Key alternativo no caminho. O mecanismo encontrado é precisamente `ApiKeyAuthenticationHandler`, desativado pela ausência de chamada a `AddSsoAuthentication`.

**Relação com QA:** [AUTH-02](qa-v3-rf01-rf10-20261103/AUTH-02.json), [AUTH-03](qa-v3-rf01-rf10-20261103/AUTH-03.json), [AUTH-04](qa-v3-rf01-rf10-20261103/AUTH-04.json), [AUTH-05](qa-v3-rf01-rf10-20261103/AUTH-05.json), [AUTH-06](qa-v3-rf01-rf10-20261103/AUTH-06.json) e as cinco variantes de [AUTH-08](qa-v3-rf01-rf10-20261103/AUTH-08.json) registram 201 e inserção de chamado/interação. As requisições alcançam o caso de uso porque não há barreira ativa de credenciais. O JWT enviado em parte dos casos não autentica nem substitui a chave nesse fluxo; sua presença é irrelevante para a criação observada. Grau de certeza: confirmado por código e efeitos HTTP/SQL históricos.

**Limite da direção de correção:** apenas descomentar a autenticação anterior não implementaria a v3. `AuthenticationSetup.AddSsoAuthentication` exige configuração SSO (25–40), define Bearer como padrão (45–50), seleciona esquema conforme headers (58–69) e provisiona no evento JWT. O atributo comentado da controller exige JWT explicitamente. Essa arquitetura anterior não é o contrato servidor-a-servidor exclusivamente por API Key descrito na v3.

## 5. Investigação NC-02

### C2 — Contrato de abertura sem entrada e validação de identidade

**CAUSA CONFIRMADA**, compartilhada com NC-04 e contribuinte para NC-03.

**Arquivo:** `APP/DTOs/CriarChamadoInput.cs`. **Tipo:** record `CriarChamadoInput`. **Propriedades/linhas:** 3–8.

```csharp
public record CriarChamadoInput(
    string Produto,
    string Categoria,
    string MensagemInicial,
    string? Titulo = null,
    string? Descricao = null);
```

Não há identificador, nome ou e-mail do usuário, nem identificador/nome do grupo. Não há atributos de validação ou armazenamento de propriedades extras nesse record. `ChamadosController.CriarChamado`, arquivo `API/Controllers/ChamadosController.cs`, linhas 43–46, recebe esse tipo e o repassa diretamente; não lê o corpo bruto ou identidade separadamente.

`Program.cs`, classe `Program`, linhas 27–29, usa JSON de controllers com conversor de enum, sem configurar rejeição de membros não mapeados. Na configuração em uso, propriedades JSON desconhecidas são ignoradas na desserialização; `[ApiController]` não transforma esses campos em identidade. Não foram encontrados `JsonExtensionData`, `UnmappedMemberHandling` ou binding alternativo de identidade nos fontes pesquisados. A confirmação empírica disponível é RF01-08: os formatos aninhado e plano recebem 201 e não controlam associação. Essa conclusão não presume que qualquer formato concebível tenha sido exercitado nem atribui nomes JSON oficiais à v3.

**Validação manual:** `APP/UseCases/CriarChamadoUseCase.cs`, classe `CriarChamadoUseCase`, método `Handle`, linhas 32–45, só valida `input.Produto`, `input.Categoria` e `input.MensagemInicial`. O controller não acrescenta validação manual (43–46). Portanto, enviar, alterar ou omitir as propriedades extras de identidade não altera o input útil do caso de uso.

**Relação com QA e certeza:** RF01-08 e RF01-13 demonstram identidade do corpo sem efeito; RF01-09/10 demonstram omissão aceita. A ausência de contrato e sua consequência nesses testes são confirmadas. A causa que determina especificamente os valores 4/3 é C3.

### C3 — Provider simulado registrado globalmente determina IDs persistidos

**CAUSA CONFIRMADA.**

| Arquivo e classe | Método/propriedade e linhas | Trecho relevante |
|---|---|---|
| `API/Program.cs`, `Program` | Registro de DI, 93–95 | `builder.Services.AddScoped<ICurrentUser, MockCurrentUserProvider>();` |
| `API/Providers/MockCurrentUserProvider.cs`, `MockCurrentUserProvider` | Constantes, 13–14; contexto, 17–25 | `private const int UsuarioIdMock = 4;` / `private const int GrupoEmpresaIdMock = 3;` |
| Mesmo arquivo/classe | `IsAutenticado`, 32; `UsuarioAtual`, 34–49 | `public bool IsAutenticado => true;` / `return _usuarioMock;` |
| `APP/UseCases/CriarChamadoUseCase.cs`, `CriarChamadoUseCase` | `Handle`, 47 e 55–64 | `var usuarioAtual = _currentUser.UsuarioAtual;` / `usuarioAtual.UsuarioIdInterno` / `usuarioAtual.GrupoEmpresaIdInterno` |
| `DOM/Entities/Chamado.cs`, `Chamado` | Construtor, 71–74 | `UsuarioId = usuarioId;` / `GrupoEmpresaId = grupoEmpresaId;` |

O provider ainda grava esse mesmo contexto em `HttpContext.Items` (linhas 38–45), sem ler a identidade enviada pelo portal. O caso de uso não consulta `IsAutenticado`; obtém diretamente `UsuarioAtual`. Sua linha 64 executa `chamado.AdicionarInteracao(usuarioAtual.UsuarioIdInterno, ...)`, determinando também o autor 4 da interação inicial. O mapeamento `InteracaoConfiguration.Configure`, linhas 18–20, persiste esse ID em `autor_id`.

`ICurrentUser` é uma abstração; o comportamento fixo vem da implementação registrada. `API/Providers/JwtCurrentUserProvider.cs`, classe `JwtCurrentUserProvider`, propriedades `IsAutenticado`/`UsuarioAtual`, linhas 19–26, constitui alternativa baseada em contexto previamente provisionado, mas seu registro está comentado em `Program.cs`, linha 94. Ela não é um caminho de identidade do corpo e não está ativa.

**Relação com QA:** RF01-01 envia 61001/71001, mas cria o chamado 14, código `SA-084799423`, com 4/3. RF01-08 testa dois formatos, ambos 4/3; RF01-13 alterna clientes A/B sem alterar vínculo; RF01-14 não preserva 94001/95001; INT-05 deriva a falha de separação entre clientes. O snapshot final confirma os 35 chamados com 4/3 e os 35 autores com 4. Código e evidências coincidem diretamente. Não foi encontrado caminho ativo alternativo de entrada da identidade do portal nesse endpoint.

## 6. Investigação NC-03

### C4 — Provisionamento existente desconectado da abertura atual

**CAUSA CONFIRMADA.** Há serviço de criação/atualização de usuário e criação de grupo no projeto. A falha não é inexistência absoluta de provisionamento; é sua ausência do caminho ativo, somada às limitações do serviço existente.

**Pontos de evidência:**

| Arquivo e classe/interface | Método e linhas | Trecho relevante e significado |
|---|---|---|
| `APP/Ports/IUserProvisioningService.cs`, `IUserProvisioningService` | `ProvisionAsync`, 6–8 | Declara `Task<ProvisioningResult> ProvisionAsync(PortalUserContext usuario, ...)`. |
| `APP/DependencyInjection.cs`, `DependencyInjection` | `AddApplication`, 10–13 | `services.AddScoped<IUserProvisioningService, UserProvisioningService>();`: serviço registrado. |
| `APP/Services/UserProvisioningService.cs`, `UserProvisioningService` | `ProvisionAsync`, 32–49 | Consulta cache e chama `ProvisionarEmEscopoAsync(...)` em novo escopo. |
| Mesmo arquivo/classe | `ProvisionarEmEscopoAsync`, 60–90 | `grupoRepository.GetByCodigoExternoAsync(...)`; cria grupo ausente (72–74), salva para obter ID (80–82), consulta usuário por código externo (85) e cria ausente (88–90). |
| Mesmo arquivo/classe | `ProvisionarEmEscopoAsync`, 94–130 | Atualiza grupo do usuário, nome, e-mail e papel, registra auditoria e salva. Ex.: `usuarioAtual.AlterarNome(usuario.Nome);` (105). |
| `API/Authentication/AuthenticationSetup.cs`, `AuthenticationSetup` | `AddSsoAuthentication`, evento `OnTokenValidated`, 125–153 | `PortalIdentityClaimsReader.Ler(...)` e `await provisioning.ProvisionAsync(contextoExterno, ...)`: entrada vem das claims JWT. Esse evento depende da autenticação desativada em C1. |
| `APP/UseCases/CriarChamadoUseCase.cs`, `CriarChamadoUseCase` | Construtor 18–27 e `Handle` 30–69 | Dependências são `ICurrentUser`, SLA, chamado e unit of work; não há `IUserProvisioningService`, repositório de usuário/grupo ou chamada de sincronização. |

**Sequência real:** validar campos do chamado → obter contexto simulado → procurar SLA → gerar código → construir chamado e interação com 4/3 → adicionar agregado → salvar. Não há consulta de existência nem upsert de usuário/grupo nessa sequência. Sua existência prévia é uma dependência referencial imposta na gravação pelas FKs, sem tratamento de negócio anterior.

**Abrangência da busca:** foram pesquisadas declarações e chamadas de `ProvisionAsync`, `IUserProvisioningService`, `Upsert`, `Usuario.Criar`, `GrupoEmpresa.Criar` e `AlterarNome` em todos os fontes de `src/backend/src`, excluindo artefatos `bin/obj`; foram lidos serviço, interface, DI, providers e repositórios. A chamada de produção a `ProvisionAsync` localizada está no evento JWT. Os repositórios `UsuarioRepository` e `GrupoEmpresaRepository` oferecem consultas e `AddAsync`, não um upsert autônomo oculto: métodos de código externo e inserção em `INF/Repositories/UsuarioRepository.cs`, 35–36/49–50, e `INF/Repositories/GrupoEmpresaRepository.cs`, 20–24; interfaces correspondentes em `APP/Ports/IUsuarioRepository.cs`, 15–21, e `IGrupoEmpresaRepository.cs`, 7–11.

O cadastro separado também foi verificado: `APP/UseCases/CadastrarUsuarioUseCase.cs`, classe `CadastrarUsuarioUseCase`, método `Handle`, linhas 43–55, exige grupo existente, rejeita e-mail repetido e cria usuário por `Usuario.Criar(...)`; não é upsert de usuário/grupo na abertura e não é chamado por `CriarChamadoUseCase`. O seeder `INF/Persistence/DevelopmentDbSeeder.cs`, classe `DevelopmentDbSeeder`, `StartAsync`, linhas 19–24, retorna fora de Development; não substitui sincronização por requisição. O QA registra ambiente Production em `api.log`, linha 11.

**Limitação confirmada do ramo inativo, sem atribuí-la à execução histórica:** `UserProvisioningService.ProvisionarEmEscopoAsync`, linhas 69–85, só aplica `usuario.NomeGrupo` ao criar um grupo novo. Não há ramo para `grupo.AlterarNome(...)` quando ele já existe, embora `DOM/Entities/GrupoEmpresa.cs`, classe `GrupoEmpresa`, método `AlterarNome`, linhas 34–41, disponibilize essa operação. A busca de chamadas confirma uso no construtor da entidade, não atualização de grupo existente no serviço. Assim, simplesmente reconectar o serviço ainda deixaria a atualização de nome do grupo incompleta. RF10-06 é compatível com a lacuna, mas sua causa executada é a ausência de chamada ao serviço, e não esse ramo inativo.

**Relação com QA:** RF10-03 envia usuário novo 61091 em grupo 71001 existente, recebe 201 e só insere chamado/interação. RF10-04 envia `QA V3 A Atualizado`, mas usuário 61001 mantém `QA V3 A`; RF10-05 envia `a-atualizado@qa.example.invalid`, mas mantém `a@qa.example.invalid`; RF10-06 envia `QA V3 Grupo A Atualizado`, mas grupo 71001 mantém `QA V3 Grupo A`. RF10-10 envia novos IDs 61092/71092 sem criá-los. Os snapshots/diferenças dos respectivos JSON confirmam ausência de alterações em usuário/grupo. Grau de certeza: confirmado para ausência de sincronização no fluxo ativo.

### Consequência de C3/C4 — FK que produziu SQLSTATE 23503

Em [RF10-01](qa-v3-rf01-rf10-20261103/RF10-01.json), o corpo contém usuário 61090/grupo 71090; o snapshot anterior tem usuários 2301/61001/61002/61003 e grupos 3301/71001/71002, sem 4/3. O fluxo tenta salvar 4/3, sem criar as entidades solicitadas e sem verificar as referências fixas.

**Código:** `CriarChamadoUseCase.Handle`, linhas 47, 55–67; `MockCurrentUserProvider`, constantes 13–14; `ChamadoConfiguration.Configure`, linhas 99–102:

```csharp
builder.HasOne(c => c.GrupoEmpresa)
    .WithMany(g => g.Chamados)
    .HasForeignKey(c => c.GrupoEmpresaId)
    .OnDelete(DeleteBehavior.NoAction);
```

**Evidência precisa:** `qa-v3-rf01-rf10-20261103/api.log`, linhas 44, 59–64, identifica `SqlState: 23503` e `ConstraintName: FK_chamado_grupo_empresa_grupo_empresa_id`: referência de `chamado.grupo_empresa_id` a `grupo_empresa.id`. É a FK do grupo que efetivamente falhou, não uma FK de usuário inferida. A ausência de usuário 4 também tornaria inválidas as referências a ele, mas não foi a constraint reportada nessa falha.

`ExceptionHandlingMiddleware.HandleExceptionAsync`, linhas 32–45, não possui ramo para esse erro de persistência e usa 500. O JSON RF10-01 tem diferenças vazias em todas as tabelas; não se observou chamado ou entidade parcial persistida. A fixture 4/3 foi adicionada pelo QA depois dessa falha para permitir continuar a bateria, conforme `RELATORIO.md` e `compatibility-fixture.json`; não foi upsert da aplicação. Isso explica o contraste entre 500 inicial e 201 posteriores sem correção do software. Classificação: consequência confirmada de C3/C4, sem contagem como nova causa independente.

### C5 — Estratégia de IDs internos gerados e códigos externos separada dos IDs reais do portal

**CAUSA CONFIRMADA como incompatibilidade da estratégia implementada com §§2.5/6.2.** Não é explicação alternativa para a gravação 4/3 dos testes, pois o serviço em que ocorre essa estratégia não foi executado.

| Arquivo e classe | Método/propriedade e linhas | Trecho e evidência |
|---|---|---|
| `DOM/Entities/Usuario.cs`, `Usuario` | `Id`/`CodigoExterno`, 8–10; `Criar`, 44–51; `AtribuirCodigoExterno`, 85–92 | `public int Id { get; private set; }` e `public string? CodigoExterno { get; private set; }`; criação não recebe ID do portal. |
| `DOM/Entities/GrupoEmpresa.cs`, `GrupoEmpresa` | `Id`/`CodigoExterno`, 5–7; `Criar`, 32; `AtribuirCodigoExterno`, 59–66 | Mesmo desdobramento de ID inteiro interno e código externo string; criação recebe somente nome. |
| `APP/Services/UserProvisioningService.cs`, `UserProvisioningService` | `ProvisionarEmEscopoAsync`, 69–89 e 130 | `grupo = GrupoEmpresa.Criar(usuario.NomeGrupo);` / `grupo.AtribuirCodigoExterno(usuario.CodigoExternoGrupo);` / `return new ProvisioningResult(usuarioAtual.Id, grupo.Id);` |
| `INF/Migrations/20260915173343_InitialCreate.cs`, `InitialCreate` | `Up`, 15–25 e 45–50 | IDs de grupo e usuário têm `NpgsqlValueGenerationStrategy.IdentityByDefaultColumn`. |
| `INF/Migrations/20260919141706_AddPortalExternalId.cs`, `AddPortalExternalId` | `Up`, 15–25 e 43–53 | Acrescenta `codigo_externo` nas duas tabelas com índices únicos, preservando PK interna. |
| `INF/Migrations/SupportAtosDbContextModelSnapshot.cs`, `SupportAtosDbContextModelSnapshot` | `BuildModel`, 175–186 e 386–401 | `ValueGeneratedOnAdd()` / `UseIdentityByDefaultColumn(...)` nos IDs de grupo e usuário; código externo continua separado. |

Os mapeamentos atuais `UsuarioConfiguration.Configure` (13–16, 31–36) e `GrupoEmpresaConfiguration.Configure` (13–16, 34–39) corroboram PK `id` e coluna `codigo_externo` distinta. A migration `AlinharAoSqlOficial` foi consultada no escopo pertinente; o snapshot posterior continua com a estratégia acima.

O serviço busca por código externo e deixa o banco atribuir IDs, inclusive com salvamento antecipado para obter o ID do grupo (`UserProvisioningService`, 78–82). Manter o ID do portal em `codigo_externo` não satisfaz a regra de usá-lo como `id` real. A identidade anterior baseada em claims também produz contexto externo com IDs internos inicialmente zero (`AuthenticationSetup`, 130–137) e depois recebe os IDs retornados pelo serviço (150–153).

**O banco não torna impossível inserir IDs explícitos.** `IdentityByDefaultColumn` permite valores explícitos; as fixtures históricas usam IDs numéricos definidos pelo QA. A incompatibilidade confirmada é a estratégia automática e a API de criação das entidades, que não recebem/atribuem o ID do portal. Não se afirma impedimento absoluto do PostgreSQL. O domínio usa `int`; a v3 não especifica tipo/intervalo dos identificadores, portanto eventual incompatibilidade com IDs não numéricos ou fora do intervalo permanece uma questão de contrato, sem causa adicional demonstrada.

**Relação com QA:** RF01-14 distingue IDs reais 2301/3301 dos códigos externos 94001/95001 e não aceita equivalência entre ambos; o chamado efetivo ficou 4/3 por C3. RF10-10 exige criação real de 61092/71092 e não a observa por C2/C4. C5 confirma que reativar o provisionamento anterior também não garante a preservação requerida; não se declara que ele tenha gerado IDs novos durante essa bateria.

## 7. Investigação NC-04

**Causas confirmadas compartilhadas: C2 e C3.** Não se adiciona uma causa distinta só porque a manifestação aparece em outros cenários.

`CriarChamadoInput` (arquivo `APP/DTOs/CriarChamadoInput.cs`, record homônimo, linhas 3–8) não declara identidade obrigatória nem atributos correspondentes. `ChamadosController.CriarChamado` (`API/Controllers/ChamadosController.cs`, 43–46) apenas repassa o input. `CriarChamadoUseCase.Handle` (`APP/UseCases/CriarChamadoUseCase.cs`, 32–47) valida os campos do chamado e em seguida usa `_currentUser.UsuarioAtual`; não verifica se usuário/grupo foram enviados no corpo.

O domínio tem validação de identidade, mas ela se aplica aos IDs que recebe, não à presença dos dados na requisição. Em `DOM/Entities/Chamado.cs`, classe `Chamado`, método `Criar`, linhas 102–109:

```csharp
if (usuarioId <= 0)
{
    throw new Exceptions.DomainException("O usuário é obrigatório.");
}
```

A verificação análoga do grupo também exige apenas ID positivo. Como o provider retorna 4 e 3 (`MockCurrentUserProvider`, 13–25, 48), essas condições são satisfeitas mesmo sem identidade no corpo. Não há como essas verificações distinguirem uma identidade recebida do portal de valores simulados.

**Relação com QA:** RF01-09 omite `usuario` e cria chamado 19, `SA-084016371`, com 4/3; RF01-10 omite `grupoEmpresa` e cria chamado 20, `SA-966896419`, também com 4/3. Cada JSON registra 201, um chamado e uma interação inseridos. Grau de certeza: confirmado pela ausência de validação de entrada somada à substituição pela identidade fixa.

**Mudança conceitual necessária:** tornar os dados de identidade parte explícita do contrato da abertura; validar presença e conteúdo antes de criar o agregado; após autenticar o backend do portal, sincronizar e usar a identidade recebida. A resposta para identidade ausente deve ser acordada e documentada: a v3 não impõe especificamente HTTP 400 nesse caso. Nenhuma dessas mudanças foi implementada nesta investigação.

## 8. Relação entre causas

| Causa | NCs relacionadas | Dependência ou papel |
|---|---|---|
| C1 — Autenticação desativada | NC-01; participa da desconexão de C4 | Permite alcançar a ação sem validar o backend do portal. É um defeito de autenticação independente da escolha de identidade, embora a desativação do evento JWT também retire o provisionamento anterior do caminho. |
| C2 — Identidade ausente do contrato/validação | NC-02, NC-03, NC-04 | Dados enviados não chegam ao processamento; omissões não são detectadas. |
| C3 — Provider fixo 4/3 | NC-02, NC-04; FK de NC-03 | Determina os IDs gravados e substitui a identidade ausente. Sem referências 4/3 existentes, a gravação falha. |
| C4 — Provisionamento fora do fluxo | NC-03; agrava NC-02 | Não cria/atualiza usuário/grupo nem resolve sua associação na abertura. A presença do serviço registrado não significa sua execução. |
| C5 — IDs internos/códigos externos | NC-03 e preservação de IDs em NC-02 | Incompatibilidade adicional do provisionamento inativo; exige revisão mesmo depois de reconectá-lo. |

NC-02 e NC-04 são duas manifestações do mesmo conjunto C2/C3: informar outra identidade ou não informá-la termina no mesmo contexto fixo. NC-02 e NC-03 também compartilham a ausência de entrada de identidade e de sincronização no caminho de criação. A FK de RF10-01 é consequência da tentativa de persistir referências fixas inexistentes, não evidência de tentativa malsucedida de inserir os IDs do portal.

As FKs cumprem a integridade estrutural e não verificam se a identidade é a correta para o negócio: após cadastrar 4/3, todos os INSERTs podem ser referencialmente válidos e ainda violar RF01/RF10. Por isso os resultados positivos de integridade/não duplicação da bateria não anulam as falhas de associação ou demonstram upsert.

## 9. Matriz de rastreabilidade

| Não conformidade | Exigência v3 | Testes de QA | Arquivo/método | Causa identificada | Grau de certeza |
|---|---|---|---|---|---|
| NC-01 | §6.2; RF10; §8: chave obrigatória, ausente/inválida → 401 | AUTH-02/03/04/05/06/08 | `API/Program.cs`, inicialização 78–95/pipeline 108–113; `ChamadosController`, atributos 10–14 e `CriarChamado` 43–46; `AuthenticationSetup.AddSsoAuthentication` 172; `ApiKeyAuthenticationHandler.HandleAuthenticateAsync` 29–45 | C1: validador existente sem ativação nem exigência no endpoint | CAUSA CONFIRMADA |
| NC-02 | §§2.1/6.2; RF01: associar identidade do corpo | RF01-01/08/13; INT-05 | `APP/DTOs/CriarChamadoInput.cs`, propriedades 3–8; `CriarChamadoUseCase.Handle` 47–64; `MockCurrentUserProvider`, constantes 13–25 e `UsuarioAtual` 34–49 | C2/C3: contrato não recebe identidade e provider fornece 4/3 | CAUSA CONFIRMADA |
| NC-03 | §§2.5/6.2; RF10; §8: sincronizar sem cadastro prévio | RF10-01/03/04/05/06/10 | `CriarChamadoUseCase.Handle` 30–69; `UserProvisioningService.ProvisionAsync` 32–49 e `ProvisionarEmEscopoAsync` 60–130; `AuthenticationSetup`, evento `OnTokenValidated` 125–153 | C4, com C2: serviço de provisionamento não chamado pela abertura | CAUSA CONFIRMADA |
| NC-03 — falha FK | §§2.5/6.2: criar entidades necessárias automaticamente | RF10-01 | `MockCurrentUserProvider`, constantes 13–14; `CriarChamadoUseCase.Handle` 55–67; `ChamadoConfiguration.Configure` 99–102; `ExceptionHandlingMiddleware.HandleExceptionAsync` 32–45 | Consequência de C3/C4: grupo 3 inexistente, FK `FK_chamado_grupo_empresa_grupo_empresa_id`, erro convertido em 500 | CONFIRMADA, consequência sem contagem adicional |
| NC-02/NC-03 — IDs reais | §§2.5/6.2: ID do portal como ID da entidade | RF01-14; RF10-10 | `Usuario.Id/CodigoExterno` 8–10; `GrupoEmpresa.Id/CodigoExterno` 5–7; `UserProvisioningService.ProvisionarEmEscopoAsync` 69–89/130; `SupportAtosDbContextModelSnapshot.BuildModel` 175–186/386–401 | C5: estratégia existente gera PK interna e mantém código externo; C3/C4 explicam o resultado efetivamente executado | CAUSA CONFIRMADA da incompatibilidade; ramo inativo nos testes |
| NC-04 | §§2.1/6.2: identidade no corpo, sem HTTP de erro específico fixado | RF01-09/10 | `CriarChamadoInput`, propriedades 3–8; `CriarChamadoUseCase.Handle` 32–47; `Chamado.Criar` 102–109; `MockCurrentUserProvider.UsuarioAtual` 34–49 | C2/C3: ausência não validada e IDs simulados positivos satisfazem o domínio | CAUSA CONFIRMADA |

Os caminhos abreviados são definidos na seção 2; classes, métodos, linhas e trechos completos que sustentam cada causa constam nas seções 4–7. Linhas de evidência histórica não substituem as linhas dos fontes.

## 10. Recomendações técnicas

Estas são direções de correção propostas, sem implementação ou alteração do sistema:

1. Aplicar autenticação servidor-a-servidor por API Key ao endpoint de abertura, exigindo chave válida antes de qualquer operação de negócio ou persistência. Garantir 401 para chave ausente/inválida e impedir que JWT isolado ou acompanhado de chave inválida substitua essa exigência. Reaproveitar o comparador existente pode ser possível, com revisão do registro, challenge e política; simplesmente reativar SSO/JWT não atende à v3.
2. Definir com o portal os nomes e a estrutura JSON da identidade: usuário com ID/nome/e-mail e grupo com ID/nome. Formalizar o contrato e sua validação; não promover os dois formatos do QA a contrato oficial sem acordo. Documentar também a resposta à ausência de identidade.
3. Retirar a identidade fixa do fluxo de integração real e determinar a associação exclusivamente a partir da identidade recebida do backend autenticado. Usar o mesmo usuário sincronizado como autor da interação inicial.
4. Integrar sincronização de grupo e usuário ao caso de abertura, antes da construção/persistência das referências. Revisar atualização de nome do grupo existente, nome/e-mail do usuário e seu vínculo com o grupo; a capacidade parcial do serviço JWT não garante cobertura de RF10.
5. Revisar entidades, factories e estratégia de persistência para atribuir os IDs reais do portal, em vez de apenas armazená-los em `codigo_externo`. Planejar compatibilidade dos dados existentes, colisões e domínio dos identificadores antes de eventual migração; não assumir que `IdentityByDefault` impede IDs explícitos.
6. Definir uma unidade consistente de gravação para sincronização e chamado, inclusive falhas e concorrência. O serviço anterior salva em escopo separado e pode salvar grupo antes do usuário; sua simples conexão não demonstra atomicidade de ponta a ponta. Nenhuma falha parcial desse ramo foi observada ou testada nesta investigação.
7. Após avaliação de QA e autorização para uma etapa futura de correção/validação, revisar Swagger e critérios dos cenários afetados para refletir a v3, distinguindo autenticação, identidade, upsert e integridade referencial. Esta investigação não executa essa etapa.

## 11. Limitações

- Não houve nova execução. Os resultados HTTP/SQL são históricos; o estado de um ambiente atualmente em execução não foi consultado. A comparação Git confirma igualdade dos fontes, não identidade de um deployment ou de sua configuração efetiva.
- Não foram usados a v2, requisitos JWT anteriores ou expectativas de status inventadas. A v3 não define nomes JSON, formato/tipo completo dos IDs nem HTTP obrigatório para identidade ausente. Essas lacunas de contrato não desfazem os mecanismos demonstrados de ignorar identidade, fixar 4/3 e deixar de sincronizar.
- A paginação indicada foi fornecida pelo solicitante; a leitura OOXML confirma conteúdo e tabelas, sem nova conferência visual das páginas. Nenhum documento intermediário foi criado.
- As buscas por componentes ausentes foram delimitadas aos fontes disponíveis do backend, registros e fluxo relacionados, com `rg` e leitura dos arquivos. Não se afirma inexistência universal em sistemas externos, bibliotecas não fornecidas ou outros deployments. No material inspecionado, não foi localizada proteção alternativa ativa ou upsert de identidade do corpo no endpoint.
- O serviço de provisionamento existe e não foi executado nesta análise. Suas limitações de IDs e nome do grupo são demonstradas estaticamente; não se atribuem a ele operações que o QA não executou. Comportamentos de concorrência, cache, atomicidade entre escopos ou eventual reativação do serviço não foram validados funcionalmente.
- A constraint efetivamente reportada em RF10-01 é a do grupo. Não se afirma que o PostgreSQL também tenha reportado FK do usuário nessa execução, embora o usuário 4 também estivesse ausente.
- Não há evidência técnica insuficiente para classificar qualquer das cinco causas C1–C5 como provável ou não determinada. Questões abertas de contrato/deployment e consequências não exercitadas são limites de alcance, não causas adicionais arbitrariamente contadas.
- A investigação criou somente este Markdown. Não alterou fontes, migrations, configuração, evidências anteriores, banco, branches ou commits; não iniciou serviços, não instalou dependências e não abriu Issues/PRs.

## 12. Conclusão

**NC-01:** requisições sem chave válida alcançam a criação porque o registro da autenticação, os middlewares e a proteção da controller estão desativados. Existe comparador de API Key, mas não participa do caminho executado: C1 confirmada.

**NC-02:** o DTO não transporta identidade e o caso de uso recebe sempre o contexto simulado 4/3; esses valores determinam tanto o chamado quanto o autor da interação inicial: C2/C3 confirmadas.

**NC-03:** o provisionamento registrado foi ligado ao evento JWT desativado e não é chamado pela abertura; por isso não cria/atualiza usuário/grupo do corpo. Sem 4/3 preexistentes, a referência ao grupo 3 provoca a FK observada e o tratamento genérico retorna 500: C4 e consequência de C3 confirmadas. A estratégia de IDs internos gerados/códigos externos é uma incompatibilidade adicional confirmada, C5, que também precisa ser revista para cumprir a v3, sem atribuí-la ao caminho executado no QA.

**NC-04:** a omissão de identidade não invalida o contrato recebido e os valores positivos do mock satisfazem as validações do domínio, permitindo 201: C2/C3 confirmadas, compartilhadas com NC-02.

Total de causas distintas: **5 confirmadas, 0 prováveis, 0 não determinadas**. Os fontes atuais relevantes coincidem com a revisão testada; as conclusões se sustentam na combinação do código e das evidências anteriores, sem novos testes. A investigação está encerrada e aguarda avaliação da equipe de QA antes de qualquer outra ação.
