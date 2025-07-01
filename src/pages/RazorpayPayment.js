// RazorpayPayment.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const RazorpayPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, cartItems, totalAmount } = location.state || {};

  const loadRazorpay = async () => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      alert('Razorpay SDK failed to load.');
      return;
    }

    try {
      const result = await axios.post('http://localhost:5000/create-order', {
        amount: totalAmount * 100,
      });

      const { id: order_id } = result.data;

      const options = {
        key: 'rzp_test_EH1UEwLILEPXCj', // replace with your Razorpay key
        amount: totalAmount * 100,
        currency: 'INR',
        name: 'My E-Commerce App',
        description: 'Order Payment',
        order_id,
        handler: function (response) {
          navigate('/order-successful', {
            state: {
              user,
              cartItems,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
            },
          });
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },
        theme: {
          color: '#0d6efd',
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (err) {
      alert('Something went wrong in order creation');
    }
  };

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  return (
    <div className="text-center mt-5">
      <h2>Proceed to Payment</h2>
      <button className="btn btn-success mt-3" onClick={loadRazorpay}>
        Pay ₹{totalAmount}
      </button>
    </div>
  );
};

export default RazorpayPayment;
