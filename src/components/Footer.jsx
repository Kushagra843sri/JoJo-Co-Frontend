import GlowOrbs from './GlowOrbs.jsx';

// TODO: replace the remaining placeholders below with JOJO&CO's real
// details — these are not fetched from anywhere, so shipping this file
// unedited puts fake contact info / dead social links in front of real customers.
const CONTACT_EMAIL = 'hello@jojoandc0mpany.com';
const CONTACT_PHONE = '+91 00000 00000';

const socialLinks = [
  { label: 'Instagram · @jojo.and.c0mpany', href: 'https://www.instagram.com/jojo.and.c0mpany/' },
  { label: 'Facebook', href: 'https://facebook.com/jojoandcompany' },
  { label: 'Pinterest', href: 'https://pinterest.com/jojoandcompany' },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-ink text-white/60 border-t border-white/10 px-8 py-16 overflow-hidden">
      <GlowOrbs />
      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="flex flex-col gap-4">
          <span className="font-serif text-xl tracking-[0.2em] uppercase text-gradient-brand">JOJO&amp;CO</span>
          <p className="text-sm text-white/50 leading-relaxed max-w-xs">
            From Delhi lanes to dystopia — desi vibes fused with alt grunge, limited drops, no compromise on quality.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-xs uppercase tracking-widest text-white/40">Contact</span>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-sm text-white/60 transition-colors duration-300 hover:text-brand"
          >
            {CONTACT_EMAIL}
          </a>
          <a
            href={`tel:${CONTACT_PHONE.replace(/\s+/g, '')}`}
            className="text-sm text-white/60 transition-colors duration-300 hover:text-brand"
          >
            {CONTACT_PHONE}
          </a>
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-xs uppercase tracking-widest text-white/40">Follow Us</span>
          <div className="flex flex-col gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/60 transition-colors duration-300 hover:text-brand"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto border-t border-white/10 mt-12 pt-8">
        <span className="text-xs uppercase tracking-widest text-white/30">
          © {year} JOJO&amp;CO. All rights reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
