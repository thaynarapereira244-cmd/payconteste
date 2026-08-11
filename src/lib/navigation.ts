import { ScrollSmoother, ScrollTrigger } from "./gsap";

/**
 * NAVEGAÇÃO SINCRONIZADA COM O SCROLL ANIMADO.
 *
 * Antes os links do header eram âncoras nativas (`<a href="#secao">`). O
 * navegador executava um salto de hash próprio, que **ignora o ScrollSmoother**:
 * a viewport ia para a seção, mas o scroll interno que alimenta as
 * ScrollTriggers não acompanhava — os efeitos ficavam num progresso e a página
 * noutro. É essa a dessincronização.
 *
 * A correção é rolar pelo MESMO sistema que dirige as animações
 * (`smoother.scrollTo`), com `window.scrollTo` como alternativa quando o
 * smoother não existe (reduced motion).
 */

/** Altura do header fixo, para a seção não ficar escondida atrás dele. */
function headerOffset(): number {
  const header = document.querySelector("header");
  if (!header) return 0;
  return Math.round(header.getBoundingClientRect().height);
}

/**
 * Posição do elemento no documento, somando `offsetTop` pela cadeia de
 * offsetParents.
 *
 * Usamos isto em vez de `getBoundingClientRect()` porque o ScrollSmoother
 * transforma o conteúdo: o rect reflete o deslocamento visual do momento,
 * enquanto `offsetTop` dá a posição estável no fluxo — e, importante, já
 * **inclui os pin-spacers** das seções pinadas, que é justamente o que faz a
 * conta fechar quando existe uma hero pinada de 3 viewports acima do alvo.
 */
function documentTop(el: HTMLElement): number {
  let y = 0;
  let node: HTMLElement | null = el;
  while (node) {
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return y;
}

export function scrollToSection(sectionId: string, immediate = false) {
  const target = document.getElementById(sectionId);
  if (!target) return;

  /**
   * As medidas precisam estar atualizadas antes de resolver o destino: com
   * seções pinadas, a posição de um elemento no documento depende dos
   * pin-spacers, que só existem depois do refresh.
   */
  ScrollTrigger.refresh();

  const offset = headerOffset();
  // a primeira seção encosta no topo; as demais param abaixo do header
  const destination = Math.max(0, documentTop(target) - (sectionId === "home" ? 0 : offset));

  const smoother = ScrollSmoother.get();
  if (smoother) {
    /**
     * Destino NUMÉRICO de propósito. A sobrecarga
     * `scrollTo(elemento, smooth, "top 76px")` não move o scroll nesta versão do
     * ScrollSmoother (medido: fica em 0); a forma numérica funciona.
     *
     * E deliberadamente NÃO usamos `trigger.start`: aquilo marca onde a ANIMAÇÃO
     * da cena começa (ex.: "top 78%", com a seção ainda a ~78% da viewport), não
     * onde a seção encosta no topo — usar isso deixava a seção parando centenas
     * de pixels abaixo do lugar certo.
     */
    smoother.scrollTo(destination, !immediate);
  } else {
    window.scrollTo({ top: destination, behavior: immediate ? "auto" : "smooth" });
  }

  /**
   * Num salto INSTANTÂNEO as ScrollTriggers intermediárias nunca são
   * percorridas, então nenhuma cena escreve no palco e o efeito fica na fase
   * antiga (medido: scroll em 4287px com o palco ainda em `hero-cloud`).
   * `ScrollTrigger.update()` força todas a recalcularem a partir da posição
   * nova — é isto que sincroniza a animação com o destino.
   */
  if (immediate) {
    ScrollTrigger.update();
    window.setTimeout(() => ScrollTrigger.update(), 60);
  }
}

/**
 * Rola para o hash da URL depois de fontes, imagens e GSAP estarem prontos.
 * O salto nativo do navegador acontece antes de as cenas serem medidas, então
 * refazemos o posicionamento com as medidas corretas.
 */
export function scrollToInitialHash() {
  const id = window.location.hash.replace("#", "");
  if (!id || !document.getElementById(id)) return;

  /**
   * TENTATIVAS ATÉ ASSENTAR.
   *
   * Uma única tentativa era instável: o destino depende de pin-spacers, fontes e
   * imagens acima do alvo, e cada recarregamento resolvia isso num instante
   * diferente (medido: às vezes ia para a posição certa, às vezes ficava em 0).
   * Aqui cada tentativa confere se o scroll realmente chegou perto do destino e
   * só então para.
   *
   * `setTimeout` e não `requestAnimationFrame`: rAF não dispara em aba que não
   * está compondo quadros (segundo plano, janela minimizada).
   */
  let attempt = 0;
  const tick = () => {
    attempt += 1;
    scrollToSection(id, true);

    const smoother = ScrollSmoother.get();
    const current = smoother ? smoother.scrollTop() : window.scrollY;
    const target = document.getElementById(id);
    if (!target) return;
    const expected = Math.max(0, documentTop(target) - (id === "home" ? 0 : headerOffset()));

    const landed = Math.abs(current - expected) < 6;
    if (!landed && attempt < 6) window.setTimeout(tick, attempt * 120);
  };

  /**
   * Começa de imediato, sem esperar `document.fonts.ready`.
   *
   * Esperar por aquela promessa era um ponto único de falha: quando ela não
   * resolve (medido: aba que não compõe quadros deixa o carregamento de fontes
   * pendente), a rotina inteira nunca executava e a página ficava no topo. As
   * tentativas acima já absorvem mudanças de medida por fontes ou imagens que
   * cheguem depois.
   */
  window.setTimeout(tick, 0);
}

// gancho de verificação: permite medir o destino sem depender da animação
if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__payconScrollTo = scrollToSection;
}
