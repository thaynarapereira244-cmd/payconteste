import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { PayconLogo } from "../PayconLogo/PayconLogo";
import { payconLandingContent } from "../../content/payconLandingContent";
import { trackCtaClick } from "../../lib/analytics";
import { ensureGsapRegistered, ScrollTrigger } from "../../lib/gsap";
import { scrollToSection } from "../../lib/navigation";
import styles from "./PayconHeader.module.css";

const CTA_HREFS = new Set(["#contato", "#fale-conosco"]);

/**
 * Header na composição da referência: logo à esquerda, navegação compacta dentro
 * de uma pill escura ao centro, CTA em pill de alto contraste à direita.
 *
 * O desktop mostra apenas 4 âncoras (Home, Soluções, Clientes, Diferenciais) para
 * a barra ficar discreta; NENHUM link é perdido — o menu mobile continua listando
 * a navegação completa da página original. Os labels vêm do conteúdo, não são
 * reescritos aqui.
 */
const COMPACT_HREFS = ["#home", "#solucoes", "#clientes", "#diferenciais"];

export function PayconHeader() {
  const { navigation } = payconLandingContent;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // ao abrir a página já com um #hash, o marcador começa na seção certa
  const [activeHref, setActiveHref] = useState(() => {
    const hash = typeof window === "undefined" ? "" : window.location.hash;
    return COMPACT_HREFS.includes(hash) ? hash : "#home";
  });

  const primaryLink = navigation.find((l) => l.href === "#contato");
  const compactLinks = COMPACT_HREFS.map((href) => navigation.find((l) => l.href === href)).filter(
    (l): l is (typeof navigation)[number] => Boolean(l)
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /**
   * ESTADO ATIVO PELO MESMO SISTEMA QUE DIRIGE AS ANIMAÇÕES.
   *
   * A primeira versão usava IntersectionObserver, mas ele não acompanha o
   * ScrollSmoother de forma confiável: o conteúdo é transladado por
   * `transform`, e ao rolar programaticamente para uma seção o observer não
   * reagia (medido: marcador continuou em `#home` depois de rolar para
   * Soluções, Diferenciais e Clientes).
   *
   * Usando ScrollTrigger, o marcador passa a vir da MESMA fonte de verdade das
   * cenas — então ele acompanha tanto o scroll manual quanto os cliques.
   */
  useEffect(() => {
    ensureGsapRegistered();
    const triggers = COMPACT_HREFS.map((href) => {
      const el = document.getElementById(href.replace("#", ""));
      if (!el) return null;
      const activate = () => setActiveHref(href);
      return ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 45%",
        onEnter: activate,
        onEnterBack: activate,
      });
    }).filter((t): t is ScrollTrigger => Boolean(t));

    return () => triggers.forEach((t) => t.kill());
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  /**
   * Navegação pelo mesmo sistema que dirige as animações.
   *
   * `preventDefault` impede o salto de hash nativo, que ignorava o
   * ScrollSmoother e deixava os efeitos de scroll fora de sincronia com a
   * posição da página. O hash é atualizado por `replaceState`, sem provocar um
   * segundo salto.
   */
  const handleLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    label: string
  ) => {
    if (CTA_HREFS.has(href)) trackCtaClick(label, "header", href);
    setMenuOpen(false);

    const id = href.replace("#", "");
    if (!document.getElementById(id)) return; // deixa o navegador resolver
    event.preventDefault();
    scrollToSection(id);
    setActiveHref(href);
    history.replaceState(null, "", href);
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}>
      <div className={styles.inner}>
        <a
          href="#home"
          className={styles.logoLink}
          aria-label="Paycon, ir para o início"
          onClick={(e) => handleLinkClick(e, "#home", "HOME")}
        >
          <PayconLogo height={17} />
        </a>

        <nav className={styles.navPill} aria-label="Navegação principal">
          {compactLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={activeHref === link.href ? "page" : undefined}
              className={activeHref === link.href ? styles.navActive : undefined}
              onClick={(e) => handleLinkClick(e, link.href, link.label)}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          {primaryLink ? (
            <a
              href={primaryLink.href}
              className={styles.ctaPill}
              onClick={(e) => handleLinkClick(e, primaryLink.href, primaryLink.label)}
            >
              {primaryLink.label}
              <ArrowRight size={14} aria-hidden="true" />
            </a>
          ) : null}
          <button
            type="button"
            className={styles.menuToggle}
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav id="mobile-nav" className={styles.mobileNav} aria-label="Navegação completa">
          {navigation.map((link) => (
            <a key={link.href} href={link.href} onClick={(e) => handleLinkClick(e, link.href, link.label)}>
              {link.label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
