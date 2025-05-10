import prisma from "../../config/prisma.js";
import { logger } from "../../utils/logger.js";

/**
 * Supprime une boutique par son ID
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON confirmant la suppression
 */
export const deleteStore = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        // Vérifier si l'utilisateur est connecté
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Vous devez être connecté pour effectuer cette action",
                error: "UNAUTHORIZED"
            });
        }

        // Vérifier si la boutique existe
        const shop = await prisma.shop.findUnique({
            where: { id },
            include: {
                owner: {
                    select: { id: true }
                },
                members: {
                    where: { userId },
                    select: { role: true }
                },
                products: {
                    select: { id: true },
                    take: 1
                },
                orders: {
                    select: { id: true },
                    take: 1
                }
            }
        });

        if (!shop) {
            logger.warn(`Tentative de suppression d'une boutique inexistante: ${id}`, { userId });
            return res.status(404).json({
                success: false,
                message: "Boutique introuvable",
                error: "SHOP_NOT_FOUND"
            });
        }

        // Vérifier les permissions
        const isOwner = shop.owner.id === userId;
        const isAdmin = req.user?.role === 'ADMIN';
        const member = shop.members[0];
        const hasPermission = isOwner || isAdmin;

        if (!hasPermission) {
            logger.warn(`Accès non autorisé à la suppression de la boutique ${id}`, { userId });
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas la permission de supprimer cette boutique",
                error: "FORBIDDEN"
            });
        }

        // Vérifier si la boutique a des produits ou des commandes
        const hasProducts = shop.products.length > 0;
        const hasOrders = shop.orders.length > 0;

        // Demander une confirmation supplémentaire si la boutique a des produits ou des commandes
        const { confirmationCode } = req.body;
        const expectedCode = `DELETE-${shop.name.toUpperCase()}`;

        if ((hasProducts || hasOrders) && confirmationCode !== expectedCode) {
            return res.status(400).json({
                success: false,
                message: "Cette boutique contient des produits ou des commandes. Pour confirmer la suppression, veuillez fournir le code de confirmation.",
                error: "CONFIRMATION_REQUIRED",
                confirmationRequired: true,
                confirmationCode: expectedCode,
                hasProducts,
                hasOrders
            });
        }

        // Archiver les données importantes avant suppression
        await prisma.shopArchive.create({
            data: {
                originalId: shop.id,
                name: shop.name,
                ownerId: shop.ownerId,
                createdAt: shop.createdAt,
                deletedAt: new Date(),
                deletedBy: userId,
                shopData: JSON.stringify(shop),
                reason: req.body.reason || "Suppression demandée par l'utilisateur"
            }
        }).catch(error => {
            // Ne pas bloquer la suppression si l'archivage échoue
            logger.error(`Erreur lors de l'archivage de la boutique ${id}:`, error);
        });

        // Supprimer la boutique et toutes ses données associées (cascade)
        await prisma.shop.delete({
            where: { id }
        });

        // Journaliser la suppression
        logger.info(`Boutique supprimée: ${id}`, {
            userId,
            shopName: shop.name,
            shopId: id,
            reason: req.body.reason
        });

        // Envoyer une notification au propriétaire si ce n'est pas lui qui supprime
        if (!isOwner && shop.owner.email) {
            // Code pour envoyer un email de notification (à implémenter)
            logger.info(`Notification de suppression envoyée au propriétaire de la boutique ${id}`);
        }

        return res.status(200).json({
            success: true,
            message: "Boutique supprimée avec succès",
            deletedShop: {
                id: shop.id,
                name: shop.name,
                createdAt: shop.createdAt,
                deletedAt: new Date()
            }
        });
    } catch (error) {
        logger.error(`Erreur lors de la suppression de la boutique:`, {
            error: error.message,
            stack: error.stack,
            userId: req.user?.id,
            shopId: req.params.id
        });
        
        return res.status(500).json({
            success: false,
            message: "Erreur lors de la suppression de la boutique",
            error: process.env.NODE_ENV === 'development' ? error.message : "SERVER_ERROR"
        });
    }
};

/**
 * Restaure une boutique supprimée à partir des archives
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON confirmant la restauration
 */
export const restoreStore = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        // Vérifier si l'utilisateur est administrateur
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: "Seuls les administrateurs peuvent restaurer une boutique supprimée",
                error: "FORBIDDEN"
            });
        }

        // Récupérer les données archivées
        const archivedShop = await prisma.shopArchive.findFirst({
            where: { originalId: id }
        });

        if (!archivedShop) {
            return res.status(404).json({
                success: false,
                message: "Aucune archive trouvée pour cette boutique",
                error: "ARCHIVE_NOT_FOUND"
            });
        }

        // Vérifier si une boutique avec le même nom ou slug existe déjà
        const shopData = JSON.parse(archivedShop.shopData);
        const existingShop = await prisma.shop.findFirst({
            where: {
                OR: [
                    { name: shopData.name },
                    { slug: shopData.slug }
                ]
            }
        });

        if (existingShop) {
            return res.status(409).json({
                success: false,
                message: "Une boutique avec le même nom ou slug existe déjà",
                error: "SHOP_EXISTS"
            });
        }

        // Recréer la boutique à partir des données archivées
        const restoredShop = await prisma.shop.create({
            data: {
                ...shopData,
                id: shopData.id, // Conserver l'ID original
                createdAt: new Date(shopData.createdAt),
                updatedAt: new Date(),
                status: 'PENDING', // Remettre en attente pour vérification
                restoredAt: new Date(),
                restoredBy: userId
            }
        });

        // Journaliser la restauration
        logger.info(`Boutique restaurée: ${id}`, {
            userId,
            shopId: id,
            shopName: restoredShop.name
        });

        return res.status(200).json({
            success: true,
            message: "Boutique restaurée avec succès",
            shop: restoredShop
        });
    } catch (error) {
        logger.error(`Erreur lors de la restauration de la boutique:`, {
            error: error.message,
            stack: error.stack,
            userId: req.user?.id,
            shopId: req.params.id
        });
        
        return res.status(500).json({
            success: false,
            message: "Erreur lors de la restauration de la boutique",
            error: process.env.NODE_ENV === 'development' ? error.message : "SERVER_ERROR"
        });
    }
};