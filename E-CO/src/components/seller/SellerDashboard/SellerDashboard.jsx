import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getShopById } from '../../../services/shops/getShops.js';
import { Container, Row, Col, Card, Button, Alert, Nav, ProgressBar, Table, Form, Badge, Spinner } from 'react-bootstrap';
import {
  Store, Globe, Tag, CreditCard, BarChart2, ChevronRight, Package, Users, 
  DollarSign, TrendingUp, AlertCircle, PenSquare, Eye, Search, Plus, Calendar
} from 'lucide-react';

export default function SellerDashboard() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('week'); // 'day', 'week', 'month', 'year'
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'sales'
  
 useEffect(() => {
  const fetchShopData = async () => {
    try {
      setLoading(true);
      const response = await getShopById(shopId);
      console.log('Données de la boutique reçues:', response); // Ajout d'un log pour déboguer
      
      // Vérifier si les données sont dans response.data (structure courante des API)
      if (response.data) {
        setShop(response.data);
      } else if (response.shop) {
        setShop(response.shop);
      } else {
        // Si les données sont directement dans response
        setShop(response);
      }
    } catch (err) {
      console.error('Erreur lors du chargement de la boutique:', err);
      setError('Impossible de charger les données de la boutique. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };
  
  fetchShopData();
}, [shopId]);
  
  // Données simulées pour le tableau de bord
  const dashboardData = {
    inStoreRevenue: 7820.75,
    inStoreOrders: 5000,
    inStoreGrowth: 4.3,
    
    onlineRevenue: 985937.45,
    onlineOrders: 21000,
    onlineGrowth: 12.5,
    
    discountRevenue: 15503.00,
    discountOrders: 6000,
    discountGrowth: 4.4,
    
    affiliateRevenue: 3982.53,
    affiliateOrders: 2400,
    affiliateGrowth: -2.1,
    
    totalOrders: 125090,
    maxOrders: 200000
  };

  // Données simulées pour les produits populaires
  const topProducts = [
    { id: 1, name: 'Google Home', price: 65, sold: 7545, revenue: 15302.00, change: 3.1, trend: 'down', image: '/images/products/google-home.jpg', stock: 72 },
    { id: 2, name: 'Calvin Klein T-shirts', price: 89, sold: 4714, revenue: 8466.02, change: 47, trend: 'up', image: '/images/products/tshirt.jpg', stock: 50 },
    { id: 3, name: 'RayBan black sunglasses', price: 37, sold: 5951, revenue: 10351.71, change: 0.9, trend: 'down', image: '/images/products/sunglasses.jpg', stock: 65 },
    { id: 4, name: 'Mango Women\'s shoe', price: 65, sold: 5002, revenue: 9917.45, change: 0.1, trend: 'down', image: '/images/products/shoe.jpg', stock: 53 },
    { id: 5, name: 'Plain white sweater', price: 21, sold: 6643, revenue: 12492.21, change: 14.2, trend: 'up', image: '/images/products/sweater.jpg', stock: 69 }
  ];

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-50 py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-3">Chargement du tableau de bord...</p>
        </div>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>{error}</p>
          <div className="d-flex justify-content-end">
            <Button 
              variant="outline-danger"
              onClick={() => navigate('/seller/shops')}
            >
              Retour à mes boutiques
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }
  
  if (!shop) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <Alert.Heading>Boutique non trouvée</Alert.Heading>
          <p>La boutique demandée n'existe pas ou vous n'avez pas les permissions nécessaires pour y accéder.</p>
          <div className="d-flex justify-content-end">
            <Button 
              variant="outline-warning"
              onClick={() => navigate('/seller/shops')}
            >
              Retour à mes boutiques
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      {/* En-tête du tableau de bord */}
      <div className="bg-white py-4 mb-4 border-bottom">
        <Container>
          <Row className="align-items-md-center">
            <Col md={8} className="mb-3 mb-md-0">
              <h2 className="h4 mb-1">Bonjour, {shop?.name || 'Vendeur'}</h2>
              <p className="text-muted">Voici ce qui se passe avec votre boutique aujourd'hui.</p>
            </Col>
            <Col md={4} className="d-flex gap-2 justify-content-md-end">
              <Button 
                variant="outline-secondary"
                size="sm"
                onClick={() => navigate(`/seller/shops/${shop.id}/edit`)}
                className="d-flex align-items-center"
              >
                <PenSquare size={16} className="me-2" />
                Modifier
              </Button>
              <Button 
                variant="primary"
                size="sm"
                onClick={() => window.open(`/shop/${shop.slug}`, '_blank')}
                className="d-flex align-items-center"
              >
                <Eye size={16} className="me-2" />
                Voir la boutique
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="mb-5">
        {/* Cartes de statistiques principales */}
        <Row className="mb-4 g-3">
          {/* Carte 1 - Ventes en boutique */}
          <Col md={6} lg={3}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex align-items-center mb-2">
                  <div className="bg-light rounded p-2 me-2">
                    <Store size={18} className="text-primary" />
                  </div>
                  <h6 className="text-muted small mb-0">Ventes en boutique</h6>
                </div>
                <h3 className="fs-4 fw-semibold mt-2 mb-1">{dashboardData.inStoreRevenue.toLocaleString('fr-FR')} €</h3>
                <div className="d-flex align-items-center">
                  <span className="small text-muted">{dashboardData.inStoreOrders.toLocaleString('fr-FR')} commandes</span>
                  <Badge 
                    bg={dashboardData.inStoreGrowth >= 0 ? "success" : "danger"} 
                    className="ms-2 d-flex align-items-center"
                    pill
                  >
                    <TrendingUp size={12} className="me-1" />
                    {Math.abs(dashboardData.inStoreGrowth)}%
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          {/* Carte 2 - Ventes en ligne */}
          <Col md={6} lg={3}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex align-items-center mb-2">
                  <div className="bg-light rounded p-2 me-2">
                    <Globe size={18} className="text-success" />
                  </div>
                  <h6 className="text-muted small mb-0">Ventes en ligne</h6>
                </div>
                <h3 className="fs-4 fw-semibold mt-2 mb-1">{dashboardData.onlineRevenue.toLocaleString('fr-FR')} €</h3>
                <div className="d-flex align-items-center">
                  <span className="small text-muted">{dashboardData.onlineOrders.toLocaleString('fr-FR')} commandes</span>
                  <Badge 
                    bg={dashboardData.onlineGrowth >= 0 ? "success" : "danger"} 
                    className="ms-2 d-flex align-items-center"
                    pill
                  >
                    <TrendingUp size={12} className="me-1" />
                    {Math.abs(dashboardData.onlineGrowth)}%
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          {/* Carte 3 - Remises */}
          <Col md={6} lg={3}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex align-items-center mb-2">
                  <div className="bg-light rounded p-2 me-2">
                    <Tag size={18} className="text-warning" />
                  </div>
                  <h6 className="text-muted small mb-0">Remises</h6>
                </div>
                <h3 className="fs-4 fw-semibold mt-2 mb-1">{dashboardData.discountRevenue.toLocaleString('fr-FR')} €</h3>
                <div className="d-flex align-items-center">
                  <span className="small text-muted">{dashboardData.discountOrders.toLocaleString('fr-FR')} commandes</span>
                  <Badge 
                    bg={dashboardData.discountGrowth >= 0 ? "success" : "danger"} 
                    className="ms-2 d-flex align-items-center"
                    pill
                  >
                    <TrendingUp size={12} className="me-1" />
                    {Math.abs(dashboardData.discountGrowth)}%
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          {/* Carte 4 - Affiliés */}
          <Col md={6} lg={3}>
            <Card className="h-100">
              <Card.Body>
                              <div className="d-flex align-items-center mb-2">
                  <div className="bg-light rounded p-2 me-2">
                    <CreditCard size={18} className="text-info" />
                  </div>
                  <h6 className="text-muted small mb-0">Affiliés</h6>
                </div>
                <h3 className="fs-4 fw-semibold mt-2 mb-1">{dashboardData.affiliateRevenue.toLocaleString('fr-FR')} €</h3>
                <div className="d-flex align-items-center">
                  <span className="small text-muted">{dashboardData.affiliateOrders.toLocaleString('fr-FR')} commandes</span>
                  <Badge 
                    bg={dashboardData.affiliateGrowth >= 0 ? "success" : "danger"} 
                    className="ms-2 d-flex align-items-center"
                    pill
                  >
                    <TrendingUp size={12} className="me-1" />
                    {Math.abs(dashboardData.affiliateGrowth)}%
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Section des commandes et graphiques */}
        <Row className="mb-4">
          <Col lg={8}>
            <Card className="mb-4">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Commandes</h5>
                <div className="d-flex align-items-center">
                  <Form.Select 
                    size="sm" 
                    className="me-2" 
                    style={{ width: 'auto' }}
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                  >
                    <option value="day">Aujourd'hui</option>
                    <option value="week">Cette semaine</option>
                    <option value="month">Ce mois</option>
                    <option value="year">Cette année</option>
                  </Form.Select>
                  <Button variant="outline-secondary" size="sm">
                    <Calendar size={14} className="me-1" />
                    25 Jul - 25 Aug
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="d-flex mb-3">
                  <Nav variant="tabs" className="border-0">
                    <Nav.Item>
                      <Nav.Link 
                        active={activeTab === 'orders'} 
                        onClick={() => setActiveTab('orders')}
                        className={activeTab === 'orders' ? 'border-primary border-bottom-0' : ''}
                      >
                        Commandes
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link 
                        active={activeTab === 'sales'} 
                        onClick={() => setActiveTab('sales')}
                        className={activeTab === 'sales' ? 'border-primary border-bottom-0' : ''}
                      >
                        Ventes
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </div>
                
                {/* Graphique (à remplacer par un vrai graphique) */}
                <div className="chart-container" style={{ height: '300px', position: 'relative' }}>
                  <div className="position-absolute top-0 start-0 end-0 bottom-0 d-flex justify-content-center align-items-center">
                    <div className="text-center text-muted">
                      <p>Graphique des {activeTab === 'orders' ? 'commandes' : 'ventes'} par mois</p>
                      <small>Intégrez ici votre bibliothèque de graphiques préférée</small>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-success rounded-circle me-2" style={{ width: '10px', height: '10px' }}></div>
                        <small className="text-muted">En boutique</small>
                      </div>
                    </div>
                    <div>
                      <div className="d-flex align-items-center">
                        <div className="bg-secondary rounded-circle me-2" style={{ width: '10px', height: '10px' }}></div>
                        <small className="text-muted">En ligne</small>
                      </div>
                    </div>
                  </div>
                  <Button variant="link" className="text-decoration-none p-0">
                    <small className="d-flex align-items-center">
                      Voir tous les détails
                      <ChevronRight size={14} />
                    </small>
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4}>
            <Card className="h-100">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Aperçu des commandes</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-4">
                  <h2 className="display-6 fw-bold mb-1">{dashboardData.totalOrders.toLocaleString('fr-FR')}</h2>
                  <ProgressBar 
                    now={(dashboardData.totalOrders / dashboardData.maxOrders) * 100} 
                    variant="success" 
                    className="mb-2"
                  />
                  <div className="d-flex justify-content-between">
                    <small className="text-muted">0</small>
                    <small className="text-muted">{dashboardData.maxOrders.toLocaleString('fr-FR')}</small>
                  </div>
                </div>
                
                <p className="text-muted">
                  Une analyse détaillée des commandes par projet, complétée par des informations précises.
                </p>
                
                <div className="mt-4">
                  <Button variant="outline-primary" className="w-100 d-flex align-items-center justify-content-between">
                    <span className="d-flex align-items-center">
                      <BarChart2 size={16} className="me-2" />
                      Voir tous les points forts
                    </span>
                    <ChevronRight size={16} />
                  </Button>
                  
                  <Button variant="outline-secondary" className="w-100 mt-2 d-flex align-items-center justify-content-between">
                    <span className="d-flex align-items-center">
                      <BarChart2 size={16} className="me-2" />
                      Voir toutes les données de vente
                    </span>
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* Section des produits populaires */}
        <Card>
          <Card.Header className="bg-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Produits populaires</h5>
            <div className="d-flex">
              <Form.Control
                type="search"
                placeholder="Rechercher des produits"
                size="sm"
                className="me-2"
                style={{ width: '200px' }}
              />
              <Button variant="primary" size="sm">
                <Plus size={14} className="me-1" />
                Ajouter un produit
              </Button>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <Table hover responsive className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-3">
                    <Form.Check type="checkbox" />
                  </th>
                  <th>Produit</th>
                  <th>Variation</th>
                  <th>Prix</th>
                  <th>Vendus</th>
                  <th>Chiffre d'affaires</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map(product => (
                  <tr key={product.id}>
                    <td className="ps-3">
                      <Form.Check type="checkbox" />
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="me-3" style={{ width: '40px', height: '40px' }}>
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="img-fluid rounded"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
                          />
                        </div>
                        <div>
                          <p className="mb-0 fw-medium">{product.name}</p>
                          <Badge bg={product.stock > 20 ? 'success' : (product.stock > 5 ? 'warning' : 'danger')}>
                            {product.stock} en stock
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Badge 
                          bg={product.trend === 'up' ? 'success' : 'danger'} 
                          className="d-flex align-items-center"
                          pill
                        >
                          <TrendingUp size={12} className="me-1" />
                          {product.change}%
                        </Badge>
                      </div>
                    </td>
                    <td>${product.price}</td>
                    <td>{product.sold.toLocaleString('fr-FR')}</td>
                    <td>${product.revenue.toLocaleString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
          <Card.Footer className="bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted">Affichage de 1 à {topProducts.length} sur {topProducts.length} produits</small>
              </div>
              <div>
                <Button variant="outline-secondary" size="sm" className="me-2">Précédent</Button>
                <Button variant="outline-secondary" size="sm">Suivant</Button>
              </div>
            </div>
          </Card.Footer>
        </Card>
        
        {/* Section des actions rapides */}
        <Row className="mt-4 g-3">
          <Col md={6} lg={2} xl>
            <Card className="text-center h-100">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center py-4">
                <div className="bg-light rounded-circle p-3 mb-3">
                  <Package size={24} className="text-primary" />
                </div>
                <h6>Produit</h6>
                       <Button variant="link" className="text-decoration-none p-0 mt-2">
                  <small className="text-muted">Ajouter</small>
                </Button>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6} lg={2} xl>
            <Card className="text-center h-100">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center py-4">
                <div className="bg-light rounded-circle p-3 mb-3">
                  <Users size={24} className="text-success" />
                </div>
                <h6>Clients</h6>
                <Button variant="link" className="text-decoration-none p-0 mt-2">
                  <small className="text-muted">Gérer</small>
                </Button>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6} lg={2} xl>
            <Card className="text-center h-100">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center py-4">
                <div className="bg-light rounded-circle p-3 mb-3">
                  <DollarSign size={24} className="text-warning" />
                </div>
                <h6>Paiements</h6>
                <Button variant="link" className="text-decoration-none p-0 mt-2">
                  <small className="text-muted">Voir</small>
                </Button>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6} lg={2} xl>
            <Card className="text-center h-100">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center py-4">
                <div className="bg-light rounded-circle p-3 mb-3">
                  <Tag size={24} className="text-info" />
                </div>
                <h6>Promotions</h6>
                <Button variant="link" className="text-decoration-none p-0 mt-2">
                  <small className="text-muted">Créer</small>
                </Button>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6} lg={2} xl>
            <Card className="text-center h-100">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center py-4">
                <div className="bg-light rounded-circle p-3 mb-3">
                  <AlertCircle size={24} className="text-danger" />
                </div>
                <h6>Support</h6>
                <Button variant="link" className="text-decoration-none p-0 mt-2">
                  <small className="text-muted">Contacter</small>
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* Alerte d'information */}
        <Alert variant="info" className="d-flex align-items-center mt-4">
          <AlertCircle size={20} className="me-2" />
          <div>
            <strong>Information:</strong> Vous pouvez personnaliser ce tableau de bord selon vos besoins en ajoutant ou supprimant des widgets.
          </div>
        </Alert>
      </Container>
    </div>
  );
}