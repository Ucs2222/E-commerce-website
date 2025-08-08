import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    axios
      .get('http://13.232.233.89/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .bg-gradient-custom {
        background: linear-gradient(135deg, #4f46e5, #8b5cf6, #ec4899);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
      }

      .glass-box {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        color: white;
      }

      .btn-logout {
        background-color: #ef4444;
        font-weight: bold;
        border: none;
      }

      .btn-logout:hover {
        background-color: #dc2626;
      }

      .profile-label {
        font-weight: bold;
        margin-bottom: 4px;
        color: #f1f1f1;
      }

      .profile-value {
        background-color: rgba(255, 255, 255, 0.15);
        padding: 10px 15px;
        border-radius: 8px;
        margin-bottom: 16px;
        color: #ffffff;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="bg-gradient-custom">
        <div className="glass-box p-5 w-100 text-center" style={{ maxWidth: '500px' }}>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-custom">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="glass-box p-5 w-100">
              <h2 className="text-center fw-bold mb-4">Your Profile</h2>

              <div>
                <div className="profile-label">Name</div>
                <div className="profile-value">{user.name}</div>
              </div>

              <div>
                <div className="profile-label">Email</div>
                <div className="profile-value">{user.email}</div>
              </div>

              <div>
                <div className="profile-label">Address</div>
                <div className="profile-value">{user.address || 'Not Provided'}</div>
              </div>

              <div className="d-grid mt-4">
                <button className="btn btn-logout text-white" onClick={logout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
