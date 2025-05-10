'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FaUser, FaBox, FaWallet, FaHeart, FaGift, FaHeadset, FaUndo,
  FaStar, FaShieldAlt, FaFileInvoice, FaRegCreditCard, FaSignOutAlt,
  FaChevronRight, FaSignInAlt, FaUserPlus
} from 'react-icons/fa';
import '../../styles/AccountDropdown.css';

const AccountDropdown = () => {
  const [activeSection, setActiveSection] = useState('account');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const { user, logout, isLoading } = useAuth();

  useEffect(() => {
    if (user) {
      console.log('User object:', JSON.stringify(user, null, 2));
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    // Ajouter l'écouteur d'événement au document entier
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/sign-in');
  };

  const toggleDropdown = (e) => {
    e.stopPropagation(); // Empêche l'événement de se propager au document
    setIsOpen(!isOpen);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-start text-white">
        <div className="text-xs">Chargement...</div>
        <div className="font-bold">Compte</div>
      </div>
    );
  }

  const accountOptions = [
    { icon: FaUser, text: "Profile", link: "/profile" },
    { icon: FaBox, text: "My Orders", link: "/orders" },
    { icon: FaWallet, text: "My Wallet", link: "/wallet" },
    { icon: FaHeart, text: "Favourites", link: "/favourites" },
    { icon: FaGift, text: "Vouchers", link: "/vouchers" },
    { icon: FaHeadset, text: "Support", link: "/support" },
  ];

  const settingsOptions = [
    { icon: FaUndo, text: "Returns", link: "/returns" },
    { icon: FaStar, text: "Reviews", link: "/reviews" },
    { icon: FaShieldAlt, text: "Guarantees", link: "/guarantees" },
    { icon: FaFileInvoice, text: "Billing", link: "/billing" },
    { icon: FaRegCreditCard, text: "Subscriptions", link: "/subscriptions" },
  ];

  return (
    <div className="account-dropdown" ref={menuRef}>
      <div className="user-info" onClick={toggleDropdown}>
        <img src="/path_to_user_avatar.jpg" alt="User Avatar" className="user-avatar"/>
        <div className="user-details">
          <h6>{user ? (user.fullName || 'Utilisateur') : 'Compte et Listes'}</h6>
          <small>{user ? user.email : 'Identifiez-vous'}</small>
        </div>
      </div>
      {isOpen && (
        <div className="dropdown-content">
          <div className="tabs">
            <button
              className={`tab ${activeSection === 'account' ? 'active' : ''}`}
              onClick={() => setActiveSection('account')}
            >
              Account
            </button>
            <button
              className={`tab ${activeSection === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveSection('settings')}
            >
              Settings
            </button>
          </div>
          <div className="options-list">
            {(activeSection === 'account' ? accountOptions : settingsOptions).map(({ icon: Icon, text, link }, index) => (
              <Link to={link} key={index} className="option-item" onClick={() => setIsOpen(false)}>
                <Icon className="icon"/>
                <span>{text}</span>
                <FaChevronRight className="chevron"/>
              </Link>
            ))}
          </div>
        </div>
      )}
      <div className="account-actions">
        {user ? (
          <button onClick={handleLogout} className="account-action logout">
            <FaSignOutAlt className="icon"/>
            <span>Logout</span>
          </button>
        ) : (
          <>
            <Link to="/sign-in" className="account-action signin" onClick={() => setIsOpen(false)}>
              <FaSignInAlt className="icon"/>
              <span>Sign In</span>
            </Link>
            <Link to="/sign-up" className="account-action signup" onClick={() => setIsOpen(false)}>
              <FaUserPlus className="icon"/>
              <span>Sign Up</span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default AccountDropdown;