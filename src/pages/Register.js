import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .bg-gradient-custom {
        background: linear-gradient(135deg, #4f46e5, #8b5cf6, #ec4899);
        min-height: 100vh;
      }
      .glass-box {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 16px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        color: white;
      }
      .glass-box input {
        background-color: rgba(255,255,255,0.2);
        color: white;
        border: 1px solid rgba(255,255,255,0.3);
      }
      .glass-box input::placeholder {
        color: #ddd;
      }
      .toast-message {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 9999;
        font-weight: bold;
        animation: fadein 0.5s, fadeout 0.5s 2.5s;
        color: white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      }
      .toast-success {
        background-color: #28a745;
      }
      .toast-error {
        background-color: #dc3545;
      }
      @keyframes fadein {
        from { opacity: 0; right: 0px; }
        to { opacity: 1; right: 20px; }
      }
      @keyframes fadeout {
        from { opacity: 1; right: 20px; }
        to { opacity: 0; right: 0px; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const showToast = (message, color) => {
    setToastMessage(message);
    setToastColor(color);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', form);
      showToast('✅ Registration successful! Please login.', 'success');

      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      showToast('❌ Registration failed. Please try again.', 'error');
    }
  };

  return (
    <>
      {toastMessage && (
        <div className={`toast-message ${toastColor === 'success' ? 'toast-success' : 'toast-error'}`}>
          {toastMessage}
        </div>
      )}

      <div className="container-fluid d-flex align-items-center justify-content-center bg-gradient-custom">
        <div className="glass-box p-5 my-5 w-100" style={{ maxWidth: '400px' }}>
          <h2 className="text-center fw-bold mb-3">Create an Account</h2>
          <p className="text-center mb-4" style={{ color: '#ddd' }}>
            Register to continue shopping
          </p>

          <form onSubmit={submit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label text-white">Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label text-white">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label text-white">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div className="d-grid">
              <button type="submit" className="btn btn-light fw-bold">Register</button>
            </div>
          </form>

          <p className="text-center mt-4" style={{ color: '#ddd' }}>
            Already have an account?{' '}
            <Link to="/" style={{ color: '#e0d2ff', fontWeight: 500 }}>
              Login here
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
