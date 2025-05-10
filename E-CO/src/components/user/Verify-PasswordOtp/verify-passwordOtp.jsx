'use client';

import { useState, useRef, useEffect } from 'react';
import { verifyPasswordResetOTP, requestPasswordReset } from '../../../services/api/PasswordServices-Api.js';

export default function VerifyOTPForm({ email, onVerified, onBack, onVerificationError }) {
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(120); // 2 minutes
  const inputRefs = useRef([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(0, 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  const otpCode = otp.join('');
  console.log('Données envoyées:', { email, otpCode });
  
  if (otpCode.length !== 6) {
    setError('Veuillez entrer le code complet à 6 chiffres');
    if (onVerificationError) {
      onVerificationError('Veuillez entrer le code complet à 6 chiffres');
    }
    return;
  }
  
  setIsLoading(true);
  setError(null);
  
  try {
    const result = await verifyPasswordResetOTP(email, otpCode);
    console.log('Réponse complète du serveur:', result);

    if (result.success) {
      if (result.data?.token) {
        onVerified(result.data.token);
      } else {
        console.error('Token manquant dans la réponse réussie');
        setError('Erreur de vérification. Veuillez réessayer.');
        if (onVerificationError) {
          onVerificationError('Erreur de vérification. Veuillez réessayer.');
        }
      }
    } else {
      let errorMessage;
      if (result.error === 'INVALID_OTP') {
        errorMessage = 'Code de vérification invalide ou expiré. Veuillez réessayer ou demander un nouveau code.';
      } else {
        errorMessage = result.message || 'Code de vérification invalide';
      }
      setError(errorMessage);
      if (onVerificationError) {
        onVerificationError(errorMessage);
      }
    }
  } catch (err) {
    console.error('Erreur détaillée:', err);
    let errorMessage = 'Une erreur est survenue lors de la vérification du code';
    if (err.message === 'INVALID_OTP') {
      errorMessage = 'Code OTP invalide ou expiré. Veuillez réessayer ou demander un nouveau code.';
    } else if (err.message === 'USER_NOT_FOUND') {
      errorMessage = 'Utilisateur non trouvé';
    } else if (err.response) {
      errorMessage = `Erreur ${err.response.status}: ${err.response.data.message || 'Erreur inconnue'}`;
    }
    setError(errorMessage);
    if (onVerificationError) {
      onVerificationError(errorMessage);
    }
  } finally {
    setIsLoading(false);
  }
};

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    setError(null);
    
    const messageElement = document.getElementById('status-message');
    if (messageElement) {
      messageElement.textContent = 'Envoi du nouveau code en cours...';
      messageElement.className = 'text-blue-600 text-center mb-2 animate-pulse';
    }
    
    try {
      const result = await requestPasswordReset(email);
      
      if (result.success) {
        setCountdown(120);
        setOtp(Array(6).fill(''));
        
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
        
        if (messageElement) {
          messageElement.textContent = 'Un nouveau code a été envoyé à votre adresse email';
          messageElement.className = 'text-green-600 text-center mb-2';
          
          setTimeout(() => {
            if (messageElement) {
              messageElement.textContent = countdown > 0 
                ? `Vous pourrez demander un nouveau code dans ${formatTime(countdown)}`
                : "Vous n'avez pas reçu de code?";
              messageElement.className = 'text-gray-600 mb-2';
            }
          }, 5000);
        }
      } else {
        let errorMessage = '';
        if (result.error === 'TOO_MANY_REQUESTS') {
          errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
          setCountdown(300);
        } else if (result.error === 'EMAIL_NOT_FOUND') {
          errorMessage = 'Adresse email non trouvée. Veuillez vérifier votre email.';
        } else {
          errorMessage = result.message || 'Impossible d\'envoyer un nouveau code';
        }
        
        setError(errorMessage);
        if (onVerificationError) {
          onVerificationError(errorMessage);
        }
      }
    } catch (err) {
      console.error('Erreur d\'envoi de code:', err);
      
      let errorMessage = 'Une erreur est survenue lors de l\'envoi du code';
      
      if (err instanceof Error) {
        if (err.message.includes('network') || err.message.includes('connection')) {
          errorMessage = 'Problème de connexion. Veuillez vérifier votre connexion internet.';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'La requête a pris trop de temps. Veuillez réessayer.';
        }
      }
      
      setError(errorMessage);
      if (onVerificationError) {
        onVerificationError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Vérification du code</h2>
      
      <p className="text-gray-600 text-center mb-6">
        Nous avons envoyé un code à 6 chiffres à <strong>{email}</strong>
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-12 h-12 text-center text-xl font-bold border rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              disabled={isLoading}
              autoFocus={index === 0}
            />
          ))}
        </div>
        
        {error && (
          <div className="text-red-500 text-center mb-4">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || otp.join('').length !== 6}
        >
          {isLoading ? 'Vérification...' : 'Vérifier le code'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p id="status-message" className="text-gray-600 mb-2">
          {countdown > 0 
            ? `Vous pourrez demander un nouveau code dans ${formatTime(countdown)}`
            : "Vous n'avez pas reçu de code?"}
        </p>
        
        <button
          type="button"
          onClick={handleResendCode}
          className={`text-blue-600 hover:text-blue-800 font-medium transition-all duration-300 ${
            countdown > 0 || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:underline'
          }`}
          disabled={countdown > 0 || isLoading}
          aria-disabled={countdown > 0 || isLoading}
          title={countdown > 0 ? `Attendre ${formatTime(countdown)} avant de renvoyer` : "Renvoyer le code de vérification"}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Envoi en cours...
            </span>
          ) : (
            "Renvoyer le code"
          )}
        </button>
      </div>
      
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 font-medium hover:underline"
        >
          Retour
        </button>
      </div>
    </div>
  );
}