const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Service pour gérer les opérations liées aux boutiques
 */
export const shopService = {
  /**
   * Crée une nouvelle boutique
   * @param {Object} shopData - Données de la boutique à créer
   * @returns {Promise<Object>} - Réponse de l'API
   */
  createShop: async (shopData) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('Vous devez être connecté pour créer une boutique');
      }
      
      // Logs pour le débogage
      console.log('Création de boutique - données envoyées:', shopData);
      console.log('URL de l\'API:', `${API_URL}/shops`);
      
      const response = await fetch(`${API_URL}/shops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(shopData),
        credentials: 'include'
      });
      
      console.log('Statut de la réponse:', response.status);
      
      const data = await response.json();
      console.log('Données reçues:', data);
      
      if (!response.ok) {
        // Gestion spécifique des erreurs selon le code de statut
        if (response.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        } else if (response.status === 403) {
          throw new Error('Vous n\'avez pas les droits pour créer une boutique.');
        } else if (response.status === 400) {
          throw new Error(data.message || 'Données invalides pour la création de la boutique.');
        } else if (response.status === 409) {
          throw new Error(data.message || 'Une boutique avec ce nom existe déjà.');
        } else if (response.status === 404) {
          throw new Error('Ressource non trouvée. Vérifiez l\'URL de l\'API.');
        }
        
        throw new Error(data.message || 'Erreur lors de la création de la boutique');
      }
      
      console.log('Boutique créée avec succès:', data);
      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la boutique:', error);
      
      // Vérifier si l'erreur est liée à la connexion réseau
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
      }
      
      throw error;
    }
  },

  /**
   * Récupère les boutiques de l'utilisateur connecté
   * @returns {Promise<Object>} - Réponse de l'API
   */
  getMyShops: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('Vous devez être connecté pour accéder à vos boutiques');
      }
      
      // Correction de l'URL pour correspondre à la structure du backend
      // Essayons d'abord avec /shops/my-shops qui est plus standard
      console.log('Récupération des boutiques - URL:', `${API_URL}/shops/my-shops`);
      
      const response = await fetch(`${API_URL}/shops/my-shops`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      console.log('Statut de la réponse:', response.status);
      
      const data = await response.json();
      console.log('Données reçues:', data);
      
      if (!response.ok) {
        // Gestion spécifique des erreurs selon le code de statut
        if (response.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        } else if (response.status === 403) {
          throw new Error('Vous n\'avez pas les droits pour accéder à ces boutiques.');
        } else if (response.status === 404) {
          // Si l'URL /shops/my-shops n'existe pas, essayons avec l'URL originale
          console.log('URL non trouvée, essai avec l\'URL alternative:', `${API_URL}/seller/my-shops`);
          return await fallbackGetMyShops(token);
        }
        
        throw new Error(data.message || 'Erreur lors de la récupération des boutiques');
      }
      
      console.log('Boutiques récupérées avec succès:', data);
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des boutiques:', error);
      
      // Vérifier si l'erreur est liée à la connexion réseau
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
      }
      
      throw error;
    }
  }
};

/**
 * Fonction de secours pour récupérer les boutiques avec une URL alternative
 * @param {string} token - Token d'authentification
 * @returns {Promise<Object>} - Réponse de l'API
 */
async function fallbackGetMyShops(token) {
  try {
    const response = await fetch(`${API_URL}/seller/my-shops`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw new Error(data.message || 'Erreur lors de la récupération des boutiques');
    }
    
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des boutiques (fallback):', error);
    throw error;
  }
}