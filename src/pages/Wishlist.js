import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user?.id) {
      navigate('/login');
      return;
    }

    axios
      .get(`http://localhost:5000/api/wishlist/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setWishlistItems(res.data);
      })
      .catch(() => setWishlistItems([]));
  }, [navigate, user]);

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/api/wishlist/remove`, {
        data: { user_id: user.id, product_id: productId },
      });
      setWishlistItems((prev) =>
        prev.filter((item) => item.product_id !== productId)
      );
      alert('Removed from wishlist');
    } catch (err) {
      console.error('Failed to remove item', err);
      alert('Error removing item');
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-gradient-custom p-4">
      <div className="glass-box p-4 rounded-4 shadow-lg text-white" style={{ maxWidth: 900, width: '100%' }}>
        <h2 className="text-center mb-4">Your Wishlist</h2>

        {wishlistItems.length === 0 ? (
          <p className="text-center">Your wishlist is empty.</p>
        ) : (
          <div className="row g-4">
            {wishlistItems.map((item) => (
              <div key={item.product_id} className="col-md-6 col-lg-4">
                <div className="card h-100 text-dark shadow-sm">
                  <img
                    src={item.image_url}
                    className="card-img-top"
                    alt={item.name}
                    style={{ objectFit: 'cover', height: '200px' }}
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{item.name}</h5>
                    <p className="card-text mb-1"><strong>Price:</strong> ₹{item.price}</p>
                    <p className="card-text mb-1"><strong>Quality:</strong> {item.quality}</p>
                    <p className="card-text mb-1"><strong>Quantity:</strong> {item.quantity}</p>
                    <p className="card-text mb-2" style={{ flexGrow: 1 }}>{item.description}</p>
                    <p className="card-text mb-3"><small className="text-muted">{item.delivery_option}</small></p>
                    <button
                      onClick={() => removeFromWishlist(item.product_id)}
                      className="btn btn-danger mt-auto"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 text-center">
          <Link to="/home" className="btn btn-outline-light">
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Styles for gradient background + glass effect */}
      <style>{`
        .bg-gradient-custom {
          background: linear-gradient(135deg, #4f46e5, #8b5cf6, #ec4899);
        }
        .glass-box {
          background: rgba(255 255 255 / 0.12);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255 255 255 / 0.3);
        }
      `}</style>
    </div>
  );
};

export default Wishlist;
