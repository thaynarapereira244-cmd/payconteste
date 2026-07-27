import { useCallback, useRef } from "react";
import { Gauge, Layers, ShieldCheck, TrendingDown, TrendingUp } from "lucide-react";
import { payconLandingContent } from "../../content/payconLandingContent";
import { useTilt } from "../../hooks/useParallax";
import { useStageScene } from "../../hooks/useStageScene";
import styles from "./TechnologyScene.module.css";

/**
 * CENA 5 — texto à esquerda, mosaico à direita.
 *
 * O mosaico NÃO aparece pronto: cada módulo chega de um plano de profundidade
 * diferente, com atraso próprio, e só ganha nitidez ao encaixar. O progresso vem
 * do mesmo scroll que move o palco de partículas para a fase "mosaic".
 */
export function TechnologyScene() {
  const { metrics, differentiators } = payconLandingContent;
  const sectionRef = useRef<HTMLElement | null>(null);
  const tileRefs = useRef<Array<HTMLDivElement | null>>([]);
  const gridRef = useTilt<HTMLDivElement>(3, 0.05);

  /**
   * FOCO ANTECIPADO.
   *
   * Antes os quadradinhos só saíam do blur quando a seção já estava saindo da
   * tela (medido: blur 9px com a seção a 630px do topo, nítidos só em -90px).
   * Agora a progressão é:
   *   0–15%  entrada
   *   15–35% blur caindo
   *   35–75% totalmente focado e estável
   *   75–100% preparação para a próxima cena
   * O encaixe escalonado é preservado, só bem mais curto.
   */
  const onProgress = useCallback((p: number) => {
    const tiles = tileRefs.current;
    const n = Math.max(1, tiles.length);
    for (let i = 0; i < tiles.length; i++) {
      const el = tiles[i];
      if (!el) continue;
      // escalonamento curto: todos encaixam dentro dos primeiros 35%
      const delay = (i / n) * 0.14;
      const t = Math.min(1, Math.max(0, (p - delay) / 0.2));
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      // saída suave só perto da transição seguinte
      const exit = Math.min(1, Math.max(0, (p - 0.78) / 0.22));

      // planos alternados: uns vêm de trás, outros da frente e das laterais
      const dir = i % 3 === 0 ? -1 : i % 3 === 1 ? 1 : 0;
      const z = (1 - eased) * -420 - exit * 90;
      const x = (1 - eased) * dir * 90;
      const y = (1 - eased) * (dir === 0 ? 70 : 24) - exit * 26;
      const blur = (1 - eased) * 9 + exit * 2.2;

      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px)`;
      el.style.filter = blur > 0.2 ? `blur(${blur.toFixed(2)}px)` : "none";
      el.style.opacity = (eased * (1 - exit * 0.35)).toFixed(3);
    }
  }, []);

  useStageScene(sectionRef, {
    segments: [
      {
        phase: "mosaic",
        offsetX: [0.3, 0.28],
        interaction: [0.25, 0.3],
        // partículas discretas aqui: a seção é dos quadradinhos
        opacity: [0.34, 0.2],
        glow: [0.1, 0.12],
      },
    ],
    // a faixa começa mais cedo e termina antes: o estado focado ocupa o
    // tempo em que a seção realmente está sendo lida
    start: "top 95%",
    end: "bottom 75%",
    scrub: 0.7,
    onProgress,
  });

  const metricIcons = [TrendingUp, Layers, TrendingDown];

  return (
    <section id="diferenciais" ref={sectionRef} className={styles.section} aria-labelledby="tech-heading">
      <div className={styles.grid}>
        {/* copy lateralizada à esquerda */}
        <div className={styles.copy}>
          <span className="eyebrow">Diferenciais</span>
          <h2 id="tech-heading" className={styles.title}>
            {differentiators.title}
          </h2>
        </div>

        <div ref={gridRef} className={styles.mosaic}>
          {differentiators.items.map((item, i) => (
            <div
              key={item}
              ref={(el) => {
                tileRefs.current[i] = el;
              }}
              className={`${styles.tile} ${styles.tileWide}`}
            >
              {i === 0 ? (
                <ShieldCheck size={18} className={styles.icon} aria-hidden="true" />
              ) : (
                <Gauge size={18} className={styles.icon} aria-hidden="true" />
              )}
              <p className={styles.tileText}>{item}</p>
            </div>
          ))}

          {metrics.map((metric, i) => {
            const Icon = metricIcons[i];
            const idx = differentiators.items.length + i;
            return (
              <div
                key={metric.label}
                ref={(el) => {
                  tileRefs.current[idx] = el;
                }}
                className={styles.tile}
              >
                <Icon size={16} className={styles.icon} aria-hidden="true" />
                <span className={styles.metricValue}>{metric.value}</span>
                <span className={styles.metricLabel}>{metric.label}</span>
                <span className={styles.tileBar} aria-hidden="true" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
