import { useEffect, useRef } from "react";
import { registerParallax, registerTilt } from "../lib/stageState";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Parallax de cursor para um elemento de interface (camada 4).
 * Não cria rAF próprio: registra-se no loop único do ParticleStage.
 */
export function useParallax<T extends HTMLElement>(amount = 6, damping = 0.05) {
  const ref = useRef<T | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !ref.current) return;
    return registerParallax(ref.current, amount, damping);
  }, [amount, damping, reducedMotion]);

  return ref;
}

/**
 * Inclinação 3D por cursor. Expõe `--tilt-y` / `--tilt-x` no elemento, para o
 * CSS combinar com outros transforms sem conflito.
 */
export function useTilt<T extends HTMLElement>(maxDeg = 5, damping = 0.055) {
  const ref = useRef<T | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !ref.current) return;
    return registerTilt(ref.current, maxDeg, damping);
  }, [maxDeg, damping, reducedMotion]);

  return ref;
}
