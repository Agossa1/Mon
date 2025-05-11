import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Nav, Button } from 'react-bootstrap';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, Settings, 
  CreditCard, BarChart2, MessageSquare, HelpCircle, ChevronRight, ChevronDown
} from 'lucide-react';
import './SellerSidebar.css'; // Vous devrez créer ce fichier CSS

export default function SellerSidebar({ shop }) {
  const location = useLocation();
  const { shopId } = useParams();
  const [expandedMenus, setExpandedMenus] = useState({
    products: false,
    orders: false,
    marketing: false
  });

  // Fonction pour vérifier si un lien est actif
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Fonction pour basculer l'état d'expansion d'un menu
  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  return (
    <div className="seller-sidebar bg-white border-end h-100">
      {/* En-tête de la sidebar avec le nom de la boutique */}
      <div className="sidebar-header p-3 border-bottom">
        <h5 className="mb-0 text-truncate">{shop?.name || 'Ma Boutique'}</h5>
        <small className="text-muted d-block">Espace vendeur</small>
      </div>

      {/* Navigation principale */}
      <Nav className="flex-column p-2">
        {/* Tableau de bord */}
        <Nav.Item>
          <Link 
            to={`/seller/shops/${shopId}/dashboard`} 
            className={`nav-link d-flex align-items-center py-2 px-3 ${isActive(`/seller/shops/${shopId}/dashboard`) ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} className="me-3" />
            <span>Tableau de bord</span>
          </Link>
        </Nav.Item>

        {/* Produits avec sous-menu */}
        <Nav.Item>
          <Button 
            variant="link" 
            className={`nav-link d-flex align-items-center justify-content-between w-100 py-2 px-3 text-start ${location.pathname.includes('/products') ? 'active' : ''}`}
            onClick={() => toggleMenu('products')}
          >
            <div className="d-flex align-items-center">
              <Package size={18} className="me-3" />
              <span>Produits</span>
            </div>
            {expandedMenus.products ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </Button>
          
          {expandedMenus.products && (
            <div className="submenu ps-4">
              <Nav.Item>
                <Link 
                  to={`/seller/shops/${shopId}/products`} 
                  className={`nav-link py-2 px-3 ${isActive(`/seller/shops/${shopId}/products`) ? 'active' : ''}`}
                >
                  Tous les produits
                </Link>
              </Nav.Item>
              <Nav.Item>
                <Link 
                  to={`/seller/shops/${shopId}/products/add`} 
                  className={`nav-link py-2 px-3 ${isActive(`/seller/shops/${shopId}/products/add`) ? 'active' : ''}`}
                >
                  Ajouter un produit
                </Link>
              </Nav.Item>
              <Nav.Item>
                <Link 
                  to={`/seller/shops/${shopId}/products/categories`} 
                  className={`nav-link py-2 px-3 ${isActive(`/seller/shops/${shopId}/products/categories`) ? 'active' : ''}`}
                >
                  Catégories
                </Link>
              </Nav.Item>
              <Nav.Item>
                <Link 
                  to={`/seller/shops/${shopId}/products/inventory`} 
                  className={`nav-link py-2 px-3 ${isActive(`/seller/shops/${shopId}/products/inventory`) ? 'active' : ''}`}
                >
                  Inventaire
                </Link>
              </Nav.Item>
            </div>
          )}
        </Nav.Item>

        {/* Commandes avec sous-menu */}
        <Nav.Item>
          <Button 
            variant="link" 
            className={`nav-link d-flex align-items-center justify-content-between w-100 py-2 px-3 text-start ${location.pathname.includes('/orders') ? 'active' : ''}`}
            onClick={() => toggleMenu('orders')}
          >
            <div className="d-flex align-items-center">
              <ShoppingBag size={18} className="me-3" />
              <span>Commandes</span>
            </div>
            {expandedMenus.orders ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </Button>
          
          {expandedMenus.orders && (
            <div className="submenu ps-4">
              <Nav.Item>
                <Link 
                  to={`/seller/shops/${shopId}/orders`} 
                  className={`nav-link py-2 px-3 ${isActive(`/seller/shops/${shopId}/orders`) ? 'active' : ''}`}
                >
                  Toutes les commandes
                </Link>
              </Nav.Item>
              <Nav.Item>
                <Link 
                  to={`/seller/shops/${shopId}/orders/pending`} 
                  className={`nav-link py-2 px-3 ${isActive(`/seller/shops/${shopId}/orders/pending`) ? 'active' : ''}`}
                >
                  En attente
                </Link>
              </Nav.Item>
              <Nav.Item>
                <Link 
                  to={`/seller/shops/${shopId}/orders/processing`} 
                  className={`nav-link py-2 px-3 ${isActive(`/seller/shops/${shopId}/orders/processing`) ? 'active' : ''}`}
                >
                  En traitement
                </Link>
              </Nav.Item>
              <Nav.Item>
                <Link 
                  to={`/seller/shops/${shopId}/orders/completed`} 
                  className={`nav-link py-2 px-3 ${isActive(`/seller/shops/${shopId}/orders/completed`) ? 'active' : ''}`}
                >
                  Terminées
                </Link>
              </Nav.Item>
            </div>
          )}
        </Nav.Item>

        {/* Clients */}
        <Nav.Item>
          <Link 
            to={`/seller/shops/${shopId}/customers`} 
            className={`nav-link d-flex align-items-center py-2 px-3 ${isActive(`/seller/shops/${shopId}/customers`) ? 'active' : ''}`}
          >
            <Users size={18} className="me-3" />
            <span>Clients</span>
          </Link>
        </Nav.Item>

        {/* Marketing avec sous-menu */}
        <Nav.Item>
          <Button 
            variant="link" 
            className={`nav-link d-flex align-items-center justify-content-between w-100 py-2 px-3 text-start ${location.pathname.includes('/marketing') ? 'active' : ''}`}
            onClick={() => toggleMenu('marketing')}
          >
            <div className="d-flex align-items-center">
              <Tag size={18} className="me-3" />
              <span>Marketing</span>
            </div>
            {expandedMenus.marketing ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </Button>
          
          {expandedMenus.marketing && (
            <div className="submenu ps-4">
              <Nav.Item>
                <Link 
                  to={`/seller/shops/${shopId}/marketing/promotions`} 
                  className={`nav-link py-2 px-3 ${isActive(`/seller/shops/${shopId}/marketing/promotions`) ? 'active' : ''}`}
                >
                  Promotions
                </Link>
              </Nav.Item>
              <Nav.Item>
                <Link 
                  to={`/seller/shops/${shopId}/marketing/coupons`} 
                  className={`nav-link py-2 px-3 ${isActive(`/seller/shops/${shopId}/marketing/coupons`) ? 'active' : ''}`}
                >
                  Coupons
                </Link>
              </Nav.Item>
              <Nav.Item>
                <Link 
                  to={`/seller/shops/${shopId}/marketing/campaigns`} 
                  className={`nav-link py-2 px-3 ${isActive(`/seller/shops/${shopId}/marketing/campaigns`) ? 'active' : ''}`}
                >
                  Campagnes
                </Link>
              </Nav.Item>
            </div>
          )}
        </Nav.Item>

        {/* Paiements */}
        <Nav.Item>
          <Link 
            to={`/seller/shops/${shopId}/payments`} 
            className={`nav-link d-flex align-items-center py-2 px-3 ${isActive(`/seller/shops/${shopId}/payments`) ? 'active' : ''}`}
          >
            <CreditCard size={18} className="me-3" />
            <span>Paiements</span>
          </Link>
        </Nav.Item>

        {/* Statistiques */}
        <Nav.Item>
          <Link 
            to={`/seller/shops/${shopId}/analytics`} 
            className={`nav-link d-flex align-items-center py-2 px-3 ${isActive(`/seller/shops/${shopId}/analytics`) ? 'active' : ''}`}
          >
            <BarChart2 size={18} className="me-3" />
            <span>Statistiques</span>
          </Link>
        </Nav.Item>

        {/* Messages */}
        <Nav.Item>
          <Link 
            to={`/seller/shops/${shopId}/messages`} 
            className={`nav-link d-flex align-items-center py-2 px-3 ${isActive(`/seller/shops/${shopId}/messages`) ? 'active' : ''}`}
          >
            <MessageSquare size={18} className="me-3" />
            <span>Messages</span>
            <span className="badge bg-danger rounded-pill ms-auto">3</span>
          </Link>
        </Nav.Item>

        {/* Paramètres */}
        <Nav.Item>
          <Link 
            to={`/seller/shops/${shopId}/settings`} 
            className={`nav-link d-flex align-items-center py-2 px-3 ${isActive(`/seller/shops/${shopId}/settings`) ? 'active' : ''}`}
          >
            <Settings size={18} className="me-3" />
            <span>Paramètres</span>
          </Link>
        </Nav.Item>
      </Nav>

      {/* Aide et support */}
      <div className="mt-auto p-3 border-top">
        <Link 
                  to="/seller/help" 
          className="d-flex align-items-center text-decoration-none text-muted py-2"
        >
          <HelpCircle size={18} className="me-2" />
          <span>Aide et support</span>
        </Link>
      </div>
    </div>
  );
}