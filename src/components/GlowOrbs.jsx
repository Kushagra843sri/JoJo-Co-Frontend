// Decorative ambient background used on dark sections to break up flat
// black/purple with some depth — purely visual, so it's aria-hidden and
// never intercepts pointer events.
const GlowOrbs = ({ className = '' }) => (
  <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
    <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-brand/25 blur-[90px] animate-float-orb" />
    <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-fuchsia-600/20 blur-[100px] animate-float-orb-slow" />
  </div>
);

export default GlowOrbs;
