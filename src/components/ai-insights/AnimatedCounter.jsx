import { useState, useEffect, useRef } from 'react';

export default function AnimatedCounter({ value, prefix = '₹', suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (value == null || isNaN(value)) return;
    const start = display;
    const end = Number(value);
    const duration = 1500;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (end - start) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString('en-IN');

  return <span>{prefix}{formatted}{suffix}</span>;
}