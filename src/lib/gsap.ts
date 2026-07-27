import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

let registered = false;

export function ensureGsapRegistered() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, useGSAP);
  registered = true;
}

export { gsap, ScrollTrigger, ScrollSmoother, SplitText, useGSAP };
