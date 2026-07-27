import { useCallback, useLayoutEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { payconLandingContent } from "../../content/payconLandingContent";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useStageScene, type StageSegment } from "../../hooks/useStageScene";
import { trackCtaClick } from "../../lib/analytics";
import { ensureGsapRegistered, gsap, SplitText } from "../../lib/gsap";
import styles from "./PayconHero.module.css";

/**
 * Coreografia da hero.
 *
 * A forma principal é uma NUVEM DE PARTÍCULAS QUE SEGUE O CURSOR (referência: o
 * vídeo em `Reference/`), com núcleo denso e corpo difuso que se deforma ao se
 * deslocar. As mãos/dedos foram removidos.
 *
 * A copy fica centralizada na área superior e o palco recebe `offsetY` negativo,
 * deixando a nuvem na metade inferior sem cobrir o texto.
 *
 * Tudo é função do progresso do scroll → a sequência reverte corretamente.
 */
const SEGMENTS: StageSegment[] = [
  // 0–20%: nuvem seguindo o cursor livremente; copy e CTA visíveis
  { phase: "hero-cloud", weight: 1, interaction: [1, 1], offsetY: [-0.5, -0.5], glow: [0.1, 0.16] },
  // 20–45%: a nuvem se recolhe, ainda acompanhando o cursor
  { phase: "hero-gather", weight: 1.3, interaction: [1, 0.5], offsetY: [-0.5, -0.46], glow: [0.16, 0.26] },
  // 45–68%: condensa no núcleo Paycon, com linhas de dados
  { phase: "hero-condense", weight: 1.2, interaction: [0.5, 0.3], offsetY: [-0.46, -0.36], glow: [0.26, 0.6] },
  // 68–84%: núcleo formado, pulso contido
  {
    phase: "hero-core",
    weight: 0.8,
    interaction: [0.3, 0.25],
    offsetY: [-0.38, -0.26],
    zoom: [1, 1.06],
    glow: [0.6, 0.9],
  },
  // 84–100%: as partículas viram a linguagem da cena seguinte
  {
    phase: "hero-entry",
    weight: 0.9,
    interaction: [0.15, 0.55],
    offsetY: [-0.26, 0],
    zoom: [1.06, 1.24],
    camZ: [0, 0.26],
    opacity: [1, 0.85],
    glow: [0.9, 0.25],
  },
];

export function PayconHero() {
  const { hero } = payconLandingContent;
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const reducedMotion = useReducedMotion();

  // A copy sai por máscara (sobe e desvanece) só depois dos 68%.
  const onProgress = useCallback((p: number) => {
    const copy = copyRef.current;
    if (!copy) return;
    const out = Math.min(1, Math.max(0, (p - 0.68) / 0.22));
    // mantém o translateX(-50%) da centralização; só acrescenta o deslocamento
    copy.style.transform = `translate(-50%, ${(-out * 5).toFixed(2)}vh)`;
    copy.style.opacity = String(1 - out);
    copy.style.pointerEvents = out > 0.6 ? "none" : "auto";
  }, []);

  useStageScene(sectionRef, {
    segments: SEGMENTS,
    start: "top top",
    end: () => `+=${window.innerHeight * 3}`,
    scrub: 1.2,
    pinRef: stickyRef,
    onProgress,
  });

  useLayoutEffect(() => {
    if (reducedMotion || !headlineRef.current) return;
    ensureGsapRegistered();
    let split: SplitText | undefined;
    const ctx = gsap.context(() => {
      split = new SplitText(headlineRef.current!, { type: "lines,words", linesClass: "hero-line" });
      gsap.from(split.words, {
        yPercent: 115,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.04,
        delay: 0.1,
      });
    }, sectionRef);
    return () => {
      split?.revert();
      ctx.revert();
    };
  }, [reducedMotion]);

  return (
    <section
      id="home"
      ref={sectionRef}
      className={styles.section}
      aria-label="Introdução: automações jurídicas Paycon"
    >
      <div ref={stickyRef} className={styles.sticky}>
        {/* Composição centralizada: headline, apoio e CTA na área superior */}
        <div ref={copyRef} className={styles.copy}>
          <h1 ref={headlineRef} className={styles.headline}>
            {hero.headline}
          </h1>
          <p className={styles.subheadline}>{hero.subheadline}</p>
          <a
            href={hero.cta.href}
            className={styles.cta}
            onClick={() => trackCtaClick(hero.cta.label, hero.cta.placement, hero.cta.href)}
          >
            {hero.cta.label}
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>

        {/*
          Único label restante na hero: indicação discreta de scroll. Os leitores
          técnicos que ficavam ao redor do núcleo e nas extremidades foram
          removidos — a conexão é comunicada visualmente pelos dedos e pelo núcleo.
        */}
        <span className={styles.scrollHint} aria-hidden="true">
          ROLE PARA CONECTAR
        </span>
      </div>
    </section>
  );
}
