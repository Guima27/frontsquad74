using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SupportAtos.Domain.Entities;

namespace SupportAtos.Infrastructure.Persistence.Configurations;

public class SlaCategoriaConfiguration : IEntityTypeConfiguration<SlaCategoria>
{
    public void Configure(EntityTypeBuilder<SlaCategoria> builder)
    {
        builder.ToTable("sla_categoria");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Id)
            .HasColumnName("id");

        builder.Property(s => s.Produto)
            .HasColumnName("produto")
            .HasColumnType("varchar");

        builder.Property(s => s.Categoria)
            .HasColumnName("categoria")
            .HasColumnType("varchar");

        builder.Property(s => s.Prioridade)
            .HasColumnName("prioridade")
            .HasColumnType("varchar")
            .HasConversion<string>();

        builder.Property(s => s.TempoResposta)
            .HasColumnName("tempo_resposta");

        builder.Property(s => s.TempoResolucao)
            .HasColumnName("tempo_resolucao");
    }
}