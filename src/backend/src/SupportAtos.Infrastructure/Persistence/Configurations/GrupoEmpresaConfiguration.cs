using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SupportAtos.Domain.Entities;

namespace SupportAtos.Infrastructure.Persistence.Configurations;

public class GrupoEmpresaConfiguration : IEntityTypeConfiguration<GrupoEmpresa>
{
    public void Configure(EntityTypeBuilder<GrupoEmpresa> builder)
    {
        builder.ToTable("grupo_empresa");

        builder.HasKey(g => g.Id);

        builder.Property(g => g.Id)
            .HasColumnName("id");

        builder.Property(g => g.Nome)
            .HasColumnName("nome")
            .HasColumnType("varchar");

        builder.Property(g => g.CodigoExterno)
            .HasColumnName("codigo_externo")
            .HasColumnType("varchar");

        builder.HasIndex(g => g.CodigoExterno)
            .IsUnique();
    }
}