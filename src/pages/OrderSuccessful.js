import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OrderSuccessful = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    orderItems = [],
    deliveryDetails = {},
    paymentMethod = '',
    transactionId = '',
    totalAmount = 0,
  } = location.state || {};

  const handleDownload = () => {
    const content = document.getElementById('receipt-content')?.innerHTML;
    const blob = new Blob(
      [
        `
        <html>
        <head><title>Receipt</title></head>
        <body>${content}</body>
        </html>
      `,
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

  if (!orderItems.length) {
    return (
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-gradient-custom p-4">
        <h2 className="text-danger mb-4">No order details found</h2>
        <button onClick={() => navigate('/')} className="btn btn-success px-4 py-2">
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column align-items-center bg-gradient-custom p-4">
      <div
        id="receipt-content"
        className="glass-box p-5 rounded-4 shadow-lg text-white"
        style={{ maxWidth: 700, width: '100%' }}
      >
        <h1 className="text-center fw-bold mb-3">✅ Order Placed Successfully!</h1>
        <p className="text-center mb-4">Thank you for your purchase.</p>

        <div className="mb-4">
          <h4>Delivery Details</h4>
          <p><strong>Name:</strong> {deliveryDetails.name}</p>
          <p><strong>Address:</strong> {deliveryDetails.address}</p>
          <p><strong>Phone:</strong> {deliveryDetails.phone}</p>
        </div>

        <div className="mb-4">
          <h4>Order Items</h4>
          <table className="table table-bordered table-striped table-hover align-middle text-white bg-transparent">
            <thead className="table-light text-dark">
              <tr>
                <th className="text-center">Product ID</th>
                <th className="text-center">Quantity</th>
                <th className="text-center">Price (₹)</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item, i) => (
                <tr key={i}>
                  <td className="text-center">{item.product_id}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-center">₹{item.price}</td>
                </tr>
              ))}
              <tr className="fw-bold">
                <td colSpan="2" className="text-end">Total</td>
                <td className="text-center">₹{totalAmount}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h4>Payment Details</h4>
          <p><strong>Method:</strong> {paymentMethod}</p>
          <p><strong>Transaction ID:</strong> {transactionId}</p>
        </div>
      </div>

      <div className="mt-4 d-flex justify-content-center gap-3 flex-wrap">
        <button onClick={handleDownload} className="btn btn-success px-4 py-2">
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

export default OrderSuccessful;
