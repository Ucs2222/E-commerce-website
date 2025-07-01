import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Order = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) return;

    (async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/order/orders/${user.id}`);
        setOrders(res.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
    })();
  }, []);

  const formatPrice = (value) => {
    const num = Number(value);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column align-items-center py-5 bg-gradient-custom text-white"
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      <div className="container" style={{ maxWidth: '900px' }}>
        <h1 className="text-center fw-bold mb-5">Your Orders</h1>

        {orders.length === 0 ? (
          <p className="text-center fs-5">No orders found.</p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="mb-5 p-4 rounded-4 shadow-lg glass-card"
            >
              <h5 className="border-bottom border-white border-opacity-25 pb-3 mb-4">
                Order ID #{order.id}
              </h5>

              <p className="mb-2">
                <strong>Payment:</strong> {order.payment_method} - {order.payment_status}
              </p>
              <p className="mb-2">
                <strong>Date:</strong> {new Date(order.created_at).toLocaleString()}
              </p>
              <p className="mb-4">
                <strong>Address:</strong> {order.delivery_name}, {order.delivery_address}
              </p>

              <h6 className="mb-3">Items</h6>
              <div className="table-responsive">
                <table className="table table-sm table-bordered table-striped align-middle">
                  <thead className="table-light text-dark">
                    <tr>
                      <th>Product</th>
                      <th className="text-end">Qty</th>
                      <th className="text-end">Price</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => {
                      const price = Number(item.price);
                      const quantity = Number(item.quantity);
                      const total = price * quantity;
                      return (
                        <tr key={item.product_id}>
                          <td>{item.product_name}</td>
                          <td className="text-end">{quantity}</td>
                          <td className="text-end">₹{formatPrice(price)}</td>
                          <td className="text-end">₹{formatPrice(total)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .bg-gradient-custom {
          background: linear-gradient(135deg, #4f46e5, #8b5cf6, #ec4899);
        }
        .glass-card {
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

export default Order;
