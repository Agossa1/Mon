'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as LoginService from "../services/api/loginUser-Api.js";

// Valeur par défaut du contexte
const defaultAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Création du contexte
const AuthContext = createContext(undefined);

/**
 * Provider d'authentification pour l'application
 */
export const AuthProvider = ({ children }) => {
  const [state, setState] = useState(defaultAuthState);
  const navigate = useNavigate();

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const initAuth = () => {
      const user = LoginService.getCurrentUser();
      const isAuthenticated = LoginService.isAuthenticated();

      setState({
        user,
        isAuthenticated,
        isLoading: false,
        error: null,
      });
    };

    initAuth();
  }, []);

  /**
   * Fonction de connexion
   */
  const login = async (credentials) => {
    setState({ ...state, isLoading: true, error: null });
    
    try {
      const response = await LoginService.login(credentials);
      
      if (response.success) {
        setState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setState({
          ...state,
          isLoading: false,
          error: response.message,
        });
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      
      setState({
        ...state,
        isLoading: false,
        error: errorMessage,
      });
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  /**
   * Fonction de déconnexion
   */
  const logout = () => {
    LoginService.logout();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    navigate('/login');
  };

  // Valeur exposée par le contexte
  const contextValue = {
    ...state,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personnalisé pour utiliser le contexte d'authentification
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  
  return context;
};