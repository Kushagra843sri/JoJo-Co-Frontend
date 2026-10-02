import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import Footer, { CONTACT_EMAIL, WHATSAPP_DISPLAY, WHATSAPP_URL } from '../../components/Footer.jsx';

// DRAFT COPY — written from what the storefront already states (payment
// methods, limited drops, contact details). Business terms the client has not
// supplied (return window, delivery times, shipping fees) are deliberately left
// out rather than invented; the client should review and extend each page.
const contactLine = (
  <>
    Email us at{' '}
    <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand hover:underline">
      {CONTACT_EMAIL}
    </a>{' '}
    or message us on WhatsApp at{' '}
    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
      {WHATSAPP_DISPLAY}
    </a>
    .
  </>
);

const policies = {
  'refund-return': {
    title: 'Refund / Return Policy',
    sections: [
      {
        heading: 'Limited pieces',
        body: 'Every JOJO&CO piece is made in limited quantities and we do not restock sold-out drops, so please check the size and shade you select before you pay.',
      },
      {
        heading: 'Wrong or damaged items',
        body: 'If your order arrives damaged or is not what you ordered, contact us with your order details and photos and we will make it right.',
      },
      {
        heading: 'How to request a return or refund',
        body: contactLine,
      },
    ],
  },
  'shipping-delivery': {
    title: 'Shipping & Delivery',
    sections: [
      {
        heading: 'Where we ship',
        body: 'We deliver across India. Delivery details are collected at checkout and confirmed on your order.',
      },
      {
        heading: 'Payment options',
        body: 'You can pay by UPI, Cash on Delivery (COD), or credit/debit card.',
      },
      {
        heading: 'Questions about a delivery',
        body: contactLine,
      },
    ],
  },
  faq: {
    title: 'FAQ’s',
    sections: [
      {
        heading: 'Which payment methods do you accept?',
        body: 'UPI, Cash on Delivery (COD), and credit/debit cards.',
      },
      {
        heading: 'Will sold-out pieces come back?',
        body: 'Our pieces are limited and are not restocked. Follow us on Instagram and join the cult for special drops for members only.',
      },
      {
        heading: 'Do you offer customisation or upcycling?',
        body: 'Yes — we provide customisation and upcycling services. Message us on Instagram or email us to talk it through.',
      },
      {
        heading: 'How do I track my order?',
        body: (
          <>
            Log in and open{' '}
            <Link to="/orders" className="text-brand hover:underline">
              your orders
            </Link>{' '}
            to see the current status of each one.
          </>
        ),
      },
      {
        heading: 'Still need help?',
        body: contactLine,
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      {
        heading: 'What we collect',
        body: 'When you create an account or place an order we collect the details needed to run it: your name, email address, delivery address, and order history.',
      },
      {
        heading: 'How we use it',
        body: 'We use your details only to create your account, process and deliver your orders, and contact you about them. Payments are handled by our payment provider; we do not store your card details.',
      },
      {
        heading: 'Your choices',
        body: contactLine,
      },
    ],
  },
};

const Policy = () => {
  const { slug } = useParams();
  const policy = policies[slug];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  return (
    <div className="w-full bg-ink min-h-screen">
      <div className="grain-overlay" />
      <Navbar />

      <div className="pt-20">
        <main className="px-4 sm:px-8 py-12 max-w-3xl mx-auto flex flex-col gap-8">
          {policy ? (
            <>
              <h1 className="font-serif text-3xl md:text-4xl text-brand">{policy.title}</h1>
              {policy.sections.map((section) => (
                <section key={section.heading} className="flex flex-col gap-2">
                  <h2 className="font-serif text-lg text-white/90">{section.heading}</h2>
                  <p className="text-sm text-white/60 leading-relaxed">{section.body}</p>
                </section>
              ))}
            </>
          ) : (
            <>
              <h1 className="font-serif text-3xl text-brand">Page not found</h1>
              <Link to="/" className="text-sm text-brand hover:underline">
                Back to home
              </Link>
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Policy;
