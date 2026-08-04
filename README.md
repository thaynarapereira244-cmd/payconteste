# Paycon — Landing Page (reconstrução visual)

Reconstrução completa da landing page de Automações Jurídicas da Paycon
(originalmente em `https://lp.payconautomacoes.com.br/`), preservando 100% da
copy e do funcionamento comercial da página original, com uma nova direção
visual premium, tecnológica e orientada por scroll (React + TypeScript + GSAP).

## Objetivo

Não é uma repaginação de cores: é uma reconstrução da experiência visual —
partículas, cenas de escaneamento, cards em profundidade, mosaico tecnológico
— mantendo intactos headline, subheadline, métricas, os 8 produtos, os 13
depoimentos, o método em 3 passos, a história da empresa, o time, os 30
parceiros, o formulário e o CTA final.

## Stack

- React 19 + TypeScript + Vite
- GSAP 3.15 (ScrollTrigger, ScrollSmoother, SplitText — todos gratuitos desde a
  aquisição do GSAP pela Webflow) via `@gsap/react` (`useGSAP`)
- Canvas2D para o sistema de partículas (ver "Por que não WebGL/Three.js")
- `@supabase/supabase-js` para reaproveitar a mesma Edge Function de leads da
  LP original
- lucide-react para os poucos ícones de interface

## Instalação e execução

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # build de produção em dist/
npm run preview   # serve o build de produção localmente
npm run lint      # oxlint
```

`npm run build` executa `tsc -b` antes do `vite build` — qualquer erro de tipo
quebra o build.

## Processo de extração da copy

A copy é 100% real, extraída da LP em produção em 2026-07-27 por três vias:

1. Leitura do HTML renderizado (`WebFetch`) para headline, seções, depoimentos,
   método, sobre, time e footer.
2. Inspeção do DOM/rede no navegador (título, meta description/OG, scripts de
   terceiros, requisições de imagem).
3. Leitura do bundle JS minificado (`assets/index-*.js`) para encontrar a
   integração real do formulário (Supabase Edge Function) e os textos exatos
   dos campos/opções do select, que não apareciam no HTML estático.

Nada foi reescrito, resumido ou inventado. Onde a página original citava um
número (`+80%`, `15%`, `-25%`, "40 clientes", "15 anos") esse número foi
mantido literalmente.

## Onde está cada coisa

| O quê | Onde |
|---|---|
| Toda a copy (fonte única) | `src/content/payconLandingContent.ts` |
| Cores/tipografia/tokens | `src/styles/tokens.css` |
| Parceiros (imagens baixadas) | `public/assets/partners/partner-<nome>.<ext>` |
| Fotos de depoimentos | `public/assets/testimonials/testimonial-<nome>.<ext>` |
| Fotos do time | `public/assets/team/team-<nome>.<ext>` |
| Logo oficial (fonte) | `public/assets/identity/paycon-logo-source.jpg` (+ `Reference/`) |
| Script de download dos assets | `scripts/download-assets.sh` |
| Formulário + integração real | `src/components/ContactForm`, `src/lib/supabaseClient.ts` |
| Scripts de analytics preservados | `index.html` |

## Cores da marca

O único arquivo de logo disponível no projeto (`Reference/311909161_..._n.jpg`)
é um JPEG de 150×150px. As cores reais foram extraídas por amostragem de pixel
(pixels mais escuros/puros de cada palavra, para minimizar o efeito do
anti-aliasing e da compressão JPEG):

- **Azul "PAY"**: `#22265A` (mais escuro/saturado que o provisório `#33367B`
  do briefing)
- **Cinza "CON"**: `#B0B0B0` (muito próximo do provisório `#BABABD`)

Os dois valores provisórios do briefing ficam registrados em
`--paycon-blue-700-brief` / `--paycon-gray-400-brief` em `tokens.css` para
referência. **Se um arquivo vetorial (AI/SVG/EPS) do logo aparecer**, refaça a
amostragem (ou copie os valores exatos do vetor) e atualize
`--paycon-blue-700` / `--paycon-gray-400` — toda a paleta deriva desses dois
tokens.

### Ajustar o azul ou o cinza

Edite apenas os tokens base em `tokens.css`:

```css
--paycon-blue-700: #22265a; /* toda a escala azul deriva daqui */
--paycon-gray-400: #b0b0b0; /* toda a escala cinza deriva daqui */
```

## Tipografia

Não foi encontrada nenhuma fonte proprietária da Paycon no projeto (sem
arquivos `.woff`/`.otf`, sem CSS `@font-face` na LP original). Foi usada
`Inter` (grotesca contemporânea, institucional) como fonte provisória para
display e body, via a stack do sistema — sem baixar arquivo de fonte externo.
Se a Paycon tiver uma fonte oficial, adicione os arquivos em `public/fonts/` e
declare `@font-face` em `src/styles/typography.css`, trocando `--font-display`
/ `--font-body` em `tokens.css`.

## Arquitetura visual: um palco de partículas persistente

A decisão central da experiência: **existe UM único canvas de partículas**,
fixo cobrindo a viewport, vivo do início ao fim da página
(`src/components/ParticleStage`).

Isso é o que cria a continuidade entre cenas. As mesmas partículas que formam
os dois dedos na hero são as que viram o scanner, as molduras dos cards, o
mosaico, a rede de parceiros e, no fim, a logo Paycon. Nenhuma seção tem canvas
próprio, então nada "aparece" e "desaparece" — tudo se transforma.

As seções ficam acima do palco com fundo **transparente** (`main > section` em
`globals.css`), e apenas as áreas de leitura crítica (formulário, rodapé)
recebem fundo sólido.

### Como as peças se ligam

| Arquivo | Papel |
|---|---|
| `src/lib/particleShapes.ts` | Constrói as nuvens de pontos (dedo humano, dedo robótico, núcleo, scanner, molduras, mosaico, rede, wordmark) como `Float32Array` |
| `src/lib/choreography.ts` | `writeTargets(fase, progresso)` → escreve os alvos em buffers **prealocados** |
| `src/lib/stageState.ts` | Estado mutável compartilhado + cursor com damping + registries de parallax/tilt |
| `src/components/ParticleStage` | Único loop de rAF: interpola, projeta em perspectiva, aplica cursor e desenha |
| `src/hooks/useStageScene.ts` | Liga uma seção ao palco com UMA ScrollTrigger scrubbed |

**Por que estado mutável e não React state**: as timelines escrevem a 60fps.
Passar isso por state causaria um re-render por frame. As cenas escrevem em
`stageState`, o loop do palco lê. Zero re-render.

**Zero alocação por frame**: a versão anterior fazia `targets.map(...)` a cada
frame por canvas, gerando churn de GC. Agora a coreografia só escreve em
`Float32Array`s que já existem.

### Contagens e custo real medido

| Tier | Partículas | Custo de desenho |
|---|---|---|
| high (desktop > 1024px) | 4200 | ~7,3 ms/frame (estimado) |
| medium (≤1024px ou touch) | 2500 | ~4,4 ms/frame (estimado) |
| low (≤640px) | 1100 | **1,91 ms/frame** (medido) |

Densidades elevadas a pedido (antes 2600/1500/620). O `low` foi medido direto
(1,91 ms @1100); `high`/`medium` são escalados pela mesma aritmética por
partícula. A rede de segurança por FPS (`useDevicePerformance`) rebaixa o tier
se um aparelho real não sustentar a taxa.

Orçamento de 60fps = 16,7 ms/frame, então o tier alto usa ~44%. Medido
sinteticamente no navegador com a mesma aritmética por partícula (perspectiva +
`drawImage`). Para ajustar, edite `COUNT_BY_TIER` em `ParticleStage.tsx`.

O render usa **sprites de brilho pré-renderizados** com blending aditivo
(`globalCompositeOperation = "lighter"`) em vez de `fillRect` — bem mais bonito
e mais rápido que desenhar formas por partícula.

### Timeline da hero

Uma única ScrollTrigger pinada de 320vh, dividida em segmentos ponderados
(`SEGMENTS` em `PayconHero.tsx`). Cada segmento mapeia para uma fase do palco:

```
hero-idle → hero-hands → hero-converge → hero-core → hero-entry → (scanner)
(a fase "hero-hands" hoje forma os dois DEDOS; o nome foi mantido)
```

Tudo é **função pura do progresso do scroll**, não de eventos `onEnter` — por
isso a cena é completamente reversível. Verificado: voltando ao topo, o estado
retorna a `hero-idle p=0.00`.

### Morph entre as formas

O morph é **indexado**: a partícula `i` interpola entre a posição `i` da forma
A e a posição `i` da forma B. Cada fase define de onde vem e para onde vai, e
cada fase começa a partir da forma da fase anterior (ex.: a fase `cards`
começa exatamente nas posições do `scanner`). É isso que faz cada cena nascer
da anterior em vez de aparecer por fade.

As partículas são divididas em papéis fixos (`ROLE_SPLIT`): 37% lado humano,
37% lado tecnológico, 26% núcleo.

### Os dois dedos

A composição da hero é o encontro entre **um dedo humano** e **um dedo
robótico**, com as pontas quase se tocando e um núcleo azul nascendo no vão.
(Uma versão anterior usava duas mãos completas; elas não ficavam
reconhecíveis, então foram substituídas.)

- **Humano** (`buildHumanFinger`): silhueta **preenchida** e orgânica —
  indicador construído por uma cadeia de círculos de raio decrescente, com leve
  curvatura para cima, falanges sugeridas por pequenas reentrâncias e ponta
  arredondada. Ao lado, apenas uma sugestão de nó dos dedos e dois dedos
  dobrados, o suficiente para contextualizar sem virar mão inteira.
  Reamostragem com densidade irregular (`organic: true`). Cinza/branco.
- **Robótico** (`buildRobotFinger`): desenhado em **contorno** (stroke, não
  preenchido) — base chanfrada com barramentos, pulso mecânico e três segmentos
  articulados separados por juntas sólidas, com painel interno em cada
  segmento. A ponta traz um nó sólido marcando o ponto de contato. Azul
  institucional.

Ambos são construídos por primitivas geométricas num canvas offscreen e
amostrados por alpha, com ênfase de borda. **Nenhuma imagem de referência é
traçada, mascarada ou usada como textura**, e a composição não reproduz "A
Criação de Adão".

**Como o vão entre as pontas é garantido**: as máscaras têm a ponta na borda
direita, então a âncora de cada dedo é **derivada do vão desejado**
(`fingerAnchorForTip` em `choreography.ts`) em vez de escolhida à mão. Assim o
vão é exato e não varia com o aspecto da tela — importante porque é nele que o
núcleo nasce. Verificado no navegador: 416px de vão com os dedos formados →
328px na aproximação → **71px com o núcleo ativo** → dissolução.

### Interação com o cursor — apenas local

O cursor **não move mais o quadro**. Uma versão anterior aplicava rotação 3D do
conjunto inteiro e parallax por camada, e a sensação era de cena girando e
balançando junto com o mouse. Ambos foram removidos.

O que existe hoje:

1. **Fundo**: apenas uma luz ambiente radial que acompanha o cursor (≤14px).
2. **Partículas**: campo de influência **local**, raio de 320px, com força
   caindo em `(1 - d/r)²`. Dentro dele cada partícula recebe **dois**
   componentes: um **radial** (até 58px — o lado humano é repelido e o
   tecnológico atraído, dualidade da marca) e uma **corrente tangencial**
   forte (`SWIRL_RATIO` 0,8) que a faz fluir **ao redor** do cursor. O sentido do giro
   acompanha a direção do movimento do mouse (produto vetorial velocidade ×
   raio), então passar o cursor "arrasta" a nuvem numa curva em vez de só
   afastá-la — é o que dá a sensação de fluido. A força também cresce com a
   velocidade do cursor (`0,7 + speed·0,7`). O acompanhamento é **por
   partícula** (`0.14 − cloudLag·0.05`): o miolo segue, a borda fica para trás,
   criando rastro; e tudo **relaxa devagar** de volta à origem (`RELEASE_RATE`)
   em vez de saltar.
3. **Nada mais**: headline, CTA, labels, moldura e câmera não respondem ao
   cursor. A hero tem base fixa — a corrente é puramente local, não gira nem
   balança o quadro.

Medido no render real (fase `hero-cloud`, tier low 1100): a nuvem em repouso
espalha ~55px; com o cursor passando por ela em movimento, sobe para ~75px
(+36%), crescendo mais no eixo do movimento — a corrente arrastando as
partículas na direção do mouse.

Verificado no navegador: com o cursor na extremidade **esquerda** (longe da
massa de partículas) o centroide fica **inalterado** (0,5763 vs 0,5762 no
centro); todo o DOM da hero reporta `transform: none`; e partículas distantes do
cursor variam no máximo 16px. Antes, o conjunto inteiro deslocava 84px.

### Scroll tem prioridade sobre o cursor

`stageState.interactionTarget` é interpolado suavemente (`interactionStrength`)
e cada segmento de cena declara sua faixa: 1.0 em repouso na hero, ~0.25
durante os morphs, ~0.1 na entrada de câmera, voltando a 0.85 no CTA final.
Assim o cursor nunca tira os objetos da trajetória durante uma transição.

### Como reduzir a intensidade das interações

Sem tocar em lógica, três níveis:

- **Cursor mais discreto**: reduza `INFLUENCE_RADIUS` (raio, padrão 320px),
  `MAX_PUSH` (deslocamento radial, padrão 58px) e `SWIRL_RATIO` (peso da
  corrente tangencial, padrão 0,8) no topo de `ParticleStage.tsx`.
  `RELEASE_RATE` controla a velocidade de retorno. Para um cursor só radial,
  zere `SWIRL_RATIO`; para desligar o campo, zere `MAX_PUSH`.
- **Por cena**: baixe os valores de `interaction` nos `segments` da seção.
- **Global**: em `stageState.ts`, fixe `interactionTarget` em um valor baixo.

### Como desativar as partículas

Não há Three.js nem WebGL no projeto (ver abaixo), então não há "desativar
WebGL". Para remover o palco, apague `<ParticleStage />` de `App.tsx` — a
página inteira continua funcionando: copy, cards, mosaico, parceiros,
formulário e CTAs são todos DOM/CSS e não dependem do canvas para existir.

**Por que Canvas2D e não WebGL/Three.js**: o briefing aceita Canvas/SVG como
alternativa equivalente. Sem hardware de teste variado nesta sessão, Canvas2D
foi escolhido deliberadamente: menos superfície de falha (sem contexto WebGL
para perder, sem shaders para depurar) e comportamento previsível entre
browsers. O custo medido acima confirma que há folga. O trade-off é a contagem
de partículas, menor do que a de um point cloud em GPU.

## Cenas e composição editorial

A copy foi **relateralizada**: nenhuma cena usa mais uma coluna central longa.

| Cena | Composição |
|---|---|
| Hero | copy à esquerda (max 46vw), massa de partículas à direita, labels nas 4 extremidades |
| Análise | texto à esquerda, moldura de scanner à direita |
| Soluções | pilha 3D de cards à esquerda/centro, índice + princípios P2P à direita |
| Mosaico | copy à esquerda, bento montado por scroll à direita |
| Parceiros | copy à esquerda, rede de logos à direita |
| Depoimentos | copy + controles à esquerda, card à direita |
| Método / Sobre | blocos limitados a ~40rem, deslocados para lados opostos |
| CTA final | central, mas contido (34rem), emoldurado pelas mãos |

### Cena de escaneamento

Ligada ao conteúdo real de **Insights / Dados Qualificados / Baixa de
Provisão** (`src/sections/AnalysisScene`) — as soluções da Paycon sobre análise
e classificação de dados processuais. Não foi inventado produto para caber a
animação. O "documento" escaneado é o próprio palco de partículas (as mesmas
que saíram da fusão da hero); a moldura, os cantos e o feixe são DOM por cima,
e ambos leem o **mesmo** progresso de scroll.

### Cards em profundidade

Não é grid nem carrossel. Os 5 cards vivem numa pilha 3D com
`transform-style: preserve-3d`; o scroll move um índice contínuo
(`activeFloat`) e cada card deriva profundidade, `rotateY/rotateZ`, escala,
blur e opacidade da sua distância a esse índice. Só um fica totalmente legível
por vez; os demais permanecem parcialmente visíveis. Em ≤960px a pilha vira
fluxo vertical full-width (transforms são limpos em JS e o CSS assume).

### Mosaico montado por scroll

Os módulos não aparecem prontos: cada um chega de um plano de profundidade
diferente (`translateZ` de -420px), de direções alternadas, com atraso próprio,
ganhando nitidez ao encaixar.

### Parceiros como rede

O marquee foi removido (o briefing o proíbe). Agora linhas de conexão se
desenham via `stroke-dashoffset`, e cada logo nasce de um **nó** que se expande.
Todos os 30 parceiros são preservados, na ordem original, com `alt` e sem
filtro que descaracterize a marca (dessaturado em repouso, **cor real no
hover**).

A onda de revelação é curta de propósito: parceiros são prova comercial, então
todos precisam estar 100% visíveis enquanto a seção ainda está na tela.
Verificado: com a seção em vista, 0 de 30 logos ficam ocultos.

### Formação da logo no CTA final

Abaixo do botão, as mesmas partículas que percorreram a página se reorganizam
no wordmark **PAYCON**: primeiro se recolhem numa faixa solta, depois assumem as
letras, e por fim um pulso estreito atravessa a logo da esquerda para a direita.
"PAY" recebe o azul institucional e "CON" o cinza, usando o mapa `logoIsPay`
derivado da largura real do texto. Dirigido por scroll e reversível — ao subir,
os módulos voltam à malha e o CTA permanece acessível.

O `<div className={styles.logoSlot}>` na seção é só **reserva de layout**
(`margin-top: clamp(48px, 8vh, 120px)`, largura `clamp(180px, 24vw, 420px)`); o
desenho vem do palco atrás, e um `<span class="sr-only">Paycon</span>` garante o
equivalente textual para leitores de tela.

**Sobre o arquivo da logo**: o wordmark é reproduzido como texto na fonte da
marca (mesma abordagem do componente `PayconLogo`), e não amostrado do arquivo
de imagem — o único asset disponível é um JPEG de 150×150 com fundo branco e
forte compressão, que amostrado geraria alvos serrilhados. Se aparecer um
vetor, `buildLogoWordmark` é o único ponto a trocar.

Verificado no navegador: aos 55% da cena as 2600 partículas já estão no
wordmark (y médio −0,51, abaixo do centro) e aos 68% as cores da marca entram —
**1228 partículas azuis (PAY) + 1372 cinzas (CON)**. A logo fica 90px abaixo do
botão.

## Como as seções mapeiam para o conteúdo original

A ordem visual foi reorganizada (permitido pelo briefing, seção 1) para seguir
a progressão narrativa "dois universos se aproximam → Paycon conecta → dados
são processados → soluções → parceiros → contato": o formulário de lead, que
na LP original aparece no meio da página, foi posicionado ao lado do CTA final
(ambos são pedidos de contato, fazem sentido juntos no fechamento). Nenhum
texto foi removido — apenas reposicionado.

| Ordem na página nova | Conteúdo original |
|---|---|
| `PayconHero` | Hero (headline, subheadline, CTA) |
| `PartnersScene` | Logos de clientes |
| `AnalysisScene` (`#solucoes`) | Insights, Baixa de Provisão, Dados Qualificados |
| `SolutionsScene` | Contratos, Contencioso, esocialPro, Controladoria, Societário |
| `TechnologyScene` (`#diferenciais`) | Métricas + Diferenciais |
| `TestimonialsScene` (`#depoimentos`) | 13 depoimentos |
| `MethodScene` (`#metodo`) | Método Paycon (3 passos) |
| `AboutScene` (`#sobre`) | Sobre + time (3 sócios) |
| `FinalContactScene` (`#fale-conosco` + `#contato`) | CTA WhatsApp + formulário |
| `PageFooter` | Rodapé |

## Formulário e integrações (crítico)

O formulário reaproveita **exatamente** o backend da LP em produção — não é um
formulário decorativo:

- Envia para a mesma **Supabase Edge Function** (`submit-lead`, projeto
  `ratdvdatfbbxlrozdioi.supabase.co`) usando a mesma anon key pública já
  exposta no bundle JS do site em produção (anon keys do Supabase são
  públicas por design; não concedem acesso a dados, só permitem invocar a
  function).
- Mesmo payload: `{ name, email, phone, company, role, sector, source, page_url, submitted_at }`.
- Mesmos campos e mesmas opções do select (`privada`, `escritorio`, `publica`,
  `outro`), extraídos do bundle JS original.
- Mesmo comportamento de sucesso/erro/loading, com proteção contra duplo envio
  (`status === "submitting"` bloqueia novo submit).

Ver `src/components/ContactForm/ContactForm.tsx` e `src/lib/supabaseClient.ts`.

### Atualizar campos do formulário

Edite `payconLandingContent.form.fields` em `payconLandingContent.ts` — o
componente é gerado a partir dessa lista, então adicionar/remover um campo não
exige tocar no JSX do `ContactForm`.

### Validar a integração

Abra o DevTools → Network, preencha o formulário com dados de teste e envie —
deve aparecer uma chamada `POST` para `.../functions/v1/submit-lead`
retornando 200. **Não envie dados de teste em excesso**: cada envio cria um
lead real no CRM da Paycon.

## Analytics (preservado, ver `index.html`)

| Script | ID real capturado | Status |
|---|---|---|
| Google Tag Manager | `GTM-TNX4TPXC` | preservado |
| LinkedIn Insight Tag | via `snap.licdn.com` | preservado |
| Microsoft Clarity | `uwshe4qqkz` | preservado |
| Rastreador próprio (Mantora Lab) | `cid=95b4b23b-...` | preservado |
| Meta Pixel | — | pendência, ver abaixo |

**Pendência real**: o Meta Pixel na LP original é inicializado com um ID
carregado dinamicamente em runtime (`fbq('init', '${e}')`), não hardcoded no
bundle — não foi possível extrair o número real do Pixel só inspecionando o JS
do cliente. Não foi inventado um ID. Para adicionar o Pixel real, insira o
snippet padrão do Meta com o ID correto em `index.html` (mesmo padrão dos
outros scripts já presentes).

Cliques nos CTAs disparam `trackCtaClick()` (`src/lib/analytics.ts`), que
replica o comportamento original: chama
`window.trck.event("cta_click", {button: placement})` (mesmo rastreador da
LP) e empurra um evento `paycon_cta_click` no `dataLayer` (GTM).

## Acessibilidade

- Skip link, hierarquia de headings, `<main>`/`<header>`/`<nav>`/`<footer>`
  semânticos.
- Labels reais em todos os campos do formulário (não apenas placeholder),
  erros com `role="alert"` e `aria-invalid`/`aria-describedby`.
- Carrossel de depoimentos navegável por teclado, com `aria-live` anunciando o
  depoimento atual.
- Elementos puramente decorativos (`ParticleStage`, `ExperienceFrame`) usam
  `aria-hidden="true"`.
- Nenhum conteúdo comercial vive no canvas: toda a copy, cards, mosaico,
  parceiros, formulário e CTAs são DOM real, selecionável e rastreável.
- `prefers-reduced-motion`: `ScrollSmoother` não é inicializado, o preloader é
  pulado, os canvases desenham um frame estático (sem `requestAnimationFrame`)
  e as animações de entrada por CSS/GSAP são neutralizadas pelo reset global.

## Performance

- DPR do canvas limitado a 1.5.
- O palco pausa o loop via `visibilitychange` quando a aba perde foco (por ser
  fixo e sempre visível, não usa `IntersectionObserver`).
- Zero alocação por frame: os alvos são escritos em `Float32Array`s prealocados.
- Um único `requestAnimationFrame` para tudo — partículas, parallax de interface
  e tilt dos containers, em vez de um loop por componente.
- Densidade de partículas por tier de dispositivo (`useDevicePerformance.ts`,
  heurística por `hardwareConcurrency` + `deviceMemory` + `pointer: coarse`,
  com rede de segurança por FPS medido que só rebaixa o tier).
- Imagens em WebP, com `loading="lazy"` + `decoding="async"` + dimensões.
- `@supabase/supabase-js` fora do bundle inicial (import dinâmico no submit).
- `ScrollTrigger`/`ScrollSmoother` únicos (uma instância cada, criados em
  `App.tsx`) — evite criar novas instâncias em componentes filhos.

## Otimização de performance (rodada 9)

Passe focado em deixar a página **mais leve e fluida sem redesenho** — mesma
experiência visual, menor custo. A auditoria antes de qualquer mudança revelou
que o gargalo NÃO estava no motor de partículas (já enxuto: 1 canvas, 1 rAF,
pausa em `visibilitychange`, DPR 1.5, tiers), e sim em **imagens** e no
**bundle inicial**.

Importante: **não há Three.js, WebGL nem shaders** neste projeto — as partículas
são Canvas2D. Por isso a recomendação genérica de "10–18k partículas" foi
recusada: em Canvas2D cada partícula é um `drawImage` na CPU (medido: 2600 ≈
5,45 ms/frame ≈ 2,1 µs/partícula), então 18k dariam ~38 ms/frame (26fps) e
quebrariam justamente a fluidez que se quer. Os tiers (2600/1500/620) foram
mantidos.

O que mudou:

- **Imagens PNG/JPG → WebP** (depoimentos, time e parceiros, via ffmpeg/libwebp).
  Foto salva como PNG era o maior desperdício — um depoimento caiu de 282 KB para
  22 KB. Total de imagens: **~3,5 MB → 911 KB (−73%)**. Só o formato mudou; a
  identidade `paycon-logo-source.jpg` (fonte da amostragem de partículas) foi
  preservada de propósito.
- **Supabase sob demanda.** `@supabase/supabase-js` saiu do bundle inicial: o
  client é criado por `import()` dinâmico só no submit do formulário
  (`getSupabase()` em `supabaseClient.ts`). Bundle inicial JS: **188 KB → 132 KB
  gzip (−28%)**; os ~52 KB gzip do SDK viram um chunk separado, carregado apenas
  quando o usuário envia o formulário (medido: nenhum request do SDK no load).
- **CLS/decoding.** `decoding="async"` + `width`/`height` explícitos nas imagens
  de parceiros e depoimentos, reservando o espaço antes do decode.
- **Rede de segurança por FPS medido.** `useDevicePerformance` agora, além da
  heurística (cores/memória/ponteiro/largura), mede a taxa real de quadros ~600ms
  após o load e **rebaixa o tier uma vez** se a mediana ficar abaixo de ~42fps.
  Só desce, nunca sobe — o desktop aprovado nunca é empurrado além do que a
  heurística concedeu; protege um aparelho fraco que enganou a heurística.

Por que "pausar animações fora da viewport" (pedido comum) não se aplica: o palco
é um canvas fixo **sempre visível** atrás de todas as seções — não existe estado
"offscreen" dele. O equivalente real é pausar quando a aba perde foco, o que já
existe via `visibilitychange`; e o trabalho por cena é arbitrado por proximidade
de viewport (`isForemostScene`).

Não feito de propósito: `React.lazy` por seção. O maior chunk (GSAP) é necessário
já no load da hero, então o ganho seria marginal, enquanto o code-split
desestabilizaria a medição do canvas persistente e a sincronia de scroll.

## Bugs encontrados e corrigidos na validação em navegador

Nenhum destes aparecia no `npm run build` — todos foram encontrados medindo a
página rodando.

**1. Cena final sequestrando o palco (arbitragem).** As faixas de scroll das
cenas se sobrepõem de propósito (é o que faz uma transição começar antes de a
anterior acabar). Sem arbitragem, a última `ScrollTrigger` a disparar no frame
ganhava — e como a ordem é a de criação, a **cena final ativava aos 60% da
página**, enquanto o usuário ainda estava no mosaico. Corrigido com arbitragem
por proximidade: só escreve no palco a cena cujo retângulo está mais próximo do
centro da viewport (`isForemostScene` em `useStageScene.ts`). Verificado depois:
sequência monotônica `cards → mosaic → network → dormant → final-hands`.

**2. Mãos ilegíveis.** Rasterizando os buffers de pontos em grade ASCII, as
duas "mãos" eram manchas sem dedos distinguíveis: dedos de 27px com vãos de 9px
não sobrevivem à amostragem, e a palma preenchida virava um bloco. Corrigido
aumentando a resolução da máscara (320×300 → 460×420), afinando os dedos e
alargando os vãos, dando um polegar de verdade, e — o mais importante —
desenhando a mão robótica em **contorno** em vez de preenchida, o que a torna
mecânica e visualmente distinta da orgânica.

**3. Mãos sobrepostas.** Mesmo com silhuetas boas, as duas mãos e o núcleo se
fundiam num único borrão central: o `offsetX` da hero empurrava a mão direita
para fora do quadro e comprimia a esquerda contra o núcleo. Corrigido reduzindo
o `offsetX`, aumentando o `HAND_SPREAD` e contendo o núcleo durante a formação.

**4. Parceiros invisíveis.** 10 de 30 logos ficavam em `opacity < 0.05` com a
seção já visível, porque a onda de revelação se espalhava por 55% de uma faixa
de scroll que terminava fora da tela. Para prova comercial isso é inaceitável.
Corrigido comprimindo a onda e encerrando a faixa com a seção ainda visível.

**5. Partículas demais em viewport estreito.** `useDevicePerformance` só olhava
`pointer: coarse`, então uma janela de 390px num desktop recebia 2600
partículas. Passou a considerar a largura da viewport (com resize debounced).

**6. Copy oculta da acessibilidade por `autoAlpha`.** As etapas do Método
usavam `autoAlpha: 0` como estado inicial da animação de entrada. `autoAlpha`
aplica `visibility: hidden`, o que remove o texto da **árvore de
acessibilidade** e do `innerText` até o usuário rolar até a seção — ou seja, a
etapa "Diagnóstico" era invisível para leitores de tela e crawlers em quem
nunca chegasse lá. Trocado por `opacity` puro: visualmente idêntico, conteúdo
acessível desde o carregamento. (Verificação relacionada: o `SplitText` da
headline está correto — ele põe `aria-label` no `h1` e `aria-hidden` nos spans
de palavra, preservando a leitura.)

**7. (sessão anterior) Kill global de ScrollTrigger.** O cleanup do `App`
chamava `ScrollTrigger.getAll().forEach(t => t.kill())`, matando triggers de
componentes-filho. Corrigido para matar apenas o `ScrollSmoother` que o próprio
`App` criou.

## Hero sem morph de partículas (rodada 11)

A pedido, o scroll da hero não forma mais nuvem, núcleo nem o wordmark PAYCON.
O visual da hero passou a ser só o `HeroIntroGraphic` (cards conectados) — sem
pin, sem coreografia, sem sequência pra reverter. É uma seção normal, do
tamanho do seu próprio conteúdo.

O que mudou:

- **`PayconHero.tsx` reescrito**: removidos o pin (`pinRef`, o `end:
  +=innerHeight*3`), as 6 fases da coreografia antiga e o `onProgress` que
  desvanecia copy/gráfico por progresso de scroll. Restou uma única faixa
  (`{ phase: "hero-cloud", opacity: [0, 0] }`) que só existe para manter o
  palco de partículas **invisível** enquanto a hero está em foco — as cenas
  seguintes (scanner, cards, mosaico, rede de parceiros, PAYCON do CTA final)
  continuam dependendo do mesmo palco persistente, então ele não podia
  simplesmente ser removido da árvore.
- **`.sticky` deixou de ter `height: 100vh; overflow: hidden`** (que existia
  para conter o quadro PINADO exatamente na viewport) e passou a
  `min-height: 100vh` — sem pin, um `overflow:hidden` teria cortado a
  composição num viewport baixo/estreito.
- **`HeroIntroGraphic` simplificado**: não precisa mais de `forwardRef` (nada
  externo controla sua opacidade agora — ela nunca precisa desvanecer).
- **Limpeza de código morto em `choreography.ts`/`stageState.ts`**: as fases
  `hero-gather`, `hero-condense`, `hero-core`, `hero-wordmark` e `hero-release`
  (e os helpers só usados por elas — `HERO_LOGO_SX`, `HERO_LOGO_VH`,
  `heroLogoY()`) nunca mais são atingidas por nenhum componente, então foram
  removidas do `switch` e do tipo `StagePhase`. Confirmado por grep antes de
  remover que nada mais referenciava essas fases. O CTA final usa constantes
  próprias (`FINAL_LOGO_SX`/`FINAL_LOGO_VH`/`finalLogoY()`), então **a formação
  do PAYCON no CTA final não foi tocada** — verificado depois da limpeza:
  `logoReady: true`, 2500 partículas formadas normalmente.

Medido: com o palco em `stageOpacity: 0` durante toda a altura da hero
(694px), zero pixels de partícula visíveis; ao passar da hero, a fase muda
para `scanner` (da `AnalysisScene`) sem vão nem disputa pelo palco. Bundle JS
caiu ~1 kB gzip refletindo a remoção do código morto.

## Ressincronização de copy com o site oficial (rodada 10)

O site fonte (`lp.payconautomacoes.com.br`) mudou desde a captura original de
2026-07-27 — e havia truncamentos que não vieram de lá. Comparei o texto ATUAL
do site ao vivo (lido do DOM real, não de cache) contra `payconLandingContent.ts`
campo a campo e corrigi todas as divergências encontradas:

- **Todos os 13 depoimentos estavam truncados** — cortados no meio da frase.
  Reescritos com o texto completo, lido diretamente do `textContent` de cada
  card no site ao vivo. Um deles (Luiz Tassitani) tem uma frase duplicada
  ("...redução efetiva do SLA redução efetiva do SLA de pagamentos.") — verifiquei
  que é assim no próprio DOM da fonte, não um erro de transcrição minha; mantido
  verbatim, com comentário no código explicando.
- **`solutionsIntro.principles` tinha só 3 itens com texto errado** — o site
  oficial tem 4 princípios distintos ("DNA Jurídico", "P2P: De Pessoa para
  Pessoa", "Tecnologia de Advogados para Advogados", "Eficiência Dentro de
  Casa"); a versão anterior tinha misturado a descrição de dois deles num só.
- **`solutions.insights.description`** estava faltando a segunda frase
  ("Através de uma análise técnica e precisa...").
- **`solutions.contratos.description`** era uma paráfrase inventada
  ("Gestão inteligente de contratos, do cadastro ao vencimento") — trocada pela
  frase verbatim do site.
- **`solutions.controladoria` e `solutions.societario` tinham descrição
  inventada** que não existe no site oficial (esses dois cards vão direto do
  título para a lista de recursos, sem frase de abertura). `description` virou
  campo opcional no tipo `SolutionProduct`, e `SolutionsScene.tsx` só renderiza
  o parágrafo quando ele existe.
- **Ana Luiza**: byline no site é "Supervisora de Legal Ops na Afya
  Educacional" — `company` corrigido de `"Afya"` para `"Afya Educacional"`.

Verificado que os cards de depoimento crescem para acomodar o texto completo
sem cortar nada (`.card` usa `min-height`, não `height` fixo) — medido: 0px de
transbordo até no depoimento mais longo (495 caracteres, Julianne Lacerda).

### Fundo dos logos de clientes — tom uniforme

Bug relatado: os logos de clientes pareciam ter tons de branco diferentes entre
si. Causa raiz confirmada por amostragem de pixel (canto do arquivo): o logo do
Afya tem fundo branco **opaco** (`#ffffff`) já embutido na imagem, enquanto
quase todos os outros (Sabesp, C&A, Samsung, Votorantim, Carrefour, Suzano...)
são **transparentes**. O painel do card atrás de cada logo estava em
`opacity: 0.92`, então ~8% do fundo escuro da página vazava por trás dos logos
transparentes — só o Afya, com branco já opaco no arquivo, escapava desse
escurecimento. Corrigido tornando o painel opaco (`rgb(244,245,248)`, sem
alpha) em `PartnersScene.tsx` (reveal por scroll) e `PartnersScene.module.css`
(hover e reduced-motion). Medido: os 30 logos convergem para o mesmo
`rgb(244, 245, 248)` depois do scroll assentar.

Sabesp já estava no array `partners` e renderizando (30/30 células, sem
slicing) — confirmado, nenhuma mudança de código foi necessária para ele.

## Hero: gráfico de cards no repouso, partículas assumem ao rolar

A pedido, o estado de REPOUSO da hero (o que aparece antes de rolar) trocou de
nuvem de partículas para um gráfico de produto: um hub central com ícones
satélite conectados por linhas tracejadas — inspirado no ARRANJO de uma
referência visual (hub + cards + conectores + badge) fornecida pelo usuário.

**Original em tudo que é da marca**: paleta azul/cinza da Paycon (a referência
usava verde — não copiado), ícones e ângulos próprios (`Workflow` no hub,
`FileText`/`Link2`/`CheckCircle2` nos satélites — ecoando a própria copy da
hero: tarefas, integração, um clique), e **sem nenhuma métrica ou rótulo
inventado**: o badge flutuante é só um ícone de check, sem número (a
referência tinha "48%" — não replicado, pois não existe esse dado na Paycon).

Componente: `src/components/HeroIntroGraphic/HeroIntroGraphic.tsx`. Hub e
satélites ficam num espaço de coordenadas 400×300 compartilhado entre os cards
(posicionados em `%`) e o SVG dos conectores (`viewBox` nos mesmos pontos) —
alinham em qualquer largura sem conversão manual. Entrada animada por GSAP
(hub → linhas → satélites → badge, com `stagger`); giro/flutuação sutil por
CSS (`prefers-reduced-motion` desliga via `@media`, mesmo padrão do resto do
projeto). Tilt de cursor de 5° via `useTilt` — o MESMO hook já usado na rede de
parceiros, camada 3, sem criar rAF próprio.

**Ao rolar, o gráfico desvanece e as partículas assumem** a narrativa que já
existia (nuvem → núcleo → PAYCON), sem interrupção:

- O segmento `hero-cloud` (em `PayconHero.tsx`) ganhou `opacity: [0, 1]` — as
  partículas entram em 0% e chegam a 100% de opacidade ao final da fase
  (22% do scroll da hero).
- `onProgress` desvanece o gráfico linearmente até `GRAPHIC_FADE_OUT_END`
  (14% do scroll) — **antes** das partículas chegarem a 100%, então não há vão:
  no instante em que o gráfico some, as partículas já estão a ~64% visíveis.
- Medido (crossfade real, não estimado): p=0 → gráfico 1,00 / partículas 0,00;
  p=0,05 → 0,64 / 0,23; p=0,10 → 0,29 / 0,46; **p=0,14 → 0,001 / 0,64**; p=0,20
  → 0 / 0,91; p=0,22 → 0 / 1,00 (fase muda para `hero-gather`).
- `HeroIntroGraphic` só é renderizado com `!reducedMotion`: sob movimento
  reduzido não há scroll-driven nada, e o palco já mostra sua própria nuvem
  estática (comportamento anterior, inalterado) — sem os dois se sobrepondo.

**Detalhe de implementação que evitou um bug de layout**: a ref que o pai usa
para controlar a opacidade aponta para o PRÓPRIO elemento `position: absolute`
do gráfico (via `forwardRef`), não para um `<div>` wrapper. Um wrapper com
`transform`/`opacity` aplicados via JS criaria um novo bloco de contenção
(`containing block`) para esse `position: absolute`, e o `left/top` em `%` do
gráfico passaria a resolver contra o wrapper (tamanho zero) em vez do `.sticky`
— quebrando a posição assim que o scroll começasse.

**Bug encontrado e corrigido (relatado pelo usuário, com print): partículas
"acendiam" ao passar o mouse sobre o gráfico, mesmo em repouso.** A causa era
o reforço de alpha por proximidade do cursor —
`alpha = Math.min(1, alpha + f * 0.5)` em `ParticleStage.tsx` — que SOMAVA
visibilidade direto, sem passar pelo `stageOpacity` que devia manter as
partículas invisíveis (0) enquanto o `HeroIntroGraphic` está em cena. Corrigido
multiplicando o reforço por `stageOpacity`: `alpha + f * 0.5 * stageOpacity`.
Medido: com `stageOpacity=0`, 0 pixels acesos com ou sem cursor (antes:
qualquer aproximação do mouse já pintava partículas); com `stageOpacity=1`
(demais fases), o reforço de proximidade continua idêntico a antes (nuvem
cresce 1398→1658 partículas visíveis com o cursor perto — mesmo número de
antes desta correção).

## Hero: nuvem que segue o cursor

A hero **não usa mais mãos nem dedos**. A forma principal é uma nuvem de
partículas que acompanha o ponteiro, com núcleo denso e corpo difuso que se
deforma ao se deslocar — o comportamento da referência em vídeo
(`Reference/sparcleydesign_pindown.io_1785161207.mp4`).

**Como o vídeo foi lido**: rasterizei frames em ASCII no navegador (o painel não
compõe frames, então não havia como assistir). Entre t=2s e t=6s a massa
luminosa migra ~35% da largura mantendo a escala — não é objeto rígido nem mão,
é uma massa que segue o ponteiro.

**Implementação** (`buildCloud` em `particleShapes.ts`):

- Distribuição radial com viés forte para o centro (`r = u^1.9`), levemente
  achatada na horizontal — lê como massa, não como círculo.
- Cada partícula recebe um **fator de atraso** proporcional à distância do
  centro. O `ParticleStage` usa esse fator na taxa de interpolação
  (`baseLerp * (0.3 + lag * 1.1)`): as de dentro acompanham rápido, as de fora
  ficam atrás. **O rastro e a deformação vêm daí** — não há efeito de trail.
- O centro da nuvem é o ponteiro já amortecido (`pointer.x/y`, damping 0.075),
  limitado por `FOLLOW_X` e `FOLLOW_Y`.

**Ajuste (a pedido — "vira um rastro do cursor"):** os limites eram pequenos
demais (`FOLLOW_X` 0.62, `FOLLOW_Y` 0.22) e prendiam a nuvem numa janela central
estreita — na prática ela quase não se movia. Subidos para `FOLLOW_X = 1.05` e
`FOLLOW_Y = 0.78`, a nuvem agora viaja por boa parte da hero. O atraso que faz
parecer rastro (e não teleporte) já existia no damping do `stepPointer` — só o
alcance estava curto.

Medido nos 4 cantos da viewport (720×694, canvas real, cursor movido e damping
convergido): o centroide da nuvem chega a **13–81px** do alvo do cursor em cada
canto — antes, com os limites antigos, ela praticamente não saía do centro. O
header (`z-index: 100`) fica sempre acima do palco (`z-index: 0`), então a nuvem
pode passar por baixo do texto sem conflito de camadas.

**Fases da hero** (renomeadas): `hero-cloud` → `hero-gather` → `hero-condense`
→ `hero-core` → `hero-entry`. A nuvem segue o cursor nas duas primeiras, condensa
no núcleo Paycon na terceira e a câmera atravessa na última.

### Sobre as mãos da referência

As ilustrações de mãos do screenshot `Reference/download.jpeg` são de um site de
terceiro. **Não foram reutilizadas** — usá-las numa página comercial criaria
exposição de propriedade intelectual. As tentativas anteriores (mãos completas,
depois dedos em retículo) foram descartadas a pedido; o conceito atual é a nuvem.

## Ajustes da quarta rodada

**Moldura global removida.** O `ExperienceFrame` (retângulo arredondado fixo em
volta da viewport) foi apagado, junto do CSS de `--frame-inset` no header. A
página usa a viewport inteira; bordas sutis continuam apenas em componentes
(scanner, cards, painel do formulário).

**Hero recomposta na estrutura da referência.** Logo no topo à esquerda,
navegação compacta numa pill escura ao centro (Home · Soluções · Clientes ·
Diferenciais, com `aria-current` por `IntersectionObserver`), CTA em pill de alto
contraste à direita. Headline, apoio e CTA agora **centralizados** na área
superior; os dois dedos e o núcleo ocupam a área inferior (`offsetY` do palco em
−0,46). O menu mobile mantém a navegação **completa** — nenhum link foi perdido.

**Labels técnicos removidos da hero.** "NÚCLEO PAYCON / CONEXÃO ATIVA",
"CONHECIMENTO HUMANO" e "AUTOMAÇÃO · DADOS · IA" saíram; restou apenas a
indicação discreta de scroll. As duas tags equivalentes no CTA final também
foram removidas — ficaram órfãs quando aquela cena passou a formar a logo.

**Bug do "Análise de Base Ativa" corrigido.** Causa medida: `buildScanner`
distribuía TODAS as partículas em 11 linhas horizontais finas; com blending
aditivo cada linha acumulava ~236 sprites no mesmo strip e estourava em branco
(58–74 pixels saturados por linha, 312 no total). Correções: (a) a estrutura
virou uma grade 2D de 26×14 módulos com vãos reais, (b) alpha/size/heat
contidos e feixe mais estreito, (c) glow do feixe reduzido de `20px 3px` para
`8px 0`, (d) **contenção por clip** — a cena publica o retângulo da moldura em
`stageState.clip` e o render desvanece o que cai fora.
Depois: **2 pixels saturados** (máx. 2 por linha), densidade por linha de 136 →
41, e partículas 100% dentro da moldura.

**Sobreposição do título P2P corrigida por fluxo, não por z-index.** O intro
estava em `top: clamp(150px,17vh,230px)` e a pilha em `top: 57%`; em 1366×768 as
faixas se cruzavam (10px de sobreposição medidos). O `.sticky` virou
`grid-template-rows: auto minmax(0,1fr)`: o intro tem a própria linha e a pilha
só existe na de baixo. Resultado: **46px de folga**. Os cards também só começam
a percorrer depois de 30% do progresso.

**Sobre a PAYCON em duas colunas.** Os sócios ocupam a coluna esquerda (que
estava vazia) e o texto institucional a direita, no mesmo `<section>`, com filete
ligando os retratos. Em ≤1000px o institucional vem primeiro e os sócios
imediatamente abaixo.

**Formação da logo antecipada.** Era `gather 0–0.3 / assemble 0.28–0.85`; agora
`0.22–0.45 / 0.40–0.68`, com o pulso em 0.82–0.97 e a faixa de scroll de
`top 92% → bottom 78%`. Medido: aos 64% as 2600 partículas já formam o wordmark
(PAY 1228 / CON 1372) com a seção inteira ainda na tela.

**Overflow do formulário corrigido.** Causa: `grid-template-columns: 1fr 1fr` —
itens de grid têm `min-width: auto` e não encolhem abaixo do min-content do
input, então 3 campos furavam o painel em **40px**. Correção: `minmax(0, 1fr)`,
`min-width: 0` nos wrappers, `width/max-width/box-sizing` explícitos nos
controles, select e botão em `grid-column: 1 / -1`, padding do card em
`clamp(28px, 4vw, 52px)`, e o layout da seção empilha em ≤1100px (a 1024px a
coluna do form era esmagada para 344px). Campos, labels, validação, endpoint e
integração **não foram tocados**; só ganharam `:-webkit-autofill` para o autofill
não quebrar o tema escuro.

**Bug de vazamento do clip (introduzido e corrigido nesta rodada).** Ao publicar
o clip direto de `AnalysisScene`, ele continuava ativo depois da cena e apagava o
palco inteiro na hero (canvas vazio). O clip passou a ser gerido por
`useStageScene`: a cena em foco publica, todas as outras limpam — atômico.

## Ajustes da terceira rodada

**Hero estabilizada.** A rotação 3D do conjunto e o parallax por camada foram
removidos do `ParticleStage`; os `useParallax` dos labels da hero foram
retirados; a amplitude de câmera caiu de `zoom 1→1.75 / camZ 0→0.6` para
`1→1.32 / 0→0.34`. Só resta a luz ambiente e o campo local de partículas.

**Duas mãos → dois dedos.** Ver "Os dois dedos" acima.

**Foco dos Diferenciais antecipado.** Antes os quadradinhos só ficavam nítidos
quando a seção já havia passado do topo. Medido antes e depois, pela posição do
topo da seção:

| Topo da seção | Antes | Depois |
|---|---|---|
| 810px (abaixo da viewport) | blur 9,0 / op 0,00 | blur 9,0 / op 0,00 |
| 630px (entrando) | blur 9,0 / op 0,00 | **blur 0,3 / op 0,97** |
| 450px | blur 9,0 / op 0,00 | **blur 0,0 / op 1,00** |
| 270px | blur 8,3 / op 0,08 | **blur 0,0 / op 1,00** |
| −90px (saindo) | blur 0,6 / op 0,93 | blur 2,2 / op 0,65 |

Os quadradinhos foram **preservados** — só a entrada, o escalonamento e a saída
mudaram.

**Respiro da seção de Soluções.** A intro ficava a 26px do header; agora fica a
71px (`top: clamp(150px, 17vh, 230px)`), com a pilha de cards a 57% da altura,
levemente abaixo do centro. `min-height` virou `height: 100vh` porque o elemento
é pinado e não pode transbordar a viewport.

**O dado "+80%".** Estava flutuando sobre o scanner, sem relação com a copy de
Insights (que trata de baixa de provisão). O dado **não foi removido**: ele vive
na seção de Diferenciais, dentro de um módulo de métrica com o seu próprio label
(“de acuracidade na previsão de pagamentos judiciais”) e ao lado das outras duas
métricas oficiais. O que saiu foi a duplicata solta.

**Logos dos clientes em cores originais.** O `filter: grayscale(1) brightness()
opacity()` foi removido — nenhum logo passa por filtro de cor em nenhum estado.
Como muitos arquivos foram desenhados para fundo claro (logos escuros
desapareceriam sobre preto), cada logo recebeu um **painel off-white próprio**;
no hover o painel clareia e o logo ganha nitidez e escala, sem alterar as cores.
O box da imagem passou a ser reservado (`width: 100%` + `height` fixa +
`object-fit: contain`) em vez de depender do tamanho intrínseco — evita layout
shift e o caso em que uma imagem `loading="lazy"` de área zero nunca é baixada.

**Setas dos depoimentos.** Eram 38×38 (abaixo do mínimo de 44px). Agora o botão
inteiro tem 56×56, e 60×60 acima de 1280px — verificado no navegador. Ganharam
hover, `:active`, `:focus-visible`, `cursor: pointer` e `aria-label`. Foi
adicionado um indicador: contador `01 / 13` e uma barra de progresso com
`role="progressbar"` + `aria-valuenow`.

**Sócios junto de Quem somos.** Continuam no mesmo `<section id="sobre">`, agora
43px abaixo do texto institucional (era ~3–5rem), ligados por um filete técnico
vertical, sem mudança de fundo e sem partículas na área.

**Headline do formulário.** Subiu de `clamp(1.3rem, 1.9vw, 1.85rem)` para
`clamp(2rem, 4.4vw, 4rem)` com `line-height: 0.98`, e a coluna da headline ficou
maior que a do formulário. Campos, labels, validação, endpoint e mensagens
**não foram tocados**.

## Ajustes da oitava rodada

Três pedidos: aproximar a hero da referência de partículas, consertar a
navegação (Home / Soluções / Clientes / Diferenciais) e trocar a formação
quadrada pelo wordmark PAYCON oficial.

### A "grade quadrada" da hero

Confirmei o sintoma rasterizando o canvas do site publicado: por volta de
`scrollY ≈ 2013` as partículas se espalhavam numa **matriz regular** por toda a
viewport. A causa era a fase final da hero reformando em `lib.scanner`, que é
literalmente uma grade 26×14.

Ela foi substituída por duas fases novas — `hero-wordmark` (as partículas se
juntam no wordmark) e `hero-release` (as letras se soltam e viram o material da
cena seguinte, sem quadro vazio no meio).

### O wordmark é AMOSTRADO do arquivo oficial

`loadOfficialWordmark` em `src/lib/particleShapes.ts` lê
`public/assets/identity/paycon-logo-source.jpg` e converte a tinta em pontos.
Nada de texto digitado numa fonte qualquer.

Duas correções foram necessárias para ele deixar de sair como ruído:

- **Limiar de luminância 215, não 186.** O cinza do "CON" (`#B0B0B0`) tem
  luminância ≈176 e ficava perigosamente perto do corte; com 186 a divisão
  saía **1189 pontos em PAY contra 311 em CON**. Com 215: **754 / 746**.
- **Reamostragem sem suavização** (`imageSmoothingEnabled = false`). O upscale
  interpolado criava um halo azulado na borda das letras cinzas, que a regra
  `b - r > 14` classificava como "PAY".

### As posições verticais são fração da ALTURA da viewport

O palco projeta com `scale = min(largura, altura) / 2`. Num telefone o menor
lado é a largura, então uma constante em unidades de palco vale muito menos
pixels — e ao mesmo tempo o texto do CTA quebra em mais linhas e empurra o
botão para baixo. Resultado medido com constante fixa: o PAYCON final ficava a
**115px** do botão em 1920×1080 e a **11px** em 360×740.

`HERO_LOGO_VH = 0.58` e `FINAL_LOGO_VH = 0.74` resolvem isso: a mesma
proporção em qualquer tela, e nos desktops largos os números caem praticamente
sobre os anteriores.

Quem informa a métrica é o **laço de render**, via `setStageViewport(w, h)`.
A primeira versão calculava dentro do módulo e atualizava num listener de
`resize` — e ficava velha quando o evento não chegava: depois de ir de 360×740
para 1024×768, a logo era desenhada com a métrica antiga e sobravam **6px** até
a borda inferior. Sem cache, não há o que envelhecer.

### Navegação sincronizada com o scroll animado

O problema: as âncoras eram nativas. O navegador fazia seu próprio salto de
hash, que **ignora o ScrollSmoother** — a viewport ia para a seção, mas o
scroll interno que alimenta as ScrollTriggers não acompanhava, então os efeitos
ficavam num progresso e a página noutro.

`src/lib/navigation.ts` centraliza a correção. Quatro coisas que só apareceram
medindo:

1. **`trigger.start` é o lugar errado.** Ele marca onde a *animação* da cena
   começa (`"top 78%"`, com a seção ainda a 78% da viewport), não onde a seção
   encosta no topo. Usá-lo deixava a seção parando **541–659px** abaixo do
   destino. O certo é `offsetTop` somado pela cadeia de `offsetParent` — que já
   inclui os pin-spacers das seções pinadas.
2. **`scrollTo(elemento, smooth, "top 76px")` não move o scroll** nesta versão
   do ScrollSmoother (medido: `scrollTop` 0 nas duas variantes). A forma
   **numérica** funciona.
3. **Salto instantâneo não percorre as ScrollTriggers intermediárias**, então
   nenhuma cena escrevia no palco e o efeito ficava na fase antiga (scroll em
   4287px com o palco ainda em `hero-cloud`). Um `ScrollTrigger.update()` após
   o salto resolve — é isso que sincroniza animação e destino.
4. **`document.fonts.ready` pode não resolver.** A rotina de hash estava
   pendurada nessa promessa e simplesmente nunca executava. Agora ela começa de
   imediato e **tenta até assentar** (até 6 tentativas, cada uma conferindo se o
   scroll chegou a menos de 6px do destino), o que também absorve mudanças de
   medida por imagens que carreguem depois.

O marcador de seção ativa também saiu do IntersectionObserver, que não
acompanhava o smoother (medido: continuou em `#home` depois de rolar para
Soluções, Diferenciais e Clientes). Agora vem de ScrollTriggers dedicadas — a
mesma fonte de verdade das cenas —, então segue tanto o scroll manual quanto os
cliques.

### Sobre medição neste ambiente

Armadilhas encontradas, registradas para quem for validar depois:

- **`window.scrollTo` briga com o ScrollSmoother.** Medições davam resultados
  alternados/duplicados. O correto é usar a API do smoother
  (`smoother.scrollTo(y, false)`), exposta em `window.__payconSmoother` em DEV.
- **FPS não é medível aqui.** O painel do navegador não compõe frames quando
  não está em foco, então `requestAnimationFrame` é estrangulado (medi 0,6fps —
  artefato do harness, não do código). Por isso o custo foi medido de forma
  **síncrona**, cronometrando o trabalho real de desenho por frame.
- **Com o painel oculto (`document.hidden`), o Chrome para de recalcular estilo
  da árvore existente.** Isso produz leituras falsas: escrevi
  `img.style.opacity = '1'` direto no console, forcei layout, e
  `getComputedStyle` continuou devolvendo `0` — o que nenhuma regra de cascata
  explica. Um elemento recém-criado, sem estilo em cache, computa corretamente.
  Perdi um bom tempo perseguindo um "bug" nos logos dos parceiros que era só
  isso. Antes de investigar sintoma de estilo, **confirme
  `document.hidden === false`**.
- O loop do palco pausa quando `document.hidden` é true (correto, poupa
  bateria). Para medir nesse estado existe `window.__payconStage.debug
  .renderOnce(n)`, que desenha N frames sem agendar rAF.
- **Scroll *suave* não é medível aqui**, pelo mesmo motivo: a animação do
  `smoother.scrollTo(y, true)` depende de rAF, então ela congela no meio do
  caminho e amostras posteriores leem a posição do destino *anterior*. Para
  validar o destino use o caminho instantâneo,
  `window.__payconScrollTo(id, true)` (exposto em DEV) — é a mesma conta, sem
  animação.
- **Eventos de `resize` não chegam de forma confiável** ao redimensionar a
  viewport por ferramenta. Qualquer valor derivado da viewport que dependa
  desse listener vai ser lido velho; prefira calcular no ponto de uso.

Em DEV, `window.__payconStage` expõe `{ stageState, lib, targets, pointer,
debug }`. Todos os globais de debug são removidos no build de produção
(`import.meta.env.DEV`).

## Pendências reais

1. **Meta Pixel**: ID não recuperável via inspeção client-side (ver seção
   Analytics acima) — precisa ser fornecido pela Paycon.
2. **Logo vetorial**: cores extraídas de um JPEG 150×150px comprimido; se
   aparecer um arquivo vetorial, reamostrar (ver seção "Cores da marca").
3. **Fonte oficial**: nenhuma encontrada no projeto; `Inter` foi usada como
   substituta institucional provisória.
4. Não há testes automatizados (`npm run test`) configurados neste projeto.
5. `dist/assets/index-*.js` está com ~599 kB (189 kB gzip) num único chunk —
   funcional, mas um candidato natural a `dynamic import()` por seção se o
   tempo de carregamento inicial se tornar um problema real.
6. **`prefers-reduced-motion` não foi exercitado em runtime.** As ferramentas
   deste ambiente não emulam a media query, e forçá-la por evento sintético não
   alcança os listeners dos hooks. O que **foi** verificado: todas as regras
   `@media (prefers-reduced-motion: reduce)` existem no CSSOM e declaram os
   fallbacks corretos (pilha de cards → fluxo estático, tiles → `opacity: 1`,
   células de parceiro → `--reveal: 1`), e os caminhos JS têm saída antecipada
   por `reducedMotion`. Vale uma passada manual num browser com a preferência
   ativada antes de publicar.
7. Safari e Firefox não foram testados (só o Chromium do ambiente). O
   `backdrop-filter` nos cards e o `preserve-3d` na pilha são os pontos que
   merecem olhada.

## Testado

Build de produção (`npm run build`), tipos (`tsc -b`), lint (`oxlint` — zero
avisos), e verificação **medida** no navegador:

| O que | Resultado |
|---|---|
| Palco único e persistente | 1 canvas para toda a página |
| Progressão da narrativa | `hero-idle → hands → converge → core → entry → scanner → cards → mosaic → network → dormant → final-hands` |
| Reversibilidade | voltando ao topo retorna a `hero-idle p=0.00` |
| Separação das mãos | humana x ≈ -0,59 / robótica x ≈ +0,56 (~520px em 1440px) |
| Silhuetas | rasterizadas em ASCII: palma + 4 dedos com vãos + polegar em ambas |
| Reação ao cursor | 84px de deslocamento do centroide entre extremidades |
| Custo de desenho | 5,45 ms/frame @2600 partículas (33% do orçamento de 60fps) |
| Cursor rápido / saindo da janela | valores finitos, damping estável, campo desliga |
| Scrub rápido por toda a página e volta | 0 alvos não-finitos (sem NaN) |
| Overflow horizontal | 0px em 390px e 1440px, em 6 posições de scroll |
| Parceiros | 30 logos, 0 ocultos com a seção em vista |
| Mobile 390px | 620 partículas, cards em fluxo, CTA visível no primeiro viewport |
| Copy comercial | 26 trechos-chave conferidos no `innerText`, 0 ausentes |
| Analytics | `dataLayer` (GTM) e `clarity` presentes em runtime |
| Link do WhatsApp | `wa.me/5511914070729?text=…` preservado |
| Console | nenhum erro novo após percorrer a página inteira |
| Larguras testadas | 1920, 1440, 1366, 1024, 768, 390, 360 — overflow horizontal 0 em todas |
| Wordmark oficial amostrado | `logoReady` true, proporção 0,158, divisão PAY/CON **754 / 746** |
| Legibilidade do wordmark | raster ASCII lê P-A-Y em azul e C-O-N em cinza |
| Hero forma o wordmark | `hero-wordmark` p=0,52 → distância média ao alvo **0,024**; `hero-release` p=0,17 → **0,000** |
| Hero: centro do wordmark | **57% da altura** da viewport em todas as 7 larguras, centrado no eixo X |
| PAYCON do CTA final | centrado no X; **66–217px** abaixo do botão e **186–262px** até a borda inferior nas 7 larguras |
| Timing do PAYCON final | formado em p=0,42, opaco a partir de 0,62, legível até 1,0 |
| Navegação (4 links) | seção pousa a **76px** (offset do header) com a fase do palco correta: `scanner` / `mosaic` / `network` / `hero-cloud` |
| Hash direto | `#clientes` pousa em 5271px na 1ª tentativa, fase `network` |
| ScrollTriggers | 13 no total (9 de cena + 4 do marcador ativo), 1 smoother, `scroll-behavior: auto` |
| Caminho sem smoother (reduced motion) | `window.scrollTo` move a página (0 → 7971) |
| HeroIntroGraphic: crossfade com as partículas | medido sem vão: p=0,14 → gráfico 0,001 / partículas 0,636 |
| HeroIntroGraphic: mobile 390px | sem overlap com copy/CTA, margem clara até "role para conectar" |
| HeroIntroGraphic: build de produção | console limpo, JS +1,06 kB gzip, CSS +0,43 kB gzip |

O formulário teve validação exercitada (os 6 erros de campo obrigatório
aparecem com `role="alert"`), **sem completar um envio real** — cada envio cria
um lead de verdade no CRM da Paycon.
