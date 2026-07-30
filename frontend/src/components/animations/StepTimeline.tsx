import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Step {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface StepTimelineProps {
  steps: Step[];
  className?: string;
}

export default function StepTimeline({ steps, className = '' }: StepTimelineProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const svg = svgRef.current;
    if (!section || !svg) return;

    const lineLength = svg.getBoundingClientRect().height;

    // Set up line dash
    gsap.set(svg.querySelector('path'), {
      strokeDasharray: lineLength,
      strokeDashoffset: lineLength,
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        pin: true,
        scrub: 1,
        anticipatePin: 1,
      },
    });

    // Draw line
    tl.to(svg.querySelector('path'), {
      strokeDashoffset: 0,
      duration: 1,
      ease: 'none',
    });

    // Animate each step as line reaches it
    stepsRef.current.forEach((stepEl, i) => {
      if (!stepEl) return;
      const stepTl = gsap.timeline();
      stepTl
        .fromTo(stepEl, { opacity: 0, x: i % 2 === 0 ? -40 : 40 }, { opacity: 1, x: 0, duration: 0.6, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' })
        .fromTo(stepEl.querySelector('.step-dot'), { scale: 0 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' }, 0);
      tl.add(stepTl, i * (1 / steps.length));
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [steps.length]);

  return (
    <div ref={sectionRef} className={`relative ${className}`}>
      <div className="flex flex-col items-center justify-center min-h-screen py-20">
        {/* SVG Line */}
        <svg ref={svgRef} className="absolute left-1/2 top-0 -translate-x-1/2 w-0.5 h-full" style={{ zIndex: 0 }}>
          <path d={`M 0 0 L 0 ${typeof window !== 'undefined' ? window.innerHeight : 800}`} stroke="rgba(79,140,255,0.3)" strokeWidth={2} fill="none" />
        </svg>

        {/* Steps */}
        <div className="relative z-10 w-full max-w-4xl space-y-32">
          {steps.map((step, i) => (
            <div
              key={i}
              ref={(el) => { stepsRef.current[i] = el; }}
              className={`flex items-center gap-8 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
            >
              <div className="flex-1">
                <div className="glass rounded-2xl p-6 border border-white/[0.06]">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="step-dot w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                      {i + 1}
                    </span>
                    <h3 className="text-xl font-bold text-white font-heading">{step.title}</h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
              <div className="flex-1 hidden md:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
