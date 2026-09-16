const defaultItems = ['LIMITED DROPS', 'ALT GRUNGE', 'DELHI TO DYSTOPIA', 'CUSTOM & UPCYCLED', 'NO RESTOCKS'];

// Doubled so the -50% translateX loop is seamless (see .animate-marquee in
// index.css) — the second half is an exact copy of the first, so the snap
// back to 0% is invisible.
const MarqueeStrip = ({ items = defaultItems }) => {
  const doubled = [...items, ...items];

  return (
    <div className="w-full overflow-hidden border-y border-white/10 bg-surface py-4">
      <div className="flex w-max animate-marquee gap-12">
        {doubled.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="flex flex-none items-center gap-12 font-mono text-xs uppercase tracking-[0.3em] text-white/40"
          >
            {item}
            <span className="text-brand">&#9670;</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarqueeStrip;
