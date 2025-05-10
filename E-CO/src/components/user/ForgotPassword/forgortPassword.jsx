import React, { useState } from 'react';
import { requestPasswordReset } from '../../../services/api/PasswordServices-Api.js';
import VerifyOTPForm from '../../../components/user/Verify-PasswordOtp/verify-passwordOtp';
import { Alert } from 'react-bootstrap';

const ForgotPassword = () => {
  const [formState, setFormState] = useState({
    email: '',
    isLoading: false,
    message: { type: '', text: '' },
    emailError: ''
  });

  const [currentStep, setCurrentStep] = useState('request');
  const [, setResetToken] = useState('');

  const validateEmail = (email) => {
    if (!email.trim()) {
      setFormState(prev => ({ ...prev, emailError: "L'email est requis" }));
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormState(prev => ({ 
        ...prev, 
        emailError: "Veuillez entrer une adresse email valide" 
      }));
      return false;
    }
    
    setFormState(prev => ({ ...prev, emailError: '' }));
    return true;
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setFormState(prev => ({ ...prev, email: newEmail }));
    
    if (formState.emailError) {
      validateEmail(newEmail);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(formState.email)) {
      return;
    }
    
    setFormState(prev => ({ 
      ...prev, 
      isLoading: true,
      message: { type: '', text: '' }
    }));
    
    try {
      const response = await requestPasswordReset(formState.email);
      
      if (response.success) {
        setFormState(prev => ({
          ...prev,
          isLoading: false,
          message: {
            type: 'success',
            text: response.message
          }
        }));
        
        setTimeout(() => {
          setCurrentStep('verify');
        }, 1500);
      } else {
        setFormState(prev => ({
          ...prev,
          isLoading: false,
          message: {
            type: 'danger',
            text: response.message || "Une erreur est survenue"
          }
        }));
      }
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation:', error);
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        message: {
          type: 'danger',
          text: "Une erreur inattendue s'est produite. Veuillez réessayer."
        }
      }));
    }
  };

 const handleOTPVerified = (token) => {
  setResetToken(token);
  const encodedToken = encodeURIComponent(token);
  window.location.href = `/reset-password?token=${encodedToken}`;
};

  const handleBack = () => {
    if (currentStep === 'verify') {
      setCurrentStep('request');
    }
  };

  if (currentStep === 'verify') {
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card mt-5">
              <div className="card-body">
                <h2 className="card-title text-center mb-4">Vérification du code</h2>
                <p className="text-center text-muted mb-4">
                  Veuillez entrer le code de vérification envoyé à <strong>{formState.email}</strong>
                </p>
                <VerifyOTPForm
                  email={formState.email} 
                  onVerified={handleOTPVerified} 
                  onBack={handleBack}
                  type="password-reset"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card mt-5">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Mot de passe oublié</h2>
              
              {formState.message.text && (
                <Alert variant={formState.message.type} className="mb-4">
                  {formState.message.text}
                </Alert>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Adresse email</label>
                  <input
                    id="email"
                    type="email"
                    className={`form-control ${formState.emailError ? 'is-invalid' : ''}`}
                    value={formState.email}
                    onChange={handleEmailChange}
                    placeholder="Entrez votre adresse email"
                    disabled={formState.isLoading}
                  />
                  {formState.emailError && (
                    <div className="invalid-feedback">{formState.emailError}</div>
                  )}
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={formState.isLoading}
                >
                  {formState.isLoading ? 'Envoi en cours...' : 'Réinitialiser mon mot de passe'}
                </button>
                
                <div className="text-center mt-3">
                  <a href="/sign-in" className="text-decoration-none">
                    Retour à la connexion
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;