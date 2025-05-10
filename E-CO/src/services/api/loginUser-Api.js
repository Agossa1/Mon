const API_URL = 'http://localhost:4000/api/users';

/**
 * Authentifie un utilisateur
 * @param {Object} credentials - Informations de connexion
 * @returns {Promise<Object>} Réponse de l'API
 */
export async function login(credentials) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    // Vérifier si la réponse est un succès HTTP
    if (!response.ok) {
      // Gérer les différents codes d'erreur HTTP
      if (response.status === 401) {
        return {
          success: false,
          message: data.message || 'Email ou mot de passe incorrect',
          error: data.error || 'INVALID_CREDENTIALS'
        };
      } else if (response.status === 404) {
        return {
          success: false,
          message: 'Utilisateur non trouvé',
          error: 'USER_NOT_FOUND'
        };
      } else if (response.status === 429) {
        return {
          success: false,
          message: 'Trop de tentatives de connexion. Veuillez réessayer plus tard.',
          error: 'TOO_MANY_REQUESTS'
        };
      } else {
        return {
          success: false,
          message: data.message || 'Une erreur est survenue lors de la connexion',
          error: data.error || 'UNKNOWN_ERROR'
        };
      }
    }

    if (data.success) {
      // Stocker les tokens et les infos utilisateur
      localStorage.setItem('accessToken', data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.tokens.refreshToken);
      
      // Stocker uniquement les informations non sensibles de l'utilisateur
      const safeUserData = {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.fullName || data.user.name,
        role: data.user.role,
        emailVerified: data.user.emailVerified
      };
      localStorage.setItem('user', JSON.stringify(safeUserData));
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    
    // Erreur réseau ou autre
    return {
      success: false,
      message: 'Erreur de connexion au serveur. Veuillez vérifier votre connexion internet.',
      error: 'NETWORK_ERROR'
    };
  }
}

/**
 * Vérifie si l'utilisateur est authentifié
 * @returns {boolean}
 */
export function isAuthenticated() {
  if (typeof window === 'undefined') return false; // Pour le SSR
  const token = localStorage.getItem('accessToken');
  return !!token;
}

/**
 * Récupère l'utilisateur actuellement connecté
 * @returns {Object|null}
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') return null; // Pour le SSR
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Déconnecte l'utilisateur
 */
export function logout() {
  if (typeof window === 'undefined') return; // Pour le SSR
  
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

/**
 * Ajoute le token d'authentification aux en-têtes de la requête
 * @returns {Object}
 */
export function getAuthHeaders() {
  if (typeof window === 'undefined') return { 'Content-Type': 'application/json' }; // Pour le SSR
  
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
}

/**
 * Effectue une requête authentifiée
 * @param {string} url - URL de la requête
 * @param {Object} options - Options de la requête
 * @returns {Promise<any>}
 */
export async function fetchWithAuth(url, options = {}) {
  const headers = getAuthHeaders();
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
}