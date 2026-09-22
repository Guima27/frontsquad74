namespace SupportAtos.Domain.Entities;

public class Anexo
{
    public int Id { get; private set; }

    public int InteracaoId { get; private set; }

    public Interacao? Interacao { get; private set; }

    public string NomeArquivo { get; private set; } = string.Empty;

    public string Url { get; private set; } = string.Empty;

    public int TamanhoBytes { get; private set; }

    protected Anexo()
    {
    }

    private Anexo(int interacaoId, string nomeArquivo, string url, int tamanhoBytes)
    {
        InteracaoId = interacaoId;
        NomeArquivo = nomeArquivo;
        Url = url;
        TamanhoBytes = tamanhoBytes;
    }

    public static Anexo Criar(Interacao interacao, string nomeArquivo, string url, int tamanhoBytes)
    {
        if (interacao is null)
        {
            throw new Exceptions.DomainException("A interação do anexo é obrigatória.");
        }

        if (string.IsNullOrWhiteSpace(nomeArquivo))
        {
            throw new Exceptions.DomainException("O nome do arquivo é obrigatório.");
        }

        if (string.IsNullOrWhiteSpace(url))
        {
            throw new Exceptions.DomainException("A URL do arquivo é obrigatória.");
        }

        if (tamanhoBytes < 0)
        {
            throw new Exceptions.DomainException("O tamanho do arquivo não pode ser negativo.");
        }

        return new Anexo(interacao.Id, nomeArquivo.Trim(), url.Trim(), tamanhoBytes);
    }
}