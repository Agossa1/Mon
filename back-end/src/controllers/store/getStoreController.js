import prisma from "../../config/prisma.js";
import { logger } from "../../utils/logger.js";

/**
 * Fonction utilitaire pour construire les options d'inclusion
 * @param {Object} options - Options pour contrôler les inclusions
 * @returns {Object} Options d'inclusion pour Prisma
 */
function buildIncludeOptions(options) {
    const {
        includeProducts = false,
        includeOrders = false,
        includeOwner = true,
        includeStats = true,
        productLimit = 10,
        orderLimit = 10
    } = options;

    const include = {};

    // Produits récents (version optimisée)
    if (includeProducts) {
        include.products = {
            take: productLimit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                price: true,
                mainImage: true,
                status: true,
                createdAt: true
            }
        };
    }

    // Commandes récentes (version optimisée)
    if (includeOrders) {
        include.orders = {
            take: orderLimit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                orderNumber: true,
                status: true,
                totalAmount: true,
                createdAt: true
            }
        };
    }

    // Propriétaire de la boutique (version optimisée)
    if (includeOwner) {
        include.owner = {
            select: {
                id: true,
                fullName: true,
                profileImage: true
            }
        };
    }

    // Statistiques (version optimisée)
    if (includeStats) {
        include._count = {
            select: {
                products: true,
                orders: true
            }
        };
    }

    return include;
}

/**
 * Récupère une boutique par son ID
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON avec les détails de la boutique
 */
export const getShopById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "L'ID de la boutique est requis",
                error: "MISSING_ID"
            });
        }

        // Récupérer la boutique avec des informations limitées
        const shop = await prisma.shop.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                slug: true,
                shopType: true,
                description: true,
                shortDescription: true,
                logo: true,
                banner: true,
                colors: true,
                category: true,
                subCategories: true,
                tags: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                website: true,
                socialMedia: true,
                address: true,
                city: true,
                state: true,
                postalCode: true,
                country: true,
                coordinates: true,
                currency: true,
                languages: true,
                timeZone: true,
                status: true,
                featured: true,
                verified: true,
                createdAt: true,
                updatedAt: true,
                ownerId: true,
                rating: true,
                reviewCount: true,
                salesCount: true,
                productCount: true,
                followerCount: true
            }
        });

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: "Boutique non trouvée",
                error: "SHOP_NOT_FOUND"
            });
        }

        // Vérifier si la boutique est active ou si l'utilisateur est autorisé à la voir
        const isActive = shop.status === 'ACTIVE';
        const isOwner = req.user && req.user.id === shop.ownerId;
        const isAdmin = req.user && req.user.role === 'ADMIN';

        if (!isActive && !isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Cette boutique n'est pas encore active",
                error: "SHOP_NOT_ACTIVE"
            });
        }

        logger.info(`Boutique récupérée avec succès: ${shop.name}`);

        return res.status(200).json({
            success: true,
            message: "Boutique récupérée avec succès",
            data: shop
        });
    } catch (error) {
        logger.error(`Erreur lors de la récupération de la boutique: ${error.message}`, {
            error: error.stack
        });

        return res.status(500).json({
            success: false,
            message: "Une erreur est survenue lors de la récupération de la boutique",
            error: process.env.NODE_ENV === 'development' ? error.message : "SERVER_ERROR"
        });
    }
};

/**
 * Récupère toutes les boutiques avec filtrage et pagination
 * @param {Object} filters - Filtres à appliquer
 * @param {Object} pagination - Options de pagination
 * @returns {Object} Liste des boutiques et informations de pagination
 * @throws {Error} En cas d'erreur
 */
export const getAllShops = async (filters = {}, pagination = {}) => {
    try {
        const { status, category, featured, verified, search } = filters;
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;

        // Construction des conditions de filtrage
        const where = {};

        if (status) {
            where.status = status;
        }

        if (category) {
            where.category = category;
        }

        if (featured !== undefined) {
            where.featured = featured;
        }

        if (verified !== undefined) {
            where.verified = verified;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { shortDescription: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Calcul de l'offset pour la pagination
        const skip = (page - 1) * limit;

        // Récupération des boutiques avec pagination et tri (optimisée)
        const shops = await prisma.shop.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                shortDescription: true,
                category: true,
                featured: true,
                verified: true,
                createdAt: true,
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        profileImage: true
                    }
                },
                _count: {
                    select: {
                        products: true
                    }
                }
            }
        });

        // Compter le nombre total de boutiques pour la pagination
        const totalCount = await prisma.shop.count({ where });

        logger.info(`${shops.length} boutiques récupérées sur ${totalCount}`);

        return {
            shops,
            pagination: {
                page,
                limit,
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        };
    } catch (error) {
        logger.error('Erreur lors de la récupération des boutiques:', error);
        throw error;
    }
}


/**
 * Récupère une boutique par son slug
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
/**
 * Récupère une boutique par son slug
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const getShopBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        if (!slug) {
            return res.status(400).json({
                success: false,
                message: "Le slug de la boutique est requis",
                error: "MISSING_SLUG"
            });
        }

        logger.info(`Récupération de la boutique avec le slug: ${slug}`);

        // Vérifier d'abord si la boutique existe, quel que soit son statut
        const shopExists = await prisma.shop.findUnique({
            where: {
                slug: slug
            },
            select: {
                id: true,
                name: true,
                status: true,
                ownerId: true
            }
        });

        if (!shopExists) {
            logger.warn(`Boutique non trouvée avec le slug: ${slug}`);
            return res.status(404).json({
                success: false,
                message: "Boutique non trouvée",
                error: "SHOP_NOT_FOUND"
            });
        }

        // Vérifier si l'utilisateur est autorisé à voir une boutique non active
        const isAuthorized =
            shopExists.status === 'ACTIVE' ||
            (req.user && (
                req.user.role === 'ADMIN' ||
                req.user.id === shopExists.ownerId
            ));

        if (!isAuthorized) {
            logger.warn(`Boutique trouvée avec le slug: ${slug} mais son statut est: ${shopExists.status}`);
            return res.status(403).json({
                success: false,
                message: `Cette boutique n'est pas encore active`,
                error: "SHOP_NOT_ACTIVE",
                shopStatus: shopExists.status,
                shopName: shopExists.name,
                isOwner: req.user && req.user.id === shopExists.ownerId
            });
        }

        // Récupérer les détails complets de la boutique
        const shop = await prisma.shop.findUnique({
            where: {
                slug: slug
            },
            select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                banner: true,
                shortDescription: true,
                description: true,
                category: true,
                subCategories: true,
                tags: true,
                verified: true,
                featured: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                ownerId: true,
                rating: true,
                reviewCount: true,
                salesCount: true,
                productCount: true,
                followerCount: true
            }
        });

        logger.info(`Boutique récupérée avec succès: ${shop.name}`);

        return res.status(200).json({
            success: true,
            message: "Boutique récupérée avec succès",
            data: shop
        });
    } catch (error) {
        logger.error(`Erreur lors de la récupération de la boutique par slug: ${error.message}`, {
            error: error.stack
        });

        return res.status(500).json({
            success: false,
            message: "Une erreur est survenue lors de la récupération de la boutique",
            error: process.env.NODE_ENV === 'development' ? error.message : "SERVER_ERROR"
        });
    }
};
/**
 * Récupère les boutiques de l'utilisateur connecté
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON avec les boutiques de l'utilisateur
 */
export const getMyStores = async (req, res) => {
    try {
        // Vérifier si l'utilisateur est connecté
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Vous devez être connecté pour effectuer cette action",
                error: "UNAUTHORIZED"
            });
        }

        // Récupérer les boutiques dont l'utilisateur est propriétaire (optimisé)
        const ownedShops = await prisma.shop.findMany({
            where: {
                ownerId: req.user.id
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                shortDescription: true,
                status: true,
                category: true,
                createdAt: true,
                _count: {
                    select: {
                        products: true,
                        orders: true
                    }
                }
            }
        });

        // Récupérer les boutiques où l'utilisateur est membre d'équipe (optimisé)
        const memberShops = await prisma.shopMember.findMany({
            where: {
                userId: req.user.id,
                shop: {
                    ownerId: {
                        not: req.user.id
                    }
                }
            },
            select: {
                role: true,
                permissions: true,
                shop: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo: true,
                        shortDescription: true,
                        status: true,
                        category: true,
                        createdAt: true,
                        _count: {
                            select: {
                                products: true,
                                orders: true
                            }
                        }
                    }
                }
            }
        });

        // Transformer les données des boutiques où l'utilisateur est membre
        const formattedMemberShops = memberShops.map(membership => ({
            ...membership.shop,
            role: membership.role,
            permissions: membership.permissions
        }));

        // Ajouter le rôle "OWNER" aux boutiques dont l'utilisateur est propriétaire
        const formattedOwnedShops = ownedShops.map(shop => ({
            ...shop,
            role: 'OWNER',
            permissions: { fullAccess: true }
        }));

        // Combiner les deux types de boutiques
        const allShops = [...formattedOwnedShops, ...formattedMemberShops];

        // Journaliser l'accès
        logger.info(`Utilisateur ${req.user.id} a récupéré ses boutiques`, {
            userId: req.user.id,
            ownedShopsCount: ownedShops.length,
            memberShopsCount: memberShops.length
        });

        // Retourner les boutiques avec un message de succès
        return res.status(200).json({
            success: true,
            message: "Boutiques récupérées avec succès",
            data: {
                shops: allShops,
                counts: {
                    total: allShops.length,
                    owned: formattedOwnedShops.length,
                    member: formattedMemberShops.length
                }
            }
        });
    } catch (error) {
        logger.error(`Erreur lors de la récupération des boutiques de l'utilisateur:`, error);
        return res.status(500).json({
            success: false,
            message: "Une erreur est survenue lors de la récupération de vos boutiques",
            error: process.env.NODE_ENV === 'development' ? error.message : "SERVER_ERROR"
        });
    }
};

/**
 * Récupère les boutiques populaires ou recommandées
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const getFeaturedShops = async (req, res) => {
    try {
        const { limit = 6, category } = req.query;

        // Construire les conditions de filtrage
        const where = {
            status: 'ACTIVE',
                   featured: true
        };

        // Ajouter le filtre de catégorie si spécifié
        if (category) {
            where.category = category;
        }

        // Récupérer les boutiques mises en avant
        const featuredShops = await prisma.shop.findMany({
            where,
            take: parseInt(limit),
            orderBy: [
                { featured: 'desc' },
                { createdAt: 'desc' }
            ],
            select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                banner: true,
                shortDescription: true,
                category: true,
                verified: true,
                createdAt: true,
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        profileImage: true
                    }
                },
                _count: {
                    select: {
                        products: true,
                        reviews: true
                    }
                }
            }
        });

        logger.info(`${featuredShops.length} boutiques mises en avant récupérées`);

        return res.status(200).json({
            success: true,
            message: "Boutiques mises en avant récupérées avec succès",
            data: featuredShops
        });
    } catch (error) {
        logger.error('Erreur lors de la récupération des boutiques mises en avant:', error);
        return res.status(500).json({
            success: false,
            message: "Une erreur est survenue lors de la récupération des boutiques mises en avant",
            error: process.env.NODE_ENV === 'development' ? error.message : "SERVER_ERROR"
        });
    }
};