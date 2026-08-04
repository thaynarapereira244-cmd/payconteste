import { useCallback, useRef } from "react";
import { payconLandingContent } from "../../content/payconLandingContent";
import { useTilt } from "../../hooks/useParallax";
import { useStageScene } from "../../hooks/useStageScene";
import styles from "./PartnersScene.module.css";

const COLUMNS = 6;

/**
 * CENA — parceiros como REDE, não como marquee.
 *
 * Cada logo nasce de um nó: o nó surge, a conexão se desenha e o logo é
 * revelado. Todos os 30 parceiros da página original são preservados, na mesma
 * ordem, com alt text e sem filtro que descaracterize a marca.
 */
export function PartnersScene() {
  const { partners, partnersIntro } = payconLandingContent;
  const sectionRef = useRef<HTMLElement | null>(null);
  const cellRefs = useRef<Array<HTMLLIElement | null>>([]);
  const linesRef = useRef<SVGSVGElement | null>(null);
  const netRef = useTilt<HTMLDivElement>(4, 0.05);

  const onProgress = useCallback(
    (p: number) => {
      const cells = cellRefs.current;
      const total = cells.length;
      for (let i = 0; i < total; i++) {
        const el = cells[i];
        if (!el) continue;
        // Revelação em onda diagonal pela grade.
        // A onda é curta de propósito: parceiros são prova comercial, então
        // TODOS precisam estar 100% visíveis enquanto a seção ainda está na
        // tela — nenhum logo pode depender de o usuário rolar até o fim.
        const col = i % COLUMNS;
        const row = Math.floor(i / COLUMNS);
        const wave = (col + row) / (COLUMNS + Math.ceil(total / COLUMNS));
        const t = Math.min(1, Math.max(0, (p - wave * 0.3) / 0.3));

        /**
         * Propriedades escritas DIRETO no style, como nas outras cenas.
         *
         * A versão anterior passava por custom properties (`--reveal`) e o CSS
         * fazia a aritmética. As propriedades resolviam os valores default em
         * vez dos inline, então os logos ficavam com `opacity: 0`; e como imagem
         * `loading="lazy"` que nunca é pintada também nunca é baixada, os 30
         * logos não carregavam. Escrever o valor final elimina a indireção.
         */
        const depth = (col - COLUMNS / 2) * 5;
        el.style.transform = `translateZ(${depth.toFixed(1)}px)`;
        /**
         * Alpha vai até 1 (opaco), não 0.92 como antes — painel translúcido
         * deixava o fundo escuro da página vazar por trás de logos com arquivo
         * transparente (a maioria), ficando visivelmente mais escuro que o
         * Afya (que tem branco opaco embutido no próprio arquivo). Ver o
         * comentário em PartnersScene.module.css `.cell`.
         */
        el.style.background = `rgba(244, 245, 248, ${t.toFixed(3)})`;
        el.style.borderColor = `rgba(255, 255, 255, ${(0.05 + t * 0.06).toFixed(3)})`;

        const img = el.querySelector("img");
        if (img) {
          img.style.opacity = t.toFixed(3);
          img.style.transform = `scale(${(0.92 + t * 0.08).toFixed(3)})`;
        }
        const node = el.querySelector<HTMLElement>("[data-node]");
        if (node) {
          node.style.opacity = Math.max(0, 1 - t * 1.6).toFixed(3);
          node.style.transform = `scale(${(1 + t * 3).toFixed(3)})`;
        }
      }
      if (linesRef.current) {
        linesRef.current.style.setProperty("--draw", Math.min(1, p * 1.5).toFixed(3));
      }
    },
    []
  );

  useStageScene(sectionRef, {
    segments: [
      {
        phase: "network",
        offsetX: [0, 0],
        // clientes: prioridade é logos e linhas de conexão
        interaction: [0.18, 0.2],
        opacity: [0.2, 0.14],
        glow: [0.06, 0.08],
      },
    ],
    // a faixa termina com a seção ainda visível, garantindo revelação completa
    start: "top 92%",
    end: "bottom 65%",
    scrub: 0.9,
    onProgress,
  });

  return (
    <section id="clientes" ref={sectionRef} className={styles.section} aria-labelledby="partners-heading">
      <div className={styles.grid}>
        {/* copy lateralizada, com o título em escala editorial */}
        <div className={styles.copy}>
          <span className="eyebrow">Clientes</span>
          {/* título/subtítulo dedicados da seção (H2 + parágrafo no site oficial) */}
          <h2 id="partners-heading" className={styles.title}>
            {partnersIntro.title}
          </h2>
          <p className={styles.subtitle}>{partnersIntro.subtitle}</p>
        </div>

        <div ref={netRef} className={styles.network}>
          {/* conexões da malha, desenhadas conforme o scroll */}
          <svg
            ref={linesRef}
            className={styles.lines}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {Array.from({ length: 5 }, (_, i) => (
              <line key={`h${i}`} x1="0" y1={10 + i * 20} x2="100" y2={10 + i * 20} />
            ))}
            {Array.from({ length: COLUMNS }, (_, i) => (
              <line
                key={`v${i}`}
                x1={(i / (COLUMNS - 1)) * 100}
                y1="0"
                x2={(i / (COLUMNS - 1)) * 100}
                y2="100"
              />
            ))}
          </svg>

          <ul className={styles.logos}>
            {partners.map((partner, i) => (
              <li
                key={partner.id}
                ref={(el) => {
                  cellRefs.current[i] = el;
                }}
                className={styles.cell}
              >
                <span className={styles.node} data-node aria-hidden="true" />
                <img
                  src={partner.logo}
                  alt={partner.name}
                  loading="lazy"
                  decoding="async"
                  width="132"
                  height="64"
                  className={styles.logo}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
