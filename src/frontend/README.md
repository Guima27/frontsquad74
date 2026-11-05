# Atos Capital — Ferramenta de Suporte (Unidade Bank)

Front-end do MVP do termo de abertura: login, fila de atendimento com SLA, resposta
a chamados, notas internas, notificações e relatórios. A **abertura de chamado já usa a API real**
(`src/api.js`); o restante das telas ainda usa dados mockados (`src/data.js`).

## Como rodar

```bash
npm install
npm run dev     # http://localhost:5173
```

Requer Node.js 18 ou superior.

### Abertura de chamado (API real)

A tela "Abrir chamado" (campo **Título obrigatório**) chama `POST /api/chamados` e carrega produto/categoria
de `GET /api/sla-categorias`. Configure em `.env.local` (veja `.env.example`):

```
VITE_API_URL=http://localhost:5177
VITE_API_TOKEN=<jwt de desenvolvimento>
```

Para gerar o token de desenvolvimento use `backend/scripts/mint-token.ps1` (o login SSO ainda é simulado, então o
token é fornecido por aqui ou gravado em `sessionStorage` na chave `atos_token`). A API precisa estar rodando em
Development com o banco populado (`backend/database/seed.sql`).

## Padrão de interface: MUI + tokens

O front segue o padrão da Atos Bank: **Material UI (MUI v5) com tokens do design system**.
Antes ele usava Tailwind; foi migrado para alinhar ao padrão.

- `src/theme.js` é a **fonte única dos tokens** (marca, superfícies, texto, estados, menu,
  tabela, scrollbar), em claro e escuro, e monta o tema com `createTheme`. Também define a
  escala tipográfica do doc (título 24/600, seção 16/600, corpo 13-14, rótulo 12/500, apoio 11).
- Tokens que não existem na paleta do MUI ficam em `theme.atos` (ex.: `atos.menuGradient`,
  `atos.tableHeaderBg`, `atos.tones.info.bg`). Use `useTheme()` para lê-los.
- Componentes usados: `Button`, `TextField`, `Dialog`, `Tabs`, `Table`/`TablePagination`,
  `Chip`, `Drawer`, `AppBar`, `Popover`, `Stepper`, `Snackbar`, `Skeleton`, `Breadcrumbs`.
- Ícones: `@mui/icons-material`. Gráficos: `recharts` (cores vindas do tema).
- `src/index.css` só tem o reset mínimo. Para mudar cor, fonte ou espaçamento global, edite
  `theme.js`, não os componentes.

## Padrões do projeto

- **Notificações:** `sonner` — `toast.success` / `toast.error` / `toast.warning` (`<Toaster/>` em `SupportPortal.tsx`).
  Não usar `Snackbar` do MUI. Erros de API passam por `notifyApiError` (`src/notify.ts`; 401/403 viram aviso).
- **Datas:** `dayjs` + `@mui/x-date-pickers`, sempre `DD/MM/YYYY` na interface (`src/dates.ts`). Datas trafegam em ISO 8601.
- **Idiomas:** `i18next` + `react-i18next` (pt / en / es) em `src/i18n/locales`. Todo texto de tela usa `t('chave')`;
  o seletor PT/EN/ES fica no menu lateral e no login (escolha salva em `localStorage`).
- **Formulários:** `react-hook-form` + `Yup` (`yupResolver`). Os erros aparecem em `LineErrorForm`, sob o campo.
  As mensagens do Yup são chaves de tradução (`validation.*`), traduzidas ao exibir.
- **Obrigatoriedade:** campo obrigatório leva `required` (asterisco vermelho no rótulo, definido no tema) desde o início;
  a validação não é o único aviso. `mode: 'onTouched'` valida ao sair do campo, não só no envio.

## Estrutura

O projeto é **TypeScript** (`strict`). Para checar os tipos: `npm run typecheck` (o `npm run build` também checa).

```
src/
├─ main.tsx              # bootstrap
├─ SupportPortal.tsx     # estado global, ThemeProvider, Toaster, LocalizationProvider e troca de telas
├─ types.ts              # tipos de domínio (Ticket, Session, Role, ViewId...)
├─ api.ts                # cliente HTTP da API + tipos dos DTOs (chamados, usuários, grupos)
├─ dates.ts              # dayjs: formatos DD/MM/YYYY e leitura de datas da API
├─ notify.ts             # notifyApiError (sonner)
├─ theme.ts              # tokens + tema MUI (claro/escuro), com a extensão de tipo `theme.atos`
├─ data.ts               # constantes de domínio e dados mockados da fila
├─ i18n/                 # configuração do i18next e locales pt.ts / en.ts / es.ts
└─ components/
   ├─ form/              # LineErrorForm e FormTextField (react-hook-form)
   ├─ Login.tsx          # vitrine do produto + cartão de acesso (Cliente / Equipe / Administrador)
   ├─ Layout.tsx         # Sidebar (Drawer) e TopBar (AppBar, notificações)
   ├─ LanguageSwitcher.tsx
   ├─ TicketList.tsx     # fila / "Meus chamados", filtros (inclusive por data), modal de novo chamado
   ├─ TicketDetail.tsx   # conversa, notas internas, SLA, assumir / repassar
   ├─ Reports.tsx        # relatórios
   ├─ UserAdmin.tsx      # administração: cadastro de usuários (API real)
   └─ ui.tsx             # marca, chips de status, SLA, cartões de indicador
```

A logo está em `public/` (`atos-capital-logo.png` e a versão branca para fundos escuros).
Se receber um arquivo novo da marca, remova o fundo branco e gere a versão branca antes de trocar.

## Papéis

- **Administrador** (aba "Administrador" no login): vê **Fila de atendimento**, **Relatórios** e **Cadastro de usuários**
  (`POST /api/usuarios`, lista em `GET /api/usuarios?grupoEmpresaId=` e grupos em `GET /api/grupos-empresa`), para
  cadastrar clientes e demais perfis. O perfil real é validado pela API a partir do token (papel `Admin`); a tela não
  substitui a autorização do servidor.
- **Cliente** (login "Atos Capital ID", SSO): vê só os chamados da própria empresa, abre
  novos chamados e acompanha o andamento.
- **Agente** (e-mail e senha): vê toda a fila, assume e repassa chamados, usa notas internas.
  Não abre chamado.

## O que ainda é só interface

- "Manter conectado", "Esqueci minha senha", "Exportar" e "Atualizar" são visuais.
- Seleção de colunas persistida (`<ColumnSelector/>` do template de tela) não foi feita.
- Notificações e leitura vivem no estado local; numa integração real viriam do webhook
  de eventos (seção 2.3 do termo).
- Autenticação é simulada (o SSO/JWT real entra na seção 6 do termo).
