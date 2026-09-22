using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupportAtos.Application.DTOs;
using SupportAtos.Application.UseCases;

namespace SupportAtos.Api.Controllers;

[ApiController]
[Route("api/usuarios")]
public class UsuariosController : ControllerBase
{
    private readonly CadastrarUsuarioUseCase _cadastrarUsuarioUseCase;
    private readonly ConsultarUsuarioUseCase _consultarUsuarioUseCase;
    private readonly ListarUsuariosPorGrupoUseCase _listarUsuariosPorGrupoUseCase;

    public UsuariosController(
        CadastrarUsuarioUseCase cadastrarUsuarioUseCase,
        ConsultarUsuarioUseCase consultarUsuarioUseCase,
        ListarUsuariosPorGrupoUseCase listarUsuariosPorGrupoUseCase)
    {
        _cadastrarUsuarioUseCase = cadastrarUsuarioUseCase;
        _consultarUsuarioUseCase = consultarUsuarioUseCase;
        _listarUsuariosPorGrupoUseCase = listarUsuariosPorGrupoUseCase;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(UsuarioDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CadastrarUsuario([FromBody] CadastrarUsuarioInput input, CancellationToken cancellationToken)
    {
        var usuario = await _cadastrarUsuarioUseCase.Handle(input, cancellationToken);
        return CreatedAtAction(nameof(ConsultarUsuario), new { id = usuario.Id }, usuario);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(UsuarioDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ConsultarUsuario(int id, CancellationToken cancellationToken)
    {
        var usuario = await _consultarUsuarioUseCase.Handle(id, cancellationToken);
        return Ok(usuario);
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Supervisor,Agente")]
    [ProducesResponseType(typeof(IReadOnlyList<UsuarioDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ListarUsuariosPorGrupo([FromQuery] int grupoEmpresaId, CancellationToken cancellationToken)
    {
        var usuarios = await _listarUsuariosPorGrupoUseCase.Handle(grupoEmpresaId, cancellationToken);
        return Ok(usuarios);
    }
}