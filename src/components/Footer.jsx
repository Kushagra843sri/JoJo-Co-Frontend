import { Link } from 'react-router-dom';
import GlowOrbs from './GlowOrbs.jsx';

export const CONTACT_EMAIL = 'when.mojo.met.jojo@gmail.com';
export const WHATSAPP_DISPLAY = '+91 7838557228';
export const WHATSAPP_URL = 'https://wa.me/917838557228';
export const INSTAGRAM_URL = 'https://www.instagram.com/jojo.and.c0mpany/';

const policyLinks = [
  { label: 'Refund / Return Policy', to: '/policy/refund-return' },
  { label: 'Shipping & Delivery', to: '/policy/shipping-delivery' },
  { label: 'Order Tracking', to: '/orders' },
  { label: 'FAQ’s', to: '/policy/faq' },
  { label: 'Privacy Policy', to: '/policy/privacy' },
];

const linkClasses = 'text-sm text-white/60 transition-colors duration-300 hover:text-brand';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-ink text-white/60 border-t border-white/10 px-4 sm:px-8 py-16 overflow-hidden">
      <GlowOrbs />
      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="flex flex-col gap-4">
          <span className="font-serif text-xl tracking-[0.2em] uppercase text-gradient-brand">JOJO&amp;CO</span>
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-xs uppercase tracking-widest text-white/40">Contact</span>
          <a href={`mailto:${CONTACT_EMAIL}`} className={linkClasses}>
            Email: {CONTACT_EMAIL}
          </a>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={linkClasses}>
            WhatsApp: {WHATSAPP_DISPLAY}
          </a>
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-xs uppercase tracking-widest text-white/40">Follow Us</span>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={linkClasses}>
            Instagram
          </a>
        </div>
      </div>

      <nav
        aria-label="Policies and help"
        className="relative z-10 max-w-6xl mx-auto border-t border-white/10 mt-12 pt-8 flex flex-wrap gap-x-8 gap-y-3"
      >
        {policyLinks.map((link) => (
          <Link key={link.label} to={link.to} className={linkClasses}>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto border-t border-white/10 mt-8 pt-8">
        <span className="text-xs uppercase tracking-widest text-white/30">
          © {year} JOJO&amp;CO. All rights reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
