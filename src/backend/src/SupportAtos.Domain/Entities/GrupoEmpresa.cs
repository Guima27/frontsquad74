namespace SupportAtos.Domain.Entities;

public class GrupoEmpresa
{
    public int Id { get; private set; }

    public string? CodigoExterno { get; private set; }

    public string Nome { get; private set; } = string.Empty;

    public ICollection<Usuario> Usuarios { get; private set; } = new List<Usuario>();

    public ICollection<Chamado> Chamados { get; private set; } = new List<Chamado>();

    protected GrupoEmpresa()
    {
    }

    private GrupoEmpresa(string nome)
    {
        AlterarNome(nome);
    }

    public static GrupoEmpresa Criar(string nome) => new(nome);

    public void AlterarNome(string nome)
    {
        if (string.IsNullOrWhiteSpace(nome))
        {
            throw new Exceptions.DomainException("O nome do grupo de empresa é obrigatório.");
        }

        Nome = nome.Trim();
    }

    public void AtribuirCodigoExterno(string codigoExterno)
    {
        if (string.IsNullOrWhiteSpace(codigoExterno))
        {
            throw new Exceptions.DomainException("O código externo do grupo de empresa é obrigatório.");
        }

        CodigoExterno = codigoExterno.Trim();
    }
}