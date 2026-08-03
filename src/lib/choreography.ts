import type { ShapeLibrary } from "./particleShapes";
import { pointer, type StageState } from "./stageState";

/**
 * Escreve os alvos das partículas para a fase atual, EM BUFFERS PREALOCADOS.
 *
 * A versão anterior desta página alocava um array de objetos por frame por
 * canvas (`targets.map(...)`), gerando churn de GC. Aqui nada é alocado durante
 * o loop: a coreografia apenas escreve em Float32Arrays existentes.
 */

export type TargetBuffers = {
  x: Float32Array;
  y: Float32Array;
  z: Float32Array;
  /** 0 = lado humano (cinza), 1 = lado tecnológico (azul), 2 = núcleo */
  kind: Uint8Array;
  size: Float32Array;
  alpha: Float32Array;
  /** 0..1 — quanto a partícula "acende" (usado pelo feixe do scanner e pelo núcleo) */
  heat: Float32Array;
};

export function createTargetBuffers(count: number): TargetBuffers {
  return {
    x: new Float32Array(count),
    y: new Float32Array(count),
    z: new Float32Array(count),
    kind: new Uint8Array(count),
    size: new Float32Array(count),
    alpha: new Float32Array(count),
    heat: new Float32Array(count),
  };
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Remapeia progresso para uma janela [s,e]. */
const win = (p: number, s: number, e: number) => clamp01((p - s) / (e - s));
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/**
 * NUVEM DA HERO.
 *
 * `CLOUD_R` é o raio da nuvem em unidades normalizadas. `FOLLOW` limita o quanto
 * o centro da nuvem se afasta do centro da composição ao seguir o cursor — sem
 * esse limite ela sairia do quadro e passaria por cima da copy.
 */
const CLOUD_R = 0.34;
/**
 * ALCANCE DE SEGUIMENTO — a pedido, a nuvem virou um RASTRO do cursor: o
 * centro dela vai de fato até onde o mouse está, em vez de só se deslocar
 * dentro de uma janela central pequena. O atraso que faz parecer rastro (e
 * não teleporte) já vem do damping em `stepPointer` — aqui é só o alcance.
 *
 * X mais largo que Y: a composição é mais larga que alta, e um alcance
 * vertical igual ao horizontal levaria o núcleo por cima do header (z-index
 * 100, então não haveria conflito visual, mas o efeito ficaria estranho saindo
 * por cima da nav).
 */
const FOLLOW_X = 1.05;
const FOLLOW_Y = 0.78;

/**
 * Wordmark oficial. A escala vertical vem da PROPORÇÃO REAL da caixa de tinta
 * (`lib.logoAspect`), não de um valor fixo — assim a tipografia nunca estica.
 */
const HERO_LOGO_SX = 0.52;
const FINAL_LOGO_SX = 0.46;

/**
 * ALTURA DOS WORDMARKS EM FRAÇÃO DA VIEWPORT, não em constante de palco.
 *
 * O palco projeta com `scale = min(largura, altura) / 2`. Num telefone o menor
 * lado é a LARGURA, então um deslocamento fixo em unidades de palco vale muito
 * menos pixels — enquanto o conteúdo do CTA fica mais alto, porque o texto
 * quebra em mais linhas. As duas coisas juntas aproximavam o wordmark do botão
 * (medido em 360×740: apenas 11px de folga, contra 115px em 1920×1080).
 *
 * Ancorando na ALTURA da viewport, a posição vertical passa a ser a mesma
 * proporção em qualquer tela. Nos desktops largos os valores caem praticamente
 * sobre os anteriores (em 1920×1080: −0,16 e −0,48 contra −0,16 e −0,46).
 */
const HERO_LOGO_VH = 0.58;
const FINAL_LOGO_VH = 0.74;

/**
 * Altura da viewport expressa em unidades verticais do palco.
 *
 * Quem informa isto é o próprio laço de render, que já mede a viewport a cada
 * quadro. A primeira versão calculava aqui dentro e atualizava num listener de
 * `resize` — e ficava DESATUALIZADA quando o evento não chegava (medido: depois
 * de ir de 360×740 para 1024×768 a logo final foi desenhada com a métrica
 * antiga e sobrou apenas 6px até a borda inferior). Com a métrica vindo do
 * render não existe cache para envelhecer.
 */
let heightInStageUnits = 2;

/** Informa as dimensões da viewport usadas na projeção do quadro atual. */
export function setStageViewport(width: number, height: number) {
  if (width > 0 && height > 0) heightInStageUnits = height / (Math.min(width, height) / 2);
}

/** Centro vertical do wordmark da hero, em unidades de palco. */
function heroLogoY() {
  return (0.5 - HERO_LOGO_VH) * heightInStageUnits;
}

/** Centro vertical do wordmark do CTA final, abaixo do botão. */
function finalLogoY() {
  return (0.5 - FINAL_LOGO_VH) * heightInStageUnits;
}

/** Posição do wordmark para uma partícula, dada escala e centro vertical. */
function wordmarkPoint(lib: ShapeLibrary, i: number, sx: number, cy: number) {
  const sy = sx * lib.logoAspect.value;
  return { x: lib.logo[i * 2] * sx, y: lib.logo[i * 2 + 1] * sy + cy };
}

export function writeTargets(
  state: StageState,
  lib: ShapeLibrary,
  buf: TargetBuffers,
  count: number,
  time: number
) {
  const p = state.p;
  const phase = state.phase;

  switch (phase) {
    case "hero-cloud": {
      /**
       * ESTADO PRINCIPAL — a nuvem SEGUE O CURSOR.
       *
       * O centro é o ponteiro já amortecido (`pointer.x/y`, damping 0.075 no
       * `stepPointer`), limitado por FOLLOW_X/Y para não invadir a copy. O
       * rastro e a deformação vêm do atraso desigual por partícula
       * (`lib.cloudLag`, aplicado no ParticleStage), não de um efeito de trail.
       */
      const cxp = pointer.x * FOLLOW_X;
      const cyp = pointer.y * FOLLOW_Y;
      const pulse = 0.5 + 0.5 * Math.sin(time * 1.4);
      // a nuvem "respira" e gira muito lentamente
      const rot = time * 0.06;
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);

      for (let i = 0; i < count; i++) {
        const ox = lib.cloud[i * 2] * CLOUD_R;
        const oy = lib.cloud[i * 2 + 1] * CLOUD_R;
        buf.x[i] = cxp + ox * cosR - oy * sinR;
        buf.y[i] = cyp + ox * sinR + oy * cosR;
        buf.z[i] = 0.18 + (1 - lib.cloudLag[i]) * 0.3;

        // núcleo denso branco/azul no centro, corpo cinza nas bordas
        const inner = lib.cloudLag[i];
        buf.kind[i] = inner > 0.78 ? 2 : i % 3 === 0 ? 1 : 0;
        buf.size[i] = lib.cloudSize[i] * (inner > 0.78 ? 1 + pulse * 0.3 : 1);
        buf.alpha[i] = 0.34 + inner * 0.6;
        buf.heat[i] = inner > 0.78 ? 0.4 + pulse * 0.25 : inner * 0.18;
      }
      break;
    }

    case "hero-gather": {
      // A nuvem se recolhe: ainda segue o cursor, mas com menos amplitude.
      const t = easeInOut(p);
      const cxp = pointer.x * FOLLOW_X * (1 - t * 0.6);
      const cyp = pointer.y * FOLLOW_Y * (1 - t * 0.6);
      const r = lerp(CLOUD_R, CLOUD_R * 0.72, t);
      const pulse = 0.5 + 0.5 * Math.sin(time * 1.8);

      for (let i = 0; i < count; i++) {
        buf.x[i] = cxp + lib.cloud[i * 2] * r;
        buf.y[i] = cyp + lib.cloud[i * 2 + 1] * r;
        buf.z[i] = 0.18 + (1 - lib.cloudLag[i]) * 0.22;
        const inner = lib.cloudLag[i];
        buf.kind[i] = inner > 0.7 ? 2 : i % 3 === 0 ? 1 : 0;
        buf.size[i] = lib.cloudSize[i] * (1 + t * 0.1) * (inner > 0.7 ? 1 + pulse * 0.25 : 1);
        buf.alpha[i] = 0.4 + inner * 0.6;
        buf.heat[i] = inner > 0.7 ? 0.5 + pulse * 0.3 : inner * 0.22;
      }
      break;
    }

    case "hero-condense": {
      // Condensa no núcleo Paycon; linhas de dados atravessam o centro.
      const t = easeInOut(p);
      const r = lerp(CLOUD_R * 0.72, 0.16, t);
      const pulse = 0.5 + 0.5 * Math.sin(time * 2.2);
      const cxp = pointer.x * FOLLOW_X * 0.4 * (1 - t);
      const cyp = pointer.y * FOLLOW_Y * 0.4 * (1 - t);

      for (let i = 0; i < count; i++) {
        const ox = lib.cloud[i * 2] * r;
        const oy = lib.cloud[i * 2 + 1] * r;
        // parte das partículas migra para a forma do núcleo
        const toCore = i % 4 === 0 ? t : t * 0.35;
        buf.x[i] = lerp(cxp + ox, lib.coreFull[i * 2] * 0.3, toCore);
        buf.y[i] = lerp(cyp + oy, lib.coreFull[i * 2 + 1] * 0.3, toCore);
        buf.z[i] = 0.2;
        const inner = lib.cloudLag[i];
        buf.kind[i] = inner > 0.6 || i % 4 === 0 ? 2 : i % 3 === 0 ? 1 : 0;
        buf.size[i] = lib.cloudSize[i] * lerp(1, 1.2, t) + pulse * 0.2;
        buf.alpha[i] = 0.5 + inner * 0.5;
        buf.heat[i] = lerp(inner * 0.3, 0.7 + pulse * 0.25, t);
      }
      break;
    }

    case "hero-core": {
      // Núcleo formado e pulsando; expansão contida, sem flash.
      const t = easeInOut(p);
      const pulse = 0.5 + 0.5 * Math.sin(time * 2.2);
      const scale = lerp(0.3, 0.46, t);

      for (let i = 0; i < count; i++) {
        buf.x[i] = lib.coreFull[i * 2] * scale;
        buf.y[i] = lib.coreFull[i * 2 + 1] * scale;
        buf.z[i] = 0.22;
        buf.kind[i] = i % 5 === 0 ? 1 : 2;
        buf.size[i] = 0.9 + pulse * 0.3;
        buf.alpha[i] = 0.88;
        buf.heat[i] = 0.55 + pulse * 0.25;
      }
      break;
    }

    case "hero-wordmark": {
      /**
       * FORMA O WORDMARK PAYCON — substitui a antiga remontagem na grade do
       * scanner, que aparecia como um retângulo regular de pontos por toda a
       * viewport (era esse o "quadrado").
       *
       * PAY assume o azul institucional e CON o cinza, pela classificação de cor
       * do próprio arquivo oficial. Enquanto a imagem não carregou
       * (`logoReady.value === false`), o núcleo permanece — nunca uma grade.
       */
      const form = easeInOut(win(p, 0, 0.72));
      const settle = win(p, 0.62, 1);
      const ready = lib.logoReady.value;
      const heroY = heroLogoY();

      for (let i = 0; i < count; i++) {
        const cx0 = lib.coreFull[i * 2] * 0.46;
        const cy0 = lib.coreFull[i * 2 + 1] * 0.46;

        if (!ready) {
          buf.x[i] = cx0;
          buf.y[i] = cy0;
          buf.z[i] = 0.22;
          buf.kind[i] = 2;
          buf.size[i] = 1;
          buf.alpha[i] = 0.85;
          buf.heat[i] = 0.5;
          continue;
        }

        const w = wordmarkPoint(lib, i, HERO_LOGO_SX, heroY);
        // escalonamento leve por partícula: as letras se desenham, não surgem juntas
        const t = clamp01((form - ((i % 9) / 9) * 0.22) / 0.78);
        buf.x[i] = lerp(cx0, w.x, t);
        buf.y[i] = lerp(cy0, w.y, t);
        buf.z[i] = lerp(0.22, 0.16, t);
        // a cor da marca só entra quando a letra já está legível
        buf.kind[i] = t > 0.55 ? (lib.logoIsPay[i] === 1 ? 1 : 0) : 2;
        // ao estabilizar, os pontos encolhem e o ruído cai → borda mais limpa
        buf.size[i] = lerp(1.05, 0.72, settle) * lerp(1, 1.05, t);
        buf.alpha[i] = lerp(0.6, 1, t);
        buf.heat[i] = lerp(0.55, 0.06, t);
      }
      break;
    }

    case "hero-release": {
      /**
       * O wordmark permanece legível no início e só então as letras se soltam,
       * virando o material da cena seguinte. Sem quadro vazio entre as cenas.
       */
      const release = easeInOut(win(p, 0.3, 1));
      const ready = lib.logoReady.value;
      // pulso sutil que atravessa a logo enquanto ela ainda está parada
      const pulse = 0.5 + 0.5 * Math.sin(time * 2.6);
      const heroY = heroLogoY();

      for (let i = 0; i < count; i++) {
        const w = ready
          ? wordmarkPoint(lib, i, HERO_LOGO_SX, heroY)
          : { x: lib.coreFull[i * 2] * 0.46, y: lib.coreFull[i * 2 + 1] * 0.46 };

        // dispersão suave para fora, escalonada — nada de explosão
        const ang = Math.atan2(w.y - heroY, w.x);
        const outR = 1.15 + ((i % 13) / 13) * 0.9;
        const t = clamp01((release - ((i % 7) / 7) * 0.25) / 0.75);
        buf.x[i] = lerp(w.x, Math.cos(ang) * outR * 1.35, t);
        buf.y[i] = lerp(w.y, Math.sin(ang) * outR + heroY, t);
        buf.z[i] = lerp(0.16, 0.62, t);
        buf.kind[i] = ready && t < 0.5 ? (lib.logoIsPay[i] === 1 ? 1 : 0) : i % 4 === 0 ? 1 : 0;
        buf.size[i] = lerp(0.72, 0.85, t);
        buf.alpha[i] = lerp(1, 0.35, t);
        // o pulso só existe enquanto a letra está parada; desaparece ao soltar
        buf.heat[i] = lerp(0.06 + pulse * 0.12, 0.04, t);
      }
      break;
    }

    case "scanner": {
      /**
       * Feixe de leitura percorre a estrutura; os módulos atingidos acendem.
       *
       * Valores deliberadamente CONTIDOS: alpha base baixa, ganho pequeno no
       * feixe e `heat` limitado. Com blending aditivo, alpha alta + sprite grande
       * estourava em branco e produzia rastro/fantasma. O brilho agora vem do
       * contraste com o fundo, não de saturação.
       */
      const beam = (p * 1.6 - 0.3) * 1.4 - 0.7;
      const closeIn = easeInOut(win(p, 0, 0.25));
      for (let i = 0; i < count; i++) {
        const sx = lib.scanner[i * 2] * lerp(0.9, 0.78, closeIn);
        const sy = lib.scanner[i * 2 + 1] * 0.8;
        buf.x[i] = sx;
        buf.y[i] = sy;
        buf.z[i] = 0.32 + ((i % 7) / 7) * 0.2;
        // feixe mais estreito → um único evento de leitura, sem borrão largo
        const hit = Math.max(0, 1 - Math.abs(sy - beam) / 0.075);
        const classified = sy < beam ? 1 : 0;
        buf.kind[i] = hit > 0.55 ? 2 : classified && i % 3 === 0 ? 1 : 0;
        buf.size[i] = 0.62 + hit * 0.5;
        buf.alpha[i] = 0.22 + hit * 0.4 + classified * 0.1;
        buf.heat[i] = hit * 0.45;
      }
      break;
    }

    case "cards": {
      // Molduras de cards chegam de profundidades diferentes
      const assemble = easeInOut(p);
      for (let i = 0; i < count; i++) {
        const fx = lib.cardFrames[i * 2];
        const fy = lib.cardFrames[i * 2 + 1];
        const sx = lib.scanner[i * 2] * 0.8;
        const sy = lib.scanner[i * 2 + 1] * 0.8;
        buf.x[i] = lerp(sx, fx, assemble);
        buf.y[i] = lerp(sy, fy, assemble);
        buf.z[i] = lerp(0.3, 0.1 + (i % 4) * 0.28, assemble);
        buf.kind[i] = i % 4 === 0 ? 1 : 0;
        buf.size[i] = 0.95;
        buf.alpha[i] = 0.32 + assemble * 0.28;
        buf.heat[i] = 0.06;
      }
      break;
    }

    case "mosaic": {
      // Módulos vêm de planos diferentes e encaixam
      for (let i = 0; i < count; i++) {
        const mx = lib.mosaic[i * 2];
        const my = lib.mosaic[i * 2 + 1];
        const fx = lib.cardFrames[i * 2];
        const fy = lib.cardFrames[i * 2 + 1];
        // cada módulo tem seu próprio atraso → encaixe escalonado
        const delay = ((i % 8) / 8) * 0.4;
        const t = easeInOut(clamp01((p - delay) / (1 - delay)));
        buf.x[i] = lerp(fx, mx, t);
        buf.y[i] = lerp(fy, my, t);
        buf.z[i] = lerp(0.75, 0.16, t);
        buf.kind[i] = i % 5 === 0 ? 1 : 0;
        buf.size[i] = 0.9;
        buf.alpha[i] = lerp(0.12, 0.5, t);
        buf.heat[i] = 0.05 + t * 0.1;
      }
      break;
    }

    case "network": {
      // Rede de conexões: nós surgem e a malha se organiza
      const weave = easeInOut(p);
      for (let i = 0; i < count; i++) {
        const nx = lib.network[i * 2];
        const ny = lib.network[i * 2 + 1];
        const mx = lib.mosaic[i * 2];
        const my = lib.mosaic[i * 2 + 1];
        buf.x[i] = lerp(mx, nx, weave);
        buf.y[i] = lerp(my, ny, weave);
        buf.z[i] = lerp(0.16, 0.34, weave);
        buf.kind[i] = i % 6 === 0 ? 1 : 0;
        buf.size[i] = 0.85;
        buf.alpha[i] = 0.22 + weave * 0.24;
        buf.heat[i] = 0.05;
      }
      break;
    }

    case "final-logo": {
      /**
       * FORMAÇÃO DA LOGO — os mesmos módulos usados na página inteira se
       * reorganizam no wordmark PAYCON, abaixo do botão.
       *
       * "PAY" recebe o azul institucional e "CON" o cinza, usando o mapa
       * `logoIsPay` (derivado da largura real do texto). Totalmente controlado
       * pelo scroll e reversível: ao subir, os módulos voltam à malha.
       */
      /**
       * TIMING (spec):
       *   28–42%  módulos surgem abaixo do botão
       *   40–62%  PAY (azul) e CON (cinza) tomam forma
       *   62–72%  a logo AFINA e estabiliza (menos ruído, borda mais limpa)
       *   72–92%  totalmente legível
       *   92–100% pulso final discreto
       *
       * `settle` é o que resolve a aparência "fragmentada": ao estabilizar, os
       * pontos encolhem e o jitter residual perde peso, então as bordas das
       * letras ficam definidas em vez de esfareladas.
       */
      const gather = easeInOut(win(p, 0.28, 0.44));
      const assemble = easeInOut(win(p, 0.4, 0.62));
      const settle = easeInOut(win(p, 0.62, 0.74));
      const sweep = win(p, 0.92, 1);
      const ready = lib.logoReady.value;
      const finalY = finalLogoY();

      for (let i = 0; i < count; i++) {
        const nx = lib.network[i * 2];
        const ny = lib.network[i * 2 + 1];
        const w = ready
          ? wordmarkPoint(lib, i, FINAL_LOGO_SX, finalY)
          : { x: lib.coreFull[i * 2] * 0.28, y: lib.coreFull[i * 2 + 1] * 0.28 + finalY };

        // etapa 1: os módulos se recolhem numa faixa solta abaixo do botão
        const gx = lerp(nx, nx * 0.55, gather);
        const gy = lerp(ny, finalY + ny * 0.16, gather);

        buf.x[i] = lerp(gx, w.x, assemble);
        buf.y[i] = lerp(gy, w.y, assemble);
        buf.z[i] = lerp(0.34, 0.16, assemble);

        // cor final da marca só assume quando a letra já está formada
        const pay = lib.logoIsPay[i] === 1;
        buf.kind[i] = ready && assemble > 0.45 ? (pay ? 1 : 0) : 2;

        // pulso: realce estreito viajando no eixo x da logo, só no fim
        const norm = (lib.logo[i * 2] + 1) / 2;
        const hit = sweep > 0 ? Math.max(0, 1 - Math.abs(norm - sweep) / 0.14) : 0;

        // ponto grande enquanto forma → pequeno e nítido ao estabilizar
        buf.size[i] = lerp(lerp(0.72, 1, assemble), 0.6, settle) + hit * 0.45;
        buf.alpha[i] = lerp(0.16, 1, assemble);
        buf.heat[i] = lerp(0.1, 0.03, settle) + hit * 0.7;
      }
      break;
    }


    case "dormant":
    default: {
      // Entre cenas: campo atmosférico discreto ao fundo
      for (let i = 0; i < count; i++) {
        buf.x[i] = lib.dispersed[i * 2] * 1.1;
        buf.y[i] = lib.dispersed[i * 2 + 1] * 1.1;
        buf.z[i] = 0.5 + ((i % 9) / 9) * 0.5;
        buf.kind[i] = i % 7 === 0 ? 1 : 0;
        buf.size[i] = 0.8;
        buf.alpha[i] = 0.18;
        buf.heat[i] = 0.02;
      }
      break;
    }
  }
}
