import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const OrderSuccess = () => {
  const [user, setUser] = useState(null);
  const [fetchedProducts, setFetchedProducts] = useState([]);
  const receiptRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();

  const orderItems = useMemo(() => location.state?.items || [], [location.state]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    axios
      .get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => navigate('/'));
  }, [navigate]);

  useEffect(() => {
    const fetchOrderSummary = async () => {
      try {
        const res = await axios.post('http://localhost:5000/api/order/summary', orderItems);
        setFetchedProducts(res.data);
      } catch (err) {
        console.error('Failed to fetch order summary:', err);
      }
    };

    if (orderItems.length > 0) {
      fetchOrderSummary();
    }
  }, [orderItems]);

  const totalPrice = fetchedProducts.reduce((acc, item) => acc + item.subtotal, 0);

  const downloadReceipt = () => {
    const content = receiptRef.current.innerHTML;
    const blob = new Blob(
      [
        `
        <html>
        <head><title>Receipt</title></head>
        <body>${content}</body>
        </html>
        `
      ],
      { type: 'text/html' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'order-receipt.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (orderItems.length === 0) {
    return (
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-gradient-custom p-4">
        <h2 className="text-danger mb-4">No order details found</h2>
        <button
          onClick={() => navigate('/')}
          className="btn btn-success px-4 py-2"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column align-items-center bg-gradient-custom p-4">
      <div
        className="glass-box p-5 rounded-4 shadow-lg text-white"
        style={{ maxWidth: '900px', width: '100%' }}
        ref={receiptRef}
      >
        <h1 className="text-center fw-bold mb-3">✅ Order Placed Successfully!</h1>
        <p className="text-center mb-4">Thank you for your purchase.</p>

        {user && (
          <div className="mb-4">
            <h4>Customer Details</h4>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            {user.address && <p><strong>Address:</strong> {user.address}</p>}
            {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
          </div>
        )}

        {fetchedProducts.length > 0 && (
          <div className="table-responsive">
            <table className="table table-bordered table-striped table-hover text-white align-middle">
              <thead className="table-light text-dark">
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {fetchedProducts.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>₹{item.price}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.subtotal}</td>
                  </tr>
                ))}
                <tr className="fw-bold">
                  <td colSpan="3" className="text-end">Total</td>
                  <td>₹{totalPrice}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 d-flex justify-content-center gap-3 flex-wrap">
        <button onClick={downloadReceipt} className="btn btn-success px-4 py-2">
          Download Receipt
        </button>
        <button onClick={() => window.print()} className="btn btn-outline-light px-4 py-2">
          Print
        </button>
        <button onClick={() => navigate('/home')} className="btn btn-primary px-4 py-2">
          Continue Shopping
        </button>
      </div>

      <style>{`
        .bg-gradient-custom {
          background: linear-gradient(135deg, #4f46e5, #8b5cf6, #ec4899);
        }
        .glass-box {
          background: rgba(255 255 255 / 0.12);
          backdrop-filter: blur(12px);
          border-radius: 1rem;
          border: 1px solid rgba(255 255 255 / 0.3);
          box-shadow:
            0 8px 24px rgb(79 70 229 / 0.4),
            0 0 40px rgb(139 92 246 / 0.2);
          color: #fff;
        }
        table.table-bordered > :not(caption) > * > * {
          border-color: rgba(255 255 255 / 0.25);
        }
        .table-striped > tbody > tr:nth-of-type(odd) {
          background-color: rgba(255 255 255 / 0.05);
        }
      `}</style>
    </div>
  );
};

export default OrderSuccess;
