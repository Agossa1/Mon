import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Card, ProgressBar } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext.jsx';
import {shopService}  from '../../services/shops/create-Shop-Api.js';

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

// Étapes du formulaire
const steps = [
  { id: 1, title: 'Informations de base' },
  { id: 2, title: 'Type et catégorie' },
  { id: 3, title: 'Description' },
  { id: 4, title: 'Confirmation' }
];

export default function CreateShopPage() {
  const { user, refreshToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  
  // États du formulaire
  const [formData, setFormData] = useState({
    name: '',
    shopType: 'INDIVIDUAL',
    category: '',
    shortDescription: '',
    description: '',
    // Champs optionnels supplémentaires qui correspondent au backend
    subCategories: [],
    tags: [],
    languages: ['fr'],
    currency: 'EUR',
    timeZone: 'Europe/Paris'
  });
  
  // États pour la gestion des erreurs et du chargement
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Vérifier l'authentification au chargement du composant
  useEffect(() => {
    // Donner un peu de temps pour que l'authentification soit vérifiée
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
      
      if (isAuthenticated === false) {
        navigate('/sign-in', { state: { from: '/create-shop' } });
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);
  
  // Si on vérifie encore l'authentification, afficher un indicateur de chargement
  if (isCheckingAuth) {
    return (
      <Container className="mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-2">Vérification de l'authentification...</p>
      </Container>
    );
  }

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

  // Validation du formulaire par étape
  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          newErrors.name = 'Le nom de la boutique est requis';
        } else if (formData.name.length < 3) {
          newErrors.name = 'Le nom doit contenir au moins 3 caractères';
        } else if (formData.name.length > 50) {
          newErrors.name = 'Le nom ne peut pas dépasser 50 caractères';
        }
        break;
      case 2:
        if (!formData.category) {
          newErrors.category = 'Veuillez sélectionner une catégorie';
        }
        break;
      case 3:
        if (formData.shortDescription && formData.shortDescription.length > 200) {
          newErrors.shortDescription = 'La description courte ne peut pas dépasser 200 caractères';
        }
        
        if (formData.description && formData.description.length > 2000) {
          newErrors.description = 'La description ne peut pas dépasser 2000 caractères';
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation complète du formulaire
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

  // Navigation entre les étapes
  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Réinitialiser les messages
    setApiError(null);
    setSuccess(null);
    
    // Valider le formulaire complet
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
      
      // Préparer les données à envoyer en s'assurant qu'elles correspondent au schéma attendu par le backend
      const shopData = {
        name: formData.name.trim(),
        shopType: formData.shopType || 'INDIVIDUAL',
        category: formData.category || 'OTHER',
        description: formData.description.trim() || null,
        shortDescription: formData.shortDescription.trim() || null,
        // Inclure les champs optionnels s'ils sont définis
        subCategories: formData.subCategories,
        tags: formData.tags,
        languages: formData.languages,
        currency: formData.currency,
        timeZone: formData.timeZone
      };
      
      console.log('Données à envoyer:', shopData);
      
      const result = await shopService.createShop(shopData);
      
      if (result && result.success) {
        setSuccess(result.message || 'Boutique créée avec succès!');
        
        // Rediriger vers la page de la boutique après 2 secondes
        setTimeout(() => {
          navigate(`/seller/shops/${result.shop?.id}`);
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
      } else if (err.message.includes('Une boutique avec ce nom existe déjà')) {
        // Erreur spécifique pour les noms de boutique déjà utilisés
        setErrors(prev => ({
          ...prev,
          name: 'Ce nom de boutique est déjà utilisé'
        }));
        setApiError('Une boutique avec ce nom existe déjà. Veuillez choisir un autre nom.');
        setCurrentStep(1); // Retourner à l'étape du nom
      } else if (err.message.includes('nombre maximum de boutiques')) {
        // Erreur spécifique pour le nombre maximum de boutiques
        setApiError('Vous avez atteint le nombre maximum de boutiques autorisé (5).');
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

     // Rendu du contenu en fonction de l'étape actuelle
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h4>Informations de base</h4>
            <Form.Group className="mb-4">
              <Form.Label>Nom de la boutique*</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Entrez le nom de votre boutique"
                isInvalid={!!errors.name}
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Le nom de votre boutique sera visible par tous les utilisateurs.
              </Form.Text>
            </Form.Group>
          </div>
        );
      
      case 2:
        return (
          <div>
            <h4>Type et catégorie</h4>
            <Form.Group className="mb-4">
              <Form.Label>Type de boutique*</Form.Label>
              <Form.Select
                name="shopType"
                value={formData.shopType}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                {shopTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Sélectionnez le type qui correspond le mieux à votre activité.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Catégorie principale*</Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                isInvalid={!!errors.category}
                disabled={isSubmitting}
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
              <Form.Text className="text-muted">
                Choisissez la catégorie principale de vos produits ou services.
              </Form.Text>
            </Form.Group>
          </div>
        );
      
      case 3:
        return (
          <div>
            <h4>Description</h4>
            <Form.Group className="mb-4">
              <Form.Label>Description courte</Form.Label>
              <Form.Control
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                placeholder="Résumez votre boutique en quelques mots"
                isInvalid={!!errors.shortDescription}
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">
                {errors.shortDescription}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                {formData.shortDescription.length}/200 caractères - Cette description apparaîtra dans les résultats de recherche.
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
                placeholder="Décrivez votre boutique, vos produits ou services..."
                isInvalid={!!errors.description}
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">
                {errors.description}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                {formData.description.length}/2000 caractères - Cette description apparaîtra sur la page de votre boutique.
              </Form.Text>
            </Form.Group>
          </div>
        );
      
      case 4:
        return (
          <div>
            <h4>Récapitulatif</h4>
            <Card className="mb-4">
              <Card.Body>
                <div className="mb-3">
                  <h5>Nom de la boutique</h5>
                  <p className="mb-0">{formData.name}</p>
                </div>
                
                <div className="mb-3">
                  <h5>Type de boutique</h5>
                  <p className="mb-0">{shopTypes.find(t => t.value === formData.shopType)?.label || formData.shopType}</p>
                </div>
                
                <div className="mb-4">
                  <h5>Catégorie</h5>
                  <p className="mb-0">{shopCategories.find(c => c.value === formData.category)?.label || formData.category}</p>
                </div>
                
                {formData.shortDescription && (
                  <div className="mb-3">
                    <h5>Description courte</h5>
                    <p className="mb-0">{formData.shortDescription}</p>
                  </div>
                )}
                
                {formData.description && (
                  <div className="mb-3">
                    <h5>Description complète</h5>
                    <p className="mb-0">{formData.description}</p>
                  </div>
                )}
              </Card.Body>
            </Card>
            
            <Alert variant="info">
              <Alert.Heading>Prêt à créer votre boutique ?</Alert.Heading>
              <p>
                En cliquant sur "Créer ma boutique", vous acceptez les conditions d'utilisation 
                et la politique de confidentialité de notre plateforme.
              </p>
              <p className="mb-0">
                Vous pourrez compléter votre profil de boutique après sa création.
              </p>
            </Alert>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <h2 className="mb-4 text-center">Créer une nouvelle boutique</h2>
          
          {/* Afficher les messages d'erreur ou de succès */}
          {apiError && (
            <Alert variant="danger" className="mb-4">
              <Alert.Heading>Erreur</Alert.Heading>
              <p>{apiError}</p>
            </Alert>
          )}
          
          {success && (
            <Alert variant="success" className="mb-4">
              <Alert.Heading>Succès!</Alert.Heading>
              <p>{success}</p>
              <div className="d-flex justify-content-center">
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Redirection...</span>
                </div>
                <span>Redirection en cours...</span>
              </div>
            </Alert>
          )}
          
          {/* Barre de progression */}
          <div className="mb-4">
            <ProgressBar now={(currentStep / steps.length) * 100} />
            <div className="d-flex justify-content-between mt-2">
              {steps.map((step) => (
                <div 
                  key={step.id} 
                  className={`text-center ${currentStep >= step.id ? 'text-primary' : 'text-muted'}`}
                  style={{ flex: 1 }}
                >
                  <small>{step.title}</small>
                </div>
              ))}
            </div>
          </div>
          
          <Card className="shadow-sm">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {renderStepContent()}
                
                <div className="d-flex justify-content-between mt-4">
                  {currentStep > 1 && (
                    <Button 
                      variant="outline-secondary" 
                      onClick={goToPreviousStep}
                      disabled={isSubmitting}
                    >
                      Précédent
                    </Button>
                  )}
                  
                  {currentStep < steps.length ? (
                    <Button 
                      variant="primary" 
                      onClick={goToNextStep}
                      disabled={isSubmitting}
                      className={currentStep > 1 ? '' : 'ms-auto'}
                    >
                      Suivant
                    </Button>
                  ) : (
                    <Button 
                      variant="success" 
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Création en cours...
                        </>
                      ) : (
                        'Créer ma boutique'
                      )}
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}