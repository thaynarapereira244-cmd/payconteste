import { useState, type FormEvent } from "react";
import { payconLandingContent, type PayconLandingContent } from "../../content/payconLandingContent";
import { getSupabase } from "../../lib/supabaseClient";
import { trackCtaClick } from "../../lib/analytics";
import styles from "./ContactForm.module.css";

type FormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  sector: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const INITIAL_STATE: FormState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  role: "",
  sector: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(state: FormState, fields: PayconLandingContent["form"]["fields"]): FormErrors {
  const errors: FormErrors = {};
  const isRequired = (id: string) => fields.find((f) => f.id === id)?.required ?? false;

  if (isRequired("name") && !state.name.trim()) errors.name = "Informe seu nome.";
  if (isRequired("email") && !state.email.trim()) errors.email = "Informe seu e-mail.";
  else if (state.email.trim() && !EMAIL_PATTERN.test(state.email.trim())) errors.email = "Informe um e-mail válido.";
  if (isRequired("phone") && !state.phone.trim()) errors.phone = "Informe seu celular.";
  if (isRequired("company") && !state.company.trim()) errors.company = "Informe o nome da empresa.";
  if (isRequired("role") && !state.role.trim()) errors.role = "Informe seu cargo.";
  if (isRequired("sector") && !state.sector.trim()) errors.sector = "Selecione uma opção.";
  return errors;
}

export function ContactForm() {
  const { form } = payconLandingContent;
  const [state, setState] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const updateField = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setState((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;

    const validationErrors = validate(state, form.fields);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setStatus("submitting");
    try {
      const payload = {
        name: state.name.trim(),
        email: state.email.trim(),
        phone: state.phone.trim(),
        company: state.company.trim(),
        role: state.role.trim(),
        sector: state.sector,
        source: form.integration.source,
        page_url: window.location.href,
        submitted_at: new Date().toISOString(),
      };

      const supabase = await getSupabase();
      const { error } = await supabase.functions.invoke(form.integration.functionName, {
        body: payload,
      });
      if (error) throw error;

      setStatus("success");
      trackCtaClick(form.submitLabel, "contato", form.integration.functionName);
      setState(INITIAL_STATE);
    } catch (err) {
      console.error("Error submitting form:", err);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className={styles.successState} role="status">
        <h3 className="text-display-sm">{form.successTitle}</h3>
        <p className="text-body">{form.successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.grid}>
        {form.fields
          .filter((f) => f.type !== "select")
          .map((field) => (
            <div key={field.id} className={styles.field}>
              <label htmlFor={`paycon-${field.id}`}>
                {field.label}
                {field.required ? "*" : ""}
              </label>
              <input
                id={`paycon-${field.id}`}
                name={field.name}
                type={field.type}
                required={field.required}
                autoComplete={field.type === "email" ? "email" : field.type === "tel" ? "tel" : "on"}
                placeholder={field.placeholder}
                value={state[field.id as keyof FormState]}
                onChange={updateField(field.id as keyof FormState)}
                disabled={status === "submitting"}
                aria-invalid={Boolean(errors[field.id as keyof FormState])}
                aria-describedby={errors[field.id as keyof FormState] ? `${field.id}-error` : undefined}
              />
              {errors[field.id as keyof FormState] ? (
                <span id={`${field.id}-error`} className={styles.fieldError} role="alert">
                  {errors[field.id as keyof FormState]}
                </span>
              ) : null}
            </div>
          ))}

        {form.fields
          .filter((f) => f.type === "select")
          .map((field) => (
            <div key={field.id} className={`${styles.field} ${styles.fieldFull}`}>
              <label htmlFor={`paycon-${field.id}`}>
                {field.label}
                {field.required ? "*" : ""}
              </label>
              <select
                id={`paycon-${field.id}`}
                name={field.name}
                required={field.required}
                value={state[field.id as keyof FormState]}
                onChange={updateField(field.id as keyof FormState)}
                disabled={status === "submitting"}
                aria-invalid={Boolean(errors[field.id as keyof FormState])}
                aria-describedby={errors[field.id as keyof FormState] ? `${field.id}-error` : undefined}
              >
                <option value="" disabled>
                  {field.placeholder}
                </option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors[field.id as keyof FormState] ? (
                <span id={`${field.id}-error`} className={styles.fieldError} role="alert">
                  {errors[field.id as keyof FormState]}
                </span>
              ) : null}
            </div>
          ))}
      </div>

      {status === "error" ? (
        <p className={styles.formError} role="alert">
          {form.errorTitle}: {form.errorBody}
        </p>
      ) : null}

      <button
        type="submit"
        className={`btn btn-primary ${styles.submit}`}
        disabled={status === "submitting"}
      >
        {status === "submitting" ? form.submittingLabel : form.submitLabel}
      </button>
      <p className="text-muted text-body-sm">{form.supportingCopy}</p>
    </form>
  );
}
