import { PayconLogo } from "../PayconLogo/PayconLogo";
import { payconLandingContent } from "../../content/payconLandingContent";
import styles from "./PageFooter.module.css";

export function PageFooter() {
  const { footer } = payconLandingContent;

  return (
    <footer className={styles.footer}>
      <div className={`container-custom ${styles.grid}`}>
        <div className={styles.brand}>
          <PayconLogo />
          <p className={`text-body ${styles.tagline}`}>{footer.tagline}</p>
        </div>

        <nav className={styles.links} aria-label="Links do rodapé">
          <h3 className="text-label">{footer.title}</h3>
          <ul>
            {footer.quickLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.contact}>
          <h3 className="text-label">Contato</h3>
          <ul>
            <li>
              <a href={`mailto:${footer.contact.email}`}>{footer.contact.email}</a>
            </li>
            <li>
              <a href={`tel:${footer.contact.phone.replace(/\D/g, "")}`}>{footer.contact.phone}</a>
            </li>
            <li>{footer.contact.location}</li>
          </ul>
        </div>
      </div>

      <div className={`container-custom ${styles.bottom}`}>
        <p className="text-muted text-body-sm">{footer.copyright}</p>
      </div>
    </footer>
  );
}
