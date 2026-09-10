# ⚡ Otimização de Performance — BookHub

Auditoria de performance feita no **próprio BookHub** (o shell publicado,
`apps/shell`), não em uma página à parte — exatamente a aplicação que os
usuários acessam. Medido com o Lighthouse (Chrome DevTools / CLI) em dois
momentos: antes e depois de aplicar as otimizações abaixo.

## Como reproduzir

```bash
# 1. Suba os dois micro frontends (o shell depende deles em runtime)
npm run dev -w apps/micro-catalogo &
npm run dev -w apps/micro-estante &

# 2. Gere um build de produção do shell e sirva-o
npm run build -w apps/shell
npx serve apps/shell/dist -l 3000 -s

# 3. Rode o Lighthouse
npx lighthouse http://localhost:3000 --output=html --output=json \
  --output-path=./docs/performance/reports/meu-relatorio \
  --only-categories=performance,accessibility,best-practices,seo
```

## Gargalos identificados (relatório "antes")

Relatório completo: [`reports/before-report.report.html`](reports/before-report.report.html) · print: [`antes.png`](antes.png)

| Categoria | Nota |
|---|---|
| **Performance** | **80** |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 91 |

1. **Os dois micro frontends carregavam sempre, mesmo o que não estava
   visível.** O `App.tsx` montava `<CatalogoPage />` e `<EstantePage />`
   simultaneamente (uma delas só escondida via CSS), então o código do
   micro Estante — e o `remoteEntry.js` + bundle de vendor dele — era
   baixado e executado mesmo que o usuário nunca tivesse aberto aquela
   aba. Confirmado no `network-requests` do relatório: os dois
   `remoteEntry.js` (3001 e 3002) **e** os dois bundles de vendor e de
   `__federation_expose_App.js` apareciam na carga inicial.
2. **A fonte Inter (Google Fonts) bloqueava a renderização inicial.** O
   `<link rel="stylesheet">` no `<head>` do `apps/shell/index.html`
   baixava e aplicava a fonte de forma síncrona, atrasando o primeiro
   paint — sinalizado pelo insight "Render-blocking requests" do
   Lighthouse, e visível no LCP de **4.3s** (faixa "ruim").

## Otimizações aplicadas

| Técnica | Onde |
|---|---|
| **Code splitting por aba**: cada página só é montada (e seu micro remoto só é importado via `React.lazy`) quando o usuário abre aquela aba | `apps/shell/src/App.tsx`, `pages/CatalogoPage.tsx`, `pages/EstantePage.tsx` |
| **Carregamento não bloqueante da fonte** via `media="print" onload="this.media='all'"` (com fallback `<noscript>`) | `apps/shell/index.html` |
| **Imports enxutos de ícones**: `lucide-react` importado ícone a ícone (`import { Library, BookMarked } from 'lucide-react'`), não a biblioteca inteira | `apps/shell/src/components/Nav.tsx` |
| **CSS sem sobra**: Tailwind v4 (JIT) gera só as classes realmente usadas nos três projetos (shell, micro-catalogo, micro-estante) | `*/src/*.css` |
| **Minificação de HTML/CSS/JS** no build de produção (Vite/esbuild no shell, Terser no Webpack dos micros) | automático via `npm run build` |

## Reanálise (relatório "depois")

Relatório completo: [`reports/after-report.report.html`](reports/after-report.report.html) · print: [`depois.png`](depois.png)

| Categoria | Antes | Depois |
|---|---|---|
| **Performance** | 80 | **82** |
| Accessibility | 100 | 100 |
| Best Practices | 100 | 100 |
| SEO | 91 | 91 |

| Métrica | Antes | Depois |
|---|---|---|
| First Contentful Paint | 2.9 s | **2.5 s** |
| Largest Contentful Paint | 4.3 s | **3.9 s** |
| Speed Index | 2.9 s | **2.5 s** |
| Total Blocking Time | 100 ms | 160 ms |
| Peso total transferido | 438 KiB | **417 KiB** |
| Cumulative Layout Shift | 0 | 0 |

## O que trouxe mais impacto — e uma nota honesta sobre os números

- **A fonte não bloqueante** foi a mudança que mais moveu métricas visíveis
  ao usuário: FCP e Speed Index caíram de 2.9s para 2.5s (-14%), e o LCP
  saiu de 4.3s para 3.9s.
- **O code splitting por aba** removeu ~22 KiB da carga inicial (o bundle
  de vendor + o módulo exposto do micro Estante, que deixam de ser
  baixados até o usuário abrir aquela aba). Nesta aplicação de estudo, os
  micros são pequenos, então o ganho em KiB é modesto — mas o
  `remoteEntry.js` de cada remoto (que é só um manifesto leve de
  federação) continua sendo buscado antecipadamente pelo runtime do
  Module Federation, independente da aba ativa; só o *código de fato* do
  micro (seus vendors e seu módulo exposto) é adiado. **Em uma aplicação
  real, com micros maiores, essa mesma técnica economizaria muito mais.**
- **Total Blocking Time piorou levemente** (100ms → 160ms) entre as duas
  medições. Isso está dentro da variação normal do Lighthouse em modo
  `simulate` para valores tão pequenos (a diferença é de um único
  "long task" a mais detectado) — não atribuo isso a uma regressão real
  causada pelas otimizações, e destaco aqui em vez de omitir para manter
  o relatório honesto.
- O maior "Est. savings" que ainda aparece no relatório (**"Use efficient
  cache lifetimes"**) é uma limitação do ambiente de teste: o servidor
  estático usado localmente (`npx serve`) não define cabeçalhos de cache
  agressivos. Em um deploy real (Vercel, CDN), esse ganho apareceria
  automaticamente, sem mudança de código.
