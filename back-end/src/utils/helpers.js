import prisma from "../config/prisma.js";

/**
 * Convertit une chaîne en slug URL-friendly
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

/**
 * Génère un slug unique basé sur le nom de la boutique
 * @param {string} name - Nom de la boutique
 * @param {string} model - Nom du modèle Prisma ('shop', 'product', etc.)
 * @returns {Promise<string>} Slug unique
 */
export const generateSlug = async (name, model = 'shop') => {
    let slug = slugify(name);
    let isUnique = false;
    let counter = 0;
    let existingSlug;
    
    // Vérifier si le slug existe déjà dans la base de données
    while (!isUnique) {
        const currentSlug = counter === 0 ? slug : `${slug}-${counter}`;
        
        // Vérifier dans le modèle approprié
        switch (model) {
            case 'shop':
                existingSlug = await prisma.shop.findUnique({
                    where: { slug: currentSlug }
                });
                break;
            case 'product':
                existingSlug = await prisma.product.findUnique({
                    where: { slug: currentSlug }
                });
                break;
            case 'category':
                existingSlug = await prisma.category.findUnique({
                    where: { slug: currentSlug }
                });
                break;
            default:
                // Modèle par défaut est 'shop'
                existingSlug = await prisma.shop.findUnique({
                    where: { slug: currentSlug }
                });
        }

        if (!existingSlug) {
            isUnique = true;
            slug = currentSlug;
        } else {
            counter++;
        }
    }
    
    return slug;
};

/**
 * Génère un identifiant unique pour les commandes, produits, etc.
 * @param {string} prefix - Préfixe pour l'identifiant (ex: 'ORD', 'PRD')
 * @param {number} length - Longueur de la partie numérique
 * @returns {string} Identifiant unique
 */
export const generateUniqueId = (prefix = '', length = 8) => {
    const timestamp = Date.now().toString().slice(-4);
    const randomPart = Math.floor(Math.random() * Math.pow(10, length - 4))
        .toString()
        .padStart(length - 4, '0');
    return `${prefix}${timestamp}${randomPart}`;
};

/**
 * Formate un prix avec le symbole de devise
 * @param {number} price - Prix à formater
 * @param {string} currency - Code de devise (EUR, USD, etc.)
 * @returns {string} Prix formaté
 */
export const formatPrice = (price, currency = 'EUR') => {
    const formatter = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2
    });
    
    return formatter.format(price);
};

/**
 * Calcule la date d'expiration à partir d'une durée
 * @param {number} duration - Durée en jours
 * @returns {Date} Date d'expiration
 */
export const calculateExpiryDate = (duration = 30) => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + duration);
    return expiryDate;
};

/**
 * Tronque un texte à une longueur maximale
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @returns {string} Texte tronqué
 */
export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Vérifie si une chaîne est un UUID valide
 * @param {string} str - Chaîne à vérifier
 * @returns {boolean} True si c'est un UUID valide
 */
export const isValidUUID = (str) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
};