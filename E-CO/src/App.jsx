import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/headers/Header';
import Home from './pages/HomePage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/very-email.jsx';
import LoginPage from "./pages/auth/LoginPage.jsx";
import ForgotPasswordPage from './pages/auth/forgot-password';
import ResetPassword from './pages/auth/reset-password';
import CreateShop from './pages/shops/CreateShop';
import GlobalStyles from './GlobalStyles';

function App() {
  return (
    <>
      <GlobalStyles />
      <div className="app">
        <Header />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />

              {/* Auth routes */}
            <Route path="/sign-up" element={<RegisterPage />} />
            <Route path="/sign-in" element={<LoginPage />} />
            <Route path="/verify" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
           <Route path="/reset-password" element={<ResetPassword />} />

              {/* Shop routes */}
              <Route path="/create-shop" element={<CreateShop />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;