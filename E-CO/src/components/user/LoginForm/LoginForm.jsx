'use client'
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext.jsx';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [remainingAttempts, setRemainingAttempts] = useState(null);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [requiresVerification, setRequiresVerification] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError(null);
    setRemainingAttempts(null);
    setLockedUntil(null);
    setRequiresVerification(false);

    const response = await login({ email, password, rememberMe });

    if (response.success) {
      navigate('/');
    } else {
      const errorResponse = response;
      setError(errorResponse.message);
      
      if (errorResponse.remainingAttempts !== undefined) {
        setRemainingAttempts(errorResponse.remainingAttempts);
      }
      
      if (errorResponse.lockedUntil) {
        setLockedUntil(new Date(errorResponse.lockedUntil));
      }
      
      if (errorResponse.requiresVerification) {
        setRequiresVerification(true);
      }
    }
  };

  const getRemainingLockTime = () => {
    if (!lockedUntil) return '';
    
    const now = new Date();
    const diffMinutes = Math.ceil((lockedUntil.getTime() - now.getTime()) / 1000 / 60);
    
    return diffMinutes > 0 ? `(${diffMinutes} minute${diffMinutes > 1 ? 's' : ''})` : '';
  };

  const handleResendVerification = () => {
    // Implémentez ici la logique pour renvoyer l'email de vérification
    console.log("Renvoyer l'email de vérification");
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
          {remainingAttempts !== null && remainingAttempts > 0 && (
            <p className="mt-1 text-sm">
              Tentatives restantes : {remainingAttempts}
            </p>
          )}
          {lockedUntil && (
            <p className="mt-1 text-sm">
              Compte verrouillé. Réessayez plus tard {getRemainingLockTime()}.
            </p>
          )}
        </div>
      )}
      
      {requiresVerification && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-700 rounded-md">
          Votre compte n'est pas vérifié. Veuillez vérifier votre email pour activer votre compte.
          <div className="mt-2">
            <button 
              className="text-sm underline hover:text-yellow-800"
              onClick={handleResendVerification}
            >
              Renvoyer l'email de vérification
            </button>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Se souvenir de moi
            </label>
          </div>
          
          <div className="text-sm">
            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800">
              Mot de passe oublié?
            </Link>
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Vous n'avez pas de compte?{' '}
          <Link to="/sign-up" className="text-blue-600 hover:text-blue-800">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;