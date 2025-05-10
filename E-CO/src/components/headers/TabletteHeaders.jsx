import React, { useState } from "react";
import { FaBars, FaMapMarkerAlt, FaSearch, FaShoppingCart, FaUser, FaStore, FaBell, FaHeart } from "react-icons/fa";
import { Link } from "react-router-dom";
import AccountDropdown from "./AccountDropdown.jsx";
import OffcanvasMenu from "./OffcanvasMenu.jsx";
import config from "../../config/config.json";

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
        <button className="btn btn-sm btn-link text-decoration-none p-0 dropdown-toggle" type="button" id="languageDropdown" data-bs-toggle="dropdown" aria-expanded="false" style={{ color: '#ffffff' }}>
            <span className="me-1">🇺🇸</span> English (USA)
        </button>
        <ul className="dropdown-menu" aria-labelledby="languageDropdown">
            {/* Add language options here */}
        </ul>
    </div>
);

const LocationDropdown = () => (
    <div className="dropdown">
        <button className="btn btn-sm btn-link text-decoration-none p-0 dropdown-toggle" type="button" id="locationDropdown" data-bs-toggle="dropdown" aria-expanded="false" style={{ color: '#ffffff' }}>
            <FaMapMarkerAlt className="me-1"/>
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
        <input type="text" className="form-control" placeholder="What can we help you find today?" aria-label="Search" style={{ border: '1px solid #767676' }}/>
        <button className="btn" type="submit" style={{ backgroundColor: '#ed0c0c', color: '#FFFFFF' }}>
            <FaSearch/>
        </button>
    </div>
);

const HeaderIcons = () => (
    <div className="d-flex align-items-center">
        {[
            { to: "/cart", icon: FaShoppingCart, count: 2, color: "#E53238", label: "Panier" },
            { to: "/notifications", icon: FaBell, count: 5, color: "#0066c0", label: "Notifications" },
            { to: "/favorites", icon: FaHeart, count: 3, color: "#ff6600", label: "Mes favoris" }
        ].map(({ to, icon, count, color, label }, index) => (
            <div key={to} className="d-flex flex-column align-items-center me-4">
                <IconWithBadge to={to} icon={icon} count={count} color={color} />
                <span className="mt-1" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{label}</span>
            </div>
        ))}
    </div>
);

const TabletHeader = () => {
    const [showAccountDropdown, setShowAccountDropdown] = useState(false);
    const [showOffcanvas, setShowOffcanvas] = useState(false);

    const handleOffcanvasShow = () => setShowOffcanvas(true);
    const handleOffcanvasClose = () => setShowOffcanvas(false);

    return (
        <header className="amazon-header" style={{ backgroundColor: '#FFFFFF' }}>
            <div style={{ backgroundColor: '#090000', color: '#ffffff', borderBottom: '1px solid #e5e5e5' }} className="py-2">
                <div className="container-fluid px-3">
                    <div className="row align-items-center">
                        <div className="col-12 col-sm-4 mb-2 mb-sm-0">
                            <Link to="/sell" className="text-decoration-none d-flex align-items-center" style={{ color: '#ffffff' }}>
                                <FaStore className="me-1" /> Vendre sur {config.MARKETPLACE_NAME}
                            </Link>
                        </div>
                        <div className="col-12 col-sm-4 mb-2 mb-sm-0 text-center">
                            <span className="me-2 text-white " style={{width:"100%"}}>Get 50% off on Member Exclusive Month</span>
                            <a href="#" className="text-decoration-none" style={{ color: '#ed0c0c', fontWeight: 'bold' }}>Shop Now</a>
                        </div>
                        <div className="col-12 col-sm-4 d-flex justify-content-end">
                            <LanguageDropdown />
                            <LocationDropdown />
                        </div>
                    </div>
                </div>
            </div>

            <nav className="navbar navbar-expand-sm navbar-light py-2 m-1.5" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="container-fluid px-3">
                    <div className="d-flex align-items-center">
                        <button className="btn btn-sm p-0 me-3" onClick={handleOffcanvasShow} style={{ color: '#333333' }}>
                            <FaBars className="fs-4" />
                        </button>
                        <Link to="/" className="navbar-brand d-flex align-items-center">
                            <span className="fw-bold fs-4" style={{ color: '#E53238' }}>{config.MARKETPLACE_NAME}</span>
                        </Link>
                    </div>

                    <div className="d-flex align-items-center">
                        <HeaderIcons />
                        <div className="dropdown ms-3">
                            <button
                                className="btn dropdown-toggle d-flex align-items-center"
                                type="button"
                                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                                style={{backgroundColor: '#FFFFFF', color: '#333333'}}
                            >
                                <FaUser className="me-1 fs-5"/> <span className="d-none d-sm-inline">Account</span>
                            </button>
                            {showAccountDropdown && (
                                <div className="dropdown-menu show position-absolute mt-2"
                                     style={{
                                         right: 0,
                                         left: 'auto',
                                         zIndex: 1050,
                                         minWidth: '200px',
                                         transform: 'translateX(-25%)',
                                         backgroundColor: '#FFFFFF',
                                         border: '1px solid #e5e5e5'
                                     }}>
                                    <AccountDropdown/>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <div style={{backgroundColor: '#FFFFFF' }} className="py-2">
                <div className="container-fluid px-3">
                    <SearchBar />
                </div>
            </div>

            <nav className="navbar navbar-light py-1 border-top border-bottom" style={{ backgroundColor: '#FFFFFF', borderColor: '#e5e5e5', overflowX: 'auto' }}>
                <div className="container-fluid px-3" style={{ flexWrap: 'nowrap', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <ul className="navbar-nav d-flex flex-row flex-nowrap" style={{ minWidth: '100%', gap: '10px' }}>
                        <li className="nav-item dropdown" style={{ flexShrink: 0 }}>
                            <a className="nav-link dropdown-toggle" href="#" id="allCategoriesDropdown" role="button"
                               data-bs-toggle="dropdown" aria-expanded="false" style={{ color: '#000000', whiteSpace: 'nowrap', fontSize: '0.9rem', padding: '0.5rem 0.75rem' }}>
                                All categories
                            </a>
                            <ul className="dropdown-menu" aria-labelledby="allCategoriesDropdown">
                                {/* Add category options here */}
                            </ul>
                        </li>
                        <li className="nav-item" style={{ flexShrink: 0 }}><a className="nav-link" href="#" style={{ color: '#000000', whiteSpace: 'nowrap', fontSize: '0.9rem', padding: '0.5rem 0.75rem' }}>Best Sellers</a></li>
                        <li className="nav-item" style={{ flexShrink: 0 }}><a className="nav-link" href="#" style={{ color: '#000000', whiteSpace: 'nowrap', fontSize: '0.9rem', padding: '0.5rem 0.75rem' }}>Gift Cards</a></li>
                        <li className="nav-item" style={{ flexShrink: 0 }}><a className="nav-link" href="#" style={{ color: '#000000', whiteSpace: 'nowrap', fontSize: '0.9rem', padding: '0.5rem 0.75rem' }}>Gift Ideas</a></li>
                        <li className="nav-item" style={{ flexShrink: 0 }}><a className="nav-link" href="#" style={{ color: '#000000', whiteSpace: 'nowrap', fontSize: '0.9rem', padding: '0.5rem 0.75rem' }}>Deal of the day</a></li>
                        <li className="nav-item" style={{ flexShrink: 0 }}><a className="nav-link" href="#" style={{ color: '#000000', whiteSpace: 'nowrap', fontSize: '0.9rem', padding: '0.5rem 0.75rem' }}>Top Deals</a></li>
                        <li className="nav-item" style={{ flexShrink: 0 }}><a className="nav-link" href="#" style={{ color: '#000000', whiteSpace: 'nowrap', fontSize: '0.9rem', padding: '0.5rem 0.75rem' }}>Membership Deals</a></li>
                        <li className="nav-item" style={{ flexShrink: 0 }}><a className="nav-link" href="#" style={{ color: '#000000', whiteSpace: 'nowrap', fontSize: '0.9rem', padding: '0.5rem 0.75rem' }}>New Releases</a></li>
                    </ul>
                </div>
            </nav>

            <OffcanvasMenu isOpen={showOffcanvas} onClose={handleOffcanvasClose} />
        </header>
    );
}

export default TabletHeader;