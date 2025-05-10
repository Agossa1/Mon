import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../../services/api/register-Api';
import CustomModal from '../../common/Modal/Modal';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import { sha256 } from 'js-sha256';
import { Toast, ToastContainer } from 'react-bootstrap';

const RegisterForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [contactMethod, setContactMethod] = useState('email');
    const [fieldErrors, setFieldErrors] = useState({});
    const [showModal, setShowModal] = useState(false);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFieldErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    }, []);

    const handleContactMethodChange = useCallback((method) => {
        setContactMethod(method);
        setFormData(prev => ({
            ...prev,
            [method === 'email' ? 'phone' : 'email']: ''
        }));
        setFieldErrors(prev => {
            const { email: _, phone: __, ...rest } = prev;
            return rest;
        });
    }, []);

    const validateForm = useCallback(() => {
        const newFieldErrors = {};

        if (!formData.fullName?.trim()) {
            newFieldErrors.fullName = 'Le nom est requis';
        }
        if (formData.password !== formData.confirmPassword) {
            newFieldErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }
        if (contactMethod === 'email' && !formData.email) {
            newFieldErrors.email = 'L\'adresse email est requise';
        }
        if (contactMethod === 'phone' && !formData.phone) {
            newFieldErrors.phone = 'Le numéro de téléphone est requis';
        }

        setFieldErrors(newFieldErrors);
        return Object.keys(newFieldErrors).length === 0;
    }, [formData, contactMethod]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!validateForm()) return;

        setLoading(true);

        try {
            const result = await registerUser(formData);

            if (result.success) {
                setSuccess(true);
                setShowModal(true);
                console.log(`Utilisateur créé avec l'ID: ${result.user.id}`);
            } else {
                throw new Error(result.message || 'Une erreur est survenue lors de l\'inscription.');
            }
        } catch (err) {
            handleError(err);
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = useCallback(() => {
        setShowModal(false);
        setSuccess(false);
        setError(null);
    }, []);

  const handleContinueAfterRegistration = useCallback(() => {
    const verificationId = uuidv4();

    if ((contactMethod === 'email' && formData.email) || (contactMethod === 'phone' && formData.phone)) {
        const valueToStore = contactMethod === 'email' ? formData.email : formData.phone;

        localStorage.setItem(verificationId, JSON.stringify({
            v: valueToStore,
            m: contactMethod
        }));

        navigate(`/verify?id=${verificationId}&m=${contactMethod}&v=${encodeURIComponent(valueToStore)}&email=${encodeURIComponent(formData.email)}`);
    } else {
        navigate('/');
    }
    handleCloseModal();
}, [navigate, contactMethod, formData.email, formData.phone, handleCloseModal]);

   const handleError = useCallback((err) => {
        if (err.data && err.data.message) {
            switch (err.data.message) {
                case 'Un compte avec ces informations existe déjà.':
                    setError('Un compte avec ces informations existe déjà. Veuillez utiliser une autre adresse email ou numéro de téléphone.');
                    break;
                case 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion ou réessayer plus tard.':
                    setError('Impossible de se connecter au serveur. Veuillez vérifier votre connexion ou réessayer plus tard.');
                    break;
                default:
                    setError(err.data.message);
            }
        } else if (err.errors && Array.isArray(err.errors)) {
            const newFieldErrors = {};
            err.errors.forEach(errorMsg => {
                const errorLower = errorMsg.toLowerCase();
                if (errorLower.includes('fullname')) newFieldErrors.fullName = errorMsg;
                else if (errorLower.includes('email')) newFieldErrors.email = errorMsg;
                else if (errorLower.includes('phone')) newFieldErrors.phone = errorMsg;
                else if (errorLower.includes('password') && errorLower.includes('confirm')) newFieldErrors.confirmPassword = errorMsg;
                else if (errorLower.includes('password')) newFieldErrors.password = errorMsg;
                else setError(prev => prev ? `${prev}\n${errorMsg}` : errorMsg);
            });
            setFieldErrors(newFieldErrors);
        } else {
            setError(err.message || 'Une erreur inattendue est survenue lors de l\'inscription');
        }
    }, []);

    const handleGoToLogin = useCallback(() => {
       navigate('/sign-in');
    }, [navigate]);

    return (
        <div className="container-fluid mt-3 mt-md-5">
            <div className="row justify-content-center">
                <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
                    <div className="card shadow">
                        <div className="card-body p-3 p-md-4">
                            <h2 className="card-title text-center mb-4">Inscription</h2>

                            <form onSubmit={handleSubmit}>
                                {/* Nom complet */}
                                <div className="mb-3">
                                    <label htmlFor="fullName" className="form-label">Nom complet</label>
                                    <input
                                        type="text"
                                        className={`form-control ${fieldErrors.fullName ? 'is-invalid' : ''}`}
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        placeholder="Votre nom complet"
                                    />
                                    {fieldErrors.fullName && <div className="invalid-feedback">{fieldErrors.fullName}</div>}
                                </div>

                                {/* Choix de la méthode de contact */}
                                <div className="mb-3">
                                    <label className="form-label d-block">Comment souhaitez-vous vous connecter?</label>
                                    <div className="btn-group w-100" role="group">
                                        <button
                                            type="button"
                                            onClick={() => handleContactMethodChange('email')}
                                            className={`btn ${contactMethod === 'email' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            disabled={loading}
                                        >
                                            Email
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleContactMethodChange('phone')}
                                            className={`btn ${contactMethod === 'phone' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            disabled={loading}
                                        >
                                            Téléphone
                                        </button>
                                    </div>
                                </div>

                                {/* Champ Email ou Téléphone selon le choix */}
                                {contactMethod === 'email' ? (
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Adresse email</label>
                                        <input
                                            type="email"
                                            className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                            placeholder="exemple@domaine.com"
                                        />
                                        {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
                                    </div>
                                ) : (
                                    <div className="mb-3">
                                        <label htmlFor="phone" className="form-label">Numéro de téléphone</label>
                                        <input
                                            type="tel"
                                            className={`form-control ${fieldErrors.phone ? 'is-invalid' : ''}`}
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                            placeholder="+33 6 12 34 56 78"
                                        />
                                        {fieldErrors.phone && <div className="invalid-feedback">{fieldErrors.phone}</div>}
                                    </div>
                                )}

                                {/* Mot de passe */}
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Mot de passe</label>
                                    <input
                                        type="password"
                                        className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        placeholder="Votre mot de passe"
                                    />
                                    {fieldErrors.password && <div className="invalid-feedback">{fieldErrors.password}</div>}
                                    <small className="form-text text-muted">
                                        Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.
                                    </small>
                                </div>

                                {/* Confirmation du mot de passe */}
                                <div className="mb-4">
                                    <label htmlFor="confirmPassword" className="form-label">Confirmer le mot de passe</label>
                                    <input
                                        type="password"
                                        className={`form-control ${fieldErrors.confirmPassword ? 'is-invalid' : ''}`}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        placeholder="Confirmez votre mot de passe"
                                    />
                                    {fieldErrors.confirmPassword && <div className="invalid-feedback">{fieldErrors.confirmPassword}</div>}
                                </div>

                                <div className="d-grid">
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Inscription en cours...
                                            </>
                                        ) : (
                                            "S'inscrire"
                                        )}
                                                                       </button>
                                </div>
                            </form>

                            <div className="mt-3 text-center">
                                <p>Vous avez déjà un compte ? <button className="btn btn-link p-0" onClick={handleGoToLogin}>Connectez-vous</button></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal pour afficher les messages de succès ou d'erreur */}
            {/* Modal pour afficher les messages de succès ou d'erreur */}


{/* Modal pour afficher les messages de succès ou d'erreur */}
<CustomModal
  show={showModal}
  onHide={handleCloseModal}
  title={success ? "Inscription réussie" : "Erreur d'inscription"}
  variant={success ? "success" : "danger"}
>
  <div className="text-center">
    {success ? (
      <>
        <div className="d-flex justify-content-center mb-3">
          <FaCheckCircle size={50} className="text-success" />
        </div>
        <h4 className="mb-3">Votre compte a été créé avec succès.</h4>
        {contactMethod === 'email' && (
          <p className="mb-3">Un email de vérification a été envoyé à votre adresse. Veuillez vérifier votre boîte de réception.</p>
        )}
        <button
          className="btn btn-success"
          onClick={handleContinueAfterRegistration}
        >
          Continuer vers la vérification
        </button>
      </>
    ) : (
      <>
        <div className="d-flex flex-column align-items-center mb-3">
          <FaExclamationTriangle size={50} className="text-danger mb-2" />
          <p>{error}</p>
        </div>
        <button
          className="btn btn-outline-danger"
          onClick={handleCloseModal}
        >
          Fermer
        </button>
      </>
    )}
  </div>
</CustomModal>
            <ToastContainer position="top-end" className="p-3">
    <Toast
        show={!!error && !showModal}
        onClose={() => setError(null)}
        delay={5000}
        autohide
        bg="danger"
        text="white"
    >
        <Toast.Header closeButton={false} className="bg-danger text-white border-0">
            <div className="d-flex align-items-center justify-content-between w-100">
                <div className="d-flex align-items-center">
                    <FaExclamationTriangle className="me-2" />
                    <strong>Erreur</strong>
                </div>
                <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setError(null)}
                    aria-label="Fermer"
                />
            </div>
        </Toast.Header>
        <Toast.Body>{error}</Toast.Body>
    </Toast>
</ToastContainer>
        </div>
    );
};

export default RegisterForm;