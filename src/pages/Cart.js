import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    // Add custom styles for gradient + glassmorphism
    const style = document.createElement('style');
    style.innerHTML = `
      .bg-gradient-custom {
        background: linear-gradient(135deg, #4f46e5, #8b5cf6, #ec4899);
      }
      .glass-box {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 16px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        color: white;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    if (!user?.id) {
      navigate('/');
      return;
    }

    axios
      .get(`http://localhost:5000/api/cart/${user.id}`)
      .then((res) => setCartItems(res.data))
      .catch(() => setCartItems([]));
  }, [navigate, user]);

  const removeItem = async (productId) => {
    try {
      await axios.delete('http://localhost:5000/api/cart/remove', {
        data: { user_id: user.id, product_id: productId },
      });
      setCartItems((prev) =>
        prev.filter((item) => item.product_id !== productId)
      );
      alert('Item removed from cart.');
    } catch (err) {
      console.error('Failed to remove item', err);
      alert('Error removing item.');
    }
  };

  const updateQuantity = async (productId, change) => {
    const item = cartItems.find((i) => i.product_id === productId);
    const newQuantity = item.cart_quantity + change;

    if (newQuantity < 1) return alert('Quantity cannot be less than 1');
    if (newQuantity > item.stock_quantity) return alert('Not enough stock');

    try {
      await axios.put('http://localhost:5000/api/cart/update', {
        user_id: user.id,
        product_id: productId,
        quantity: newQuantity,
      });

      setCartItems((prev) =>
        prev.map((i) =>
          i.product_id === productId
            ? { ...i, cart_quantity: newQuantity }
            : i
        )
      );
    } catch (err) {
      console.error('Failed to update quantity', err);
    }
  };

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.cart_quantity,
    0
  );

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column align-items-center bg-gradient-custom py-5">
      <div className="glass-box p-4" style={{ width: '100%', maxWidth: '1000px' }}>
        <h2 className="mb-4">🛒 Your Cart</h2>

        {cartItems.length === 0 ? (
          <div className="alert alert-light text-center">Your cart is empty.</div>
        ) : (
          <>
            <div className="row g-4">
              {cartItems.map((item) => (
                <div key={item.product_id} className="col-md-4">
                  <div className="card h-100 shadow-sm">
                    <img
                      src={item.image_base64}
                      alt={item.name}
                      className="card-img-top"
                      style={{
                        height: '200px',
                        objectFit: 'cover',
                        borderTopLeftRadius: '0.375rem',
                        borderTopRightRadius: '0.375rem',
                      }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{item.name}</h5>
                      <p className="mb-1"><strong>Price:</strong> ₹{item.price}</p>
                      <p className="mb-1"><strong>Quantity:</strong> {item.cart_quantity}</p>
                      <p className="mb-3">
                        <strong>Subtotal:</strong> ₹{item.price * item.cart_quantity}
                      </p>

                      <div className="btn-group mb-2" role="group">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => updateQuantity(item.product_id, -1)}
                        >
                          -
                        </button>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => updateQuantity(item.product_id, 1)}
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="btn btn-danger mt-auto"
                        onClick={() => removeItem(item.product_id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <h4>Total Price: ₹{totalPrice}</h4>
              <button
                className="btn btn-light fw-bold mt-3"
                onClick={() => navigate('/checkout', { state: { cartItems } })}
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}

        <div className="mt-4">
          <Link to="/home" className="btn btn-outline-light">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
