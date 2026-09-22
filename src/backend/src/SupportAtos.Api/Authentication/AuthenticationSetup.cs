using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using SupportAtos.Api.Options;
using SupportAtos.Application.Abstractions;
using SupportAtos.Application.Ports;

namespace SupportAtos.Api.Authentication;

public static class AuthenticationSetup
{
    public const string ApiKeyScheme = "ApiKey";
    public const string ApiKeyHeaderName = "X-Api-Key";

    public static IServiceCollection AddSsoAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var sso = new SsoSettings();
        configuration.GetSection("Sso").Bind(sso);
        services.Configure<SsoSettings>(configuration.GetSection("Sso"));

        if (string.IsNullOrWhiteSpace(sso.JwksUrl) && string.IsNullOrWhiteSpace(sso.PublicKeyPem))
        {
            throw new InvalidOperationException(
                "SSO não configurado: defina 'Sso:JwksUrl' (produção) ou 'Sso:PublicKeyPem' (local/testes) via user-secrets ou variáveis de ambiente.");
        }

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(jwt =>
        {
            jwt.MapInboundClaims = false;
            jwt.SaveToken = true;
            jwt.ForwardDefaultSelector = ctx =>
                ctx.Request.Headers.ContainsKey(ApiKeyHeaderName) ? ApiKeyScheme : JwtBearerDefaults.AuthenticationScheme;

            var tvp = jwt.TokenValidationParameters;
            tvp.ClockSkew = TimeSpan.FromSeconds(sso.ClockSkewSeconds);
            tvp.ValidIssuer = sso.Issuer;
            tvp.ValidAudience = sso.Audience;
            tvp.ValidAlgorithms = new[] { SecurityAlgorithms.RsaSha256 };
            tvp.NameClaimType = sso.ClaimNames.Nome;
            tvp.RoleClaimType = sso.ClaimNames.Role;
            tvp.ValidateIssuerSigningKey = true;
            tvp.ValidateIssuer = !string.IsNullOrWhiteSpace(sso.Issuer);
            tvp.ValidateAudience = !string.IsNullOrWhiteSpace(sso.Audience);
            tvp.ValidateLifetime = true;

            if (!string.IsNullOrWhiteSpace(sso.PublicKeyPem))
            {
                tvp.IssuerSigningKey = ChaveRsaDePem(sso.PublicKeyPem);
            }
            else
            {
                jwt.ConfigurationManager = new ConfigurationManager<OpenIdConnectConfiguration>(
                    sso.JwksUrl!,
                    new OpenIdConnectConfigurationRetriever(),
                    new HttpClient());

                tvp.IssuerSigningKeyResolver = (token, securityToken, kid, parameters) =>
                {
                    var configuracao = jwt.ConfigurationManager
                        .GetConfigurationAsync(CancellationToken.None).GetAwaiter().GetResult();
                    return string.IsNullOrEmpty(kid)
                        ? configuracao.SigningKeys
                        : configuracao.SigningKeys.Where(chave => chave.KeyId == kid);
                };
            }

            jwt.Events = new JwtBearerEvents
            {
                OnTokenValidated = async context =>
                {
                    var claimsPortal = PortalIdentityClaimsReader.Ler(context.Principal!, sso.ClaimNames);
                    var provisioning = context.HttpContext.RequestServices.GetRequiredService<IUserProvisioningService>();

                    var contextoExterno = new PortalUserContext(
                        0, 0,
                        claimsPortal.CodigoExternoUsuario,
                        claimsPortal.CodigoExternoGrupo,
                        claimsPortal.Email,
                        claimsPortal.Nome,
                        claimsPortal.NomeGrupo,
                        claimsPortal.Papel);

                    var resultado = await provisioning.ProvisionAsync(contextoExterno, context.HttpContext.RequestAborted);

                    var portal = contextoExterno with
                    {
                        UsuarioIdInterno = resultado.UsuarioIdInterno,
                        GrupoEmpresaIdInterno = resultado.GrupoEmpresaIdInterno
                    };

                    if (context.Principal?.Identity is ClaimsIdentity identidade)
                    {
                        foreach (var claimCargo in identidade.FindAll(sso.ClaimNames.Role).ToList())
                        {
                            identidade.RemoveClaim(claimCargo);
                        }

                        identidade.AddClaim(new Claim(sso.ClaimNames.Role, portal.Papel.ToString()));
                    }

                    context.HttpContext.Items[PortalUserContextItems.Chave] = portal;
                }
            };
        })
        .AddScheme<ApiKeyAuthenticationOptions, ApiKeyAuthenticationHandler>(ApiKeyScheme, "API key (máquina a máquina)", null);

        return services;
    }

    private static SecurityKey ChaveRsaDePem(string pem)
    {
        var rsa = RSA.Create();
        rsa.ImportFromPem(pem);
        return new RsaSecurityKey(rsa);
    }
}