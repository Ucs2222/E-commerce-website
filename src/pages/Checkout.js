import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems: stateCart, productId } = location.state || {};

  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [singleProduct, setSingleProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState({ name: '', address: '', phone: '' });

  // Styling
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
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Fetch user + address
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to checkout');
      return navigate('/login');
    }

    axios.get('http://localhost:5000/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        const userData = res.data;
        setUser(userData);
        setDetails(prev => ({
          ...prev,
          name: userData.name,
          phone: userData.phone || '',
        }));
        return axios.get(`http://localhost:5000/api/address/${userData.id}`);
      })
      .then(addrRes => {
        setAddresses(addrRes.data);
      })
      .catch(() => {
        alert('Failed to load profile or addresses.');
        navigate('/login');
      });
  }, [navigate]);

  // Load cart or single product
  useEffect(() => {
    if (productId) {
      axios.get(`http://localhost:5000/api/products/${productId}`)
        .then(res => setSingleProduct(res.data))
        .catch(() => alert('Product not found'));
    } else if (stateCart) {
      setCartItems(stateCart);
    } else if (user?.id) {
      axios.get(`http://localhost:5000/api/cart/${user.id}`)
        .then(res => setCartItems(res.data))
        .catch(() => alert('Failed to load cart'));
    }
    setLoading(false);
  }, [productId, stateCart, user]);

  const handleAddressChange = (e) => {
    const selected = addresses.find(a => a.id === parseInt(e.target.value));
    if (selected) {
      setSelectedAddress(selected.id);
      setDetails(prev => ({ ...prev, address: selected.address }));
    }
  };

  const totalPrice = productId
    ? (singleProduct?.price || 0) * quantity
    : cartItems.reduce((sum, i) => sum + i.price * i.cart_quantity, 0);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!paymentMethod) return alert('Select a payment method');
    if (!details.name || !details.address || !details.phone)
      return alert('Please fill all details and select a saved address');

    const userDetails = {
      name: details.name,
      address: details.address,
      phone: details.phone,
    };

    const baseState = productId && singleProduct
      ? {
          product: {
            id: singleProduct.id,
            name: singleProduct.name,
            price: singleProduct.price,
            image_url: singleProduct.image_url,
            quantity: quantity,
          },
          userDetails,
        }
      : {
          products: cartItems,
          userDetails,
        };

    const fullState = {
      ...baseState,
      totalAmount: totalPrice,
      productCount: productId ? 1 : cartItems.length,
    };

    if (paymentMethod === 'razorpay') {
      navigate('/razorpay-payment', { state: fullState });
    } else if (paymentMethod === 'googlepay') {
      navigate('/upi', { state: fullState });
    } else if (paymentMethod === 'cod') {
      navigate('/cod-detail', { state: fullState });
    }
  };

  if (loading) return <div className="text-white text-center mt-5">Loading...</div>;

  return (
    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-gradient-custom py-5">
      <div className="glass-box p-4" style={{ width: '100%', maxWidth: '900px' }}>
        <h2 className="mb-4">🧾 Checkout</h2>

        {/* Product/Cart Summary */}
        <div className="glass-box p-3 mb-4">
          {productId && singleProduct ? (
            <div className="d-flex">
              <img
                src={singleProduct.image_base64}
                alt={singleProduct.name}
                className="img-fluid rounded me-3"
                style={{ width: 120, height: 120, objectFit: 'cover' }}
              />
              <div>
                <h5>{singleProduct.name}</h5>
                <p>₹{singleProduct.price}</p>
                <div className="d-flex align-items-center">
                  <button
                    className="btn btn-outline-light btn-sm"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  >-</button>
                  <span className="px-3">{quantity}</span>
                  <button
                    className="btn btn-outline-light btn-sm"
                    onClick={() => setQuantity(q => q + 1)}
                  >+</button>
                </div>
              </div>
            </div>
          ) : (
            <table className="table text-white">
              <thead>
                <tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr>
              </thead>
              <tbody>
                {cartItems.map(i => (
                  <tr key={i.product_id}>
                    <td>{i.name}</td>
                    <td>₹{i.price}</td>
                    <td>{i.cart_quantity}</td>
                    <td>₹{i.price * i.cart_quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <h5 className="text-end mt-3">Total: ₹{totalPrice}</h5>
        </div>

        {/* Checkout Form */}
        <form onSubmit={handleSubmit}>
          {/* Delivery Info */}
          <div className="glass-box p-4 mb-4">
            <h4 className="mb-3">Delivery Details</h4>
            {addresses.length > 0 && (
              <div className="mb-3">
                <label className="form-label">Saved Address</label>
                <select
                  className="form-select"
                  onChange={handleAddressChange}
                  value={selectedAddress}
                  required
                >
                  <option value="">Choose an address</option>
                  {addresses.map(a => (
                    <option key={a.id} value={a.id}>{a.address}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={details.name}
                onChange={e => setDetails({ ...details, name: e.target.value })}
                required
              />
            </div>
            {details.address && (
              <div className="mb-3">
                <label className="form-label">Selected Address</label>
                <input type="text" className="form-control" value={details.address} readOnly />
              </div>
            )}
            <div className="mb-3">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                value={details.phone}
                onChange={e => setDetails({ ...details, phone: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Payment Selection */}
          <div className="glass-box p-4 mb-4">
            <h4 className="mb-3">Payment Method</h4>
            <select
              className="form-select"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              required
            >
              <option value="" disabled hidden>Select method</option>
              <option value="googlepay">Google Pay (UPI)</option>
              <option value="razorpay">Pay with Razorpay</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="d-grid">
            <button type="submit" className="btn btn-light fw-bold">
              {paymentMethod === 'razorpay'
                ? 'Pay with Razorpay'
                : paymentMethod === 'googlepay'
                ? 'Pay with Google Pay'
                : paymentMethod === 'cod'
                ? 'Place COD Order'
                : 'Select Payment First'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
