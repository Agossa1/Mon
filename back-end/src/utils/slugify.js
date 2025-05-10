/**
 * Fonction pour convertir une chaîne en slug
 * @param {string} text - Texte à convertir en slug
 * @returns {string} Slug généré
 */
export const slugify = (text) => {
    return text
        .toString()
        .normalize('NFD')                   // Normaliser les caractères accentués
        .replace(/[\u0300-\u036f]/g, '')    // Supprimer les diacritiques
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')               // Remplacer les espaces par des tirets
        .replace(/[^\w-]+/g, '')            // Supprimer les caractères non alphanumériques
        .replace(/--+/g, '-')               // Remplacer les tirets multiples par un seul
        .replace(/^-+|-+$/g, '');           // Supprimer les tirets au début et à la fin
};
