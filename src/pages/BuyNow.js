import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const BuyNow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/products/${id}`)
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Product not found');
        setLoading(false);
      });
  }, [id]);

  const handleBuyNow = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to buy.');
      navigate('/');
      return;
    }

    try {
      const userRes = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user_id = userRes.data.id;

      await axios.post('http://localhost:5000/api/cart/add', {
        user_id,
        product_id: product.id,
        quantity,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate('/cart');
    } catch (err) {
      alert('Failed to add to cart.');
      console.error(err);
    }
  };

  if (loading) return <div className="text-center text-white mt-5">Loading product details...</div>;
  if (error) return <div className="text-center text-danger mt-5">{error}</div>;

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <div className="row">
          <div className="col-md-5">
            <img src={product.image_base64} alt={product.name} className="img-fluid rounded" />
          </div>
          <div className="col-md-7">
            <h3>{product.name}</h3>
            <p className="mb-2"><strong>Price:</strong> ₹{product.price}</p>
            <p className="mb-2"><strong>Available Stock:</strong> {product.quantity}</p>
            <div className="mb-3">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                min={1}
                max={product.quantity}
                value={quantity}
                className="form-control w-50"
                onChange={(e) =>
                  setQuantity(Math.min(product.quantity, Math.max(1, parseInt(e.target.value) || 1)))
                }
              />
            </div>
            <div className="d-flex gap-3">
              <button className="btn btn-primary" onClick={handleBuyNow}>
                Place Order
              </button>
              <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyNow;
