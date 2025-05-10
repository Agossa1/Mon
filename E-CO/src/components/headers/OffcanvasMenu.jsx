import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaChevronRight, FaChevronDown, FaUser, FaTimes, FaBook, FaMusic, FaGamepad, FaMobileAlt, FaShoppingCart, FaIndustry, FaQuestionCircle, FaGlobe, FaVideo, FaCloud, FaAppStore, FaBriefcase, FaHome, FaPaintBrush, FaGift, FaLeaf, FaUtensils, FaTshirt, FaHeart, FaStar, FaPercent, FaTablet, FaLaptop, FaTv, FaHeadphones, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const OffcanvasMenu = ({ isOpen, onClose }) => {
    const menuRef = useRef(null);
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) && isOpen) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const baseStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '365px',
        backgroundColor: 'white',
        zIndex: 1050,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out',
        overflowY: 'auto'
    };

    const categories = [
        {
            title: "Contenu Numérique et appareils",
            items: [
                { name: 'Yumi Prime Video', icon: <FaVideo />, link: '/yumi-prime-video' },
                { name: 'Yumi Music', icon: <FaMusic />, link: '/yumi-music' },
                { name: 'Yumi eBooks', icon: <FaBook />, link: '/yumi-ebooks' },
                { name: 'Yumi Appstore', icon: <FaAppStore />, link: '/yumi-appstore' },
                { name: 'Yumi Cloud Gaming', icon: <FaCloud />, link: '/yumi-cloud-gaming' },
                { name: 'Smartphones', icon: <FaMobileAlt />, link: '/smartphones' },
                { name: 'Tablettes', icon: <FaTablet />, link: '/tablettes' },
                { name: 'Ordinateurs', icon: <FaLaptop />, link: '/ordinateurs' },
                { name: 'TV & Home Cinéma', icon: <FaTv />, link: '/tv-home-cinema' },
                { name: 'Audio & Hi-Fi', icon: <FaHeadphones />, link: '/audio-hifi' },
            ]
        },
        {
            title: "Contenu Artisanal",
            items: [
                { name: 'Artisanat local', icon: <FaPaintBrush />, link: '/artisanat-local' },
                { name: 'Produits faits main', icon: <FaGift />, link: '/produits-faits-main' },
                { name: 'Créations uniques', icon: <FaIndustry />, link: '/creations-uniques' },
            ]
        },
        {
            title: "Produits du terroir",
            items: [
                { name: 'Alimentation locale', icon: <FaUtensils />, link: '/alimentation-locale' },
                { name: 'Produits bio', icon: <FaLeaf />, link: '/produits-bio' },
            ]
        },
        {
            title: "Catégories de produits",
            items: [
                { name: 'Mode et Accessoires', icon: <FaTshirt />, link: '/mode-accessoires' },
                { name: 'Maison et Décoration', icon: <FaHome />, link: '/maison-decoration' },
                { name: 'High-Tech', icon: <FaMobileAlt />, link: '/high-tech' },
                { name: 'Jeux et Loisirs', icon: <FaGamepad />, link: '/jeux-loisirs' },
                { name: 'Beauté et Bien-être', icon: <FaHeart />, link: '/beaute-bien-etre' },
            ]
        },
        {
            title: "Programmes et services",
            items: [
                { name: 'Yumi Marketplace', icon: <FaShoppingCart />, link: '/yumi-marketplace' },
                { name: 'Yumi Business', icon: <FaBriefcase />, link: '/yumi-business' },
                { name: 'Yumi Prime', icon: <FaStar />, link: '/yumi-prime' },
                { name: 'Yumi Outlet', icon: <FaPercent />, link: '/yumi-outlet' },
            ]
        },
    ];

    return (
        <div
            ref={menuRef}
            className={`offcanvas offcanvas-start ${isOpen ? 'show' : ''}`}
            tabIndex="-1"
            id="offcanvasMenu"
            style={baseStyle}
        >
            <div className="offcanvas-header text-dark d-flex justify-content-between align-items-center p-3 bg-light">
                <h5 className="offcanvas-title d-flex align-items-center m-0">
                    <FaUser className="me-2" />
                    {isAuthenticated ? `Bonjour, ${user.fullName}` : 'Bonjour, Identifiez-vous'}
                </h5>
                <button
                    type="button"
                    className="btn-close text-reset p-0"
                    onClick={onClose}
                    aria-label="Close"
                    style={{ background: 'none', border: 'none' }}
                >
                    <FaTimes size={24} />
                </button>
            </div>
            <div className="offcanvas-body p-0">
                <div className="list-group list-group-flush">
                    {categories.map((category, index) => (
                        <div key={index} className="list-group-item">
                            <h6 className="mb-2 text-muted">{category.title}</h6>
                            <ul className="list-unstyled mb-0">
                                {category.items.map((item, itemIndex) => (
                                    <li key={itemIndex} className="d-flex justify-content-between align-items-center py-2">
                                        <Link className="text-decoration-none text-dark d-flex align-items-center" to={item.link} onClick={onClose}>
                                            <span className="me-2">{item.icon}</span>
                                            {item.name}
                                        </Link>
                                        <FaChevronRight className="text-muted" />
                                    </li>
                                ))}
                            </ul>
                            {(category.title === "Catégories de produits" || category.title === "Programmes et services") && (
                                <Link className="text-decoration-none text-dark d-flex justify-content-between align-items-center mt-2 py-2" to={category.title === "Catégories de produits" ? "/all-categories" : "/all-programs"} onClick={onClose}>
                                    Tout afficher
                                    <FaChevronDown className="text-muted" />
                                </Link>
                            )}
                        </div>
                    ))}
                    <div className="list-group-item">
                        <h6 className="mb-2 text-muted">Aide et paramètres</h6>
                        <ul className="list-unstyled mb-0">
                            <li>
                                <Link className="text-decoration-none text-dark py-2 d-flex align-items-center" to="/account" onClick={onClose}>
                                    <FaUser className="me-2" />
                                    Votre compte
                                </Link>
                            </li>
                            <li>
                                <div className="d-flex justify-content-between align-items-center py-2">
                                    <span className="d-flex align-items-center">
                                        <FaGlobe className="me-2" />
                                        Français
                                    </span>
                                    <FaChevronRight className="text-muted" />
                                </div>
                            </li>
                            <li>
                                <a className="text-decoration-none text-dark py-2 d-flex align-items-center" href="https://www.yumi.fr" onClick={onClose}>
                                    <FaQuestionCircle className="me-2" />
                                    https://www.yumi.fr
                                </a>
                            </li>
                            {isAuthenticated && (
                                <li>
                                    <button 
                                        className="text-decoration-none text-dark py-2 d-flex align-items-center w-100 border-0 bg-transparent"
                                        onClick={() => {
                                            logout();
                                            onClose();
                                            navigate('/sign-in');
                                        }}
                                    >
                                        <FaSignOutAlt className="me-2" />
                                        Se déconnecter
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OffcanvasMenu;