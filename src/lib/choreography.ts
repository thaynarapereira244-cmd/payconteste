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
const FOLLOW_X = 0.62;
/**
 * O seguimento vertical é menor de propósito: com o raio da nuvem, valores
 * maiores fazem a borda superior alcançar o CTA da hero.
 */
const FOLLOW_Y = 0.22;

/**
 * Logo do CTA final. `LOGO_SY` compensa o aspecto da máscara do wordmark
 * (900×240) para não esticar a tipografia, e `LOGO_Y` posiciona a logo abaixo do
 * botão sem encostar nele.
 */
const LOGO_SX = 0.46;
const LOGO_SY = 0.46 * (240 / 900);
const LOGO_Y = -0.5;

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

    case "hero-entry": {
      // Câmera atravessa o núcleo: partículas passam pelas laterais e se
      // reorganizam já na forma da cena seguinte (scanner).
      const through = easeInOut(win(p, 0, 0.6));
      const reform = easeInOut(win(p, 0.45, 1));

      for (let i = 0; i < count; i++) {
        const cx = lib.coreFull[i * 2] * 0.72;
        const cy = lib.coreFull[i * 2 + 1] * 0.72;
        // expansão radial: os pontos abrem para fora do enquadramento
        const ang = Math.atan2(cy, cx);
        const outR = 1.1 + ((i % 11) / 11) * 1.5;
        const ox = Math.cos(ang) * outR * 1.5;
        const oy = Math.sin(ang) * outR;

        const sx = lib.scanner[i * 2] * 0.8;
        const sy = lib.scanner[i * 2 + 1] * 0.8;

        const px = lerp(cx, ox, through);
        const py = lerp(cy, oy, through);

        buf.x[i] = lerp(px, sx, reform);
        buf.y[i] = lerp(py, sy, reform);
        buf.z[i] = lerp(lerp(0.24, -0.55, through), 0.3, reform);
        buf.kind[i] = reform > 0.5 ? (i % 4 === 0 ? 1 : 0) : 2;
        buf.size[i] = lerp(1.5, 1.0, reform);
        buf.alpha[i] = lerp(1, 0.75, reform);
        buf.heat[i] = lerp(0.9, 0.1, reform);
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
       * TIMING ANTECIPADO. Antes a montagem só terminava a 85% e a logo aparecia
       * quando a seção já estava saindo. Agora:
       *   25–45%  primeiros módulos surgem abaixo do botão
       *   40–68%  PAY (azul) e CON (cinza) tomam forma
       *   68–82%  logo totalmente legível
       *   82–100% estável, com um pulso final discreto
       */
      const gather = easeInOut(win(p, 0.22, 0.45));
      const assemble = easeInOut(win(p, 0.4, 0.68));
      // pulso percorre a logo da esquerda para a direita já no trecho estável
      const sweep = win(p, 0.82, 0.97);

      for (let i = 0; i < count; i++) {
        const nx = lib.network[i * 2];
        const ny = lib.network[i * 2 + 1];
        const lx = lib.logo[i * 2] * LOGO_SX;
        const ly = lib.logo[i * 2 + 1] * LOGO_SY + LOGO_Y;

        // etapa 1: os módulos se recolhem numa faixa solta abaixo do botão
        const gx = lerp(nx, nx * 0.55, gather);
        const gy = lerp(ny, LOGO_Y + ny * 0.16, gather);

        buf.x[i] = lerp(gx, lx, assemble);
        buf.y[i] = lerp(gy, ly, assemble);
        buf.z[i] = lerp(0.34, 0.18, assemble);

        // cor final da marca só assume quando a letra já está formada
        const pay = lib.logoIsPay[i] === 1;
        buf.kind[i] = assemble > 0.45 ? (pay ? 1 : 0) : 2;

        // pulso: realce estreito viajando no eixo x da logo
        const norm = (lib.logo[i * 2] + 1) / 2;
        const hit = sweep > 0 ? Math.max(0, 1 - Math.abs(norm - sweep) / 0.16) : 0;

        buf.size[i] = lerp(0.7, 0.95, assemble) + hit * 0.55;
        buf.alpha[i] = lerp(0.16, 1, assemble);
        buf.heat[i] = 0.06 + hit * 0.8;
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
