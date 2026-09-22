using SupportAtos.Domain.Enums;

namespace SupportAtos.Application.DTOs;

public record ChamadoDto(
    int Id,
    string CodigoPublico,
    int UsuarioId,
    int GrupoEmpresaId,
    string Produto,
    string Categoria,
    StatusChamado Status,
    Prioridade Prioridade,
    DateTime SlaPrazo,
    DateTime CriadoEm,
    DateTime? FechadoEm);