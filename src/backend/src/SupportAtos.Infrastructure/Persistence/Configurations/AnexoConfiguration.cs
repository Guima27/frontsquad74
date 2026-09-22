using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SupportAtos.Domain.Entities;

namespace SupportAtos.Infrastructure.Persistence.Configurations;

public class AnexoConfiguration : IEntityTypeConfiguration<Anexo>
{
    public void Configure(EntityTypeBuilder<Anexo> builder)
    {
        builder.ToTable("anexo");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Id)
            .HasColumnName("id");

        builder.Property(a => a.InteracaoId)
            .HasColumnName("interacao_id");

        builder.Property(a => a.NomeArquivo)
            .HasColumnName("nome_arquivo")
            .HasColumnType("varchar");

        builder.Property(a => a.Url)
            .HasColumnName("url")
            .HasColumnType("varchar");

        builder.Property(a => a.TamanhoBytes)
            .HasColumnName("tamanho_bytes");

        builder.HasOne(a => a.Interacao)
            .WithMany(i => i.Anexos)
            .HasForeignKey(a => a.InteracaoId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}