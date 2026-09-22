using SupportAtos.Domain.Enums;

namespace SupportAtos.Domain.Entities;

public class Chamado
{
    public int Id { get; private set; }

    public string CodigoPublico { get; private set; } = string.Empty;

    public int UsuarioId { get; private set; }

    public Usuario? Usuario { get; private set; }

    public int GrupoEmpresaId { get; private set; }

    public GrupoEmpresa? GrupoEmpresa { get; private set; }

    public int SlaCategoriaId { get; private set; }

    public SlaCategoria? SlaCategoria { get; private set; }

    public string Produto { get; private set; } = string.Empty;

    public string Categoria { get; private set; } = string.Empty;

    public StatusChamado Status { get; private set; }

    public Prioridade Prioridade { get; private set; }

    public DateTime SlaPrazo { get; private set; }

    public DateTime CriadoEm { get; private set; }

    public DateTime? FechadoEm { get; private set; }

    public ICollection<Interacao> Interacoes { get; private set; } = new List<Interacao>();

    public ICollection<LogAuditoria> LogsAuditoria { get; private set; } = new List<LogAuditoria>();

    protected Chamado()
    {
    }

    private Chamado(
        string codigoPublico,
        int usuarioId,
        int grupoEmpresaId,
        SlaCategoria slaCategoria,
        string produto,
        string categoria,
        DateTime criadoEm)
    {
        CodigoPublico = codigoPublico;
        UsuarioId = usuarioId;
        GrupoEmpresaId = grupoEmpresaId;
        SlaCategoriaId = slaCategoria.Id;
        Produto = produto;
        Categoria = categoria;
        Status = StatusChamado.Aberto;
        Prioridade = slaCategoria.Prioridade;
        CriadoEm = criadoEm;
        SlaPrazo = criadoEm.AddHours(slaCategoria.TempoResolucao);
    }

    public static Chamado Criar(
        string codigoPublico,
        int usuarioId,
        int grupoEmpresaId,
        SlaCategoria slaCategoria,
        string produto,
        string categoria)
    {
        if (string.IsNullOrWhiteSpace(codigoPublico))
        {
            throw new Exceptions.DomainException("O código público é obrigatório.");
        }

        if (usuarioId <= 0)
        {
            throw new Exceptions.DomainException("O usuário é obrigatório.");
        }

        if (grupoEmpresaId <= 0)
        {
            throw new Exceptions.DomainException("O grupo de empresa é obrigatório.");
        }

        if (slaCategoria is null)
        {
            throw new Exceptions.DomainException("A categoria de SLA é obrigatória.");
        }

        if (string.IsNullOrWhiteSpace(produto))
        {
            throw new Exceptions.DomainException("O produto é obrigatório.");
        }

        if (string.IsNullOrWhiteSpace(categoria))
        {
            throw new Exceptions.DomainException("A categoria é obrigatória.");
        }

        return new Chamado(codigoPublico, usuarioId, grupoEmpresaId, slaCategoria, produto.Trim(), categoria.Trim(), DateTime.UtcNow);
    }

    public Interacao AdicionarInteracao(int usuarioId, TipoInteracao tipo, string mensagem, DateTime criadoEm)
    {
        if (usuarioId <= 0)
        {
            throw new Exceptions.DomainException("O usuário da interação é obrigatório.");
        }

        if (string.IsNullOrWhiteSpace(mensagem))
        {
            throw new Exceptions.DomainException("A mensagem da interação é obrigatória.");
        }

        var interacao = Interacao.Criar(this, usuarioId, tipo, mensagem, criadoEm);
        Interacoes.Add(interacao);
        return interacao;
    }

    public void MudarStatus(StatusChamado novoStatus, DateTime agora)
    {
        if (Status == novoStatus)
        {
            return;
        }

        var transicoesPermitidas = new Dictionary<StatusChamado, StatusChamado[]>
        {
            [StatusChamado.Aberto] = new[] { StatusChamado.EmAndamento, StatusChamado.AguardandoCliente, StatusChamado.Resolvido, StatusChamado.Fechado },
            [StatusChamado.EmAndamento] = new[] { StatusChamado.AguardandoCliente, StatusChamado.Resolvido, StatusChamado.Fechado, StatusChamado.Aberto },
            [StatusChamado.AguardandoCliente] = new[] { StatusChamado.EmAndamento, StatusChamado.Resolvido, StatusChamado.Fechado },
            [StatusChamado.Resolvido] = new[] { StatusChamado.Fechado, StatusChamado.Aberto, StatusChamado.EmAndamento },
            [StatusChamado.Fechado] = new[] { StatusChamado.Aberto }
        };

        if (!transicoesPermitidas[Status].Contains(novoStatus))
        {
            throw new Exceptions.DomainException(
                $"Transição de status inválida de '{Status}' para '{novoStatus}': {Status} não permite {novoStatus}.");
        }

        Status = novoStatus;
        FechadoEm = novoStatus == StatusChamado.Fechado ? agora : null;
    }

    public void AtribuirCodigoPublico(string codigoPublico)
    {
        if (string.IsNullOrWhiteSpace(codigoPublico))
        {
            throw new Exceptions.DomainException("O código público é obrigatório.");
        }

        CodigoPublico = codigoPublico.Trim();
    }
}