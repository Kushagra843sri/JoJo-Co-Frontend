// Native <select> elements only ever take styling on the closed control — the
// open option-list popup is drawn by the OS/browser and ignores Tailwind
// classes on the <select> itself, so a plain dark-themed select still opens
// to a stock white/system-styled list. `className` here supplies the box's
// own look (background, border, padding, text size) exactly like a styled
// <select> normally would; this wrapper only adds the appearance-none reset,
// room for the custom chevron, and per-<option> dark styling so the open
// list matches too (respected by Chrome/Firefox/Edge; Safari falls back to
// its native list styling regardless of markup).
const Select = ({ className = '', wrapperClassName = '', children, ...props }) => (
  <div className={`relative ${wrapperClassName}`}>
    <select {...props} className={`appearance-none pr-10 cursor-pointer ${className}`}>
      {children}
    </select>
    <svg
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 7.5l5 5 5-5" />
    </svg>
  </div>
);

export const SelectOption = (props) => <option {...props} className={`bg-ink text-white ${props.className || ''}`} />;

export default Select;
