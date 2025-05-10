/**
 * Service pour gérer les requêtes liées à la réinitialisation de mot de passe
 */

// Function to check if the object is an API error
function isApiError(obj) {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'success' in obj &&
    typeof obj.success === 'boolean'
  );
}

// URL de base de l'API (à configurer dans les variables d'environnement)
const API_URL ='http://localhost:4000/api/users';

/**
 * Envoie une demande de réinitialisation de mot de passe
 * @param {string} email - Email de l'utilisateur
 * @returns {Promise<Object>} Réponse de l'API
 */
export async function requestPasswordReset(email) {
  try {
    const request = { email };
    
    const response = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      credentials: 'include', // Inclure les cookies pour l'authentification si nécessaire
    });

    const data = await response.json();
    
    // Gérer les différents codes d'erreur HTTP
    if (!response.ok) {
      let errorCode = 'UNKNOWN_ERROR';
      let errorMessage = data.message || 'Une erreur est survenue';
      
      switch (response.status) {
        case 400:
          errorCode = data.error || 'INVALID_DATA';
          errorMessage = data.message || 'Données invalides';
          break;
        case 404:
          errorCode = 'EMAIL_NOT_FOUND';
          errorMessage = 'Adresse email non trouvée';
          break;
        case 429:
          errorCode = 'TOO_MANY_REQUESTS';
          errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
          break;
        case 500:
          errorCode = 'SERVER_ERROR';
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard';
          break;
      }
      
      return {
        success: false,
        message: errorMessage,
        error: errorCode,
        errors: data.errors
      };
    }
    
    // Si la réponse est OK mais que le serveur indique un échec
    if (!data.success) {
      return {
        success: false,
        message: data.message || 'La demande a échoué',
        error: data.error || 'REQUEST_FAILED',
        errors: data.errors
      };
    }
    
    // Réponse réussie
    return {
      success: true,
      message: data.message || 'Code de réinitialisation envoyé avec succès'
    };
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    
    // Si l'erreur est déjà formatée par notre API
    if (isApiError(error)) {
      return error;
    }
    
    // Gérer les erreurs réseau spécifiques
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('fetch') || 
          errorMessage.includes('network') || 
          errorMessage.includes('failed to fetch')) {
        return {
          success: false,
          message: 'Problème de connexion. Veuillez vérifier votre connexion internet',
          error: 'NETWORK_ERROR'
        };
      }
      
      if (errorMessage.includes('timeout')) {
        return {
          success: false,
          message: 'La requête a pris trop de temps. Veuillez réessayer',
          error: 'TIMEOUT_ERROR'
        };
      }
      
      return {
        success: false,
        message: error.message,
        error: 'CLIENT_ERROR'
      };
    }
    
    // Erreur inconnue
    return {
      success: false,
      message: 'Une erreur inattendue est survenue lors de la demande de réinitialisation',
      error: 'UNKNOWN_ERROR'
    };
  }
}

/**
 * Vérifie un code OTP pour la réinitialisation de mot de passe
 * @param {string} email - Email de l'utilisateur
 * @param {string} code - Code OTP à vérifier
 * @returns {Promise<Object>} Réponse contenant le token de réinitialisation
 */
export async function verifyPasswordResetOTP(email, code) {
  try {
    const response = await fetch(`${API_URL}/verify-password-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
      credentials: 'include',
    });

    const data = await response.json();
    console.log('Réponse complète du serveur:', data);

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Erreur de vérification',
        error: data.error,
        status: response.status
      };
    }

    // Changez cette partie pour vérifier resetToken au lieu de token
    if (!data.resetToken) {
      console.error('Token de réinitialisation manquant dans la réponse');
      return {
        success: false,
        message: 'Token de réinitialisation manquant dans la réponse',
        error: 'MISSING_RESET_TOKEN',
        status: response.status
      };
    }

    return {
      success: true,
      data: { token: data.resetToken } // Renommez resetToken en token pour la cohérence
    };
  } catch (error) {
    console.error('Erreur dans verifyPasswordResetOTP:', error);
    return {
      success: false,
      message: error.message,
      error: 'NETWORK_ERROR',
      status: 0
    };
  }
}
/**
 * Réinitialise le mot de passe avec un token valide
 * @param {string} password - Nouveau mot de passe
 * @param {string} token - Token de réinitialisation
 * @returns {Promise<Object>} Réponse de l'API
 */
export const resetPassword = async ({ password, confirmPassword, token }) => {
    try {
        console.log("Tentative de réinitialisation avec le token:", token.substring(0, 20) + "...");

        // Vérifiez si le token est une chaîne valide et commence par 'v3.local.'
      if (typeof token !== 'string' || token.length < 100 || !token.startsWith('v3.local.')) {
        console.error("Format de token invalide:", token);
        throw new Error('Format de token invalide');
      }


      console.log("Envoi de la requête de réinitialisation...");
        const response = await fetch(`${API_URL}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                password, 
                confirmPassword,
                token
            }),
            credentials: 'include',
        });

        const data = await response.json();
        console.log("Réponse du serveur:", data);

        if (!response.ok) {
            console.error("Erreur de réponse du serveur:", response.status, data);
            return {
                success: false,
                message: data.message || "Erreur lors de la réinitialisation du mot de passe",
                error: data.error || "SERVER_ERROR"
            };
        }

        if (!data.success) {
            console.warn("Le serveur a renvoyé une réponse de non-succès:", data);
            return {
                success: false,
                message: data.message || "La réinitialisation du mot de passe a échoué",
                error: data.error || "RESET_FAILED"
            };
        }

        return {
            success: true,
            message: data.message || "Mot de passe réinitialisé avec succès"
        };
    } catch (error) {
        console.error("Erreur lors de la réinitialisation du mot de passe:", error);
        return {
            success: false,
            message: error.message || "Une erreur est survenue lors de la communication avec le serveur",
            error: "RESET_PASSWORD_ERROR"
        };
    }
};
/**
 * Met à jour le mot de passe de l'utilisateur connecté
 * @param {Object} passwordData - Données pour la mise à jour du mot de passe
 * @param {string} token - Token d'authentification JWT
 * @returns {Promise<Object>} Réponse de l'API
 */
export const updatePassword = async (passwordData, token) => {
  try {
    // Validation côté client
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      return {
        success: false,
        message: 'Tous les champs sont requis',
        error: 'MISSING_FIELDS'
      };
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return {
        success: false,
        message: 'Le nouveau mot de passe et la confirmation ne correspondent pas',
        error: 'PASSWORDS_DO_NOT_MATCH'
      };
    }

    if (passwordData.newPassword.length < 8) {
      return {
        success: false,
        message: 'Le nouveau mot de passe doit contenir au moins 8 caractères',
        error: 'PASSWORD_TOO_WEAK'
      };
    }

    // Appel à l'API
    const response = await fetch(`${API_URL}/update-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(passwordData)
    });

    // Traitement de la réponse
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Une erreur est survenue lors de la mise à jour du mot de passe',
        error: data.error || 'API_ERROR'
      };
    }

    return {
      success: true,
      message: data.message || 'Votre mot de passe a été mis à jour avec succès'
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du mot de passe:', error);

    return {
      success: false,
      message: 'Une erreur est survenue lors de la communication avec le serveur',
      error: error instanceof Error ? error.message : 'NETWORK_ERROR'
    };
  }
};