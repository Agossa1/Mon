import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { shopService } from '../../services/shops/create-Shop-Api.js';

// Catégories disponibles pour les boutiques
const shopCategories = [
  { value: 'FASHION', label: 'Mode et Vêtements' },
  { value: 'ELECTRONICS', label: 'Électronique' },
  { value: 'HOME', label: 'Maison et Décoration' },
  { value: 'BEAUTY', label: 'Beauté et Bien-être' },
  { value: 'SPORTS', label: 'Sports et Loisirs' },
  { value: 'BOOKS', label: 'Livres et Médias' },
  { value: 'FOOD', label: 'Alimentation' },
  { value: 'HANDMADE', label: 'Artisanat' },
  { value: 'SERVICES', label: 'Services' },
  { value: 'OTHER', label: 'Autre' },
];

// Types de boutiques
const shopTypes = [
  { value: 'INDIVIDUAL', label: 'Individuel' },
  { value: 'COMPANY', label: 'Entreprise' },
  { value: 'ASSOCIATION', label: 'Association' },
  { value: 'OTHER', label: 'Autre' },
];

export default function CreateShopPage() {
  const { user, refreshToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // États du formulaire
  const [formData, setFormData] = useState({
    name: '',
    shopType: 'INDIVIDUAL',
    category: '',
    shortDescription: '',
    description: ''
  });
  
  // États pour la gestion des erreurs et du chargement
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Vérifier l'authentification au chargement du composant
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/sign-in', { state: { from: '/create-shop' } });
    }
  }, [isAuthenticated, navigate]);

  // Gestion des changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur pour ce champ si elle existe
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de la boutique est requis';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Le nom doit contenir au moins 3 caractères';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Le nom ne peut pas dépasser 50 caractères';
    }
    
    if (!formData.category) {
      newErrors.category = 'Veuillez sélectionner une catégorie';
    }
    
    if (formData.shortDescription && formData.shortDescription.length > 200) {
      newErrors.shortDescription = 'La description courte ne peut pas dépasser 200 caractères';
    }
    
    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'La description ne peut pas dépasser 2000 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Réinitialiser les messages
  setApiError(null);
  setSuccess(null);
  
  // Valider le formulaire
  if (!validateForm()) {
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    // Vérifier si refreshToken existe avant de l'appeler
    if (typeof refreshToken === 'function') {
      try {
        await refreshToken();
      } catch (refreshError) {
        console.warn('Impossible de rafraîchir le token:', refreshError);
        // Continuer malgré l'erreur de rafraîchissement
      }
    }
    
    const result = await shopService.createShop(formData);
    
    if (result && result.success) {
      setSuccess(result.message || 'Boutique créée avec succès!');
      
      // Rediriger vers la page de la boutique après 2 secondes
      setTimeout(() => {
        navigate(`/seller/shops/${result.data?.id || result.shop?.id}`);
      }, 2000);
    } else {
      throw new Error(result.message || 'Erreur lors de la création de la boutique');
    }
  } catch (err) {
    console.error('Erreur lors de la création de la boutique:', err);
    
    // Gérer les erreurs d'authentification spécifiquement
    if (err.message.includes('Session expirée') || err.message.includes('connecté')) {
      setApiError('Votre session a expiré. Veuillez vous reconnecter pour continuer.');
      
      // Rediriger vers la page de connexion après un court délai
      setTimeout(() => {
        navigate('/sign-in', { state: { from: '/create-shop' } });
      }, 3000);
    } else {
      setApiError(err.message || 'Une erreur est survenue lors de la création de la boutique');
    }
    
    window.scrollTo(0, 0); // Faire défiler vers le haut pour voir le message d'erreur
  } finally {
    setIsSubmitting(false);
  }
};

  // Vérifier si l'utilisateur est connecté
  if (!user) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          Vous devez être connecté pour créer une boutique.
          <Button variant="link" onClick={() => navigate('/sign-in', { state: { from: '/create-shop' } })}>
            Se connecter
          </Button>
        </Alert>
      </Container>
    );
  }



  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header as="h4" className="bg-primary text-white">
              Créer votre boutique
            </Card.Header>
            <Card.Body className="p-4">
              {apiError && <Alert variant="danger">{apiError}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom de la boutique*</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Entrez le nom de votre boutique"
                    isInvalid={!!errors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Choisissez un nom unique et mémorable pour votre boutique.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Type de boutique*</Form.Label>
                  <Form.Select
                    name="shopType"
                    value={formData.shopType}
                    onChange={handleChange}
                    isInvalid={!!errors.shopType}
                  >
                    {shopTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.shopType}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Catégorie principale*</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    isInvalid={!!errors.category}
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    {shopCategories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.category}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description courte</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    placeholder="Une brève description de votre boutique (max 200 caractères)"
                    isInvalid={!!errors.shortDescription}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.shortDescription}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    {formData.shortDescription.length}/200 caractères
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Description complète</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="description"
                                       value={formData.description}
                    onChange={handleChange}
                    placeholder="Décrivez votre boutique, vos produits et votre histoire"
                    isInvalid={!!errors.description}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    {formData.description.length}/2000 caractères
                  </Form.Text>
                </Form.Group>

                <div className="d-grid gap-2 mt-4">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Création en cours...' : 'Créer ma boutique'}
                  </Button>
                </div>
              </Form>
              
              <div className="mt-4">
                <h5>Prochaines étapes après la création :</h5>
                <ul className="text-muted">
                  <li>Ajouter un logo et une bannière pour votre boutique</li>
                  <li>Compléter les informations commerciales et légales</li>
                  <li>Configurer les méthodes de livraison et de paiement</li>
                  <li>Ajouter vos premiers produits</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}