using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SupportAtos.Domain.Entities;

namespace SupportAtos.Infrastructure.Persistence.Configurations;

public class InteracaoConfiguration : IEntityTypeConfiguration<Interacao>
{
    public void Configure(EntityTypeBuilder<Interacao> builder)
    {
        builder.ToTable("interacao");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.Id)
            .HasColumnName("id");

        builder.Property(i => i.UsuarioId)
            .HasColumnName("usuario_id");

        builder.Property(i => i.ChamadoId)
            .HasColumnName("chamado_id");

        builder.Property(i => i.Tipo)
            .HasColumnName("tipo")
            .HasColumnType("varchar")
            .HasConversion<string>();

        builder.Property(i => i.Mensagem)
            .HasColumnName("mensagem")
            .HasColumnType("text");

        builder.Property(i => i.CriadoEm)
            .HasColumnName("criado_em")
            .HasColumnType("timestamp");

        builder.HasOne(i => i.Usuario)
            .WithMany(u => u.Interacoes)
            .HasForeignKey(i => i.UsuarioId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(i => i.Chamado)
            .WithMany(c => c.Interacoes)
            .HasForeignKey(i => i.ChamadoId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}