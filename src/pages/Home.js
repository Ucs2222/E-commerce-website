import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .bg-gradient-custom {
        background: linear-gradient(135deg, #4f46e5, #8b5cf6, #ec4899);
        min-height: 100vh;
        color: white;
      }
      .product-card {
        background: white;
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        color: #111;
        transition: transform 0.2s ease;
      }
      .product-card:hover {
        transform: translateY(-5px);
      }
      .product-card img {
        border-radius: 12px;
        height: 200px;
        object-fit: cover;
        width: 100%;
      }
      .form-control-sm,
      .form-select-sm {
        max-width: 260px;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/');

    const fetchUser = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get('http://localhost:5000/api/auth/profile', { headers });
        setUser(res.data);
        const cartRes = await axios.get(`http://localhost:5000/api/cart/count/${res.data.id}`);
        setCartCount(cartRes.data.count);
      } catch {
        navigate('/');
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then((res) => {
        const available = res.data.filter(p => p.quantity > 0);
        setProducts(available);
        setFilteredProducts(available);
        setCategories(['All', ...new Set(available.map(p => p.category))]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let updated = [...products];
    if (selectedCategory !== 'All') {
      updated = updated.filter(p => p.category === selectedCategory);
    }
    if (searchTerm.trim()) {
      updated = updated.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredProducts(updated);
  }, [searchTerm, selectedCategory, products]);

  const handleAddToCart = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get('http://localhost:5000/api/auth/profile', { headers });
      await axios.post('http://localhost:5000/api/cart/add', {
        user_id: res.data.id,
        product_id: productId,
        quantity: 1
      }, { headers });
      setCartCount(prev => prev + 1);
      alert('Added to cart!');
    } catch {
      alert('Failed to add to cart.');
    }
  };

  const handleWishlist = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get('http://localhost:5000/api/auth/profile', { headers });
      await axios.post('http://localhost:5000/api/wishlist/add', {
        user_id: res.data.id,
        product_id: productId
      }, { headers });
      alert('Added to wishlist!');
    } catch {
      alert('Error adding to wishlist.');
    }
  };

  const handleBuynow = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get('http://localhost:5000/api/auth/profile', { headers });
      await axios.post('http://localhost:5000/api/cart/add', {
        user_id: res.data.id,
        product_id: productId,
        quantity: 1
      }, { headers });
      navigate('/checkout', { state: { productId } });
    } catch {
      alert('Failed to proceed to checkout.');
    }
  };

  return (
    <div className="bg-gradient-custom py-4">
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Welcome, {user?.name || 'User'}</h2>
          <div>
            <Link to="/cart" className="btn btn-light me-2">🛒 Cart ({cartCount})</Link>
            <Link to="/wishlist" className="btn btn-light me-2">❤️ Wishlist</Link>
            <Link to="/profile" className="btn btn-light me-2">👤 Profile</Link>
            <Link to="/order" className="btn btn-light">📦 Orders</Link>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="row g-2 mb-4">
          <div className="col-auto">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-auto">
            <select
              className="form-select form-select-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <p>Loading products...</p>
        ) : filteredProducts.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="row g-4">
            {filteredProducts.map((p) => (
              <div className="col-md-4 col-lg-3" key={p.id}>
                <div className="product-card h-100">
                  <Link to={`/product/${p.id}`}>
  <img
    src={p.image_url}
    alt={p.name}
    className="img-fluid mb-3"
    style={{ cursor: 'pointer' }}
  />
</Link>

                  <h5>{p.name}</h5>
                  <p className="mb-1">₹{p.price}</p>
                  <p className="mb-1">{p.description}</p>
                  <p className="mb-1">Category: {p.category}</p>
                  <p className="mb-1">In stock: {p.quantity}</p>
                  <div className="d-grid gap-2 mt-3">
                    <button className="btn btn-danger" onClick={() => handleAddToCart(p.id)}>Add to Cart</button>
                    <button className="btn btn-danger" onClick={() => handleWishlist(p.id)}>Wishlist</button>
                    <button className="btn btn-danger" onClick={() => handleBuynow(p.id)}>Buy Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
