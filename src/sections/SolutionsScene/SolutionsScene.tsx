import { useCallback, useRef, useState } from "react";
import { payconLandingContent } from "../../content/payconLandingContent";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useTilt } from "../../hooks/useParallax";
import { useStageScene } from "../../hooks/useStageScene";
import styles from "./SolutionsScene.module.css";

const CARD_IDS = ["contratos", "contencioso", "esocialpro", "controladoria", "societario"];

/**
 * CENA 4 — cards em profundidade à esquerda/centro, índice de navegação à direita.
 *
 * Não é um grid nem um carrossel: os cards vivem numa pilha 3D e o scroll move
 * um índice contínuo (`activeFloat`). Cada card calcula sua distância desse
 * índice e deriva profundidade, nitidez, rotação e opacidade — só um fica
 * totalmente legível por vez, os demais permanecem parcialmente visíveis.
 */
export function SolutionsScene() {
  const { solutionsIntro, solutions } = payconLandingContent;
  const cards = CARD_IDS.map((id) => solutions.find((s) => s.id === id)!);

  const sectionRef = useRef<HTMLElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const introRef = useRef<HTMLDivElement | null>(null);
  const stackRef = useTilt<HTMLDivElement>(5, 0.05);
  const reducedMotion = useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 961px)");
  const [activeIndex, setActiveIndex] = useState(0);

  const onProgress = useCallback(
    (p: number) => {
      const n = cards.length;

      // 0–18%: intro entra. 18–30%: título estável, ambiente aparece.
      // 30–78%: cards percorrem. 78–100%: reorganizam para a cena seguinte.
      const introEl = introRef.current;
      if (introEl) {
        const enter = Math.min(1, Math.max(0, p / 0.18));
        introEl.style.opacity = enter.toFixed(3);
        introEl.style.transform = `translate3d(0, ${((1 - enter) * 18).toFixed(1)}px, 0)`;
      }

      if (!isDesktop) {
        // mobile: cards em fluxo full-width, sem pilha 3D — limpa transforms
        for (let i = 0; i < n; i++) {
          const el = cardRefs.current[i];
          if (!el) continue;
          el.style.cssText = "";
        }
        return;
      }
      // os cards só começam a percorrer depois de 30% do progresso
      const cardsPhase = Math.min(1, Math.max(0, (p - 0.3) / 0.48));
      const activeFloat = Math.min(n - 1, Math.max(0, cardsPhase * (n - 1)));
      setActiveIndex(Math.round(activeFloat));

      for (let i = 0; i < n; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const d = i - activeFloat;
        const ad = Math.abs(d);

        // cards passados saem pela frente/lateral; futuros ficam atrás
        const z = d >= 0 ? -d * 190 : d * 320;
        const x = d >= 0 ? d * 52 : d * 150;
        const y = d >= 0 ? d * 26 : -d * 40;
        const rotY = d >= 0 ? -d * 7 : -d * 13;
        const rotZ = d >= 0 ? d * 1.4 : d * 3;
        const scale = d >= 0 ? 1 - d * 0.055 : 1 + d * 0.06;
        const blur = Math.min(7, ad * (d >= 0 ? 2.6 : 4.2));
        const opacity = d >= 0 ? Math.max(0, 1 - d * 0.3) : Math.max(0, 1 + d * 0.85);

        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(
          1
        )}px) rotateY(${rotY.toFixed(2)}deg) rotateZ(${rotZ.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        el.style.filter = blur > 0.15 ? `blur(${blur.toFixed(2)}px)` : "none";
        el.style.opacity = opacity.toFixed(3);
        el.style.zIndex = String(100 - Math.round(ad * 10));
        // só o card da frente recebe eventos/leitura de foco
        el.style.pointerEvents = ad < 0.5 ? "auto" : "none";
      }
    },
    [cards.length, isDesktop]
  );

  useStageScene(sectionRef, {
    segments: [
      {
        phase: "cards",
        offsetX: [-0.18, -0.1],
        interaction: [0.2, 0.2],
        /**
         * SEM campo de partículas nesta seção (hierarquia: as bolinhas ficam
         * concentradas na hero, na formação dos dedos e na logo final).
         * A opacidade cai a zero logo no início: as molduras ainda "nascem" da
         * cena anterior, mas o fundo desta seção fica limpo para leitura.
         */
        opacity: [0.5, 0],
        glow: [0.1, 0.04],
      },
    ],
    start: isDesktop ? "top top" : "top 80%",
    end: isDesktop ? () => `+=${window.innerHeight * 2.6}` : "bottom 20%",
    scrub: 1,
    pinRef: stickyRef,
    pinEnabled: isDesktop,
    onProgress,
  });

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="solutions-heading">
      <div ref={stickyRef} className={styles.sticky}>
        {/* intro editorial: fica no canto superior, não centralizada */}
        <div ref={introRef} className={styles.intro}>
          <span className="eyebrow">{solutionsIntro.label}</span>
          <h2 id="solutions-heading" className={styles.introTitle}>
            {solutionsIntro.title}
          </h2>
        </div>

        <div ref={stackRef} className={styles.stack}>
          {cards.map((card, i) => (
            <article
              key={card.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className={styles.card}
              aria-current={i === activeIndex ? "true" : undefined}
            >
              <span className={styles.cardIndex}>{String(i + 1).padStart(2, "0")}</span>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              {/* Controladoria/Societário não têm frase de abertura no site oficial */}
              {card.description ? <p className={styles.cardText}>{card.description}</p> : null}
              {card.features ? (
                <ul className={styles.features} data-dense={card.features.length > 5 ? "true" : undefined}>
                  {card.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>

        {/* índice à direita — a copy dos princípios P2P vive aqui, lateralizada */}
        <div className={styles.side}>
          <ol className={styles.index}>
            {cards.map((card, i) => (
              <li key={card.id} data-active={i === activeIndex ? "true" : undefined}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {card.title}
              </li>
            ))}
          </ol>

          <div className={styles.principles}>
            {solutionsIntro.principles.map((p) => (
              <div key={p.title}>
                <h4>{p.title}</h4>
                <p>{p.description}</p>
              </div>
            ))}
          </div>
        </div>

        {reducedMotion ? null : <div className={styles.hint} aria-hidden="true">ROLE PARA PERCORRER</div>}
      </div>
    </section>
  );
}
