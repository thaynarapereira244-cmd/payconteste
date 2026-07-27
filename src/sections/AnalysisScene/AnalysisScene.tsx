import { useRef } from "react";
import { payconLandingContent } from "../../content/payconLandingContent";
import { useStageScene } from "../../hooks/useStageScene";
import { trackCtaClick } from "../../lib/analytics";
import styles from "./AnalysisScene.module.css";

/**
 * Seção de Insights / inteligência de dados.
 *
 * O painel de "scanner" que ficava à direita foi REMOVIDO: mesmo depois de
 * corrigido o estouro de brilho, o que sobrava era uma grade de pontos sem
 * leitura — não comunicava análise nem sustentava a copy. No lugar dele, as duas
 * soluções relacionadas (Baixa de provisão e Dados Qualificados) passaram a
 * ocupar a coluna direita como módulos legíveis, usando a copy oficial.
 *
 * Sem partículas nesta seção: a hierarquia mantém as bolinhas na hero, na
 * conexão dos dedos e na logo final.
 */
export function AnalysisScene() {
  const { solutions } = payconLandingContent;
  const insights = solutions.find((s) => s.id === "insights")!;
  const dadosQualificados = solutions.find((s) => s.id === "dados-qualificados")!;
  const baixaProvisao = solutions.find((s) => s.id === "baixa-de-provisao")!;

  const sectionRef = useRef<HTMLElement | null>(null);

  useStageScene(sectionRef, {
    segments: [
      {
        phase: "scanner",
        interaction: [0.15, 0.15],
        // atmosfera limpa: o palco não aparece atrás desta copy
        opacity: [0.2, 0],
        glow: [0.08, 0.04],
      },
    ],
    start: "top 78%",
    end: "bottom 22%",
    scrub: 1,
  });

  return (
    <section id="solucoes" ref={sectionRef} className={styles.section} aria-labelledby="analysis-heading">
      <div className={styles.grid}>
        <div className={styles.copy}>
          <span className="eyebrow">Inteligência de dados</span>
          <h2 id="analysis-heading" className={styles.title}>
            {insights.title}
          </h2>
          <p className={styles.lead}>{insights.description}</p>
          {insights.highlight ? <p className={styles.highlight}>{insights.highlight}</p> : null}

          {insights.cta ? (
            <a
              href="#contato"
              className={`btn btn-primary ${styles.cta}`}
              onClick={() => trackCtaClick(insights.cta!.label, insights.cta!.placement, "#contato")}
            >
              {insights.cta.label}
            </a>
          ) : null}
        </div>

        {/* Coluna direita: as duas soluções relacionadas, com a copy oficial */}
        <dl className={styles.modules}>
          <div className={styles.module}>
            <dt>{baixaProvisao.title}</dt>
            <dd>{baixaProvisao.description}</dd>
          </div>
          <div className={styles.module}>
            <dt>{dadosQualificados.title}</dt>
            <dd>{dadosQualificados.description}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
