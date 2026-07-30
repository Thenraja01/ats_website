import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlowBorderProps {
  children: ReactNode;
  className?: string;
  color?: string;
  animate?: boolean;
}

export default function GlowBorder({ children, className = '', color = 'rgba(79, 140, 255, 0.3)', animate = false }: GlowBorderProps) {
  return (
    <div className={`relative group ${className}`}>
      {animate && (
        <motion.div
          className="absolute -inset-[1px] rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `conic-gradient(from 0deg, ${color}, transparent, ${color}, transparent, ${color})`,
            filter: 'blur(2px)',
            zIndex: -1,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      )}
      <div className={`relative ${animate ? 'bg-[#050816]' : ''}`}>
        {children}
      </div>
    </div>
  );
}
