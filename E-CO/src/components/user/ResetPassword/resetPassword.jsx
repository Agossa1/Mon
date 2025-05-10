import React, { useState, useEffect } from 'react';
import { resetPassword } from '../../../services/api/PasswordServices-Api';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ResetPasswordForm = ({ onSuccess, onError }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [token, setToken] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedToken = urlParams.get('token');
        if (encodedToken) {
            try {
                // Décodage du token en utilisant decodeURIComponent
                const decodedToken = decodeURIComponent(encodedToken);
                console.log("Token décodé:", decodedToken);
                
                // Vérification basique du format du token
                if (decodedToken.startsWith('v3.local.')) {
                    // Stockage du token dans le state
                    setToken(decodedToken);
                } else {
                    throw new Error("Format de token invalide");
                }
            } catch (error) {
                console.error("Erreur lors du traitement du token:", error);
                setError("Token invalide ou mal formé");
            }
        } else {
            console.log("Aucun token trouvé dans l'URL");
            setError("Aucun token de réinitialisation trouvé");
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            setLoading(false);
            return;
        }

        if (!token) {
            setError("Token de réinitialisation manquant");
            setLoading(false);
            return;
        }

        try {
            const result = await resetPassword({
                password,
                confirmPassword,
                token
            });
            
            console.log("Résultat de la réinitialisation:", result);
            if (result.success) {
                setSuccess(result.message);
                if (onSuccess) onSuccess(result.message);
                
                // Afficher un message de succès pendant quelques secondes avant la redirection
                setTimeout(() => {
                    // Rediriger vers la page de connexion
                    navigate('/sign-in');
                }, 3000); // Redirection après 3 secondes
            } else {
                setError(result.message || "Une erreur est survenue lors de la réinitialisation du mot de passe");
                if (onError) onError(result.message);
            }
        } catch (error) {
            console.error("Erreur lors de la réinitialisation du mot de passe:", error);
            setError("Une erreur inattendue s'est produite. Veuillez réessayer.");
            if (onError) onError("Une erreur inattendue s'est produite");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <Form onSubmit={handleSubmit}>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && (
                            <Alert variant="success">
                                {success}
                                <div className="mt-2">
                                    Vous allez être redirigé vers la page de connexion dans quelques secondes...
                                </div>
                            </Alert>
                        )}
                        
                        <Form.Group className="mb-3" controlId="formPassword">
                            <Form.Label>Nouveau mot de passe</Form.Label>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Entrez votre nouveau mot de passe"
                                required
                                disabled={loading || success}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formConfirmPassword">
                            <Form.Label>Confirmer le mot de passe</Form.Label>
                            <Form.Control
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirmez votre nouveau mot de passe"
                                required
                                disabled={loading || success}
                            />
                        </Form.Group>

                        <Button 
                            variant="primary" 
                            type="submit" 
                            disabled={loading || success}
                        >
                            {loading ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
                        </Button>
                        
                        {success && (
                            <Button 
                                variant="link" 
                                className="ms-2"
                                onClick={() => navigate('/login')}
                            >
                                Aller à la connexion maintenant
                            </Button>
                        )}
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default ResetPasswordForm;