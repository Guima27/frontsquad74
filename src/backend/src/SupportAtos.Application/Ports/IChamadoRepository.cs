using SupportAtos.Domain.Entities;

namespace SupportAtos.Application.Ports;

public interface IChamadoRepository
{
    Task<Chamado?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<Chamado?> GetByCodigoPublicoAsync(string codigoPublico, CancellationToken cancellationToken = default);

    Task<Chamado?> GetByCodigoPublicoComHistoricoAsync(string codigoPublico, CancellationToken cancellationToken = default);

    Task<bool> CodigoPublicoExisteAsync(string codigoPublico, CancellationToken cancellationToken = default);

    Task AddAsync(Chamado chamado, CancellationToken cancellationToken = default);
}