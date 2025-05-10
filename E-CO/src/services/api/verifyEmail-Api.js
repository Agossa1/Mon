const API_URL = 'http://localhost:4000/api/users';

/**
 * Vérifie l'email de l'utilisateur avec un code OTP
 * @param {string} email - Adresse email de l'utilisateur
 * @param {string} code - Code OTP
 * @returns {Promise<Object>} Réponse de vérification d'email
 * @throws {Object} ApiError en cas d'échec
 */
export const verifyEmailWithOtp = async (email, code) => {
  try {
    const response = await fetch(`${API_URL}/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        success: false,
        message: data.message || `Erreur ${response.status}: ${response.statusText}`,
        error: data.error,
      };
    }

    return data;
  } catch (error) {
    if (error && typeof error === 'object' && 'success' in error) {
      throw error;
    }
    
    throw {
      success: false,
      message: error instanceof Error ? error.message : 'Une erreur inconnue est survenue',
    };
  }
};

/**
 * Renvoie un code OTP de vérification à l'adresse email de l'utilisateur
 * @param {string} email - Adresse email de l'utilisateur
 * @returns {Promise<Object>} Réponse de renvoi du code de vérification
 * @throws {Object} ApiError en cas d'échec
 */
export const resendVerificationCode = async (email) => {
  try {
    const response = await fetch(`${API_URL}/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        success: false,
        message: data.message || `Erreur ${response.status}: ${response.statusText}`,
        error: data.error,
      };
    }

    return data;
  } catch (error) {
    if (error && typeof error === 'object' && 'success' in error) {
      throw error;
    }
    
    throw {
      success: false,
      message: error instanceof Error ? error.message : 'Une erreur inconnue est survenue',
    };
  }
};