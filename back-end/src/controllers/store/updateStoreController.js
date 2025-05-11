import prisma from "../../config/prisma.js";
import { logger } from "../../utils/logger.js";


/**
 * Met à jour une boutique existante
 * @param {string} id - ID de la boutique à mettre à jour
 * @param {Object} data - Données à mettre à jour
 * @param {string} userId - ID de l'utilisateur effectuant la mise à jour
 * @returns {Object} Boutique mise à jour
 * @throws {Error} Si la boutique n'existe pas ou si l'utilisateur n'a pas les permissions
 */
export const updateStore = async (id, data, userId) => {
    try {
        // Validation des entrées
        if (!id || !data) {
            throw new Error("Données d'entrée invalides");
        }

        // Vérifier si la boutique existe
        const existingStore = await prisma.shop.findUnique({
            where: { id },
            include: {
                owner: {
                    select: { id: true }
                },
                members: {
                    where: { userId },
                    select: { role: true, permissions: true }
                }
            }
        });

        if (!existingStore) {
            logger.warn(`Tentative de mise à jour d'une boutique inexistante: ${id}`);
            throw new Error("Boutique introuvable");
        }

        // Vérifier les permissions
        const isOwner = existingStore.owner.id === userId;
        const member = existingStore.members[0];
        const hasPermission = isOwner || 
                             (member && (
                                member.role === 'OWNER' || 
                                member.role === 'MANAGER' || 
                                (member.permissions && member.permissions.canEditStore)
                             ));

        if (!hasPermission) {
            logger.warn(`Accès non autorisé à la mise à jour de la boutique ${id} par l'utilisateur ${userId}`);
            throw new Error("Vous n'avez pas la permission de modifier cette boutique");
        }

        // Traitement spécial pour certains champs
        const updateData = { ...data };

        // Si le nom est modifié, générer un nouveau slug
        if (updateData.name && updateData.name !== existingStore.name) {
            updateData.slug = await generateSlug(updateData.name);
        }

        // Empêcher la modification de certains champs sensibles par des non-administrateurs
        if (!isOwner) {
            delete updateData.ownerId;
            delete updateData.status;
            delete updateData.verified;
            delete updateData.featured;
        }

        // Ajouter la date de mise à jour
        updateData.updatedAt = new Date();

        // Effectuer la mise à jour
        const updatedStore = await prisma.shop.update({
            where: { id },
            data: updateData,
            include: {
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        products: true,
                        members: true
                    }
                }
            }
        });

        // Journaliser la mise à jour
        logger.info(`Boutique mise à jour: ${id}`, {
            userId,
            storeId: id,
            updatedFields: Object.keys(data)
        });

        // Créer une entrée dans l'historique des modifications
        await prisma.shopUpdateHistory.create({
            data: {
                shopId: id,
                updatedBy: userId,
                updatedFields: Object.keys(data),
                previousValues: JSON.stringify(
                    Object.keys(data).reduce((acc, key) => {
                        acc[key] = existingStore[key];
                        return acc;
                    }, {})
                ),
                newValues: JSON.stringify(data)
            }
        }).catch(err => {
            // Ne pas bloquer la mise à jour si l'historique échoue
            logger.error(`Erreur lors de l'enregistrement de l'historique de mise à jour: ${err.message}`);
        });

        return updatedStore;
    } catch (error) {
        logger.error(`Erreur lors de la mise à jour de la boutique ${id}:`, error);
        
        // Gestion des erreurs spécifiques de Prisma
        if (error.code === 'P2002') {
            throw new Error("Un conflit existe avec une autre boutique (nom ou slug déjà utilisé)");
        }
        
        throw error;
    }
};

/**
 * Met à jour le statut d'une boutique
 * @param {string} id - ID de la boutique
 * @param {string} status - Nouveau statut
 * @param {string} userId - ID de l'utilisateur effectuant la mise à jour
 * @param {string} reason - Raison du changement de statut
 * @returns {Object} Boutique mise à jour
 */
export const updateStoreStatus = async (id, status, userId, reason = "") => {
    try {
        // Vérifier si le statut est valide
        const validStatuses = ['PENDING', 'ACTIVE', 'SUSPENDED', 'CLOSED', 'BANNED'];
        if (!validStatuses.includes(status)) {
            throw new Error("Statut invalide");
        }

        // Vérifier si l'utilisateur est administrateur
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (!user || user.role !== 'ADMIN') {
            throw new Error("Seuls les administrateurs peuvent modifier le statut d'une boutique");
        }

        // Récupérer le statut actuel
        const currentStore = await prisma.shop.findUnique({
            where: { id },
            select: { status: true }
        });

        if (!currentStore) {
            throw new Error("Boutique introuvable");
        }

        // Mettre à jour le statut
        const updatedStore = await prisma.shop.update({
            where: { id },
            data: { 
                status,
                updatedAt: new Date()
            }
        });

        // Enregistrer le changement de statut dans l'historique
        await prisma.shopStatusHistory.create({
            data: {
                shopId: id,
                previousStatus: currentStore.status,
                newStatus: status,
                changedBy: userId,
                reason
            }
        });

        // Journaliser le changement
        logger.info(`Statut de la boutique ${id} modifié: ${currentStore.status} -> ${status}`, {
            userId,
            reason
        });

        return updatedStore;
    } catch (error) {
        logger.error(`Erreur lors de la mise à jour du statut de la boutique ${id}:`, error);
        throw error;
    }
};