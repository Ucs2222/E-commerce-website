import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import AddAddress from './pages/AddAddress';
import ProductDetail from './pages/ProductDetail';
import BuyNow from './pages/BuyNow';
import CashOnDeliveryDetail from './pages/CashOnDeliveryDetail';
import Order from './pages/Order';
import UpiQr from './pages/UpiQr';  
import OrderSuccess from './pages/OrderSuccess'; 
import './index.css';
import OrderSuccessful from './pages/OrderSuccessful';
import RazorpayPayment from './pages/RazorpayPayment';

// <-- Import here

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/order" element={<Order />} />
        <Route path="/order-success" element={<OrderSuccess />} />
         <Route path="/order-successful" element={<OrderSuccessful />} />
        <Route path="/cod-detail" element={<CashOnDeliveryDetail />} />
        <Route path="/buynow" element={<BuyNow />} />
        <Route path="/register" element={<Register />} />
        <Route path="/add-address" element={<AddAddress />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/razorpay-payment" element={<RazorpayPayment />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/upi" element={<UpiQr />} />  {/* <-- New Route */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
