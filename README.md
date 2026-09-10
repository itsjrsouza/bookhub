# 📚 BookHub — Plataforma de Leitura

Um único produto, um único repositório: o **BookHub** ajuda você a catalogar
livros, montar sua estante pessoal e registrar suas sessões de leitura.
Internamente ele é composto por um shell principal, dois micro frontends e
um PWA — mas para quem usa, é uma coisa só.

🔗 **Aplicação publicada:** preencha aqui após o primeiro deploy —
`https://bookhub-flame.vercel.app/` _(veja [Deploy](#-cicd-e-deploy) abaixo)_

## Sumário

- [O que o BookHub faz](#-o-que-o-bookhub-faz)
- [Arquitetura](#-arquitetura)
- [Estrutura do repositório](#-estrutura-do-repositório)
- [Como rodar](#-como-rodar)
- [Configurando o crudcrud.com](#-configurando-o-crudcrudcom)
- [Comunicação entre os micros](#-comunicação-entre-os-micros)
- [Diário de Leitura (PWA)](#-diário-de-leitura-pwa)
- [CI/CD e Deploy](#-cicd-e-deploy)
- [Performance](#-performance)
- [Design system](#-design-system)

## 📖 O que o BookHub faz

- **Catálogo** — cadastra livros (título, autor, status de leitura),
  consumindo uma API real do crudcrud.com. Lista, adiciona, remove e
  alterna o status "Lido"/"Não lido".
- **Minha Estante** — os livros que você escolhe adicionar a partir do
  Catálogo aparecem aqui, na sua estante pessoal.
- **Diário de Leitura** — um PWA instalável e que funciona offline, para
  registrar sessões de leitura (livro, páginas lidas, data, anotações).

## 🏗️ Arquitetura

```mermaid
flowchart TD
    subgraph Shell["apps/shell — Container (React + TS + Vite + Tailwind)"]
        Nav["Navegação: Catálogo · Minha Estante · Diário de Leitura"]
    end

    Shell -- Module Federation --> Catalogo["apps/micro-catalogo\nCatálogo de Livros\n(React + JS + Webpack)"]
    Shell -- Module Federation --> Estante["apps/micro-estante\nMinha Estante\n(React + JS + Webpack)"]
    Shell -- link para /diario/ --> Diario["public/diario\nDiário de Leitura (PWA)\nHTML + CSS + JS puro"]

    Catalogo -- "crudcrud.com (GET/POST/DELETE/PUT)" --> API[(API crudcrud)]
    Catalogo -- "window.dispatchEvent('bookhub:add-to-shelf')" --> Estante
    Estante -- "localStorage (via @bookhub/shared)" --> Storage[(localStorage)]
    Diario -- "localStorage" --> Storage2[(localStorage)]

    Shared["packages/shared\nTipos, evento e estanteStore"] -.-> Catalogo
    Shared -.-> Estante
    Shared -.-> Shell
```

O **shell** é o Container: ele é a aplicação que o usuário abre, e carrega
os dois micro frontends em tempo de execução via **Webpack Module
Federation** (usando `@module-federation/vite` no lado do host Vite e
`@module-federation/enhanced` nos dois remotes Webpack). O **Diário de
Leitura** é um PWA independente, acessível em `/diario/`, sem depender de
build nenhum — é HTML/CSS/JS puro.

Em produção, os três apps (`shell`, `micro-catalogo`, `micro-estante`) são
publicados como **projetos Vercel totalmente independentes**, cada um com
sua própria URL. A URL de cada micro é passada ao shell via variável de
ambiente (`CATALOGO_REMOTE_URL`/`ESTANTE_REMOTE_URL`) — não há nenhum
recurso "mágico" de orquestração da Vercel envolvido, é só Module
Federation apontando para uma URL absoluta em vez de `localhost`. Veja
[Publicando os micros em produção](#publicando-os-micros-em-produção-3-projetos-vercel-independentes).

## 📂 Estrutura do repositório

```
bookhub/
├── apps/
│   ├── shell/                # Container: React + TS + Vite + Tailwind
│   │   └── vercel.json        # (implícito) usa o vercel.json da raiz
│   ├── micro-catalogo/        # Micro Frontend: Catálogo (React + JS + Webpack MF)
│   │   └── vercel.json        # Headers CORS (projeto Vercel próprio)
│   └── micro-estante/         # Micro Frontend: Estante (React + JS + Webpack MF)
│       └── vercel.json        # Headers CORS (projeto Vercel próprio)
├── packages/
│   └── shared/           # Tipos, constantes e utilitários compartilhados
├── public/
│   └── diario/           # PWA "Diário de Leitura" (HTML/CSS/JS puro)
├── docs/
│   └── performance/       # Relatórios Lighthouse antes/depois
├── scripts/
│   └── copy-diario.mjs   # Copia public/diario para dentro do build do shell
├── .github/workflows/main.yml   # CI/CD
├── package.json          # Workspaces + scripts globais
└── vercel.json            # Config de build/deploy do projeto do shell (rewrites de SPA)
```

## 🚀 Como rodar

Pré-requisito: Node.js 18+.

```bash
npm install                # instala as dependências de todos os workspaces
cp apps/micro-catalogo/.env.example apps/micro-catalogo/.env
# edite apps/micro-catalogo/.env com sua própria URL do crudcrud.com
# (veja a seção "Configurando o crudcrud.com" abaixo)

npm run dev                 # sobe shell + micro-catalogo + micro-estante juntos
```

Acesse **http://localhost:3000**.

### Rodando cada parte isoladamente

```bash
npm run dev -w apps/micro-catalogo   # http://localhost:3001 (standalone)
npm run dev -w apps/micro-estante    # http://localhost:3002 (standalone)
npm run dev -w apps/shell            # http://localhost:3000 (shell sozinho)

npx serve public/diario              # PWA Diário de Leitura, isolada
```

### Scripts da raiz

| Script | O que faz |
|---|---|
| `npm run dev` | sobe shell + os dois micros em paralelo (via `concurrently`) |
| `npm run build` | builda os dois micros, depois o shell, e copia o Diário para dentro do build |
| `npm run lint` | roda o ESLint em shell, micro-catalogo e micro-estante |
| `npm run test` | roda a suíte de testes (Vitest) do shell |
| `npm run typecheck` | roda o `tsc --noEmit` do shell |

## 🔑 Configurando o crudcrud.com

O micro Catálogo (`apps/micro-catalogo`) precisa de um endpoint do
[crudcrud.com](https://crudcrud.com) — gratuito, sem login, mas **único e
que expira depois de pouco tempo de uso** (o próprio crudcrud retorna
`400 Bad Request` com a mensagem `"Endpoint has expired."` quando isso
acontece — se aparecer também um erro de CORS no console junto com esse
400, é só reflexo disso: respostas de erro do crudcrud não incluem
cabeçalho CORS, então o navegador acusa os dois problemas juntos, mas a
causa real é sempre o endpoint expirado).

1. Acesse **https://crudcrud.com** no navegador.
2. Copie a URL única exibida (ex: `https://crudcrud.com/api/1a2b3c4d.../livros`).
3. Configure:
   ```bash
   cd apps/micro-catalogo
   cp .env.example .env
   ```
   ```env
   CRUDCRUD_URL=https://crudcrud.com/api/SEU_ENDPOINT_AQUI/livros
   ```
4. Reinicie o `npm run dev`. Se o endpoint expirar, gere um novo e repita
   (em produção, atualize a variável de ambiente `CRUDCRUD_URL` no projeto
   `bookhub-micro-catalogo` na Vercel e faça um redeploy).

### Em produção: proxy via Serverless Function

Em desenvolvimento local, o `apps/micro-catalogo/src/api.js` chama o
crudcrud direto do navegador. Em produção (build com `NODE_ENV=production`
e `PUBLIC_URL` definido), ele chama `/api/livros` — uma Serverless
Function do próprio projeto `bookhub-micro-catalogo`
([`api/livros/index.js`](apps/micro-catalogo/api/livros/index.js) para
listar/criar, [`api/livros/[id].js`](apps/micro-catalogo/api/livros/%5Bid%5D.js)
para atualizar/remover um item) que repassa a chamada para o crudcrud do
lado do servidor. Vantagens: a URL do crudcrud (com o ID único do
endpoint) nunca aparece no bundle JS público, e não existe mais nenhuma
chamada cross-origin para `crudcrud.com` saindo do navegador do usuário —
só o servidor da Vercel conversa com o crudcrud.

Não é preciso nenhuma configuração extra no `vercel.json` para isso — a
Vercel detecta automaticamente qualquer pasta `api/` na raiz do projeto
(aqui, relativa ao Root Directory `apps/micro-catalogo`) e publica cada
arquivo como uma função serverless.

## 🔌 Comunicação entre os micros

O micro Catálogo e o micro Estante **não compartilham código de UI** — a
comunicação acontece por um evento global do navegador:

```js
// micro-catalogo: ao clicar em "Adicionar à estante"
window.dispatchEvent(new CustomEvent('bookhub:add-to-shelf', { detail: book }));
```

```js
// micro-estante: escuta o mesmo evento
window.addEventListener('bookhub:add-to-shelf', (event) => { /* ... */ });
```

O nome do evento (`ADD_TO_SHELF_EVENT`) vive em `packages/shared`, o único
código de fato compartilhado entre os dois micros.

**Detalhe importante:** como o shell só monta cada aba quando ela está
ativa (ver [Performance](#-performance)), o micro Estante pode não estar
montado no momento em que o evento é disparado. Por isso o **shell**
registra um listener persistente assim que a aplicação inicia
(`startShelfPersistence()`, em `packages/shared/src/estanteStore.ts`) que
grava a estante em `localStorage` independente de qual aba está aberta; o
micro Estante lê esse `localStorage` ao montar, garantindo que nenhum livro
adicionado se perca — e, como bônus, a estante sobrevive a um refresh da
página.

## 📔 Diário de Leitura (PWA)

Acessível em **`/diario/`** a partir do menu do shell. Registra sessões de
leitura (livro, páginas, data, anotações) em `localStorage`, funciona
offline via Service Worker, e pode ser instalado na tela inicial
(`beforeinstallprompt`). Detalhes completos, incluindo como testar como PWA
no Lighthouse, em [`public/diario`](public/diario) — veja `index.html`,
`manifest.json` e `service-worker.js`.

> Em produção, `npm run build` copia `public/diario` para dentro de
> `apps/shell/dist/diario`, então o PWA fica publicado no mesmo domínio,
> em `/diario/`.

## ⚙️ CI/CD e Deploy

Workflow único em [`.github/workflows/main.yml`](.github/workflows/main.yml),
rodando em push/PR para `main`:

```
Lint → Testes (Vitest) → Build (micros + shell) → Deploy (Vercel, só em push na main)
```

O deploy usa [`amondnet/vercel-action@v25`](https://github.com/amondnet/vercel-action)
e o [`vercel.json`](vercel.json) da raiz, que builda o monorepo inteiro
(`npm run build`) e publica `apps/shell/dist`.

### Secrets necessários (GitHub → Settings → Secrets and variables → Actions)

| Secret | Onde encontrar |
|---|---|
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | rode `npx vercel link` uma vez em `bookhub/` → `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | mesmo arquivo `.vercel/project.json` |

### Publicando os micros em produção (3 projetos Vercel independentes)

> O plano Hobby da Vercel não dá acesso ao recurso nativo de
> "Microfrontends" (roteamento gerenciado entre projetos). Por isso o
> BookHub monta essa orquestração **inteiramente em código**: três
> projetos Vercel totalmente independentes, e o shell carrega os outros
> dois via Module Federation apontando para URLs absolutas.

| Projeto Vercel | Root Directory | Build Command | Output Directory |
|---|---|---|---|
| `bookhub` (shell) | raiz do repo | `npm run build` (via `vercel.json`) | `apps/shell/dist` |
| `bookhub-micro-catalogo` | `apps/micro-catalogo` | `npm run build` | `dist` |
| `bookhub-micro-estante` | `apps/micro-estante` | `npm run build` | `dist` |

Passo a passo:

1. **Crie os dois projetos satélite** na Vercel, importando o mesmo
   repositório GitHub (`itsjrsouza/bookhub`) de novo para cada um, com o
   **Root Directory** apontando direto para a pasta do app (`apps/micro-catalogo`
   ou `apps/micro-estante`) — a Vercel detecta o monorepo e instala a
   partir da raiz automaticamente. Framework Preset: **Other**.
2. Em cada um, nas **Environment Variables**:
   - `bookhub-micro-catalogo`: `PUBLIC_URL=https://bookhub-micro-catalogo.vercel.app`
     e `CRUDCRUD_URL=<seu endpoint do crudcrud>`.
   - `bookhub-micro-estante`: `PUBLIC_URL=https://bookhub-micro-estante.vercel.app`.

   `PUBLIC_URL` define o `output.publicPath` do Webpack (ver
   `webpack.config.js` de cada micro) — sem isso, os chunks internos
   (vendors, módulo exposto) tentariam carregar de `localhost`.
3. No projeto **`bookhub`** (o shell), adicione as variáveis de ambiente
   `CATALOGO_REMOTE_URL=https://bookhub-micro-catalogo.vercel.app` e
   `ESTANTE_REMOTE_URL=https://bookhub-micro-estante.vercel.app` — usadas
   em `apps/shell/vite.config.ts` para montar a URL do `remoteEntry.js` de
   cada remote no build de produção (em dev, sem essas variáveis, o
   padrão continua sendo `localhost:3001`/`:3002`).
4. Redeploy os três projetos.

**CORS:** como o shell carrega os remotes de um domínio diferente
(`bookhub-flame.vercel.app` → `bookhub-micro-catalogo.vercel.app`), os
dois micros precisam responder com cabeçalhos CORS liberando essa origem.
Isso já está configurado no `vercel.json` de cada micro
([`apps/micro-catalogo/vercel.json`](apps/micro-catalogo/vercel.json),
[`apps/micro-estante/vercel.json`](apps/micro-estante/vercel.json)):

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "*" }
      ]
    }
  ]
}
```

`*` é seguro aqui porque os dois micros só servem arquivos estáticos
públicos (JS/CSS do bundle) — não há cookies, autenticação ou dados
privados por trás dessas rotas.

**Roteamento interno (`/catalogo`, `/estante`):** o shell usa um pequeno
hook próprio baseado na History API do navegador
([`apps/shell/src/hooks/useRoute.ts`](apps/shell/src/hooks/useRoute.ts))
para sincronizar a aba ativa com a URL — sem depender de nenhuma
biblioteca de rotas. Acessar `/catalogo` ou `/estante` direto (ou dar
refresh) funciona graças ao rewrite configurado em
[`vercel.json`](vercel.json) (`"rewrites"`), que redireciona qualquer
caminho não encontrado como arquivo estático para `index.html`, deixando
o React assumir o roteamento a partir daí.

Sem os passos 1-4, o site publicado continua funcionando normalmente para
Catálogo/Estante quando você roda os micros localmente, e mostra uma
mensagem de erro amigável nessas abas em produção caso os micros ainda não
tenham sido publicados — ver `RemoteErrorBoundary` no shell.

## 📈 Performance

Auditoria completa (Lighthouse, antes/depois, com prints) no próprio
BookHub: [`docs/performance/README.md`](docs/performance/README.md).
Resumo: nota de Performance **80 → 82**, First Contentful Paint e Speed
Index caindo de **2.9s → 2.5s**, após remover uma fonte bloqueante e
aplicar code splitting por aba (só carrega o micro da aba ativa).

## 🎨 Design system

- **Tailwind CSS v4** (tema customizado: paleta índigo/violeta + acento
  laranja para ações de destaque) aplicado nos três apps (shell,
  micro-catalogo, micro-estante) para um visual consistente.
- **Dark mode** com toggle manual (persistido em `localStorage`) e
  detecção automática de `prefers-color-scheme`.
- **Tipografia Inter**, ícones via **lucide-react** (importados
  individualmente, sem carregar a biblioteca inteira).
- Layout responsivo mobile-first, cantos arredondados, sombras suaves e
  estados vazios ilustrados ("Nenhum livro cadastrado ainda", "Sua estante
  está vazia").
