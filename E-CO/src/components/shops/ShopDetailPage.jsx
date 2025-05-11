import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { getShopBySlug } from '../../services/shops/getShops';

const ShopDetailPage = () => {
  const { slug } = useParams();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {
  async function fetchShopDetails() {
    if (!slug) {
      setError('Identifiant de boutique manquant');
      setLoading(false);
      return;
    }

    try {
      console.log(`Tentative de récupération de la boutique avec le slug: ${slug}`);
      const response = await getShopBySlug(slug);
      
      console.log('Réponse reçue:', response);
      
      if (response.success && response.shop) {
        setShop(response.shop);
      } else {
        setError(response.message || 'Impossible de charger les détails de la boutique');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des détails de la boutique:', err);
      
      // Message d'erreur plus spécifique
      if (err.message.includes('404')) {
        setError(`La boutique "${slug}" n'a pas été trouvée. Vérifiez l'URL et réessayez.`);
      } else {
        setError(`Une erreur est survenue: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  fetchShopDetails();
}, [slug]);
  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
        <p className="mt-2">Chargement des détails de la boutique...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  if (!shop) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          Boutique introuvable.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h1>{shop.name}</h1>
            </Card.Header>
            <Card.Body>
              {shop.description && (
                <div className="mb-4">
                  <h5>Description</h5>
                  <p>{shop.description}</p>
                </div>
              )}
              
              {shop.category && (
                <div className="mb-3">
                  <h5>Catégorie</h5>
                  <p>{shop.category}</p>
                </div>
              )}
              
              {/* Ajoutez d'autres détails de la boutique selon vos besoins */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ShopDetailPage;