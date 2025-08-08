import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const RazorpayPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    product,
    products,
    userDetails,
    totalAmount,
  } = location.state || {};

  useEffect(() => {
    if (!userDetails || (!product && !products)) {
      alert('Missing payment details. Redirecting to checkout.');
      navigate('/checkout');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const loadRazorpay = async () => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      alert('Razorpay SDK failed to load.');
      return;
    }

    try {
      const result = await axios.post('http://13.232.233.89/create-order', {
        amount: totalAmount * 100,
      });

      const { id: order_id } = result.data;

      const rzp = new window.Razorpay({
        key: 'rzp_test_EH1UEwLILEPXCj',
        amount: totalAmount * 100,
        currency: 'INR',
        name: 'My E-Commerce App',
        description: 'Order Payment',
        order_id,
        handler: async function (response) {
          const token = localStorage.getItem('token');

          const orderItems = product
            ? [{
                product_id: product.id,
                quantity: product.quantity,
                price: product.price * product.quantity,
              }]
            : products.map((p) => ({
                product_id: p.product_id,
                quantity: p.cart_quantity,
                price: p.price * p.cart_quantity,
              }));

          try {
            const { data: user } = await axios.get('http://13.232.233.89/api/auth/profile', {
              headers: { Authorization: `Bearer ${token}` },
            });

            await axios.post(
              'http://13.232.233.89/api/order/place',
              {
                user_id: user.id,
                payment_method: 'razorpay',
                transaction_id: response.razorpay_payment_id,
                delivery_name: userDetails.name,
                delivery_address: userDetails.address,
                delivery_phone: userDetails.phone,
                items: orderItems,
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            navigate('/order-successful', {
              state: {
                orderItems,
                deliveryDetails: userDetails,
                paymentMethod: 'Razorpay',
                transactionId: response.razorpay_payment_id,
                totalAmount,
              },
            });
          } catch (error) {
            console.error('Order save failed:', error);
            alert('Payment succeeded but failed to save order.');
          }
        },
        prefill: {
          name: userDetails?.name,
          contact: userDetails?.phone,
        },
        theme: { color: '#0d6efd' },
      });

      rzp.open();
    } catch (err) {
      console.error('Razorpay error:', err);
      alert('Something went wrong during Razorpay setup');
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
        className="card text-white shadow-lg p-4"
        style={{
          maxWidth: '500px',
          width: '100%',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '1rem',
        }}
      >
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Razorpay Payment</h2>

          <div className="mb-4">
            <h5>Customer Details</h5>
            <p><strong>Name:</strong> {userDetails?.name}</p>
            <p><strong>Address:</strong> {userDetails?.address}</p>
            <p><strong>Phone:</strong> {userDetails?.phone}</p>
          </div>

          <div className="mb-4">
            <h5>Amount to Pay</h5>
            <p className="mb-4">₹{totalAmount}</p>
          </div>

          <div className="text-center">
            <button className="btn btn-light fw-bold w-100" onClick={loadRazorpay}>
              Pay ₹{totalAmount} with Razorpay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RazorpayPayment;
