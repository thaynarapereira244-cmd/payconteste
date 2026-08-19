import { useRef, useState } from "react";
import { Quote } from "lucide-react";
import { payconLandingContent } from "../../content/payconLandingContent";
import { useStageScene } from "../../hooks/useStageScene";
import styles from "./TestimonialsScene.module.css";

/**
 * Esteira contínua — a pedido, sem passo-a-passo com pausa entre cards: a
 * fileira desliza sem parar, num loop infinito por CSS puro (`@keyframes`,
 * ver module.css). A lista é duplicada uma vez; a animação anda exatamente
 * metade da largura da fileira (a largura de UM conjunto completo), então o
 * ponto onde ela reinicia é visualmente idêntico ao ponto de partida — sem
 * salto perceptível. Mesma técnica do `PartnersMarquee` (removido depois),
 * agora aplicada aqui.
 */
export function TestimonialsScene() {
  const { testimonials } = payconLandingContent;
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const track = [...testimonials, ...testimonials];

  useStageScene(sectionRef, {
    // depoimentos: prioridade é conteúdo — palco quase apagado
    segments: [{ phase: "network", interaction: [0.12, 0.12], opacity: [0.12, 0.08], glow: [0.05, 0.05] }],
    start: "top 85%",
    end: "bottom 25%",
    scrub: 0.8,
  });

  return (
    <section id="depoimentos" ref={sectionRef} className={styles.section} aria-labelledby="testimonials-heading">
      <div className={styles.intro}>
        <span className="eyebrow">Depoimentos</span>
        <h2 id="testimonials-heading" className={styles.title}>
          Na fala dos nossos clientes
        </h2>
      </div>

      <div
        className={styles.viewport}
        role="region"
        aria-roledescription="carrossel automático"
        aria-label="Depoimentos de clientes"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
      >
        <ul className={styles.track} data-paused={isPaused ? "true" : undefined}>
          {track.map((testimonial, i) => (
            <li key={`${testimonial.id}-${i}`} className={styles.slide} aria-hidden={i >= testimonials.length}>
              <article className={styles.card}>
                <span className={styles.sectorTag}>{testimonial.sectorTag}</span>
                <Quote size={20} className={styles.quoteIcon} aria-hidden="true" />
                <p className={styles.quote}>“{testimonial.quote}”</p>
                <div className={styles.person}>
                  <img
                    src={testimonial.photo}
                    alt=""
                    aria-hidden="true"
                    decoding="async"
                    width="44"
                    height="44"
                    className={styles.photo}
                  />
                  <div>
                    <p className={styles.name}>{testimonial.name}</p>
                    <p className={styles.role}>{testimonial.attribution}</p>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
