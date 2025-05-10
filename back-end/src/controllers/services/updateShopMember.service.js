/**
 * Met à jour le rôle ou les permissions d'un membre
 * @param {string} shopId - ID de la boutique
 * @param {string} memberId - ID du membre à mettre à jour
 * @param {Object} updateData - Données à mettre à jour
 * @param {string} requesterId - ID de l'utilisateur qui fait la demande
 * @returns {Promise<Object>} Résultat de l'opération
 */
exports.updateShopMember = async (shopId, memberId, updateData, requesterId) => {
    try {
        const { role, permissions, isActive } = updateData;

        // Vérifier si la boutique existe
        const shop = await prisma.shop.findUnique({
            where: { id: shopId },
            include: {
                members: true,
                owner: { select: { id: true } }
            }
        });

        if (!shop) throw new Error("Boutique non trouvée");

        // Vérifier si le membre à mettre à jour existe
        const memberToUpdate = shop.members.find(m => m.id === memberId);
        if (!memberToUpdate) throw new Error("Membre non trouvé");

        // Vérifier les droits d'accès du demandeur
        const isOwner = shop.ownerId === requesterId;
        const requesterMember = shop.members.find(m => m.userId === requesterId);
        const canUpdate = isOwner ||
            (requesterMember && ['OWNER', 'MANAGER'].includes(requesterMember.role));

        if (!canUpdate) {
            throw new Error("Vous n'avez pas les droits pour modifier les membres de cette boutique");
        }

        // Si on essaie de modifier le propriétaire, vérifier des restrictions supplémentaires
        if (memberToUpdate.userId === shop.ownerId) {
            // Seul le propriétaire peut modifier son propre rôle
            if (role && role !== 'OWNER' && requesterId !== shop.ownerId) {
                throw new Error("Impossible de modifier le rôle du propriétaire");
            }
        }

        // Préparer les données à mettre à jour
        const updateFields = {};
        if (role !== undefined) updateFields.role = role;
        if (permissions !== undefined) updateFields.permissions = permissions;
        if (isActive !== undefined) updateFields.isActive = isActive;

        // Mettre à jour le membre
        const updatedMember = await prisma.shopMember.update({
            where: { id: memberId },
            data: updateFields
        });

        // Journaliser la mise à jour
        console.log(`Membre mis à jour dans la boutique ${shop.name} (ID: ${shopId}): ${memberToUpdate.userId} par ${requesterId}`, updateFields);

        return {
            success: true,
            message: "Membre mis à jour avec succès",
            member: updatedMember
        };
    } catch (error) {
        console.error(`Erreur lors de la mise à jour d'un membre de la boutique (ID: ${shopId}):`, error);
        throw error;
    }
};
    