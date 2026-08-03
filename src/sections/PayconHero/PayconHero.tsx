import { useCallback, useLayoutEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { HeroIntroGraphic } from "../../components/HeroIntroGraphic/HeroIntroGraphic";
import { payconLandingContent } from "../../content/payconLandingContent";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useStageScene, type StageSegment } from "../../hooks/useStageScene";
import { trackCtaClick } from "../../lib/analytics";
import { ensureGsapRegistered, gsap, SplitText } from "../../lib/gsap";
import styles from "./PayconHero.module.css";

/**
 * Faixa (em progresso GLOBAL da hero, 0–1) em que o gráfico de entrada
 * desvanece para dar lugar às partículas. Termina ANTES do fim da fase
 * `hero-cloud` (que vai até ~0.22) para o crossfade não deixar vão: nesse
 * ponto as partículas já estão a ~64% de opacidade (ver `opacity` do
 * segmento `hero-cloud` em SEGMENTS).
 */
const GRAPHIC_FADE_OUT_END = 0.14;

/**
 * Coreografia da hero.
 *
 * Nuvem orgânica que segue o cursor (referência: o vídeo em `Reference/`) →
 * recolhe → condensa no núcleo → FORMA O WORDMARK PAYCON → libera para a cena
 * seguinte. A antiga remontagem numa grade retangular foi removida.
 *
 * O wordmark ocupa ~20% da timeline formando e ~12% legível antes de soltar, e
 * `offsetY` sobe a 0 nessa etapa para que ele fique no centro visual.
 *
 * Tudo é função do progresso do scroll → a sequência reverte corretamente.
 */
const SEGMENTS: StageSegment[] = [
  // 0–22%: campo orgânico seguindo o cursor; copy e CTA totalmente visíveis.
  // `opacity` sobe de 0→1: em repouso quem aparece é o HeroIntroGraphic (cards
  // conectados); as partículas se revelam progressivamente ao rolar, no mesmo
  // ritmo em que o gráfico desvanece (ver GRAPHIC_FADE_OUT_END/onProgress).
  {
    phase: "hero-cloud",
    weight: 1.1,
    interaction: [1, 1],
    offsetY: [-0.5, -0.5],
    opacity: [0, 1],
    glow: [0.1, 0.16],
  },
  // 22–44%: a nuvem se recolhe, dois lados começam a se distinguir
  { phase: "hero-gather", weight: 1.1, interaction: [1, 0.55], offsetY: [-0.5, -0.42], glow: [0.16, 0.26] },
  // 44–62%: conexão no centro, pulso contido
  { phase: "hero-condense", weight: 0.9, interaction: [0.55, 0.3], offsetY: [-0.42, -0.24], glow: [0.26, 0.6] },
  // 62–68%: núcleo pronto, prestes a virar letra
  { phase: "hero-core", weight: 0.3, interaction: [0.3, 0.2], offsetY: [-0.24, -0.1], glow: [0.6, 0.8] },
  // 68–88%: FORMA O WORDMARK PAYCON, centralizado
  {
    phase: "hero-wordmark",
    weight: 1,
    interaction: [0.2, 0.12],
    offsetY: [-0.1, 0],
    glow: [0.8, 0.3],
  },
  // 88–100%: permanece legível e só então libera para a cena seguinte
  {
    phase: "hero-release",
    weight: 0.6,
    interaction: [0.12, 0.5],
    offsetY: [0, 0],
    zoom: [1, 1.12],
    opacity: [1, 0.9],
    glow: [0.3, 0.2],
  },
];

export function PayconHero() {
  const { hero } = payconLandingContent;
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const graphicRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  // A copy sai por máscara (sobe e desvanece) só depois dos 68%.
  // O HeroIntroGraphic desvanece bem no início — ver GRAPHIC_FADE_OUT_END.
  const onProgress = useCallback((p: number) => {
    const copy = copyRef.current;
    if (copy) {
      // legível durante os primeiros ~44%, depois sai por máscara
      const out = Math.min(1, Math.max(0, (p - 0.44) / 0.2));
      // mantém o translateX(-50%) da centralização; só acrescenta o deslocamento
      copy.style.transform = `translate(-50%, ${(-out * 5).toFixed(2)}vh)`;
      copy.style.opacity = String(1 - out);
      copy.style.pointerEvents = out > 0.6 ? "none" : "auto";
    }

    const graphic = graphicRef.current;
    if (graphic) {
      // só `opacity` — `transform` no próprio elemento já é gerido pelo React
      // (centralização + tilt do cursor); escrever os dois via caminhos
      // diferentes no mesmo elemento entraria em conflito a cada re-render.
      // `pointer-events` já é `none` fixo no CSS (o gráfico é decorativo).
      const goneAt = Math.min(1, Math.max(0, p / GRAPHIC_FADE_OUT_END));
      graphic.style.opacity = String(1 - goneAt);
    }
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
          Gráfico de repouso: cards conectados (ver HeroIntroGraphic). Some ao
          rolar (onProgress) para as partículas assumirem a narrativa — por
          isso só existe fora de reduced motion, onde não há scroll-driven
          transform algum e o palco já mostra sua própria nuvem estática.
        */}
        {!reducedMotion && <HeroIntroGraphic ref={graphicRef} />}

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
