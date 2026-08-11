import { useLayoutEffect, type RefObject } from "react";
import { ensureGsapRegistered, ScrollTrigger } from "../lib/gsap";
import { stageState, type StagePhase } from "../lib/stageState";
import { useReducedMotion } from "./useReducedMotion";

type Range = [from: number, to: number];

export type StageSegment = {
  phase: StagePhase;
  /** Peso relativo do segmento dentro da timeline (default 1). */
  weight?: number;
  /** Força da interação com o cursor ao longo do segmento. */
  interaction?: Range;
  zoom?: Range;
  camZ?: Range;
  offsetX?: Range;
  offsetY?: Range;
  opacity?: Range;
  glow?: Range;
};

type Options = {
  segments: StageSegment[];
  start?: string;
  end?: string | (() => string);
  scrub?: number | boolean;
  /** Ref do elemento a fixar. Recebe a ref (não `.current`) porque no primeiro
   *  render `.current` ainda é null. */
  pinRef?: RefObject<HTMLElement | null>;
  /** Desliga o pinning mantendo o resto da cena (usado no mobile). */
  pinEnabled?: boolean;
  /**
   * Elemento que delimita o palco enquanto esta cena está em foco. O hook
   * publica/limpa `stageState.clip` de forma atômica — sem isso, um clip
   * definido por uma cena continuava ativo nas outras e apagava o palco inteiro.
   */
  clipRef?: RefObject<HTMLElement | null>;
  clipFeather?: number;
  /** Callback com o progresso global (0..1) para animar DOM junto. */
  onProgress?: (progress: number) => void;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function applyRange(range: Range | undefined, t: number, fallback: number) {
  return range ? lerp(range[0], range[1], t) : fallback;
}

/**
 * ARBITRAGEM ENTRE CENAS.
 *
 * As faixas de scroll das cenas se sobrepõem de propósito (é o que faz uma
 * transição começar antes da anterior acabar). Sem arbitragem, a última
 * ScrollTrigger a disparar no frame ganha — e como a ordem é a de criação, a
 * cena final chegava a sequestrar o palco enquanto o usuário ainda estava no
 * mosaico. Aqui só escreve no palco a cena mais próxima do centro da viewport.
 */
const sceneRegistry = new Set<{ el: HTMLElement }>();

/** Distância do centro da viewport até o retângulo (0 se estiver dentro). */
function distanceToViewportCenter(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  const vc = window.innerHeight / 2;
  if (vc >= r.top && vc <= r.bottom) return { d: 0, h: r.height };
  return { d: vc < r.top ? r.top - vc : vc - r.bottom, h: r.height };
}

function isForemostScene(el: HTMLElement) {
  const mine = distanceToViewportCenter(el);
  for (const other of sceneRegistry) {
    if (other.el === el) continue;
    const o = distanceToViewportCenter(other.el);
    if (o.d < mine.d) return false;
    // empate (ambas contêm o centro): a seção mais específica/menor vence
    if (o.d === mine.d && o.h < mine.h) return false;
  }
  return true;
}

/**
 * Liga uma seção ao ParticleStage com UMA única ScrollTrigger scrubbed.
 *
 * A timeline é dividida em segmentos ponderados; a cada frame o hook resolve
 * qual segmento está ativo, escreve fase + progresso local em `stageState` e
 * interpola câmera, offset, opacidade e força de interação. Reversível por
 * construção (é função pura do progresso do scroll, não de eventos onEnter).
 */
export function useStageScene(
  ref: RefObject<HTMLElement | null>,
  {
    segments,
    start = "top 80%",
    end = "bottom 20%",
    scrub = 1,
    pinRef,
    pinEnabled = true,
    clipRef,
    clipFeather = 26,
    onProgress,
  }: Options
) {
  const reducedMotion = useReducedMotion();
  // `segments` e `end` são definidos inline nas seções, então a identidade muda
  // a cada render. Serializamos para que o efeito só rode quando o conteúdo mudar.
  const segmentsKey = JSON.stringify(segments);
  const endKey = typeof end === "string" ? end : "fn";

  useLayoutEffect(() => {
    if (reducedMotion || !ref.current || segments.length === 0) return;
    ensureGsapRegistered();

    const weights = segments.map((s) => s.weight ?? 1);
    const total = weights.reduce((a, b) => a + b, 0);
    const bounds: Array<{ from: number; to: number; seg: StageSegment }> = [];
    let acc = 0;
    segments.forEach((seg, i) => {
      const from = acc / total;
      acc += weights[i];
      bounds.push({ from, to: acc / total, seg });
    });

    const element = ref.current;
    const registration = { el: element };
    sceneRegistry.add(registration);

    const trigger = ScrollTrigger.create({
      trigger: element,
      start,
      end,
      scrub,
      pin: (pinEnabled ? pinRef?.current : null) ?? undefined,
      anticipatePin: pinEnabled && pinRef?.current ? 1 : 0,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const gp = self.progress;
        // o DOM próprio da cena sempre acompanha o seu scroll…
        onProgress?.(gp);
        // …mas o palco compartilhado só é escrito pela cena em foco
        if (!isForemostScene(element)) return;

        // resolve o segmento ativo
        let active = bounds[bounds.length - 1];
        for (const b of bounds) {
          if (gp < b.to) {
            active = b;
            break;
          }
        }
        const span = active.to - active.from || 1;
        const local = Math.min(1, Math.max(0, (gp - active.from) / span));
        const seg = active.seg;

        // o clip pertence à cena em foco; qualquer outra cena o limpa
        if (clipRef?.current) {
          const r = clipRef.current.getBoundingClientRect();
          stageState.clip = { x0: r.left, y0: r.top, x1: r.right, y1: r.bottom, feather: clipFeather };
        } else {
          stageState.clip = null;
        }

        stageState.phase = seg.phase;
        stageState.p = local;
        stageState.interactionTarget = applyRange(seg.interaction, local, 1);
        stageState.cameraZoom = applyRange(seg.zoom, local, 1);
        stageState.cameraZ = applyRange(seg.camZ, local, 0);
        stageState.offsetX = applyRange(seg.offsetX, local, 0);
        stageState.offsetY = applyRange(seg.offsetY, local, 0);
        stageState.opacity = applyRange(seg.opacity, local, 1);
        stageState.glow = applyRange(seg.glow, local, 0.2);
      },
    });

    return () => {
      sceneRegistry.delete(registration);
      trigger.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, pinEnabled, segmentsKey, start, endKey, clipFeather]);
}
