import { forwardRef, useLayoutEffect } from "react";
import { CheckCircle2, Check, FileText, Link2, Workflow } from "lucide-react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useTilt } from "../../hooks/useParallax";
import { ensureGsapRegistered, gsap } from "../../lib/gsap";
import styles from "./HeroIntroGraphic.module.css";

/**
 * GRÁFICO DE ENTRADA DA HERO — cards de ícone conectados por linhas
 * tracejadas ao redor de um hub central.
 *
 * Inspirado no ARRANJO de um gráfico de produto de referência (hub + cards
 * satélite + conectores tracejados + um badge flutuante), mas original em
 * tudo o que é da marca: paleta azul/cinza da Paycon (não a cor da
 * referência), ícones e ângulos próprios, e SEM nenhuma métrica/rótulo
 * inventado — o badge é só um ícone de check, sem número.
 *
 * Os ícones seguem a própria copy da hero: documento (tarefas),
 * integração (`sistema que você já usa`), conclusão (`um clique`), com o
 * hub de automação no centro.
 *
 * Substitui a nuvem de partículas apenas no estado de REPOUSO da hero — ao
 * rolar, `PayconHero` desvanece este bloco e as partículas assumem a
 * narrativa (ver `onProgress` em PayconHero.tsx).
 */

type Node = { id: string; x: number; y: number };

// Espaço de coordenadas 400×300 — tanto os cards (em %) quanto o SVG (viewBox)
// usam os MESMOS pontos, então alinham em qualquer largura sem conversão.
const SPACE = { w: 400, h: 300 };
const HUB: Node = { id: "hub", x: 200, y: 168 };
// ícones e ângulos próprios, ecoando a copy da hero (tarefas, integração, um clique)
const SATELLITES: Array<Node & { Icon: typeof FileText }> = [
  { id: "docs", x: 88, y: 76, Icon: FileText },
  { id: "integracao", x: 326, y: 118, Icon: Link2 },
  { id: "conclusao", x: 128, y: 246, Icon: CheckCircle2 },
];
const BADGE: Node = { id: "badge", x: 292, y: 54 };

const pct = (v: number, total: number) => `${((v / total) * 100).toFixed(2)}%`;

/**
 * Encaminha a ref para o elemento raiz — `PayconHero` precisa dele para
 * escrever `opacity` diretamente durante o scroll (mesmo padrão já usado em
 * `copyRef`), sem criar um wrapper div extra. Um wrapper teria seu próprio
 * `transform`/`opacity` aplicados via JS, o que criaria um novo bloco de
 * contenção para o `.wrap` (que é `position: absolute`) e quebraria o
 * posicionamento — por isso a ref aponta para o PRÓPRIO elemento com o
 * `position: absolute`, não para um pai.
 */
export const HeroIntroGraphic = forwardRef<HTMLDivElement>(function HeroIntroGraphic(_props, forwardedRef) {
  const reducedMotion = useReducedMotion();
  // inclinação sutil de cursor (camada 3, mesmo rAF do palco) — nada de giro
  // global; é o mesmo hook já usado na rede de parceiros (`useTilt(4, 0.05)`).
  const tiltRef = useTilt<HTMLDivElement>(5, 0.06);

  useLayoutEffect(() => {
    if (reducedMotion || !tiltRef.current) return;
    ensureGsapRegistered();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.25 });
      tl.from(`.${styles.hubInner}`, {
        opacity: 0,
        scale: 0.6,
        duration: 0.55,
        ease: "back.out(1.7)",
      })
        .from(
          `.${styles.lines} path`,
          { opacity: 0, duration: 0.5, ease: "power1.out", stagger: 0.06 },
          "-=0.2"
        )
        .from(
          `.${styles.satelliteInner}`,
          { opacity: 0, scale: 0.5, y: 8, duration: 0.5, ease: "back.out(1.7)", stagger: 0.09 },
          "-=0.35"
        )
        .from(
          `.${styles.badgeInner}`,
          { opacity: 0, scale: 0.4, duration: 0.4, ease: "back.out(1.8)" },
          "-=0.15"
        )
        .from(`.${styles.lines} circle`, { opacity: 0, duration: 0.3 }, "-=0.3");
    }, tiltRef);
    return () => ctx.revert();
    // tiltRef é um ref estável (identidade não muda entre renders)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  return (
    <div
      ref={(el) => {
        tiltRef.current = el;
        if (typeof forwardedRef === "function") forwardedRef(el);
        else if (forwardedRef) forwardedRef.current = el;
      }}
      className={styles.wrap}
      aria-hidden="true"
      style={{ transform: "translate(-50%, -50%) perspective(900px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))" }}
    >
      <svg className={styles.lines} viewBox={`0 0 ${SPACE.w} ${SPACE.h}`}>
        {SATELLITES.map((s) => (
          <path
            key={s.id}
            d={`M${HUB.x},${HUB.y} L${s.x},${s.y}`}
          />
        ))}
        <path d={`M${HUB.x},${HUB.y} L${BADGE.x},${BADGE.y}`} />
        <circle cx={HUB.x} cy={HUB.y} r={3.2} />
      </svg>

      <div
        className={styles.hub}
        style={{ left: pct(HUB.x, SPACE.w), top: pct(HUB.y, SPACE.h) }}
      >
        <div className={styles.hubInner}>
          <Workflow size={26} strokeWidth={1.6} aria-hidden="true" />
        </div>
      </div>

      {SATELLITES.map(({ id, x, y, Icon }) => (
        <div key={id} className={styles.satellite} style={{ left: pct(x, SPACE.w), top: pct(y, SPACE.h) }}>
          <div className={styles.satelliteInner}>
            <Icon size={18} strokeWidth={1.6} aria-hidden="true" />
          </div>
        </div>
      ))}

      <div className={styles.badge} style={{ left: pct(BADGE.x, SPACE.w), top: pct(BADGE.y, SPACE.h) }}>
        <div className={styles.badgeInner}>
          <Check size={13} strokeWidth={2.2} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
});
