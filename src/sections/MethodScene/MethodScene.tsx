import { useRef } from "react";
import { payconLandingContent } from "../../content/payconLandingContent";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useStageScene } from "../../hooks/useStageScene";
import { trackCtaClick } from "../../lib/analytics";
import { ensureGsapRegistered, gsap, useGSAP } from "../../lib/gsap";
import styles from "./MethodScene.module.css";

export function MethodScene() {
  const { method } = payconLandingContent;
  const sectionRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  useStageScene(sectionRef, {
    segments: [
      { phase: "dormant", interaction: [0.15, 0.15], offsetX: [0.32, 0.32], opacity: [0.16, 0.12] },
    ],
    start: "top 85%",
    end: "bottom 25%",
    scrub: 0.8,
  });

  useGSAP(
    () => {
      if (reducedMotion) return;
      ensureGsapRegistered();

      const steps = gsap.utils.toArray<HTMLElement>(`.${styles.step}`);
      gsap.fromTo(
        steps,
        // `opacity` e não `autoAlpha`: autoAlpha aplica visibility:hidden, o que
        // remove a copy da árvore de acessibilidade (e do innerText/SEO) até o
        // usuário rolar até aqui. Visualmente idêntico, mas o texto continua
        // acessível desde o carregamento.
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.18,
          scrollTrigger: {
            trigger: listRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        `.${styles.progressLine}`,
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 1.2,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: listRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );
    },
    { scope: listRef, dependencies: [reducedMotion] }
  );

  return (
    <section id="metodo" ref={sectionRef} className={styles.section} aria-labelledby="method-heading">
      <div className={styles.inner}>
        <span className="eyebrow">Método</span>
        <h2 id="method-heading" className="text-display-md">
          {method.title}
        </h2>
        <p className={`text-body-lg ${styles.subtitle}`}>{method.subtitle}</p>

        <div ref={listRef} className={styles.list}>
          <div className={styles.progressLine} aria-hidden="true" />
          {method.steps.map((step) => (
            <div key={step.step} className={styles.step}>
              <span className={styles.stepNumber}>{step.stepLabel}</span>
              <div>
                <h3 className="text-display-sm">{step.title}</h3>
                <p className="text-body">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <a
          href="#contato"
          className={`btn btn-primary ${styles.cta}`}
          onClick={() => trackCtaClick(method.cta.label, method.cta.placement, "#contato")}
        >
          {method.cta.label}
        </a>
      </div>
    </section>
  );
}
