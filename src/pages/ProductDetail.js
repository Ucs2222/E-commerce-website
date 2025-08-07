import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/products/${id}`)
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load product details.');
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to add to cart.');
      navigate('/login');
      return;
    }

    try {
      const userRes = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user_id = userRes.data.id;

      await axios.post(
        'http://localhost:5000/api/cart/add',
        { user_id, product_id: product.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Product added to cart!');
    } catch (err) {
      console.error(err);
      alert('Failed to add to cart.');
    }
  };

  const handleWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to add to wishlist.');
      navigate('/login');
      return;
    }

    try {
      const profileRes = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userId = profileRes.data.id;

      await axios.post(
        'http://localhost:5000/api/wishlist/add',
        { user_id: userId, product_id: product.id },
        { headers: { 'Content-Type': 'application/json' } }
      );

      alert('Added to wishlist!');
    } catch (err) {
      console.error(err);
      alert('Failed to add to wishlist.');
    }
  };

  const handleBuynow = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to buy.');
      navigate('/login');
      return;
    }

    try {
      const userRes = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user_id = userRes.data.id;

      await axios.post(
        'http://localhost:5000/api/cart/add',
        { user_id, product_id: product.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate('/checkout', { state: { productId: product.id } });
    } catch (err) {
      alert('Failed to add to cart.');
      console.error(err);
    }
  };

  if (loading) return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-gradient-custom">
      <div className="glass-box p-4 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3 text-dark">Loading product details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-gradient-custom">
      <div className="glass-box p-4 text-center">
        <p className="text-danger">{error}</p>
        <button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>
          Back to Products
        </button>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-gradient-custom">
      <div className="glass-box p-4 text-center">
        <p className="text-dark">Product not found.</p>
        <button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>
          Back to Products
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-gradient-custom p-4">
      <div
        className="glass-box p-5 rounded-4 shadow-lg"
        style={{ maxWidth: 600, width: '100%', backgroundColor: 'white', color: '#222' }}
      >
        <h2 className="mb-4" style={{ color: '#222' }}>{product.name}</h2>

        <div className="text-center mb-4">
          <img
            src={product.image_base64}
            alt={product.name}
            className="img-fluid rounded"
            style={{ maxHeight: '300px', cursor: 'pointer' }}
          />
        </div>

        <ul className="list-group mb-4" style={{ color: '#222' }}>
          <li className="list-group-item border-0 px-0">
            <strong>Price:</strong> ₹{product.price}
          </li>
          <li className="list-group-item border-0 px-0">
            <strong>Quality:</strong> {product.quality}
          </li>
          <li className="list-group-item border-0 px-0">
            <strong>Rating:</strong> {product.rating}
          </li>
          <li className="list-group-item border-0 px-0">
            <strong>Description:</strong> {product.description}
          </li>
          <li className="list-group-item border-0 px-0">
            <strong>Category:</strong> {product.category}
          </li>
          <li className="list-group-item border-0 px-0">
            <strong>Quantity:</strong> {product.quantity}
          </li>
          <li className="list-group-item border-0 px-0">
            <strong>Delivery Option:</strong> {product.delivery_option}
          </li>
        </ul>

        <div className="d-flex flex-wrap gap-3 justify-content-center">
          <button className="btn btn-primary fw-bold px-4" onClick={handleAddToCart}>
            Add to Cart
          </button>
          <button className="btn btn-primary fw-bold px-4" onClick={handleWishlist}>
            Wish List
          </button>
          <button className="btn btn-primary fw-bold px-4" onClick={handleBuynow}>
            Buy Now
          </button>
        </div>

        <div className="text-center mt-4">
          <button className="btn btn-link text-primary" onClick={() => navigate(-1)}>
            &larr; Back to Products
          </button>
        </div>
      </div>

      <style>{`
        .bg-gradient-custom {
          background: linear-gradient(135deg, #4f46e5, #8b5cf6, #ec4899);
        }
        .glass-box {
          background: white !important;
          border-radius: 1rem;
          border: 1px solid #ddd;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
        ul.list-group > li {
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
