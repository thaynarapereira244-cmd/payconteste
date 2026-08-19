import { useRef } from "react";
import { payconLandingContent } from "../../content/payconLandingContent";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useStageScene } from "../../hooks/useStageScene";
import { ensureGsapRegistered, gsap, useGSAP } from "../../lib/gsap";
import styles from "./SolutionsIntroScene.module.css";

/**
 * "Soluções P2P" como seção própria — antes vivia dentro da cena pinada dos
 * cards de produto (`SolutionsScene`), como a primeira linha da mesma grade.
 * Separado a pedido: agora é uma seção normal, com revelação simples ao
 * rolar (sem pin/scroll-jacking), exatamente como Método, Diferenciais etc.
 */
export function SolutionsIntroScene() {
  const { solutionsIntro } = payconLandingContent;
  const sectionRef = useRef<HTMLElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();
  // 1º princípio é a "frase-título" em destaque (mesma estrutura do site
  // oficial); os demais têm o título embutido em negrito no próprio parágrafo.
  const [leadPrinciple, ...restPrinciples] = solutionsIntro.principles;

  useStageScene(sectionRef, {
    segments: [
      { phase: "dormant", interaction: [0.15, 0.15], offsetX: [-0.28, -0.28], opacity: [0.14, 0.1] },
    ],
    start: "top 85%",
    end: "bottom 25%",
    scrub: 0.8,
  });

  useGSAP(
    () => {
      if (reducedMotion) return;
      ensureGsapRegistered();
      gsap.from(`.${styles.reveal}`, {
        opacity: 0,
        y: 22,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: bodyRef.current,
          start: "top 80%",
          once: true,
        },
      });
    },
    { scope: bodyRef, dependencies: [reducedMotion] }
  );

  return (
    <section id="solucoes" ref={sectionRef} className={styles.section} aria-labelledby="solutions-intro-heading">
      <div ref={bodyRef} className={styles.inner}>
        <span className={`eyebrow ${styles.reveal}`}>{solutionsIntro.label}</span>
        <h2 id="solutions-intro-heading" className={`${styles.title} ${styles.reveal}`}>
          {solutionsIntro.title}
        </h2>
        <p className={`${styles.lead} ${styles.reveal}`}>{leadPrinciple.title}</p>
        <div className={`${styles.principles} ${styles.reveal}`}>
          <p>{leadPrinciple.description}</p>
          {restPrinciples.map((principle) => (
            <p key={principle.title}>
              <strong>{principle.title}:</strong> {principle.description}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
