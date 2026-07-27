type CtaPlacement = "header" | "hero" | "solutions" | "metodo" | "partners" | "final" | string;

declare global {
  interface Window {
    dataLayer?: unknown[];
    trck?: { event: (name: string, payload: Record<string, unknown>) => void };
  }
}

/**
 * Preserva o comportamento de rastreamento da LP original: evento customizado
 * (mantoraof trck.js) + push no dataLayer (GTM). Não instala scripts novos aqui —
 * eles já são carregados via index.html (ver seção Analytics do README).
 */
export function trackCtaClick(label: string, placement: CtaPlacement, destination?: string) {
  try {
    window.trck?.event("cta_click", { button: placement });
  } catch {
    /* tracker de terceiros indisponível — não bloquear a interação do usuário */
  }

  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "paycon_cta_click",
      placement,
      label,
      destination,
    });
  }
}
