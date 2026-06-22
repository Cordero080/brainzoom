import { useEffect, useState } from "react";

/**
 * useScrollProgress
 * Returns a normalized 0..1 progress representing how far the user has scrolled
 * through the document. Designed for sticky 3D canvases with scroll-driven scenes.
 */
export default function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        (document.documentElement.scrollHeight || 0) - window.innerHeight;
      const next = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;
      setProgress((prev) => (Math.abs(prev - next) > 0.0005 ? next : prev));
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return progress;
}
