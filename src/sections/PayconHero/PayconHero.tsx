import { useLayoutEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { payconLandingContent } from "../../content/payconLandingContent";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useStageScene, type StageSegment } from "../../hooks/useStageScene";
import { trackCtaClick } from "../../lib/analytics";
import { ensureGsapRegistered, gsap, SplitText } from "../../lib/gsap";
import styles from "./PayconHero.module.css";

/**
 * Hero SEM morph de partículas — a pedido, o scroll não forma mais nuvem,
 * núcleo nem o wordmark PAYCON aqui. Sem pin, sem coreografia, sem sequência
 * para reverter — é uma seção normal, do tamanho do seu conteúdo.
 *
 * O `HeroIntroGraphic` (cards conectados) foi removido a pedido; a hero é só
 * texto + métricas.
 *
 * O palco de partículas continua existindo (as cenas seguintes — scanner,
 * cards, mosaico, rede de parceiros, logo final do CTA — dependem dele). Esta
 * única faixa mantém a opacidade em 0 enquanto a hero está em foco, para o
 * palco não desenhar a nuvem padrão por trás do texto. `start`/`end` cobrem
 * toda a presença da seção na viewport; a arbitragem por proximidade do
 * centro (`isForemostScene`, em `useStageScene.ts`) garante que a cena
 * seguinte assuma o palco sem disputa assim que ficar mais próxima do centro.
 */
const SEGMENTS: StageSegment[] = [{ phase: "hero-cloud", opacity: [0, 0] }];

export function PayconHero() {
  const { hero, metrics } = payconLandingContent;
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const reducedMotion = useReducedMotion();

  useStageScene(sectionRef, {
    segments: SEGMENTS,
    start: "top bottom",
    end: "bottom top",
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
      <div className={styles.sticky}>
        {/* Composição centralizada: headline, apoio e CTA na área superior */}
        <div className={styles.copy}>
          <h1 ref={headlineRef} className={styles.headline}>
            {hero.headline}
          </h1>
          <p className={styles.subheadline}>{hero.subheadline}</p>
          <p className={styles.body}>{hero.body}</p>
          <a
            href={hero.cta.href}
            className={styles.cta}
            onClick={() => trackCtaClick(hero.cta.label, hero.cta.placement, hero.cta.href)}
          >
            {hero.cta.label}
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>

        {/* Métricas: no site oficial ficam dentro da própria hero, logo após o CTA */}
        <dl className={styles.metrics}>
          {metrics.map((metric) => (
            <div key={metric.label} className={styles.metric}>
              <dt>{metric.value}</dt>
              <dd>{metric.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
