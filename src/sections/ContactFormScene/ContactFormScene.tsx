import { ContactForm } from "../../components/ContactForm/ContactForm";
import { payconLandingContent } from "../../content/payconLandingContent";
import styles from "./ContactFormScene.module.css";

/**
 * Formulário — extraído de `FinalContactScene` para ficar na MESMA posição
 * que no site oficial: logo depois dos cards de soluções, não no fim da
 * página junto com o CTA final. `FinalContactScene` mantém só o CTA e a
 * formação do PAYCON.
 */
export function ContactFormScene() {
  const { form } = payconLandingContent;

  return (
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
  );
}
