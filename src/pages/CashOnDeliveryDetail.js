import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const CashOnDeliveryDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Memoize data from checkout
  const products = useMemo(() => state?.items || [], [state]);
  const userDetails = useMemo(() => {
    return state?.userDetails || {
      name: state?.delivery_name || '',
      address: state?.delivery_address || '',
      phone: state?.delivery_phone || '',
    };
  }, [state]);

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Inject custom styles for background + glass effect
  useEffect(() => {
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
      .glass-box h2, .glass-box h5, .glass-box p {
        color: white;
      }
      .glass-box .btn {
        font-weight: bold;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    if (!userDetails.name || !userDetails.address || !userDetails.phone || products.length === 0) {
      alert('Missing delivery or product information. Please checkout again.');
      navigate('/checkout');
    }
  }, [userDetails, products, navigate]);

  const submitOrder = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first.');
      return navigate('/login');
    }

    try {
      setLoading(true);

      const { data: user } = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = {
        user_id: user.id,
        payment_method: 'cash',
        transaction_id: '',
        delivery_name: userDetails.name,
        delivery_address: userDetails.address,
        delivery_phone: userDetails.phone,
        items: products.map(p => ({
          product_id: p.product_id || p.id,
          quantity: p.quantity || p.cart_quantity,
          price: p.price,
        })),
      };

      const { data: orderRes } = await axios.post('http://localhost:5000/api/order/place', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStatus(`✅ Order placed! Order ID: ${orderRes.order_id}`);
      navigate('/order-success', { state: { items: products } });
    } catch (err) {
      console.error(err);
      setStatus('❌ Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-gradient-custom py-5">
      <div className="glass-box p-5" style={{ width: '100%', maxWidth: '800px' }}>
        <h2 className="mb-4 text-center">💸 Cash on Delivery</h2>

        {/* Product Summary */}
        <div className="mb-4">
          <h5>🛍️ Products:</h5>
          {products.length > 0 ? (
            products.map((item, index) => (
              <p key={index}>
                <strong>{item.name}</strong> — ₹{item.price} × {item.quantity || item.cart_quantity} = ₹
                {item.price * (item.quantity || item.cart_quantity)}
              </p>
            ))
          ) : (
            <p>No products found.</p>
          )}
        </div>

        {/* Delivery Details */}
        <div className="mb-4">
          <h5>📦 Delivery Details:</h5>
          <p><strong>Name:</strong> {userDetails.name}</p>
          <p><strong>Address:</strong> {userDetails.address}</p>
          <p><strong>Phone:</strong> {userDetails.phone}</p>
        </div>

        {/* Confirm Order */}
        <button
          className={`btn btn-light w-100 ${loading ? 'disabled' : ''}`}
          onClick={submitOrder}
          disabled={loading}
        >
          {loading ? 'Placing Order...' : '✅ Confirm Order'}
        </button>

        {status && <div className="alert alert-light mt-4 text-center fw-bold">{status}</div>}
      </div>
    </div>
  );
};

export default CashOnDeliveryDetail;
