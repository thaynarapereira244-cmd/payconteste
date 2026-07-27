import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { ContactForm } from "../../components/ContactForm/ContactForm";
import { payconLandingContent } from "../../content/payconLandingContent";
import { useStageScene } from "../../hooks/useStageScene";
import { trackCtaClick } from "../../lib/analytics";
import styles from "./FinalContactScene.module.css";

/**
 * CENA FINAL — a logo Paycon é CONSTRUÍDA abaixo do botão.
 *
 * As mesmas partículas que percorreram a página se reorganizam no wordmark:
 * "PAY" em azul institucional e "CON" em cinza. A montagem é dirigida pelo
 * scroll e reversível — ao subir, os módulos voltam à malha e o CTA permanece
 * acessível o tempo todo.
 */
export function FinalContactScene() {
  const { finalCta, form } = payconLandingContent;
  const ctaRef = useRef<HTMLElement | null>(null);
  const logoSlotRef = useRef<HTMLDivElement | null>(null);

  // A logo é formada pelas partículas do palco, no espaço reservado abaixo do
  // botão. A faixa é longa e scrubbed para a construção ser legível e reversível.
  useStageScene(ctaRef, {
    segments: [
      {
        phase: "final-logo",
        interaction: [0.3, 0.7],
        zoom: [1.04, 1],
        opacity: [0.45, 1],
        glow: [0.12, 0.45],
      },
    ],
    start: "top 92%",
    end: "bottom 78%",
    scrub: 1.1,
  });

  return (
    <>
      <section
        id="fale-conosco"
        ref={ctaRef}
        className={styles.ctaSection}
        aria-labelledby="final-cta-heading"
      >
        <div className={styles.content}>
          <h2 id="final-cta-heading" className={styles.headline}>
            {finalCta.headline}
          </h2>
          <p className={styles.body}>{finalCta.body}</p>
          <a
            href={finalCta.cta.href}
            target={finalCta.cta.external ? "_blank" : undefined}
            rel={finalCta.cta.external ? "noopener noreferrer" : undefined}
            className="btn btn-primary"
            onClick={() => trackCtaClick(finalCta.cta.label, finalCta.cta.placement, finalCta.cta.href)}
          >
            {finalCta.cta.label}
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>

          {/*
            Espaço reservado onde as partículas montam o wordmark PAYCON.
            É só reserva de layout — a logo em si é desenhada pelo palco atrás,
            então há um texto acessível equivalente para leitores de tela.
          */}
          <div ref={logoSlotRef} className={styles.logoSlot} aria-hidden="true" />
          <span className="sr-only">Paycon</span>
        </div>
      </section>

      {/* Formulário: área de leitura — sem partículas por cima, alto contraste */}
      <section id="contato" className={styles.formSection} aria-labelledby="form-heading">
        <div className={styles.formGrid}>
          <div className={styles.formIntro}>
            <span className="eyebrow">Demonstração gratuita</span>
            <h2 id="form-heading" className={styles.formTitle}>
              {form.title}
            </h2>
            <span className={styles.formRule} aria-hidden="true" />
            <p className={styles.formSupport}>{form.supportingCopy}</p>
          </div>
          <div className={styles.formCard}>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
