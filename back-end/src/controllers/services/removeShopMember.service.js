/**
 * Supprime un membre d'une boutique
 * @param {string} shopId - ID de la boutique
 * @param {string} memberId - ID du membre à supprimer
 * @param {string} requesterId - ID de l'utilisateur qui fait la demande
 * @returns {Promise<Object>} Résultat de l'opération
 */
exports.removeShopMember = async (shopId, memberId, requesterId) => {
    try {
        // Vérifier si la boutique existe
        const shop = await prisma.shop.findUnique({
            where: { id: shopId },
            include: {
                members: true,
                owner: { select: { id: true } }
            }
        });

        if (!shop) throw new Error("Boutique non trouvée");

        // Vérifier si le membre à supprimer existe
        const memberToRemove = shop.members.find(m => m.id === memberId);
        if (!memberToRemove) throw new Error("Membre non trouvé");

        // Vérifier si le membre à supprimer est le propriétaire
        if (memberToRemove.userId === shop.ownerId) {
            throw new Error("Impossible de supprimer le propriétaire de la boutique");
        }

        // Vérifier les droits d'accès du demandeur
        const isOwner = shop.ownerId === requesterId;
        const requesterMember = shop.members.find(m => m.userId === requesterId);
        const canRemove = isOwner ||
            (requesterMember && ['OWNER', 'MANAGER'].includes(requesterMember.role));

        // Un membre peut se supprimer lui-même
        const isSelfRemoval = memberToRemove.userId === requesterId;

        if (!canRemove && !isSelfRemoval) {
            throw new Error("Vous n'avez pas les droits pour supprimer des membres de cette boutique");
        }

        // Supprimer le membre
        await prisma.shopMember.delete({
            where: { id: memberId }
        });

        // Journaliser la suppression
        console.log(`Membre supprimé de la boutique ${shop.name} (ID: ${shopId}): ${memberToRemove.userId} par ${requesterId}`);

        return {
            success: true,
            message: "Membre supprimé avec succès"
        };
    } catch (error) {
        console.error(`Erreur lors de la suppression d'un membre de la boutique (ID: ${shopId}):`, error);
        throw error;
    }
};
