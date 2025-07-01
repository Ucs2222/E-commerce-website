import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  useEffect(() => {
    // Add custom styles dynamically
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
      .glass-box input {
        background-color: rgba(255,255,255,0.2);
        color: white;
        border: 1px solid rgba(255,255,255,0.3);
      }
      .glass-box input::placeholder {
        color: #ddd;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      const user = res.data.user;

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(user));

      alert('Login successful');

      if (!user.address || user.address.trim() === '') {
        navigate('/add-address');
      } else {
        navigate('/home');
      }
    } catch (err) {
      alert('Login failed. Check your credentials.');
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-gradient-custom">
      <div className="glass-box p-5" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center fw-bold mb-2">Login</h2>
        <p className="text-center mb-4" style={{ color: '#ddd' }}>
          Enter your credentials to continue
        </p>

        <form onSubmit={submit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label text-white">
              Email address
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label text-white">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="d-grid">
            <button type="submit" className="btn btn-light fw-bold">
              Login
            </button>
          </div>
        </form>

        <p className="text-center mt-4" style={{ color: '#ddd' }}>
          Don’t have an account?{' '}
          <Link to="/register" style={{ color: '#e0d2ff', fontWeight: 500 }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
