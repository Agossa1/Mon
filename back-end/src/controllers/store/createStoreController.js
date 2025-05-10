import { validatorShopInput } from "../../validators/shop.js";
import prisma from "../../config/prisma.js";
import { logger } from "../../utils/logger.js";
import { generateSlug } from "../../utils/helpers.js";

/**
 * Crée une nouvelle boutique pour l'utilisateur authentifié
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON avec les détails de la boutique créée
 */
export const createStore = async (req, res) => {
    try {
        // Vérifier si l'utilisateur est connecté
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Vous devez être connecté pour effectuer cette action",
                error: "UNAUTHORIZED"
            });
        }

        // Récupérer les informations complètes de l'utilisateur depuis la base de données
        const userDetails = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { 
                profile: true 
            }
        });

        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur introuvable",
                error: "USER_NOT_FOUND"
            });
        }

        // Vérifier les données d'entrée (version simplifiée)
        const { error, value } = validatorShopInput.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: "Les données d'entrée sont invalides",
                errors: error.details.map(detail => detail.message)
            });
        }

        // Vérifier si une boutique avec le même nom existe déjà
        const existingShopName = await prisma.shop.findFirst({
            where: { name: value.name }
        });
        
        if (existingShopName) {
            return res.status(400).json({
                success: false,
                message: "Une boutique avec ce nom existe déjà",
                error: "SHOP_NAME_EXISTS"
            });
        }

        // Générer un slug unique basé sur le nom de la boutique
        const slug = await generateUniqueSlug(value.name);
        
        // Vérifier si l'utilisateur a déjà créé plus de 5 boutiques
        const userShopCount = await prisma.shop.count({
            where: { ownerId: req.user.id }
        });
        
        if (userShopCount >= 5) {
            return res.status(400).json({
                success: false,
                message: "Vous avez déjà créé le nombre maximum de boutiques autorisé (5)",
                error: "MAX_SHOPS_REACHED"
            });
        }

        // Extraire le nom et prénom de l'utilisateur depuis la base de données
        let firstName, lastName;
        
        // Si l'utilisateur a un profil avec prénom/nom définis, les utiliser
        if (userDetails.profile && userDetails.profile.firstName && userDetails.profile.lastName) {
            firstName = userDetails.profile.firstName;
            lastName = userDetails.profile.lastName;
        } 
        // Sinon, essayer d'extraire du fullName
        else if (userDetails.fullName) {
            const nameParts = userDetails.fullName.split(" ");
            if (nameParts.length >= 2) {
                firstName = nameParts[0];
                lastName = nameParts.slice(1).join(" ");
            } else {
                firstName = userDetails.fullName;
                lastName = "";
            }
        } 
        // Si aucune information n'est disponible, utiliser des valeurs par défaut
        else {
            firstName = "Propriétaire";
            lastName = "de la boutique";
        }

        // Préparer les données minimales pour la création de la boutique
        const shopData = {
            // Champs obligatoires fournis par l'utilisateur
            name: value.name,
            shopType: value.shopType || "INDIVIDUAL",
            category: value.category || "OTHER",
            
            // Informations du propriétaire récupérées automatiquement de la base de données
            ownerId: userDetails.id,
            firstName: firstName,
            lastName: lastName,
            email: userDetails.email,
            phone: userDetails.phone || null,
            
            // Informations optionnelles fournies par l'utilisateur
            description: value.description || null,
            shortDescription: value.shortDescription || null,
            
            // Valeurs par défaut pour les champs obligatoires
            slug,
            status: "PENDING",
            
            // Valeurs par défaut pour les tableaux
            subCategories: value.subCategories || [],
            tags: value.tags || [],
            languages: value.languages || ["fr"],
            
            // Valeurs par défaut pour les autres champs
            currency: value.currency || "EUR",
            timeZone: value.timeZone || "Europe/Paris",
            
            // Informations d'adresse depuis le profil utilisateur si disponibles
            address: userDetails.profile?.address || null,
            city: userDetails.profile?.city || null,
            state: userDetails.profile?.state || null,
            postalCode: userDetails.profile?.postalCode || null,
            country: userDetails.profile?.country || null,
        };

        // Créer la nouvelle boutique avec les données minimales
        const newShop = await prisma.shop.create({
            data: shopData
        });

        // Créer automatiquement un membre d'équipe pour le propriétaire
        await prisma.shopMember.create({
            data: {
                shopId: newShop.id,
                userId: userDetails.id,
                role: 'OWNER',
                isActive: true,
                permissions: { fullAccess: true }
            }
        });

        logger.info(`Nouvelle boutique créée: ${newShop.id}`, {
            userId: req.user.id,
            shopId: newShop.id,
            shopName: newShop.name
        });

        return res.status(201).json({
            success: true,
            message: "Boutique créée avec succès. Vous pouvez maintenant compléter votre profil de boutique.",
            shop: newShop,
            nextSteps: [
                "Ajouter un logo et une bannière",
                "Compléter les informations commerciales",
                "Configurer les méthodes de livraison et de paiement",
                "Ajouter des produits à votre catalogue"
            ]
        });
    } catch (error) {
        logger.error('Erreur lors de la création de la boutique:', {
            error: error.message,
            stack: error.stack,
            userId: req.user?.id
        });
        
        return res.status(500).json({
            success: false,
            message: "Erreur lors de la création de la boutique",
            error: process.env.NODE_ENV === 'development' ? error.message : "SERVER_ERROR"
        });
    }
};

/**
 * Génère un slug unique basé sur le nom de la boutique
 * @param {string} name - Nom de la boutique
 * @returns {Promise<string>} Slug unique
 */
async function generateUniqueSlug(name) {
    let slug = generateSlug(name);
    let isUnique = false;
    let counter = 0;
    
    while (!isUnique) {
        const existingSlug = await prisma.shop.findUnique({
            where: { slug: counter === 0 ? slug : `${slug}-${counter}` }
        });
        
        if (!existingSlug) {
            isUnique = true;
        } else {
            counter++;
        }
    }
    
    return counter === 0 ? slug : `${slug}-${counter}`;
}

