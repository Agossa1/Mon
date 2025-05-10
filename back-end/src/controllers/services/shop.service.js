// services/shop.service.js
import prisma from '../config/prisma.js';
import { logger } from '../utils/logger.js';

/**
 * Fonction pour convertir une chaîne en slug
 * @param {string} text - Texte à convertir en slug
 * @returns {string} Slug généré
 */
const slugify = (text) => {
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

exports.createShop = async (ownerId, data) => {
  // Vérifier si l'utilisateur existe
  const owner = await prisma.user.findUnique({ 
    where: { id: ownerId },
    select: { id: true, role: true }
  });
  
  if (!owner) throw new Error("Utilisateur non trouvé");
  
  // Vérifier si l'utilisateur a le droit de créer une boutique (ADMIN ou SELLER)
  if (owner.role !== 'ADMIN' && owner.role !== 'SELLER') {
    throw new Error("Vous n'avez pas les droits pour créer une boutique");
  }
  
  // Générer un slug si non fourni
  const slug = data.slug || slugify(data.name);
  
  // Vérifier si le nom ou le slug existe déjà
  const existing = await prisma.shop.findFirst({
    where: { OR: [{ name: data.name }, { slug }] }
  });
  
  if (existing) throw new Error("Une boutique avec ce nom ou ce slug existe déjà");
  
  // Extraire les données validées pour la création
  const {
    name,
    shopType,
    description,
    shortDescription,
    logo,
    banner,
    colors,
    category,
    subCategories,
    tags,
    firstName,
    lastName,
    dateOfBirth,
    identityType,
    identityNumber,
    identityDocument,
    businessName,
    taxId,
    registrationNumber,
    businessDocument,
    email,
    phone,
    website,
    socialMedia,
    address,
    city,
    state,
    postalCode,
    country,
    coordinates,
    currency,
    languages,
    timeZone,
    shippingMethods,
    shippingZones,
    paymentMethods,
    bankAccount
  } = data;
  
  // Créer la boutique avec les données validées
  try {
    const newShop = await prisma.shop.create({
      data: {
        name,
        slug,
        shopType,
        description,
        shortDescription,
        logo,
        banner,
        colors,
        category,
        subCategories: subCategories || [],
        tags: tags || [],
        ownerId,
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        identityType,
        identityNumber,
        identityDocument,
        identityVerified: false,
        businessName,
        taxId,
        registrationNumber,
        businessDocument,
        businessVerified: false,
        email,
        phone,
        website,
        socialMedia,
        address,
        city,
        state,
        postalCode,
        country,
        coordinates,
        currency: currency || "EUR",
        languages: languages || ["fr"],
        timeZone: timeZone || "Europe/Paris",
        shippingMethods,
        shippingZones,
        paymentMethods,
        bankAccount,
        status: 'PENDING',
        featured: false,
        verified: false
      }
    });
    
    // Créer automatiquement un membre d'équipe pour le propriétaire
    await prisma.shopMember.create({
      data: {
        shopId: newShop.id,
        userId: ownerId,
        role: 'OWNER',
        isActive: true,
        permissions: { fullAccess: true }
      }
    });
    
    // Journaliser la création de la boutique
    console.log(`Nouvelle boutique créée: ${newShop.name} (ID: ${newShop.id}) par l'utilisateur ${ownerId}`);
    
    return newShop;
  } catch (error) {
    console.error("Erreur lors de la création de la boutique:", error);
    
    // Gérer les erreurs spécifiques de Prisma
    if (error.code === 'P2002') {
      throw new Error("Une contrainte unique n'est pas respectée (nom ou slug)");
    } else if (error.code === 'P2003') {
      throw new Error("Une référence à une entité inexistante a été détectée");
    }
    
    // Relancer l'erreur pour qu'elle soit gérée par le contrôleur
    throw error;
  }
};

