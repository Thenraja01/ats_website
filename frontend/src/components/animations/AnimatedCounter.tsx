import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export default function AnimatedCounter({ from = 0, to, duration = 2, className = '', prefix = '', suffix = '' }: AnimatedCounterProps) {
  const [count, setCount] = useState(from);
  const frameRef = useRef<number>();
  const startRef = useRef<number>();

  useEffect(() => {
    startRef.current = undefined;
    const animate = (time: number) => {
      if (startRef.current === undefined) startRef.current = time;
      const elapsed = (time - startRef.current) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(from + (to - from) * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [from, to, duration]);

  return <span className={className}>{prefix}{count}{suffix}</span>;
}
