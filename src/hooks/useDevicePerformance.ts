import { useEffect, useState } from "react";

export type PerformanceTier = "high" | "medium" | "low";

/**
 * Heurística para escalar a densidade de partículas.
 *
 * Considera núcleos de CPU, memória exposta, tipo de ponteiro E largura da
 * viewport — a largura importa porque um viewport estreito (mobile real ou
 * janela reduzida) não se beneficia de milhares de partículas, além de ter
 * menos área para dissipar o custo de fill.
 */
export function useDevicePerformance(): PerformanceTier {
  const [tier, setTier] = useState<PerformanceTier>("high");

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

  return tier;
}
