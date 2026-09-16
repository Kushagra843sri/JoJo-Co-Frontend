import { useEffect, useRef, useState } from 'react';

// Fades/slides a section in the first time it scrolls into view. Disconnects
// after firing once — this is a one-shot entrance effect, not a repeating
// scroll animation.
export const useReveal = (options) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, ...options }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);

  return [ref, isVisible];
};
