using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SupportAtos.Application.DTOs;
using SupportAtos.Application.UseCases;

namespace SupportAtos.Api.Controllers;

[ApiController]
[Authorize(Policy = "UsuarioPortal")]
[Route("api/chamados")]
public class ChamadosController : ControllerBase
{
    private readonly CriarChamadoUseCase _criarChamadoUseCase;
    private readonly ConsultarChamadoUseCase _consultarChamadoUseCase;

    public ChamadosController(CriarChamadoUseCase criarChamadoUseCase, ConsultarChamadoUseCase consultarChamadoUseCase)
    {
        _criarChamadoUseCase = criarChamadoUseCase;
        _consultarChamadoUseCase = consultarChamadoUseCase;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ChamadoDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CriarChamado([FromBody] CriarChamadoInput input, CancellationToken cancellationToken)
    {
        var chamado = await _criarChamadoUseCase.Handle(input, cancellationToken);
        return CreatedAtAction(nameof(ConsultarChamado), new { codigoPublico = chamado.CodigoPublico }, chamado);
    }

    [HttpGet("{codigoPublico}")]
    [ProducesResponseType(typeof(ChamadoDetalheDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ConsultarChamado(string codigoPublico, CancellationToken cancellationToken)
    {
        var detalhe = await _consultarChamadoUseCase.Handle(codigoPublico, cancellationToken);
        return Ok(detalhe);
    }
}