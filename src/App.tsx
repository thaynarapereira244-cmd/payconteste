import { useLayoutEffect, useRef } from "react";
import { PayconHeader } from "./components/PayconHeader/PayconHeader";
import { ParticleStage } from "./components/ParticleStage/ParticleStage";
import { Preloader } from "./components/Preloader/Preloader";
import { PageFooter } from "./components/PageFooter/PageFooter";
import { PayconHero } from "./sections/PayconHero/PayconHero";
import { AnalysisScene } from "./sections/AnalysisScene/AnalysisScene";
import { SolutionsScene } from "./sections/SolutionsScene/SolutionsScene";
import { ContactFormScene } from "./sections/ContactFormScene/ContactFormScene";
import { TechnologyScene } from "./sections/TechnologyScene/TechnologyScene";
import { PartnersScene } from "./sections/PartnersScene/PartnersScene";
import { TestimonialsScene } from "./sections/TestimonialsScene/TestimonialsScene";
import { MethodScene } from "./sections/MethodScene/MethodScene";
import { AboutScene } from "./sections/AboutScene/AboutScene";
import { FinalContactScene } from "./sections/FinalContactScene/FinalContactScene";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { ensureGsapRegistered, ScrollSmoother, ScrollTrigger } from "./lib/gsap";
import { scrollToInitialHash } from "./lib/navigation";

function App() {
  const reducedMotion = useReducedMotion();
  const smootherRef = useRef<ScrollSmoother | null>(null);

  useLayoutEffect(() => {
    if (reducedMotion) return;
    ensureGsapRegistered();

    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 0.75,
      effects: true,
      smoothTouch: 0,
    });

    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__payconSmoother = smootherRef.current;
    }

    // as cenas registram seus próprios triggers; um refresh após o mount
    // garante medidas corretas com fontes/imagens já aplicadas
    const id = window.setTimeout(() => {
      ScrollTrigger.refresh();
      // só depois das medidas é que faz sentido honrar um #hash da URL
      scrollToInitialHash();
    }, 80);

    return () => {
      window.clearTimeout(id);
      smootherRef.current?.kill();
      smootherRef.current = null;
    };
  }, [reducedMotion]);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Ir para o conteúdo principal
      </a>
      <Preloader />
      {/* palco persistente: fica FORA do smooth-content para não ser transladado */}
      <ParticleStage />
      <PayconHeader />

      <div id="smooth-wrapper">
        <div id="smooth-content">
          {/*
            Ordem das seções alinhada à do site oficial: hero → soluções →
            formulário → clientes → diferenciais → depoimentos → método →
            sobre → CTA final. Antes o formulário ficava no fim (junto do CTA)
            e Diferenciais vinha antes de Clientes — invertido em relação ao
            site.
          */}
          <main id="main-content">
            <PayconHero />
            <AnalysisScene />
            <SolutionsScene />
            <ContactFormScene />
            <PartnersScene />
            <TechnologyScene />
            <TestimonialsScene />
            <MethodScene />
            <AboutScene />
            <FinalContactScene />
          </main>
          <PageFooter />
        </div>
      </div>
    </>
  );
}

export default App;
