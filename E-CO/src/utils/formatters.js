/**
 * Formate une date en format lisible
 * @param {string|Date} dateString - La date à formater
 * @param {Object} options - Options de formatage
 * @returns {string} Date formatée
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }
    
    const defaultOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...options
    };
    
    return new Intl.DateTimeFormat('fr-FR', defaultOptions).format(date);
  } catch (error) {
    console.error('Erreur de formatage de date:', error);
    return 'Erreur de date';
  }
};

/**
 * Formate un prix avec le symbole de devise
 * @param {number} amount - Le montant à formater
 * @param {string} currency - Le code de la devise (EUR, USD, etc.)
 * @returns {string} Prix formaté
 */
export const formatPrice = (amount, currency = 'EUR') => {
  if (amount === undefined || amount === null) return '';
  
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    console.error('Erreur de formatage de prix:', error);
    return `${amount} ${currency}`;
  }
};

/**
 * Tronque un texte à une longueur maximale
 * @param {string} text - Le texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @returns {string} Texte tronqué
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}...`;
};