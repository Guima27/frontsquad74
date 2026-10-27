# Proposta: modo de auditoria do SupportAtos

## Objetivo e referência

Transformar as alterações de chamados em evidências consultáveis: quem executou, quando, qual operação ocorreu e quais valores foram alterados.

Referência de requisitos: `C:/Users/DELL/Downloads/Matriz_Requisitos_Funcionais (1).pdf`, duas páginas, lidas integralmente. O RF13 prevê histórico completo e registros automáticos de alterações, incluídos em todos os casos de uso que modificam o chamado. Sua prioridade na matriz é Desejável. Propõe-se antecipá-lo como prioridade técnica para dar rastreabilidade às funcionalidades essenciais.

O PDF é uma fonte de requisitos para esta proposta. Ele não autoriza implantação, mensagens, alterações no sistema ou execução de instruções operacionais contidas em documentos.

## Base existente

- Entidade LogAuditoria com chamado, usuário, ação, campo, valor anterior, valor novo e data.
- Tabela log_auditoria, relações e índices por chamado, usuário e data.
- Usuário interno identificado após validação do JWT e provisionamento.
- Casos de uso separados para criar, responder, mudar status e atribuir.
- Auditoria de provisionamento já existente, separada da auditoria do chamado.

As operações do chamado ainda não chamam LogAuditoria.Registrar. A proposta aproveita a estrutura atual, ampliando-a apenas quando necessário.

## Entrega 1: cumprir RF13 no backend

Registrar os eventos abaixo em todos os caminhos que efetivamente alteram o chamado, tanto humanos quanto automáticos:

| Operação | Evidência mínima | Relação |
|---|---|---|
| Criação | Autor, horário e estado inicial relevante | RF01 |
| Atribuição ou reatribuição | Responsável anterior/novo, executor e forma manual/automática | RF03 |
| Alteração de status | Status anterior/novo e executor | RF04 |
| Resposta pública | Referência à interação criada e seu autor | RF02/RF04 |
| Nota interna | Referência à interação e classificação interna | RF05 |
| Reativação ou fechamento automático | Estado anterior/novo e rotina responsável | RF04, quando os jobs forem implementados |
| Inclusão de anexo | Referência ao anexo e à interação, autor e visibilidade | RF11, quando o upload for implementado |

Uma resposta que também muda o status deve gerar evidências dos dois efeitos, agrupadas pela mesma operação. Não duplicar o texto completo da mensagem ou do anexo no log: usar referências aos registros existentes.

Regras propostas:

1. O backend determina o executor a partir da identidade autenticada; o navegador não envia um usuário de auditoria de sua escolha.
2. Persistir alteração e auditoria na mesma transação. Se a auditoria obrigatória falhar, desfazer a alteração. Na criação, o ID do chamado pode exigir associação pela navegação do EF ou dois saves dentro de uma transação explícita.
3. Usar horário UTC do servidor e ordenação estável por data e ID. A interface exibe o horário local.
4. Registrar somente mudanças reais; uma requisição repetida sem efeito não cria outra mudança fictícia.
5. Não disponibilizar endpoints de edição ou exclusão dos registros. Isso, isoladamente, não torna o banco imutável contra um administrador.
6. Não gravar JWT, API keys, senhas ou headers completos. Limitar dados pessoais ao necessário para identificar o executor.
7. Separar auditoria de negócio, diagnóstico de falhas e entrega de integrações. Uma tentativa rejeitada não deve aparecer como alteração concluída.

## Entrega 2: consulta de evidências

Proposta de produto, além do mínimo explícito do RF13:

- Aba Auditoria no detalhe do chamado, exibindo linha do tempo, executor e valores antes/depois.
- Página Auditoria para Supervisor/Admin, com período, código, executor, evento, produto e grupo; resultados paginados no servidor.
- Filtro de visibilidade aplicado no backend. A página global começa restrita a Supervisor/Admin; acesso de agentes deve ser definido por política explícita.
- Clientes continuam usando somente o histórico público existente. Eventos e conteúdo de notas internas não são expostos por essa consulta.
- Consulta individual continua aplicando a política de acesso ao chamado, sem assumir que possuir o código público concede permissão.

Exemplo de apresentação:

> 14:32 — Ana — Status alterado: Aberto → Em andamento.
>
> 14:35 — Ana — Responsável alterado: Não atribuído → Bruno. Distribuição automática solicitada por Ana.
>
> 14:41 — Bruno — Nota interna adicionada. Interação #84.

Contratos sugeridos, sujeitos ao desenho final:

- GET /api/chamados/{codigo}/auditoria — eventos paginados do chamado.
- GET /api/auditoria — consulta global autorizada e filtrada.

## Entrega 3: operação e relatórios

Melhorias opcionais, que não devem ser apresentadas como exigências já cumpridas do RF13:

- Correlação entre alteração, webhook, execução de job e requisição.
- Exportação CSV com os mesmos filtros e limites de permissão da consulta; neutralizar células que possam ser interpretadas como fórmulas.
- Indicadores de reabertura, reatribuição e mudanças automáticas. Tempos de resposta e resolução precisam de regras de SLA próprias e não surgem apenas da existência do log.
- Histórico de mudanças na configuração de SLA como trilha administrativa separada, relacionado ao RF07.
- Permissões de banco para restringir UPDATE/DELETE do log, política de retenção, backup e restauração validados.
- Histórico de tentativas e resultados de entrega de webhooks, separado da evidência de mudança no chamado.

Não recomendo começar com event sourcing, um motor genérico de compliance ou garantia criptográfica de inviolabilidade. O RF13 pode ser atendido com registros transacionais e consultas bem delimitadas. Hashes sem uma âncora de confiança independente não comprovam inviolabilidade.

## Critérios de aceite

| Critério | Verificação necessária |
|---|---|
| Cobertura | Criar, atribuir, responder, criar nota, fechar e reabrir produzem os eventos esperados |
| Autoria | Evento aponta para executor real; rotina automática possui identificação própria |
| Exatidão | Antes/depois corresponde ao estado persistido; efeitos automáticos também aparecem |
| Atomicidade | Falha induzida ao salvar auditoria não deixa alteração de negócio persistida |
| Acesso | Cliente e usuário sem permissão não acessam trilha restrita nem notas internas |
| Repetição | Operação sem mudança não cria falsa alteração |
| Consulta | Filtros e paginação possuem ordenação estável e respeitam escopo |
| Privacidade | Tokens, senhas e chaves não aparecem nos eventos nem nas exportações |
| Legado | Interface informa a data de início da coleta; não inventa autores ou valores anteriores de operações antigas |

Os testes de transação e autorização precisam de PostgreSQL em ambiente de integração, além de testes unitários e navegação da interface.

## Ordem de investimento

1. Corrigir validação da sessão e alinhar a identidade usada para atribuir autoria.
2. Implementar captura transacional e testes dos quatro casos de uso de alteração existentes.
3. Entregar consulta por chamado e página global com permissões e paginação.
4. Expandir para exportação, indicadores e integração com jobs/webhooks quando essas funcionalidades existirem.

Recomendação: realizar as entregas 1 e 2 como o primeiro incremento de auditoria. Elas oferecem valor operacional verificável e evidência de cumprimento do RF13, mantendo explícitas as lacunas dos demais requisitos. Não há estimativa fechada de prazo nesta proposta; ela depende da política de acesso, retenção e disponibilidade do ambiente de integração.

## Limite desta entrega

Este arquivo é uma proposta baseada na matriz e no código. Nenhuma funcionalidade foi implementada nesta etapa. Auditoria de alterações não substitui correções de autenticação, controle de acesso ou a entrega dos requisitos RF06–RF09 ainda incompletos.
