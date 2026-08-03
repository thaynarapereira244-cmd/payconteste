import { useEffect, useRef } from "react";
import { getShapeLibrary } from "../../lib/particleShapes";
import { createTargetBuffers, setStageViewport, writeTargets } from "../../lib/choreography";
import {
  attachPointerListeners,
  pointer,
  stageState,
  stepParallax,
  stepPointer,
} from "../../lib/stageState";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useDevicePerformance } from "../../hooks/useDevicePerformance";
import styles from "./ParticleStage.module.css";

/**
 * Palco de partículas PERSISTENTE — uma única instância fixa cobrindo a
 * viewport, viva do início ao fim da página.
 *
 * É esta persistência que cria a continuidade entre cenas: nenhuma seção tem
 * seu próprio canvas, então as mesmas partículas que formam as mãos na hero são
 * as que viram o scanner, os cards, o mosaico, a rede de parceiros e as mãos
 * finais. As seções apenas escrevem fase+progresso em `stageState`.
 */

const COUNT_BY_TIER = { high: 4200, medium: 2500, low: 1100 } as const;
const DPR_CAP = 1.5;
const FOCAL = 2.1;

/**
 * INTERAÇÃO DO CURSOR — apenas local.
 *
 * A versão anterior aplicava, além do campo local, uma rotação 3D do conjunto
 * inteiro e um parallax por camada. O resultado era a cena toda balançando e
 * girando com o mouse. Ambos foram REMOVIDOS: o cursor agora só desloca as
 * partículas dentro de `INFLUENCE_RADIUS`, com falloff quadrático, e o restante
 * do quadro fica imóvel.
 */
const INFLUENCE_RADIUS = 320;
/** Deslocamento máximo de uma partícula no centro do campo, em px. */
const MAX_PUSH = 58;
/**
 * Peso da CORRENTE tangencial em relação ao empurrão radial. É ela que faz as
 * partículas fluírem AO REDOR do cursor (girando no sentido do movimento). Um
 * valor alto deixa a reação bem FLUIDA (a nuvem escorre em volta do cursor).
 */
const SWIRL_RATIO = 0.8;
/**
 * Velocidade de retorno à posição de origem quando o cursor se afasta. Mais
 * baixo = assenta devagar = mais rastro/fluidez.
 */
const RELEASE_RATE = 0.022;

type SpriteSet = { gray: HTMLCanvasElement; blue: HTMLCanvasElement; core: HTMLCanvasElement };

/**
 * Pré-renderiza os sprites.
 *
 * Os pontos dos dedos são NÍTIDOS (núcleo sólido até ~58% do raio, queda curta):
 * é o que dá a leitura de retículo/meio-tom da referência. Sprites muito
 * difusos transformavam a grade num borrão. O núcleo Paycon segue com halo
 * suave, porque ali o brilho é intencional.
 */
function buildSprites(): SpriteSet {
  const make = (inner: string, outer: string, solidStop: number, size = 22) => {
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, inner);
    grad.addColorStop(solidStop, inner);
    grad.addColorStop(Math.min(0.98, solidStop + 0.16), outer);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    return c;
  };
  return {
    gray: make("rgba(232,233,238,0.98)", "rgba(153,154,159,0.2)", 0.58),
    blue: make("rgba(150,160,255,0.98)", "rgba(69,75,150,0.22)", 0.58),
    core: make("rgba(255,255,255,1)", "rgba(136,144,211,0.5)", 0.2),
  };
}

export function ParticleStage() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lightRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();
  const tier = useDevicePerformance();

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const count = COUNT_BY_TIER[tier];
    const lib = getShapeLibrary(count);
    const targets = createTargetBuffers(count);
    const sprites = buildSprites();

    // posições correntes (interpoladas em direção aos alvos)
    const curX = new Float32Array(count);
    const curY = new Float32Array(count);
    const curZ = new Float32Array(count);
    const curSize = new Float32Array(count);
    // deslocamento local acumulado por partícula (campo do cursor)
    const offX = new Float32Array(count);
    const offY = new Float32Array(count);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      curX[i] = lib.cloud[i * 2] * 0.34;
      curY[i] = lib.cloud[i * 2 + 1] * 0.34;
      curZ[i] = 0.5;
      curSize[i] = 1;
      seed[i] = (i * 0.6180339887) % 1;
    }

    /**
     * Handle de teste (só em DEV). `renderOnce` existe porque o loop pausa
     * quando `document.hidden` é true — o que acontece quando o painel do
     * navegador não está compositando. Sem isso não há como medir o palco
     * automaticamente nesse estado.
     */
    const debug = {
      frames: 0,
      renderOnce: (() => {}) as (steps?: number) => void,
    };
    if (import.meta.env.DEV) {
      // handle de inspeção em desenvolvimento (não existe no build de produção)
      (window as unknown as Record<string, unknown>).__payconStage = {
        stageState,
        lib,
        targets,
        pointer,
        debug,
      };
    }

    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    resize();
    window.addEventListener("resize", resize);

    const detachPointer = reducedMotion ? () => {} : attachPointerListeners();

    let hidden = false;
    const onVisibility = () => {
      hidden = document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    let raf = 0;
    let t0 = performance.now();

    const render = (now: number) => {
      debug.frames++;
      const time = (now - t0) / 1000;

      if (!reducedMotion) stepPointer();

      const strength = reducedMotion ? 0 : stageState.interactionStrength;
      if (!reducedMotion) stepParallax(strength);
      const aspect = w / Math.max(1, h);

      // a coreografia posiciona os wordmarks em fração da ALTURA da viewport,
      // então precisa das dimensões deste quadro antes de escrever os alvos
      setStageViewport(w, h);
      writeTargets(stageState, lib, targets, count, time);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h) / 2;
      const zoom = stageState.cameraZoom;
      const camZ = stageState.cameraZ;
      const stageOpacity = stageState.opacity;

      // Offsets responsivos: em retrato o deslocamento lateral é inútil (não há
      // espaço), então ele é atenuado e a massa desce para não brigar com o texto.
      const portrait = aspect < 1.05;
      const offsetX = stageState.offsetX * Math.min(1, aspect / 1.25);
      // viés pequeno em retrato: as cenas já declaram seu próprio offsetY
      const offsetY = stageState.offsetY + (portrait ? -0.1 : 0);
      const clip = stageState.clip;

      const influenceR = INFLUENCE_RADIUS;
      const influenceR2 = influenceR * influenceR;
      const pointerActive = !reducedMotion && pointer.inside && strength > 0.02;

      /**
       * Taxa de interpolação POR PARTÍCULA.
       * As de dentro da nuvem acompanham rápido, as de fora ficam atrás — é esse
       * atraso desigual que cria o rastro e a deformação ao seguir o cursor.
       */
      const baseLerp = reducedMotion ? 1 : 0.085;

      for (let i = 0; i < count; i++) {
        // interpolação para o alvo
        const drift = reducedMotion ? 0 : Math.sin(time * 0.55 + seed[i] * 6.283) * 0.006;
        const lerpRate = reducedMotion ? 1 : baseLerp * (0.3 + lib.cloudLag[i] * 1.1);
        curX[i] += (targets.x[i] + drift - curX[i]) * lerpRate;
        curY[i] += (targets.y[i] - drift - curY[i]) * lerpRate;
        curZ[i] += (targets.z[i] - curZ[i]) * lerpRate;
        curSize[i] += (targets.size[i] - curSize[i]) * 0.12;

        // Projeção: SEM rotação do conjunto e SEM parallax por camada — o
        // enquadramento é fixo. Só a câmera controlada por scroll o altera.
        const px = curX[i] + offsetX;
        const py = curY[i] + offsetY;
        const ez = curZ[i] - camZ;
        const denom = FOCAL + ez;
        if (denom <= 0.12) continue; // atrás da câmera
        const persp = FOCAL / denom;

        const baseX = cx + px * persp * scale * zoom;
        const baseY = cy - py * persp * scale * zoom;

        let size = curSize[i] * persp * (2.5 + targets.heat[i] * 2.4);
        let alpha = targets.alpha[i] * stageOpacity;
        // atenuação por profundidade (fog)
        alpha *= Math.max(0.15, Math.min(1, 1.25 - ez * 0.55));

        /**
         * Campo de influência LOCAL. Cada partícula guarda seu próprio
         * deslocamento (`offX/offY`), que cresce enquanto o cursor está perto e
         * relaxa devagar de volta a zero quando ele se afasta — por isso as
         * bolinhas "voltam lentamente" em vez de saltar de volta.
         */
        let f = 0;
        if (pointerActive) {
          const dx = baseX - pointer.pxX;
          const dy = baseY - pointer.pxY;
          const d2 = dx * dx + dy * dy;
          if (d2 < influenceR2) {
            const d = Math.sqrt(d2) || 0.001;
            // falloff suave (não ao quadrado): a corrente alcança mais partículas
            // e a deformação lê como uma onda que percorre a nuvem, não um furo
            const fall = 1 - d / influenceR;
            f = fall * fall * strength * (0.7 + pointer.speed * 0.7);
            const nx = dx / d;
            const ny = dy / d;
            const kind = targets.kind[i];
            // dualidade preservada: o lado humano recua, o tecnológico é atraído
            const dir = kind === 1 ? -1 : 1;

            // 1) componente RADIAL — empurra/atrai ao longo da linha do cursor
            const radial = MAX_PUSH * f * dir;
            // 2) componente TANGENCIAL — a corrente que faz fluir ao redor.
            //    O sentido do giro acompanha o movimento do cursor (produto
            //    vetorial velocidade × raio), então mover o mouse "arrasta" a
            //    nuvem numa curva em vez de só afastá-la.
            const spin = pointer.vx * ny - pointer.vy * nx >= 0 ? 1 : -1;
            const swirl = MAX_PUSH * SWIRL_RATIO * f * spin;
            const tX = radial * nx - swirl * ny;
            const tY = radial * ny + swirl * nx;

            // arrasto por partícula: o miolo acompanha, a borda fica bem para
            // trás → rastro longo e escorregadio, a leitura de fluido
            const follow = 0.12 - lib.cloudLag[i] * 0.06;
            offX[i] += (tX - offX[i]) * follow;
            offY[i] += (tY - offY[i]) * follow;
          }
        }
        if (f === 0) {
          // retorno lento à origem — o assentamento suave é parte do "fluido"
          offX[i] += (0 - offX[i]) * RELEASE_RATE;
          offY[i] += (0 - offY[i]) * RELEASE_RATE;
        }

        const screenX = baseX + offX[i];
        const screenY = baseY + offY[i];
        if (f > 0) {
          size *= 1 + f * 1.1;
          /**
           * O reforço de alpha pela proximidade do cursor precisa respeitar
           * `stageOpacity` — sem o `* stageOpacity` aqui, aproximar o mouse
           * "acendia" as partículas mesmo com o palco em opacidade 0 (ex.: no
           * repouso da hero, antes de rolar, quando o HeroIntroGraphic é quem
           * deve estar visível). Bug relatado: bolinhas apareciam por baixo do
           * gráfico de cards ao passar o mouse. Em qualquer outra fase, onde
           * `stageOpacity` já é 1, este fator não muda nada.
           */
          alpha = Math.min(1, alpha + f * 0.5 * stageOpacity);
        }

        // contenção opcional na região da cena (borda suave)
        if (clip) {
          const fx = Math.min(screenX - clip.x0, clip.x1 - screenX);
          const fy = Math.min(screenY - clip.y0, clip.y1 - screenY);
          const edge = Math.min(fx, fy);
          if (edge <= 0) continue;
          if (edge < clip.feather) alpha *= edge / clip.feather;
        }

        if (alpha <= 0.012 || size <= 0.2) continue;

        const kind = targets.kind[i];
        const sprite = kind === 2 ? sprites.core : kind === 1 ? sprites.blue : sprites.gray;
        const s = size * 2.4;
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite, screenX - s / 2, screenY - s / 2, s, s);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      // luz ambiente acompanhando o cursor (camada 1: deslocamento mínimo)
      if (lightRef.current && !reducedMotion) {
        const lx = 50 + pointer.x * 14 * strength;
        const ly = 50 - pointer.y * 10 * strength;
        lightRef.current.style.background = `radial-gradient(38rem 30rem at ${lx}% ${ly}%, rgba(69,75,150,${(
          0.16 +
          stageState.glow * 0.22
        ).toFixed(3)}), transparent 70%)`;
      }

    };

    if (import.meta.env.DEV) {
      // desenha N frames sem agendar rAF (evita loops concorrentes)
      debug.renderOnce = (steps = 1) => {
        for (let i = 0; i < steps; i++) render(performance.now() + i * 16.7);
      };
    }

    if (reducedMotion) {
      // um único frame estático: nuvem em repouso, sem loop nem interação
      stageState.phase = "hero-cloud";
      stageState.p = 0;
      render(performance.now());
    } else {
      // O agendamento vive AQUI, não dentro de `render` — assim `render` pode
      // ser chamado isoladamente (reduced motion, testes) sem criar loops.
      const loop = (now: number) => {
        if (!hidden) render(now);
        raf = requestAnimationFrame(loop);
      };
      t0 = performance.now();
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      detachPointer();
      // libera referências dos sprites/buffers para o GC
      sprites.gray.width = sprites.gray.height = 0;
      sprites.blue.width = sprites.blue.height = 0;
      sprites.core.width = sprites.core.height = 0;
    };
  }, [reducedMotion, tier]);

  return (
    <div ref={wrapRef} className={styles.stage} aria-hidden="true">
      <div ref={lightRef} className={styles.ambientLight} />
      <canvas ref={canvasRef} className={styles.canvas} />
      <span className="sr-only">
        Ambiente visual decorativo: partículas formam uma mão humana e uma mão
        tecnológica que convergem no núcleo Paycon.
      </span>
    </div>
  );
}
