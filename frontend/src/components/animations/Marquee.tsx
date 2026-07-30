import { useRef, useEffect, useState } from 'react';

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: 'left' | 'right';
}

export default function Marquee({ children, className = '', speed = 30, direction = 'left' }: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [duplicated, setDuplicated] = useState(false);

  useEffect(() => {
    setDuplicated(true);
  }, []);

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <div
        className="flex gap-8"
        style={{
          animation: `marquee-${direction} ${speed}s linear infinite`,
          width: duplicated ? 'fit-content' : undefined,
        }}
      >
        {children}
        {duplicated && children}
      </div>
      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
