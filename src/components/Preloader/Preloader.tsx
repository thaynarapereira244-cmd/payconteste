import { useEffect, useState } from "react";
import { PayconLogo } from "../PayconLogo/PayconLogo";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import styles from "./Preloader.module.css";

const SESSION_KEY = "paycon-preloader-seen";

export function Preloader() {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem(SESSION_KEY);
  });
  const [dissolving, setDissolving] = useState(false);

  useEffect(() => {
    if (!visible || reducedMotion) {
      if (typeof window !== "undefined") sessionStorage.setItem(SESSION_KEY, "1");
      return;
    }

    const dissolveTimer = setTimeout(() => setDissolving(true), 900);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem(SESSION_KEY, "1");
    }, 1450);

    return () => {
      clearTimeout(dissolveTimer);
      clearTimeout(hideTimer);
    };
  }, [visible, reducedMotion]);

  if (!visible || reducedMotion) return null;

  return (
    <div className={`${styles.overlay} ${dissolving ? styles.dissolving : ""}`} aria-hidden="true">
      <div className={styles.dots}>
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className={styles.dot} style={{ animationDelay: `${i * 0.045}s` }} />
        ))}
      </div>
      <PayconLogo height={26} className={styles.logo} />
    </div>
  );
}
