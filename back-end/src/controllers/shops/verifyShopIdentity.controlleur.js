/**
 * Vérifie l'identité du propriétaire de la boutique
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON confirmant la vérification
 */
exports.verifyShopIdentity = async (req, res) => {
    try {
        // Vérifier que l'utilisateur est un administrateur
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas autorisé à vérifier l\'identité des boutiques',
                error: 'FORBIDDEN'
            });
        }

        const { id } = req.params;
        const { verified, notes } = req.body;

        // Valider le paramètre verified
        if (typeof verified !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'Le paramètre "verified" doit être un booléen',
                error: 'INVALID_PARAMETER'
            });
        }

        // Mettre à jour le statut de vérification
        const updatedShop = await shopService.updateShopVerification(id, verified, notes);

        if (!updatedShop) {
            return res.status(404).json({
                success: false,
                message: 'Boutique non trouvée',
                error: 'SHOP_NOT_FOUND'
            });
        }

        return res.status(200).json({
            success: true,
            message: verified
                ? 'Identité de la boutique vérifiée avec succès'
                : 'Vérification de l\'identité de la boutique annulée',
            data: {
                id: updatedShop.id,
                name: updatedShop.name,
                verified: updatedShop.verified,
                identityVerified: updatedShop.identityVerified,
                businessVerified: updatedShop.businessVerified
            }
        });
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'identité de la boutique:', error);

        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification de l\'identité de la boutique',
            error: 'SERVER_ERROR'
        });
    }
};
