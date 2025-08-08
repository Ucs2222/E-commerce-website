import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const UpiQr = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const qrRef = useRef(null);

  const product = location.state?.product || null;

  const cartProducts = useMemo(() => location.state?.products || [], [location.state]);
  const userDetails = useMemo(() => {
    return location.state?.userDetails || {
      name: location.state?.delivery_name || '',
      address: location.state?.delivery_address || '',
      phone: location.state?.delivery_phone || '',
    };
  }, [location.state]);
const generateQR = () => {
    const upiUrl = `upi://pay?pa=yourupi@bank&pn=Receiver%20Name&am=${amount}&cu=INR`;
    const qr = new window.QRious({ value: upiUrl, size: 250 });

    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qrRef.current.appendChild(qr.canvas);
    }
  };

  const [amount, setAmount] = useState('');
  const [upiUrl, setUpiUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Set UPI URL and amount
  useEffect(() => {
    if (product) {
      setAmount(product.price);
      setUpiUrl(`upi://pay?pa=yourupi@bank&pn=Receiver%20Name&am=${product.price}&cu=INR`);
    } else if (cartProducts.length > 0) {
      const total = cartProducts.reduce((acc, item) => acc + item.price * item.cart_quantity, 0);
      setAmount(total);
      setUpiUrl(`upi://pay?pa=yourupi@bank&pn=Receiver%20Name&am=${total}&cu=INR`);
    }
  }, [product, cartProducts]);

  // Automatically generate QR when upiUrl is ready
  useEffect(() => {
    if (upiUrl && qrRef.current) {
      qrRef.current.innerHTML = '';
      const qrImg = document.createElement('img');
      qrImg.src = `https://chart.googleapis.com/chart?cht=qr&chs=250x250&chl=${encodeURIComponent(upiUrl)}`;
      qrImg.alt = '';
      qrImg.className = 'img-fluid';
      qrRef.current.appendChild(qrImg);
    }
  }, [upiUrl]);

  const handleOrderSuccess = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Please login');

    if (!userDetails.name || !userDetails.address || !userDetails.phone) {
      alert('Missing delivery details.');
      return;
    }

    try {
      setLoading(true);

      const { data: user } = await axios.get('http://13.232.233.89/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = {
        user_id: user.id,
        payment_method: 'googlepay',
        transaction_id: 'upi1234',
        delivery_name: userDetails.name,
        delivery_address: userDetails.address,
        delivery_phone: userDetails.phone,
        items: [],
      };

      if (product) {
        payload.items.push({
          product_id: product.id,
          quantity: 1,
          price: product.price,
        });
      } else {
        payload.items = cartProducts.map((item) => ({
          product_id: item.product_id,
          quantity: item.cart_quantity,
          price: item.price,
        }));
      }

      await axios.post('http://13.232.233.89/api/order/place', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate('/order-successful', {
        state: {
          orderItems: payload.items,
          deliveryDetails: {
            name: payload.delivery_name,
            address: payload.delivery_address,
            phone: payload.delivery_phone,
          },
          paymentMethod: 'Google Pay',
          transactionId: payload.transaction_id,
          totalAmount: amount,
        },
      });
    } catch (err) {
      console.error('Order failed:', err);
      alert('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-gradient-custom p-4">
      <div className="glass-box p-5 rounded-4 shadow-lg text-center" style={{ maxWidth: 600, width: '100%' }}>
        <h2 className="text-white mb-4">UPI Payment via QR</h2>

        {/* Product or Cart Display */}
        <div className="mb-4 text-white text-start">
          {product ? (
            <div className="d-flex align-items-center mb-3">
              <img
                src={product.image_url}
                alt={product.name}
                className="rounded me-3"
                style={{ width: 80, height: 80, objectFit: 'cover' }}
              />
              <div>
                <h5 className="mb-1">{product.name}</h5>
                <p className="mb-0">₹{product.price}</p>
              </div>
            </div>
          ) : cartProducts.length > 0 ? (
            <>
              <h5>🛒 Cart Items:</h5>
              <ul className="list-unstyled">
                {cartProducts.map((item, index) => (
                  <li key={index} className="mb-2 border-bottom pb-2">
                    <strong>{item.name}</strong> — ₹{item.price} × {item.cart_quantity} = ₹
                    {item.price * item.cart_quantity}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>No products to show</p>
          )}
        </div>

        {/* Delivery Details */}
        <div className="text-white text-start mb-4">
          <h5>📦 Delivery To:</h5>
          <p><strong>Name:</strong> {userDetails.name}</p>
          <p><strong>Address:</strong> {userDetails.address}</p>
          <p><strong>Phone:</strong> {userDetails.phone}</p>
        </div>

        <p className="text-white fs-5">Pay ₹{amount} using UPI</p>

         <button className="btn btn-light w-100 mb-3" onClick={generateQR}>
          Generate QR Code
        </button>

        <div ref={qrRef} className="d-flex justify-content-center mb-4"></div>

        <button
          className="btn btn-success w-100"
          onClick={handleOrderSuccess}
          disabled={loading}
        >
          {loading ? 'Placing Order...' : 'Confirm Payment & Place Order'}
        </button>
      </div>

      <style>{`
        .bg-gradient-custom {
          background: linear-gradient(135deg, #4f46e5, #8b5cf6, #ec4899);
        }
        .glass-box {
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(12px);
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow:
            0 8px 24px rgb(79 70 229 / 0.4),
            0 0 40px rgb(139 92 246 / 0.2);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default UpiQr;
