import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { PayconLogo } from "../PayconLogo/PayconLogo";
import { payconLandingContent } from "../../content/payconLandingContent";
import { trackCtaClick } from "../../lib/analytics";
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
  const [activeHref, setActiveHref] = useState("#home");

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

  // estado ativo: seção cujo topo passou do meio da viewport
  useEffect(() => {
    const sections = COMPACT_HREFS.map((href) => document.querySelector(href)).filter(
      (el): el is Element => Boolean(el)
    );
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveHref(`#${visible.target.id}`);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleLinkClick = (href: string, label: string) => {
    if (CTA_HREFS.has(href)) trackCtaClick(label, "header", href);
    setMenuOpen(false);
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}>
      <div className={styles.inner}>
        <a href="#home" className={styles.logoLink} aria-label="Paycon, ir para o início">
          <PayconLogo height={17} />
        </a>

        <nav className={styles.navPill} aria-label="Navegação principal">
          {compactLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={activeHref === link.href ? "page" : undefined}
              className={activeHref === link.href ? styles.navActive : undefined}
              onClick={() => handleLinkClick(link.href, link.label)}
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
              onClick={() => handleLinkClick(primaryLink.href, primaryLink.label)}
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
            <a key={link.href} href={link.href} onClick={() => handleLinkClick(link.href, link.label)}>
              {link.label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
