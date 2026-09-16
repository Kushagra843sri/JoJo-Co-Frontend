import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { updateQuantity, removeItem } from '../../store/slices/cartSlice.js';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';

const Cart = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;

  return (
    <div className="w-full bg-ink min-h-screen">
      <div className="grain-overlay" />
      <Navbar />

      <div className="pt-28 px-8 pb-16">
        <div className="flex items-center justify-between mb-12">
          <h1 className="font-serif text-3xl text-brand">Your Shopping Bag</h1>
          <Link
            to="/catalog"
            className="text-xs uppercase tracking-widest text-white/40 transition-colors duration-300 hover:text-brand"
          >
            Continue Shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <p className="text-center text-sm uppercase tracking-widest text-white/40 border border-white/10 py-16">
            Your shopping bag is empty
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left column — line items */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-white/10 pb-6">
                  <div className="h-24 w-24 flex-none overflow-hidden bg-white/5">
                    {item.image && (
                      <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                    )}
                  </div>

                  <div className="flex-1 flex flex-col gap-2">
                    <h3 className="font-serif text-base text-brand">{item.title}</h3>
                    <p className="text-xs text-white/40">
                      Size: {item.size}
                      <span className="mx-2">/</span>
                      Color: {item.color}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-4 rounded-full border border-white/15 px-4 py-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.quantity > 1) {
                              dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }));
                            }
                          }}
                          className="text-white/60 transition-colors duration-300 hover:text-brand"
                        >
                          −
                        </button>
                        <span className="text-sm text-white/70">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                          className="text-white/60 transition-colors duration-300 hover:text-brand"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        aria-label="Remove item"
                        onClick={() => dispatch(removeItem(item.id))}
                        className="h-8 w-8 flex items-center justify-center border border-white/15 text-white/30 transition-colors duration-300 hover:border-brand hover:text-brand"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right column — price breakdown + checkout CTA */}
            <div className="lg:col-span-4">
              <div className="border border-white/10 p-8 flex flex-col gap-6">
                <div className="flex flex-col gap-2 text-sm text-white/60">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Shipping</span>
                    <span className="text-brand">Complimentary</span>
                  </div>
                  <div className="flex items-center justify-between text-base font-semibold text-brand pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="block text-center w-full btn-glow text-white py-4 text-sm uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Proceed to Secure Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
