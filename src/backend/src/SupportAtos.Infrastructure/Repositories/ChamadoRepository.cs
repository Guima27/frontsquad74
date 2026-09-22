using Microsoft.EntityFrameworkCore;
using SupportAtos.Application.Ports;
using SupportAtos.Domain.Entities;
using SupportAtos.Infrastructure.Persistence;

namespace SupportAtos.Infrastructure.Repositories;

public class ChamadoRepository : IChamadoRepository
{
    private readonly SupportAtosDbContext _context;

    public ChamadoRepository(SupportAtosDbContext context)
    {
        _context = context;
    }

    public Task<Chamado?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => _context.Chamados.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

    public Task<Chamado?> GetByCodigoPublicoAsync(string codigoPublico, CancellationToken cancellationToken = default)
        => _context.Chamados.FirstOrDefaultAsync(c => c.CodigoPublico == codigoPublico, cancellationToken);

    public Task<Chamado?> GetByCodigoPublicoComHistoricoAsync(string codigoPublico, CancellationToken cancellationToken = default)
        => _context.Chamados
            .Include(c => c.Interacoes)
                .ThenInclude(i => i.Anexos)
            .FirstOrDefaultAsync(c => c.CodigoPublico == codigoPublico, cancellationToken);

    public Task<bool> CodigoPublicoExisteAsync(string codigoPublico, CancellationToken cancellationToken = default)
        => _context.Chamados.AnyAsync(c => c.CodigoPublico == codigoPublico, cancellationToken);

    public async Task AddAsync(Chamado chamado, CancellationToken cancellationToken = default)
        => await _context.Chamados.AddAsync(chamado, cancellationToken);
}