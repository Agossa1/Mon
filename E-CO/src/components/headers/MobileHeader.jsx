import React, { useState } from "react";
import { FaBars, FaSearch, FaShoppingCart, FaTimes, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import config from "../../config/config.json";
import AccountDropdown from "./AccountDropdown.jsx";
import OffcanvasMenu from "./OffcanvasMenu.jsx";
import ThemeToggle from "../../contexts/ThemeToggle.jsx";

const MobileHeader = ({ onOffcanvasShow }) => {
    const [showAccountDropdown, setShowAccountDropdown] = useState(false);
    const [showOffcanvas, setShowOffcanvas] = useState(false);

    const handleOffcanvasShow = () => {
        setShowOffcanvas(true);
        if (onOffcanvasShow) onOffcanvasShow();
    };

    const handleOffcanvasClose = () => setShowOffcanvas(false);

    return (
        <header className="amazon-header position-relative">
            <nav className="navbar navbar-light py-2" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="container-fluid px-3">
                    <div className="d-flex justify-content-between align-items-center w-100">
                        <div className="d-flex align-items-center">
                            <button className="btn p-0 me-3" onClick={handleOffcanvasShow} style={{color: '#333333'}}>
                                <FaBars className="fs-4"/>
                            </button>
                            <Link to="/" className="navbar-brand m-0">
                                <span className="fw-bold fs-4" style={{color: '#E53238'}}>{config.MARKETPLACE_NAME}</span>
                            </Link>
                        </div>

                        <div className="d-flex align-items-center">
                            <Link to="/cart" className="btn p-0 position-relative me-3" style={{color: '#333333'}}>
                                <FaShoppingCart className="fs-4"/>
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                                      style={{backgroundColor: '#E53238', color: '#FFFFFF'}}>
                                    2
                                </span>
                            </Link>
                            <button
                                className="btn p-0 me-3"
                                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                                style={{color: '#333333'}}
                            >
                                <FaUser className="fs-4"/>
                            </button>

                        </div>
                    </div>
                </div>
            </nav>

           <div className="py-2 px-3" style={{backgroundColor: '#01041b'}}>
    <form className="d-flex position-relative">
        <div className="input-group">
            <span className="input-group-text bg-white border-end-0" style={{borderColor: '#767676'}}>
                <FaSearch className="text-muted" />
            </span>
            <input
                type="search"
                className="form-control border-start-0"
                placeholder="Search in all categories"
                aria-label="Search"
                style={{
                    borderColor: '#767676',
                    boxShadow: 'none',
                    borderRadius: '0 20px 20px 0'
                }}
            />
        </div>
        <button 
            className="btn position-absolute end-0 top-0 bottom-0" 
            type="submit" 
            style={{
                backgroundColor: '#ed0c0c',
                color: '#FFFFFF',
                borderRadius: '0 20px 20px 0',
                padding: '0 15px'
            }}
        >
            <span className="d-none d-sm-inline me-2">Search</span>
            <FaSearch />
        </button>
    </form>
</div>

            {/* Categories navbar */}
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
            {showAccountDropdown && (
                <div className="position-fixed top-0 start-0 end-0" style={{zIndex: 1050}}>
                    <div className="p-3 position-absolute top-0 start-0 end-0" style={{maxHeight: '80vh', overflowY: 'auto', backgroundColor: '#FFFFFF'}}>
                        <button
                            className="btn position-absolute top-0 end-0 m-2"
                            onClick={() => setShowAccountDropdown(false)}
                            style={{ color: '#333333' }}
                        >
                            <FaTimes className="fs-4" />
                        </button>
                        <AccountDropdown />
                    </div>
                </div>
            )}

            <OffcanvasMenu isOpen={showOffcanvas} onClose={handleOffcanvasClose} />
        </header>
    );
};

export default MobileHeader;