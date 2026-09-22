using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SupportAtos.Domain.Entities;

namespace SupportAtos.Infrastructure.Persistence.Configurations;

public class ChamadoConfiguration : IEntityTypeConfiguration<Chamado>
{
    public void Configure(EntityTypeBuilder<Chamado> builder)
    {
        builder.ToTable("chamado");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id)
            .HasColumnName("id");

        builder.Property(c => c.CodigoPublico)
            .HasColumnName("codigo_publico")
            .HasColumnType("varchar");

        builder.HasIndex(c => c.CodigoPublico)
            .IsUnique();

        builder.Property(c => c.UsuarioId)
            .HasColumnName("usuario_id");

        builder.Property(c => c.GrupoEmpresaId)
            .HasColumnName("grupo_empresa_id");

        builder.Property(c => c.SlaCategoriaId)
            .HasColumnName("sla_categoria_id");

        builder.Property(c => c.Produto)
            .HasColumnName("produto")
            .HasColumnType("varchar");

        builder.Property(c => c.Categoria)
            .HasColumnName("categoria")
            .HasColumnType("varchar");

        builder.Property(c => c.Status)
            .HasColumnName("status")
            .HasColumnType("varchar")
            .HasConversion<string>();

        builder.Property(c => c.Prioridade)
            .HasColumnName("prioridade")
            .HasColumnType("varchar")
            .HasConversion<string>();

        builder.Property(c => c.SlaPrazo)
            .HasColumnName("sla_prazo")
            .HasColumnType("timestamp");

        builder.Property(c => c.CriadoEm)
            .HasColumnName("criado_em")
            .HasColumnType("timestamp");

        builder.Property(c => c.FechadoEm)
            .HasColumnName("fechado_em")
            .HasColumnType("timestamp");

        builder.HasOne(c => c.Usuario)
            .WithMany(u => u.Chamados)
            .HasForeignKey(c => c.UsuarioId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(c => c.GrupoEmpresa)
            .WithMany(g => g.Chamados)
            .HasForeignKey(c => c.GrupoEmpresaId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(c => c.SlaCategoria)
            .WithMany(s => s.Chamados)
            .HasForeignKey(c => c.SlaCategoriaId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}