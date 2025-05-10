import prisma from "../../config/prisma.js";
import { logger } from "../../utils/logger.js";

/**
 * Récupère une boutique par son ID avec des options de filtrage des relations
 * @param {string} id - ID de la boutique à récupérer
 * @param {Object} options - Options pour contrôler les inclusions
 * @returns {Object} Boutique trouvée
 * @throws {Error} Si la boutique n'est pas trouvée ou en cas d'erreur
 */
export const getShopById = async (id, options = {}) => {
    try {
        // Options par défaut pour les inclusions
        const {
            includeProducts = false,
            includeOrders = false,
            includeCustomers = false,
            includeOwner = true,
            includeMembers = true,
            includeStats = true,
            includeReviews = false,
            productLimit = 10,
            orderLimit = 10,
            reviewLimit = 5
        } = options;

        // Construction dynamique des inclusions selon les options
        const include = {};
        
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
        
        if (includeOrders) {
            include.orders = {
                take: orderLimit,
                orderBy: { createdAt: 'desc' }
            };
        }
        
        if (includeCustomers) {
            include.customers = true;
        }
        
        if (includeOwner) {
            include.owner = {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true
                }
            };
        }
        
        if (includeMembers) {
            include.members = {
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            profileImage: true
                        }
                    }
                }
            };
        }
        
        if (includeStats) {
            include.stats = true;
        }
        
        if (includeReviews) {
            include.reviews = {
                take: reviewLimit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            profileImage: true
                        }
                    }
                }
            };
        }

        // Récupération de la boutique avec les inclusions spécifiées
        const shop = await prisma.shop.findUnique({
            where: { id },
            include
        });

        if (!shop) {
            logger.warn(`Boutique non trouvée: ${id}`);
            throw new Error('Boutique introuvable');
        }

        logger.info(`Boutique récupérée: ${id}`);
        return shop;
    } catch (error) {
        logger.error(`Erreur lors de la récupération de la boutique ${id}:`, error);
        throw error;
    }
}

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
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        
        // Calcul de l'offset pour la pagination
        const skip = (page - 1) * limit;
        
        // Récupération des boutiques avec pagination et tri
        const shops = await prisma.shop.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
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
 * @param {string} slug - Slug de la boutique à récupérer
 * @param {Object} options - Options pour contrôler les inclusions
 * @returns {Object} Boutique trouvée
 * @throws {Error} Si la boutique n'est pas trouvée ou en cas d'erreur
 */
export const getShopBySlug = async (slug, options = {}) => {
    try {
        // Utiliser les mêmes options que getShopById
        const shop = await prisma.shop.findUnique({
            where: { slug },
            include: buildIncludeOptions(options)
        });

        if (!shop) {
            logger.warn(`Boutique non trouvée avec le slug: ${slug}`);
            throw new Error('Boutique introuvable');
        }

        logger.info(`Boutique récupérée par slug: ${slug}`);
        return shop;
    } catch (error) {
        logger.error(`Erreur lors de la récupération de la boutique par slug ${slug}:`, error);
        throw error;
    }
}

/**
 * Fonction utilitaire pour construire les options d'inclusion
 * @param {Object} options - Options pour contrôler les inclusions
 * @returns {Object} Options d'inclusion pour Prisma
 */
function buildIncludeOptions(options) {
    const {
        includeProducts = false,
        includeOrders = false,
        includeCustomers = false,
        includeOwner = true,
        includeMembers = true,
        includeStats = true,
        includeReviews = false,
        productLimit = 10,
        orderLimit = 10,
        reviewLimit = 5
    } = options;

    const include = {};
    
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
    
    if (includeOrders) {
        include.orders = {
            take: orderLimit,
            orderBy: { createdAt: 'desc' }
        };
    }
    
    if (includeCustomers) {
        include.customers = true;
    }
    
    if (includeOwner) {
        include.owner = {
            select: {
                id: true,
                fullName: true,
                email: true,
                profileImage: true
            }
        };
    }
    
    if (includeMembers) {
        include.members = {
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        profileImage: true
                    }
                }
            }
        };
    }
    
    if (includeStats) {
        include.stats = true;
    }
    
    if (includeReviews) {
        include.reviews = {
            take: reviewLimit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        profileImage: true
                    }
                }
            }
        };
    }
    
    return include;
}


// Cette fonction récupère toutes les boutiques créées par l'utilisateur actuellement connecté.
// Ces boutiques sont affichées sur son profil personnel, depuis lequel il peut accéder à chacune d'elles.

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

        // Récupérer les boutiques dont l'utilisateur est propriétaire
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
                banner: true,
                shortDescription: true,
                status: true,
                category: true,
                shopType: true,
                featured: true,
                verified: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        products: true,
                        orders: true
                    }
                }
            }
        });

        // Récupérer les boutiques où l'utilisateur est membre d'équipe (mais pas propriétaire)
        const memberShops = await prisma.shopMember.findMany({
            where: {
                userId: req.user.id,
                shop: {
                    ownerId: {
                        not: req.user.id // Exclure les boutiques dont l'utilisateur est déjà propriétaire
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
                        banner: true,
                        shortDescription: true,
                        status: true,
                        category: true,
                        shopType: true,
                        featured: true,
                        verified: true,
                        createdAt: true,
                        updatedAt: true,
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

        return res.status(200).json({
            success: true,
            message: "Boutiques récupérées avec succès",
            shops: {
                owned: formattedOwnedShops,
                member: formattedMemberShops,
                all: allShops
            },
            counts: {
                owned: formattedOwnedShops.length,
                member: formattedMemberShops.length,
                total: allShops.length
            }
        });
    } catch (error) {
        logger.error('Erreur lors de la récupération des boutiques de l\'utilisateur:', {
            error: error.message,
            stack: error.stack,
            userId: req.user?.id
        });

        return res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des boutiques",
            error: process.env.NODE_ENV === 'development' ? error.message : "SERVER_ERROR"
        });
    }
};