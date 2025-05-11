import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Plus, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {getMyShops} from '../../services/shops/getShops';
import { formatDate } from '../../utils/formatters';

const MyShopsList = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, refreshToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchShops() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Rafraîchir le token si nécessaire
        if (typeof refreshToken === 'function') {
          try {
            await refreshToken();
          } catch (refreshError) {
            console.warn('Impossible de rafraîchir le token:', refreshError);
          }
        }

        // Appel à l'API pour récupérer les boutiques
        const response = await getMyShops();
        
        if (response.success) {
          // S'assurer que shops est bien un tableau en accédant à response.data.shops
          const shopsArray = Array.isArray(response.data?.shops) ? response.data.shops : [];
          setShops(shopsArray);
          
          // Log pour déboguer
          console.log('Boutiques récupérées:', shopsArray);
        } else {
          setError(response.message || 'Impossible de charger vos boutiques');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des boutiques:', err);
        setError('Une erreur est survenue lors du chargement de vos boutiques');
        // En cas d'erreur, s'assurer que shops est un tableau vide
        setShops([]);
      } finally {
        setLoading(false);
      }
    }

    fetchShops();
  }, [user, refreshToken]);

  // Rediriger si l'utilisateur n'est pas connecté
  if (!user) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          <AlertTriangle className="me-2" size={20} />
          Vous devez être connecté pour accéder à cette page.
          <Button 
            variant="link" 
            onClick={() => navigate('/sign-in', { state: { from: '/my-shops' } })}
          >
            Se connecter
          </Button>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
        <p className="mt-2">Chargement de vos boutiques...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Mes boutiques</h1>
        <Button 
          variant="primary" 
          as={Link} 
          to="/create-shop"
          className="d-flex align-items-center"
        >
          <Plus size={18} className="me-1" />
          Créer une boutique
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {!shops || shops.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <Store size={48} className="text-muted mb-3" />
            <h3>Vous n'avez pas encore de boutique</h3>
            <p className="text-muted">Créez votre première boutique pour commencer à vendre vos produits</p>
            <Button 
              variant="primary" 
              as={Link} 
              to="/create-shop"
              className="mt-3"
            >
              Créer une boutique
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {shops.map(shop => (
            <Col key={shop.id}>
              <Card className="h-100 shadow-sm hover-elevate">
                {shop.banner && (
                  <div style={{ height: '100px', overflow: 'hidden' }}>
                    <Card.Img 
                      variant="top" 
                      src={shop.banner} 
                      alt={shop.name}
                      style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x100?text=Banner';
                      }}
                    />
                  </div>
                )}
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex align-items-center mb-3">
                    {shop.logo ? (
                      <img 
                        src={shop.logo} 
                        alt={`Logo ${shop.name}`}
                        className="rounded-circle me-2"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/40?text=Logo';
                        }}
                      />
                    ) : (
                      <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px' }}>
                        <Store size={20} />
                      </div>
                    )}
                    <h5 className="card-title mb-0">{shop.name}</h5>
                  </div>
                  
                  {shop.shortDescription && (
                    <Card.Text className="text-muted mb-3">
                      {shop.shortDescription.length > 100 
                        ? `${shop.shortDescription.substring(0, 100)}...` 
                        : shop.shortDescription}
                    </Card.Text>
                  )}
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Badge 
                        bg={
                          shop.status === 'ACTIVE' ? 'success' : 
                          shop.status === 'PENDING' ? 'warning' : 
                          shop.status === 'SUSPENDED' ? 'danger' : 'secondary'
                        }
                      >
                        {shop.status === 'ACTIVE' ? 'Active' : 
                         shop.status === 'PENDING' ? 'En attente' : 
                         shop.status === 'SUSPENDED' ? 'Suspendue' : 
                         shop.status}
                      </Badge>
                      <small className="text-muted">
                        Créée le {formatDate(shop.createdAt)}
                      </small>
                    </div>
                    
                    <div className="d-flex gap-2">
                      <Button 
                        variant="outline-primary" 
                        as={Link}
                        to={`/seller/shops/${shop.id}`}
                        className="w-100"
                      >
                        Gérer
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        as={Link}
                        to={`/shops/${shop.slug}`}
                        className="w-100"
                        target="_blank"
                      >
                        Voir
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default MyShopsList;