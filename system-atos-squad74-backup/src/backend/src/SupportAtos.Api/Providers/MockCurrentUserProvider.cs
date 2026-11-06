using SupportAtos.Api.Authentication;
using SupportAtos.Application.Abstractions;
using SupportAtos.Domain.Enums;

namespace SupportAtos.Api.Providers;

// [AUTH-DESATIVADA] Usuário mockado para permitir testar o sistema sem token.
// Motivo: autenticação JWT desativada temporariamente. Substitui o JwtCurrentUserProvider.
// Valores originais vinham das claims do JWT provisionado no OnTokenValidated.
// Para reativar: comente o registro deste provider no Program.cs e descomente JwtCurrentUserProvider.
public class MockCurrentUserProvider : ICurrentUser
{
    private const int UsuarioIdMock = 4;
    private const int GrupoEmpresaIdMock = 3;

    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly PortalUserContext _usuarioMock = new(
        UsuarioIdMock,
        GrupoEmpresaIdMock,
        "portal-admin",
        "grupo-3",
        "admin@atos.com",
        "Admin",
        "Grupo Norte",
        PapelUsuario.Admin);

    public MockCurrentUserProvider(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public bool IsAutenticado => true;

    public PortalUserContext UsuarioAtual
    {
        get
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext is not null)
            {
                httpContext.Items[PortalUserContextItems.Chave] = _usuarioMock;
                if (!httpContext.Items.ContainsKey(PortalUserContextItems.ExpiracaoToken))
                {
                    httpContext.Items[PortalUserContextItems.ExpiracaoToken] = DateTime.UtcNow.AddHours(8);
                }
            }

            return _usuarioMock;
        }
    }
}
