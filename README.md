# Atos Capital — Ferramenta de Suporte (Unidade Bank)

Front-end do MVP descrito no termo de abertura do projeto: login, fila
de atendimento com SLA, resposta a chamados, notas internas e
relatórios gerenciais. É a ferramenta que a equipe da Atos usa para
responder aos chamados — a abertura de chamado pelo cliente é feita em
outro ponto (fora do escopo deste front-end). Os dados usados aqui são
mockados em `src/SupportPortal.jsx` (array `seed`) — ainda não há
integração com API.

## Identidade visual

O front-end segue o design system oficial da Atos Capital (tokens de
marca, superfícies, texto, estados e tipografia). Os tokens ficam em
`src/SupportPortal.jsx` (objeto `THEME`) e são aplicados como variáveis
CSS (`--brand-primary`, `--surface-base`, `--text-primary` etc.) — dá
pra trocar valores num único lugar.

A marca usa o PNG oficial (`public/atos-capital-logo.png`). Como o
arquivo original tem fundo branco, gerei duas versões ao importar:
`atos-capital-logo.png` (fundo transparente, cores originais, para
fundos claros) e `atos-capital-logo-white.png` (silhueta branca, para
o painel vermelho escuro do menu e do login). Se receber um arquivo
novo da marca, repita esse tratamento antes de substituir — colar o
PNG original direto no lugar do branco vai trazer o fundo branco de
volta.

Tem alternância entre tema claro e escuro (botão no rodapé do menu e na
tela de login), usando os valores `dark` do mesmo objeto `THEME`.

## O que ainda é só interface (sem back-end)

- Seleção de colunas persistida (`<ColumnSelector/>` do template de
  tela) não foi implementada — a tabela mostra sempre as mesmas colunas.
- Paginação da lista de chamados não foi implementada — hoje ela mostra
  tudo de uma vez.
- O botão "Exportar" e o "Atualizar" (ícone de refresh) são só mockados
  visualmente, sem gerar arquivo real nem buscar dados de verdade.

## Login (tela inicial)

A tela de entrada tem duas abas:

- **Portal do cliente** — só um botão "Entrar com Atos Capital ID",
  simulando o login via SSO descrito na seção 2.5 do termo (o usuário
  não cria senha própria aqui). Nesta ferramenta, o cliente só
  acompanha os chamados existentes — não abre novos por aqui.
- **Equipe Atos Capital** — e-mail e senha para agentes de suporte
  (qualquer e-mail válido com senha de 4+ caracteres funciona no mock).
  É o papel principal desta ferramenta: responder, atribuir e encerrar
  chamados.

Depois do login, o papel (cliente ou agente) fica fixo na sessão — para
trocar de visão durante os testes, use "Sair" no rodapé do menu lateral
e entre novamente pela outra aba.

## Como rodar no VS Code

1. Abra a pasta `atos-suporte` no VS Code.
2. Abra um terminal integrado (`` Ctrl+` ``) e instale as dependências:

   ```bash
   npm install
   ```

3. Suba o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Acesse o endereço mostrado no terminal (normalmente
   `http://localhost:5173`).

Requer Node.js 18 ou superior.

## Estrutura

```
atos-suporte/
├─ index.html            # ponto de entrada do Vite, carrega as fontes
├─ src/
│  ├─ main.jsx           # bootstrap do React
│  ├─ index.css          # diretivas do Tailwind
│  └─ SupportPortal.jsx  # componente principal (toda a interface)
├─ tailwind.config.js
├─ postcss.config.js
└─ vite.config.js
```

## Próximos passos (fora do escopo deste front-end)

- Trocar o array `seed` por chamadas reais aos endpoints da API
  (criação de chamado, fila, webhook de eventos).
- Autenticação via SSO/JWT no lugar do objeto fixo `CURRENT_USER`.
- Ligar o botão "Enviar" da conversa e o toggle de status a
  requisições reais em vez de `useState` local.
