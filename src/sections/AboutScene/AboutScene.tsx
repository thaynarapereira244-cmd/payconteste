import { useRef } from "react";
import { payconLandingContent } from "../../content/payconLandingContent";
import { useStageScene } from "../../hooks/useStageScene";
import styles from "./AboutScene.module.css";

/**
 * "Sobre a PAYCON" em DUAS COLUNAS.
 *
 * A esquerda estava vazia e os sócios ficavam empilhados embaixo. Agora os
 * retratos ocupam a coluna esquerda e o texto institucional a direita — um único
 * bloco conectado. Sem partículas nesta área (o palco fica quase apagado): a
 * prioridade é rosto, nome, cargo e leitura.
 */
export function AboutScene() {
  const { about, team } = payconLandingContent;
  const sectionRef = useRef<HTMLElement | null>(null);

  useStageScene(sectionRef, {
    segments: [
      { phase: "dormant", interaction: [0.1, 0.1], offsetX: [-0.3, -0.3], opacity: [0.06, 0.04] },
    ],
    start: "top 85%",
    end: "bottom 25%",
    scrub: 0.8,
  });

  return (
    <section id="sobre" ref={sectionRef} className={styles.section} aria-labelledby="about-heading">
      <div className={styles.inner}>
        {/* COLUNA ESQUERDA — sócios */}
        <div className={styles.team}>
          <h3 className={styles.teamHeading}>Sócios</h3>
          <ul className={styles.teamList}>
            {team.map((member) => (
              <li key={member.id} className={styles.teamCard}>
                <div className={styles.teamHead}>
                  <img
                    src={member.photo}
                    alt={member.name}
                    loading="lazy"
                    width="60"
                    height="60"
                    className={styles.teamPhoto}
                  />
                  <div className={styles.teamInfo}>
                    <p className={styles.teamName}>{member.name}</p>
                    <p className={styles.teamRole}>{member.role}</p>
                  </div>
                </div>
                {member.bio.split("\n\n").map((paragraph, i) => (
                  <p key={i} className={styles.teamBio}>
                    {paragraph}
                  </p>
                ))}
              </li>
            ))}
          </ul>
        </div>

        {/* COLUNA DIREITA — texto institucional */}
        <div className={styles.narrative}>
          <span className="eyebrow">Quem somos</span>
          <h2 id="about-heading" className={styles.title}>
            {about.title}
          </h2>
          <p className={styles.lead}>{about.history}</p>
          <p className={styles.lead}>{about.growthMetric}</p>

          {about.philosophy.map((paragraph) => (
            <p key={paragraph} className={styles.body}>
              {paragraph}
            </p>
          ))}

          <blockquote className={styles.mission}>{about.mission}</blockquote>

          <p className={styles.body}>{about.impact}</p>
          <p className={styles.body}>{about.legacy}</p>
        </div>
      </div>
    </section>
  );
}
