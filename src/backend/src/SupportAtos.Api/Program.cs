using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi;
using SupportAtos.Api.Authentication;
using SupportAtos.Api.Middleware;
using SupportAtos.Api.Providers;
using SupportAtos.Application;
using SupportAtos.Application.Abstractions;
using SupportAtos.Infrastructure;

var builder = WebApplication.CreateBuilder(args.Where(arg => arg != "--check-dev-auth").ToArray());

if (args.Contains("--check-dev-auth"))
{
    if (!builder.Environment.IsDevelopment())
    {
        Console.Error.WriteLine("O diagnóstico --check-dev-auth exige ambiente Development.");
        Environment.ExitCode = 1;
        return;
    }

    Environment.ExitCode = DevAuthenticationDiagnostic.Executar(
        builder.Configuration, builder.Environment.ContentRootPath, Console.Out);
    return;
}

builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Token JWT (RS256) emitido pelo portal. Rotas de portal exigem este scheme."
    });
    options.AddSecurityDefinition("ApiKey", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.ApiKey,
        In = ParameterLocation.Header,
        Name = AuthenticationSetup.ApiKeyHeaderName,
        Description = "API key máquina-a-máquina (ex.: n8n). Só atende endpoints de webhook; rotas de portal retornam 401/403."
    });
    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = new List<string>()
    });
});

builder.Services.AddProblemDetails();
builder.Services.AddHttpContextAccessor();
builder.Services.AddMemoryCache();
builder.Services.AddHealthChecks();

var origensFrontend = builder.Configuration.GetSection("Cors:AllowedOrigins").GetChildren()
    .Select(origem => origem.Value)
    .Where(origem => !string.IsNullOrWhiteSpace(origem))
    .ToArray();
if (origensFrontend.Length == 0)
{
    origensFrontend = new[] { "http://localhost:5173" };
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDev", policy =>
        policy.WithOrigins(origensFrontend!)
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
// [AUTH-DESATIVADA] Validação JWT/SSO desativada temporariamente para conectar o frontend sem token.
// Reative descomentando a linha abaixo e o bloco de autorização/middlewares ao final do arquivo.
// builder.Services.AddSsoAuthentication(builder.Configuration);

// [AUTH-DESATIVADA] Políticas de autorização (incluindo fallback que exigia usuário autenticado) desativadas.
// builder.Services.AddAuthorization(options =>
// {
//     options.AddPolicy("UsuarioPortal", policy =>
//         policy.RequireAuthenticatedUser().AddRequirements(new UsuarioPortalRequirement()));
//     options.FallbackPolicy = new AuthorizationPolicyBuilder()
//         .RequireAuthenticatedUser()
//         .Build();
// });
// builder.Services.AddScoped<IAuthorizationHandler, UsuarioPortalAuthorizationHandler>();

// [AUTH-DESATIVADA] Usuário real vinha do JWT provisionado; agora usamos um mock local.
// builder.Services.AddScoped<ICurrentUser, JwtCurrentUserProvider>();
builder.Services.AddScoped<ICurrentUser, MockCurrentUserProvider>();

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors("FrontendDev");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// [AUTH-DESATIVADA] Middlewares de autenticação/autorização desativados temporariamente.
// Reative junto com AddSsoAuthentication/AddAuthorization e os atributos [Authorize] dos controllers.
// app.UseAuthentication();
// app.UseAuthorization();
app.MapHealthChecks("/health").AllowAnonymous();
app.MapControllers();

app.Run();

public partial class Program;
