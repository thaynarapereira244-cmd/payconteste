/**
 * Estado mutável compartilhado do ParticleStage.
 *
 * Por que um objeto mutável e não React state: as timelines do ScrollTrigger
 * escrevem aqui a 60fps. Passar isso por state/props causaria re-render por
 * frame. As cenas escrevem, o loop de rAF do palco lê — zero re-render.
 */

export type StagePhase =
  // fase da hero: mantida só como estado inerte (opacidade 0) — o scroll não
  // forma mais nuvem/núcleo/wordmark ali, a pedido; ver PayconHero.tsx
  | "hero-cloud"
  | "scanner"
  | "cards"
  | "mosaic"
  | "network"
  | "final-logo"
  | "dormant";

export type StageState = {
  /** Fase atual da narrativa (define quais formas são alvo). */
  phase: StagePhase;
  /** Progresso 0→1 dentro da fase. */
  p: number;
  /** Quanto o cursor influencia (reduzido durante grandes transições). */
  interactionStrength: number;
  /** Alvo de interação, interpolado suavemente em direção a interactionStrength. */
  interactionTarget: number;
  /** Câmera: zoom e profundidade (sensação de entrar nas formas). */
  cameraZoom: number;
  cameraZ: number;
  /** Deslocamento lateral do conjunto (composição assimétrica por cena). */
  offsetX: number;
  offsetY: number;
  /** Opacidade global do palco (permite passagens quase-negras entre cenas). */
  opacity: number;
  /** Intensidade do brilho do núcleo. */
  glow: number;
  /**
   * Região de contenção em px da viewport. Quando definida, as partículas fora
   * dela desvanecem (borda suave). É o que mantém a cena de escaneamento DENTRO
   * da sua moldura em vez de vazar pela página.
   */
  clip: { x0: number; y0: number; x1: number; y1: number; feather: number } | null;
};

export const stageState: StageState = {
  phase: "hero-cloud",
  p: 0,
  interactionStrength: 1,
  interactionTarget: 1,
  cameraZoom: 1,
  cameraZ: 0,
  offsetX: 0,
  offsetY: 0,
  opacity: 1,
  glow: 0.25,
  clip: null,
};

export function setStagePhase(phase: StagePhase, p: number) {
  stageState.phase = phase;
  stageState.p = p;
}

/** Cursor normalizado (-1..1) com damping e velocidade, compartilhado. */
export type PointerState = {
  /** Alvo bruto vindo do evento. */
  targetX: number;
  targetY: number;
  /** Posição suavizada usada no render. */
  x: number;
  y: number;
  /** Velocidade suavizada (usada para intensificar a reação). */
  vx: number;
  vy: number;
  speed: number;
  /** Posição em pixels da viewport, para o campo de influência local. */
  pxX: number;
  pxY: number;
  inside: boolean;
};

export const pointer: PointerState = {
  targetX: 0,
  targetY: 0,
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  speed: 0,
  pxX: -9999,
  pxY: -9999,
  inside: false,
};

let listenersAttached = false;

export function attachPointerListeners() {
  if (listenersAttached || typeof window === "undefined") return () => {};
  listenersAttached = true;

  const onMove = (e: PointerEvent) => {
    pointer.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.targetY = -((e.clientY / window.innerHeight) * 2 - 1);
    pointer.pxX = e.clientX;
    pointer.pxY = e.clientY;
    pointer.inside = true;
  };
  // cursor saindo da janela: recentraliza suavemente em vez de congelar
  const onLeave = () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
    pointer.pxX = -9999;
    pointer.pxY = -9999;
    pointer.inside = false;
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerout", onLeave, { passive: true });
  window.addEventListener("blur", onLeave);

  return () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerout", onLeave);
    window.removeEventListener("blur", onLeave);
    listenersAttached = false;
  };
}

/**
 * Registro de elementos DOM com parallax de cursor (camada 4: interface).
 * Um único rAF — o do ParticleStage — atualiza todos, em vez de um loop por
 * componente.
 */
export type ParallaxEntry = {
  el: HTMLElement;
  /** Amplitude em px. */
  amount: number;
  /** Damping próprio → cada elemento chega com atraso diferente. */
  damping: number;
  x: number;
  y: number;
};

const parallaxEntries = new Set<ParallaxEntry>();

export function registerParallax(el: HTMLElement, amount: number, damping: number) {
  const entry: ParallaxEntry = { el, amount, damping, x: 0, y: 0 };
  parallaxEntries.add(entry);
  return () => {
    parallaxEntries.delete(entry);
    el.style.transform = "";
  };
}

export function stepParallax(strength: number) {
  for (const e of parallaxEntries) {
    const tx = pointer.x * e.amount * strength;
    const ty = -pointer.y * e.amount * 0.7 * strength;
    e.x += (tx - e.x) * e.damping;
    e.y += (ty - e.y) * e.damping;
    e.el.style.transform = `translate3d(${e.x.toFixed(2)}px, ${e.y.toFixed(2)}px, 0)`;
  }
  stepTilt(strength);
}

/**
 * Inclinação 3D de containers (camada 3: objeto). Escreve custom properties em
 * vez de `transform` para não conflitar com transforms que o próprio componente
 * já aplica por scroll.
 */
export type TiltEntry = {
  el: HTMLElement;
  maxDeg: number;
  damping: number
  ry: number;
  rx: number;
};

const tiltEntries = new Set<TiltEntry>();

export function registerTilt(el: HTMLElement, maxDeg: number, damping: number) {
  const entry: TiltEntry = { el, maxDeg, damping, ry: 0, rx: 0 };
  tiltEntries.add(entry);
  return () => {
    tiltEntries.delete(entry);
    el.style.removeProperty("--tilt-y");
    el.style.removeProperty("--tilt-x");
  };
}

function stepTilt(strength: number) {
  for (const e of tiltEntries) {
    const ty = pointer.x * e.maxDeg * strength;
    const tx = -pointer.y * e.maxDeg * 0.62 * strength;
    e.ry += (ty - e.ry) * e.damping;
    e.rx += (tx - e.rx) * e.damping;
    e.el.style.setProperty("--tilt-y", `${e.ry.toFixed(3)}deg`);
    e.el.style.setProperty("--tilt-x", `${e.rx.toFixed(3)}deg`);
  }
}

/** Avança o damping do cursor. Chamado uma vez por frame pelo palco. */
export function stepPointer(damping = 0.075) {
  const prevX = pointer.x;
  const prevY = pointer.y;
  pointer.x += (pointer.targetX - pointer.x) * damping;
  pointer.y += (pointer.targetY - pointer.y) * damping;
  pointer.vx = pointer.vx * 0.86 + (pointer.x - prevX) * 0.14;
  pointer.vy = pointer.vy * 0.86 + (pointer.y - prevY) * 0.14;
  pointer.speed = Math.min(1, Math.hypot(pointer.vx, pointer.vy) * 26);

  // interpolação suave da força de interação (evita cortes ao entrar em morphs)
  stageState.interactionStrength +=
    (stageState.interactionTarget - stageState.interactionStrength) * 0.06;
}
