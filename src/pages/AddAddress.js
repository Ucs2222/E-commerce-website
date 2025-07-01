import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AddAddress = () => {
  const [address, setAddress] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
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
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
      }
      .glass-box input {
        background-color: rgba(255,255,255,0.2);
        color: white;
        border: 1px solid rgba(255,255,255,0.3);
      }
      .glass-box input::placeholder {
        color: #ccc;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      alert('User not found in localStorage');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/users/${user.id}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, address1, address2 }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Addresses saved!');
        navigate('/home');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      console.error('Request failed', err);
      alert('Server error');
    }
  };

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center bg-gradient-custom">
      <div className="glass-box p-5 my-5 w-100" style={{ maxWidth: '500px' }}>
        <h2 className="text-center fw-bold mb-4">Add Your Addresses</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-white">Address 1</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Address 1"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label text-white">Address 2</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Address 2"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label text-white">Address 3</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Address 3"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              required
            />
          </div>
          <div className="d-grid">
            <button type="submit" className="btn btn-light fw-bold">
              Save All Addresses
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAddress;
