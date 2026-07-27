import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { payconLandingContent } from "../../content/payconLandingContent";
import { useStageScene } from "../../hooks/useStageScene";
import { useTilt } from "../../hooks/useParallax";
import styles from "./TestimonialsScene.module.css";

/** Cena de leitura: copy à esquerda, depoimento à direita. Palco em repouso. */
export function TestimonialsScene() {
  const { testimonials } = payconLandingContent;
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRef = useTilt<HTMLDivElement>(2.5, 0.05);
  const [index, setIndex] = useState(0);

  useStageScene(sectionRef, {
    // depoimentos: prioridade é conteúdo e controles — palco quase apagado
    segments: [{ phase: "network", interaction: [0.12, 0.12], opacity: [0.12, 0.08], glow: [0.05, 0.05] }],
    start: "top 85%",
    end: "bottom 25%",
    scrub: 0.8,
  });

  const go = (dir: 1 | -1) =>
    setIndex((prev) => (prev + dir + testimonials.length) % testimonials.length);

  const current = testimonials[index];

  return (
    <section id="depoimentos" ref={sectionRef} className={styles.section} aria-labelledby="testimonials-heading">
      <div className={styles.grid}>
        <div className={styles.copy}>
          <span className="eyebrow">Depoimentos</span>
          <h2 id="testimonials-heading" className={styles.title}>
            Na fala dos nossos clientes
          </h2>
          {/* Controles: botão inteiro com 56px (60px no desktop largo), não só o ícone */}
          <div className={styles.controls}>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => go(-1)}
              aria-label="Depoimento anterior"
            >
              <ChevronLeft size={24} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => go(1)}
              aria-label="Próximo depoimento"
            >
              <ChevronRight size={24} aria-hidden="true" />
            </button>
            <span className={styles.counter}>
              <strong>{String(index + 1).padStart(2, "0")}</strong>
              <span aria-hidden="true"> / </span>
              {String(testimonials.length).padStart(2, "0")}
            </span>
          </div>

          {/* linha de progresso + posição atual, deixando claro que é navegável */}
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={testimonials.length}
            aria-valuenow={index + 1}
            aria-label="Posição no carrossel de depoimentos"
          >
            <span
              className={styles.progressFill}
              style={{ width: `${((index + 1) / testimonials.length) * 100}%` }}
            />
          </div>
        </div>

        <div
          ref={cardRef}
          className={styles.card}
          role="region"
          aria-roledescription="carrossel"
          aria-label="Depoimentos de clientes"
        >
          <Quote size={24} className={styles.quoteIcon} aria-hidden="true" />
          <p className={styles.quote}>“{current.quote}”</p>
          <div className={styles.person}>
            <img src={current.photo} alt="" aria-hidden="true" className={styles.photo} />
            <div>
              <p className={styles.name}>{current.name}</p>
              <p className={styles.role}>
                {current.role ? `${current.role} · ` : ""}
                {current.company}
              </p>
            </div>
          </div>
          <p className="sr-only" aria-live="polite">
            Depoimento {index + 1} de {testimonials.length}: {current.name}, {current.company}
          </p>
        </div>
      </div>
    </section>
  );
}
