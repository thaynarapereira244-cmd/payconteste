import { useEffect, useRef, useState } from "react";

export type PerformanceTier = "high" | "medium" | "low";

const ORDER: PerformanceTier[] = ["low", "medium", "high"];

function lowerTier(t: PerformanceTier): PerformanceTier {
  const i = ORDER.indexOf(t);
  return i > 0 ? ORDER[i - 1] : t;
}

/**
 * Heurística para escalar a densidade de partículas.
 *
 * Considera núcleos de CPU, memória exposta, tipo de ponteiro E largura da
 * viewport — a largura importa porque um viewport estreito (mobile real ou
 * janela reduzida) não se beneficia de milhares de partículas, além de ter
 * menos área para dissipar o custo de fill.
 *
 * Sobre essa heurística roda uma REDE DE SEGURANÇA por FPS medido: se o aparelho
 * não sustenta a taxa de quadros no tier escolhido, ele desce um nível. A sonda
 * só REBAIXA, nunca sobe — o desktop aprovado nunca é empurrado para além do que
 * a heurística já concedeu, e um device fraco que enganou a heurística (boa CPU
 * declarada, GPU fraca) ainda é protegido.
 */
export function useDevicePerformance(): PerformanceTier {
  const [tier, setTier] = useState<PerformanceTier>("high");
  const probedRef = useRef(false);

  useEffect(() => {
    const evaluate = () => {
      const cores = navigator.hardwareConcurrency ?? 4;
      const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
      const isTouch = window.matchMedia("(pointer: coarse)").matches;
      const width = window.innerWidth;

      if (width <= 640 || (isTouch && (cores <= 4 || memory <= 4))) {
        setTier("low");
      } else if (width <= 1024 || isTouch || cores <= 4 || memory <= 4) {
        setTier("medium");
      } else {
        setTier("high");
      }
    };

    evaluate();
    // debounce: resize dispara em rajada durante o arraste da janela
    let timeout = 0;
    const onResize = () => {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(evaluate, 220);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  /**
   * Sonda de FPS — mede a taxa real de quadros logo após o carregamento e, se
   * estiver abaixo da meta (~45fps), rebaixa o tier uma vez.
   *
   * - Roda no MÁXIMO uma vez (`probedRef`): a troca de tier reconstrói o palco
   *   (uma pequena pausa), então evitamos rebaixamentos em cascata.
   * - Ignora deltas absurdos (>100ms): troca de aba, long task de GC ou o custo
   *   de montagem inicial não devem contaminar a mediana.
   * - Não roda em reduced motion (não há loop) nem quando já está no piso.
   */
  useEffect(() => {
    if (probedRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (tier === "low") {
      probedRef.current = true;
      return;
    }

    let raf = 0;
    let last = 0;
    const deltas: number[] = [];
    const NEED = 80;

    const tick = (now: number) => {
      if (document.hidden) {
        last = 0;
        raf = requestAnimationFrame(tick);
        return;
      }
      if (last) {
        const dt = now - last;
        if (dt > 0 && dt < 100) deltas.push(dt);
      }
      last = now;

      if (deltas.length < NEED) {
        raf = requestAnimationFrame(tick);
        return;
      }

      probedRef.current = true;
      const sorted = deltas.slice().sort((a, b) => a - b);
      const median = sorted[sorted.length >> 1];
      // ~24ms ≈ 42fps sustentado: abaixo disso, menos partículas ajudam a
      // recuperar a fluidez sem que o usuário perceba a diferença de densidade
      if (median > 24) setTier((t) => lowerTier(t));
    };

    // espera o pico de montagem passar antes de começar a medir
    const start = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, 600);

    return () => {
      window.clearTimeout(start);
      cancelAnimationFrame(raf);
    };
  }, [tier]);

  return tier;
}
