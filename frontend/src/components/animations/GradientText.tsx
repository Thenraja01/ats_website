interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string;
}

export default function GradientText({ children, className = '', colors = 'from-primary to-accent' }: GradientTextProps) {
  return (
    <span className={`bg-gradient-to-r ${colors} bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
}
