export default function Card({ children, className = '' }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-black/50 ${className}`}
    >
      {/* Subtle gradient glow effect */}
      <div className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100" />

      <div className="relative">{children}</div>
    </div>
  );
}