import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/headers/Header';
import Home from './pages/HomePage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/very-email.jsx';
import LoginPage from "./pages/auth/LoginPage.jsx";
import ForgotPasswordPage from './pages/auth/forgot-password';
import ResetPassword from './pages/auth/reset-password';
import CreateShop from './pages/shops/CreateShop';
import MyShop from './pages/shops/MyShop';
import GlobalStyles from './GlobalStyles';
import ListShop from "./pages/shops/ListShop.jsx";
import ShopDetailPage from "./pages/shops/DetailsShops.jsx";

// Composant Layout qui décide si le header doit être affiché
const Layout = ({ children }) => {
  const location = useLocation();
  
  // Liste des chemins où le header ne doit pas être affiché
  const noHeaderPaths = [
    '/sign-in',
    '/sign-up',
    '/verify',
    '/forgot-password',
    '/reset-password',
    '/create-shop',
    '/my-shops',
    '/list-shops'
  ];
  
  // Patterns pour les chemins dynamiques où le header ne doit pas être affiché
  const noHeaderPatterns = [
    /^\/my-shops\/[^/]+$/,
    /^\/seller\/shops\/[^/]+$/
  ];
  
  // Vérifier si le chemin actuel est dans la liste des chemins sans header
  // ou s'il correspond à l'un des patterns
  const shouldShowHeader = !noHeaderPaths.some(path => 
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  ) && !noHeaderPatterns.some(pattern => pattern.test(location.pathname));
  
  return (
    <div className="app">
      {shouldShowHeader && <Header />}
      <main className={shouldShowHeader ? "container" : "container-fluid p-0"}>
        {children}
      </main>
    </div>
  );
};

// Composant App qui utilise le Layout
function App() {
  return (
    <>
      <GlobalStyles />
      <Routes>
        <Route path="/" element={
          <Layout>
            <Home />
          </Layout>
        } />
        
        {/* Auth routes */}
        <Route path="/sign-up" element={
          <Layout>
            <RegisterPage />
          </Layout>
        } />
        <Route path="/sign-in" element={
          <Layout>
            <LoginPage />
          </Layout>
        } />
        <Route path="/verify" element={
          <Layout>
            <VerifyEmailPage />
          </Layout>
        } />
        <Route path="/forgot-password" element={
          <Layout>
            <ForgotPasswordPage />
          </Layout>
        } />
        <Route path="/reset-password" element={
          <Layout>
            <ResetPassword />
          </Layout>
        } />
        
        {/* Shop routes */}
        <Route path="/create-shop" element={
          <Layout>
            <CreateShop />
          </Layout>
        } />
        <Route path="/my-shops" element={
          <Layout>
            <ListShop />
          </Layout>
        } />
        <Route path="/seller/shops/:shopId" element={
          <Layout>
            <MyShop />
          </Layout>
        } />
        {/* Nouvelle route pour afficher une boutique par son slug */}
        <Route path="/shops/:slug" element={
          <Layout>
            <ShopDetailPage/>
          </Layout>
        } />
      </Routes>
    </>
  );
}

export default App;