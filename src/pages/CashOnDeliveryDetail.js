import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const CashOnDeliveryDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const product = state?.product;
  const products = state?.products;
  const userDetails = state?.userDetails || { name: '', address: '', phone: '' };

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const submitOrder = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first.');
      navigate('/login');
      return;
    }

    if (!product && (!products || products.length === 0)) {
      setStatus('❌ No product or cart items to place an order.');
      return;
    }

    try {
      setLoading(true);

      const { data: user } = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const orderItems = product
        ? [{ product_id: product.id, quantity: 1, price: product.price }]
        : products.map((p) => ({
            product_id: p.product_id,
            quantity: p.cart_quantity,
            price: p.price,
          }));

      const totalAmount = product
        ? product.price
        : products.reduce((sum, item) => sum + item.price * item.cart_quantity, 0);

      const transactionId = `COD-${Date.now()}`;

      const payload = {
        user_id: user.id,
        payment_method: 'cash',
        transaction_id: '',
        delivery_name: userDetails.name,
        delivery_address: userDetails.address,
        delivery_phone: userDetails.phone,
        items: orderItems,
      };

      const { data: orderRes } = await axios.post('http://localhost:5000/api/order/place', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStatus(`✅ Order placed! Order ID: ${orderRes.order_id}`);
      setLoading(false);

      navigate('/order-successful', {
        state: {
          orderItems,
          deliveryDetails: userDetails,
          paymentMethod: 'Cash on Delivery',
          transactionId,
          totalAmount,
        },
      });
    } catch (err) {
      console.error(err);
      setStatus('❌ Failed to place order.');
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex justify-content-center align-items-center"
      style={{
        background: 'linear-gradient(135deg, #4f46e5, #8b5cf6, #ec4899)',
        padding: '2rem',
      }}
    >
      <div
        className="card text-white shadow-lg"
        style={{
          maxWidth: '600px',
          width: '100%',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '1rem',
        }}
      >
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Cash on Delivery</h2>

          {(product || (products && products.length > 0)) && (
            <div className="mb-4">
              <h5>Products:</h5>
              {product && (
                <p>
                  <strong>{product.name}</strong> – ₹{product.price}
                </p>
              )}
              {products?.map((item) => (
                <p key={item.product_id}>
                  <strong>{item.name}</strong> – ₹{item.price} × {item.cart_quantity} = ₹
                  {item.price * item.cart_quantity}
                </p>
              ))}
            </div>
          )}

          <div className="mb-4">
            <h5>Delivery Details:</h5>
            <p><strong>Name:</strong> {userDetails.name}</p>
            <p><strong>Address:</strong> {userDetails.address}</p>
            <p><strong>Phone:</strong> {userDetails.phone}</p>
          </div>

          <div className="text-center">
            <button
              className="btn btn-light fw-bold px-4"
              onClick={submitOrder}
              disabled={loading}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>

          {status && (
            <div className="mt-4 text-center">
              <p className="fw-semibold">{status}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashOnDeliveryDetail;
