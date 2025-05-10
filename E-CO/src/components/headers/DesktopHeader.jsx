import React, { useState } from "react";
import { FaBars, FaMapMarkerAlt, FaSearch, FaShoppingCart, FaUser, FaStore, FaBell, FaHeart } from "react-icons/fa";
import { Link } from "react-router-dom";
import AccountDropdown from "./AccountDropdown.jsx";
import OffcanvasMenu from "./OffcanvasMenu.jsx";
import config from "../../config/config.json";

// eslint-disable-next-line no-unused-vars
const IconWithBadge = ({ to, icon: Icon, count, color }) => (
    <Link to={to} className="btn p-0 position-relative me-3" style={{color: '#333333'}}>
        <Icon className="fs-4"/>
        {count > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                  style={{backgroundColor: color, color: '#FFFFFF'}}>
                {count > 99 ? '99+' : count}
            </span>
        )}
    </Link>
);
const LanguageDropdown = () => (
    <div className="dropdown me-3">
        <button className="btn btn-link text-decoration-none p-0 dropdown-toggle" type="button" id="languageDropdown" data-bs-toggle="dropdown" aria-expanded="false" style={{ color: '#000000' }}>
            <span className="me-1">🇺🇸</span> English (USA)
        </button>
        <ul className="dropdown-menu" aria-labelledby="languageDropdown">
            {/* Add language options here */}
        </ul>
    </div>
);

const LocationDropdown = () => (
    <div className="dropdown">
        <button className="btn btn-link text-decoration-none p-0 dropdown-toggle" type="button" id="locationDropdown" data-bs-toggle="dropdown" aria-expanded="false" style={{ color: '#000000' }}>
            <FaMapMarkerAlt className="me-1" /> Location
        </button>
        <ul className="dropdown-menu" aria-labelledby="locationDropdown">
            {/* Add location options here */}
        </ul>
    </div>
);

const SearchBar = () => (
    <div className="input-group">
        <button className="btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ backgroundColor: '#FFFFFF', color: '#333333', border: '1px solid #767676' }}>
            Electronics
        </button>
        <ul className="dropdown-menu">
            {/* Add category options here */}
        </ul>
        <input type="text" className="form-control" placeholder="What can we help you find today?" aria-label="Search" style={{ border: '1px solid #767676' }} />
        <button className="btn" type="submit" style={{ backgroundColor: '#ed0c0c', color: '#FFFFFF' }}>
            <FaSearch />
        </button>
    </div>
);

const HeaderIcons = () => (
    <div className="d-flex align-items-center">
        {[
            { to: "/cart", icon: FaShoppingCart, count: 2, color: "#E53238", label: "Panier" },
            { to: "/notifications", icon: FaBell, count: 5, color: "#0066c0", label: "Notifications" },
            { to: "/favorites", icon: FaHeart, count: 3, color: "#ff6600", label: "Mes favoris" }
        ].map(({ to, icon, count, color, label }) => (
            <div key={to} className="d-flex flex-column align-items-center me-4">
                <IconWithBadge to={to} icon={icon} count={count} color={color} />
                <span className="mt-1" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{label}</span>
            </div>
        ))}
    </div>
);
const DesktopHeader = () => {
    const [showAccountDropdown, setShowAccountDropdown] = useState(false);
    const [showOffcanvas, setShowOffcanvas] = useState(false);

    const handleOffcanvasShow = () => setShowOffcanvas(true);
    const handleOffcanvasClose = () => setShowOffcanvas(false);

    return (
        <header className="amazon-header" style={{ backgroundColor: '#FFFFFF' }}>
            <div style={{ backgroundColor: '#F8F9FA', color: '#0635f4', borderBottom: '1px solid #e5e5e5' }} className="py-1">
                <div className="container-fluid d-flex justify-content-between align-items-center">
                    <Link to="/sell" className="text-decoration-none d-flex align-items-center" style={{ color: '#000000' }}>
                        <FaStore className="me-1" /> Vendre sur {config.MARKETPLACE_NAME}
                    </Link>
                    <div className="d-flex align-items-center">
                        <span className="me-3" style={{ color: '#000000' }}>Get 50% off on Member Exclusive Month</span>
                        <a href="#" className="text-decoration-none" style={{ color: '#ed0c0c', fontWeight: 'bold' }}>Shop Now</a>
                    </div>
                    <div className="d-flex align-items-center">
                        <LanguageDropdown />
                        <LocationDropdown />
                    </div>
                </div>
            </div>

           <nav className="navbar navbar-expand-lg navbar-light py-2 m-1.5" style={{ backgroundColor: '#FFFFFF' }}>
    <div className="container-fluid">
        <Link to="/" className="navbar-brand d-flex align-items-center">
            <span className="fw-bold fs-3" style={{ color: '#E53238' }}>{config.MARKETPLACE_NAME}</span>
        </Link>

        <div className="d-flex flex-grow-1 mx-3">
            <SearchBar />
        </div>

        <div className="d-flex align-items-center">
            <div className="me-4">
                <HeaderIcons />
            </div>
            <div className="dropdown ms-3">
                <button
                    className="btn dropdown-toggle d-flex align-items-center"
                    type="button"
                    id="accountDropdown"
                    onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                    style={{
                        backgroundColor: '#FFFFFF',
                        color: '#333333',
                        padding: '10px 18px',
                        border: '1px solid #e5e5e5',
                        borderRadius: '4px',
                        fontSize: '1.1rem'
                    }}
                >
                    <FaUser className="me-2" size={20} />
                    <span>Account</span>
                </button>
                {showAccountDropdown && (
                    <div
                        className="dropdown-menu show position-absolute mt-2"
                        style={{
                            right: 0,
                            left: 'auto',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #e5e5e5',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            minWidth: '220px',
                            zIndex: 1000,
                            fontSize: '1.05rem'
                        }}
                    >
                        <AccountDropdown />
                    </div>
                )}
            </div>
        </div>
    </div>
</nav>
       <nav className="navbar navbar-expand-lg navbar-light py-1 border-top border-bottom" style={{ backgroundColor: '#FFFFFF', borderColor: '#e5e5e5' }}>
    <div className="container-fluid">
        <ul className="navbar-nav w-100 d-flex justify-content-start align-items-center flex-wrap">
            <li className="nav-item me-2">
                <button
                    className="btn p-0 d-flex align-items-center"
                    onClick={handleOffcanvasShow}
                    style={{color: '#333333', fontSize: '0.9rem'}}
                >
                    <FaBars className="fs-6 me-1"/>
                    <span>All</span>
                </button>
            </li>
            <li className="nav-item me-2"><Link className="nav-link py-1 px-2" to="/best-sellers" style={{color: '#090000', fontSize: '0.9rem'}}>Best Sellers</Link></li>
            <li className="nav-item me-2"><Link className="nav-link py-1 px-2" to="/gift-cards" style={{color: '#000000', fontSize: '0.9rem'}}>Gift Cards</Link></li>
            <li className="nav-item me-2"><Link className="nav-link py-1 px-2" to="/gift-ideas" style={{color: '#000000', fontSize: '0.9rem'}}>Gift Ideas</Link></li>
            <li className="nav-item me-2"><Link className="nav-link py-1 px-2" to="/deal-of-the-day" style={{color: '#000000', fontSize: '0.9rem'}}>Deal of the Day</Link></li>
            <li className="nav-item me-2"><Link className="nav-link py-1 px-2" to="/top-deals" style={{color: '#000000', fontSize: '0.9rem'}}>Top Deals</Link></li>
            <li className="nav-item me-2"><Link className="nav-link py-1 px-2" to="/membership-deals" style={{color: '#000000', fontSize: '0.9rem'}}>Membership Deals</Link></li>
            <li className="nav-item"><Link className="nav-link py-1 px-2" to="/new-releases" style={{color: '#000000', fontSize: '0.9rem'}}>New Releases</Link></li>
        </ul>
    </div>
</nav>
            {/* Offcanvas Menu */}
            <OffcanvasMenu isOpen={showOffcanvas} onClose={handleOffcanvasClose} />
        </header>
    );
};

export default DesktopHeader;