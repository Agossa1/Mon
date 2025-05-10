/**
 * Met à jour une boutique
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON avec les détails de la boutique mise à jour
 */
exports.updateShop = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Vérifier si l'utilisateur a le droit de modifier cette boutique
        const canEdit = await shopService.canUserEditShop(id, userId);

        if (!canEdit) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas autorisé à modifier cette boutique',
                error: 'FORBIDDEN'
            });
        }

        // Valider les données d'entrée avec un schéma de mise à jour
        // (à définir, similaire à createShopSchema mais avec des champs optionnels)
        const updateShopSchema = createShopSchema.fork(
            Object.keys(createShopSchema.describe().keys).filter(key => key !== 'name' && key !== 'shopType'),
            (schema) => schema.optional()
        );

        const { error, value } = updateShopSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                details: error.details
            });
        }

        // Appeler le service pour mettre à jour la boutique
        const updatedShop = await shopService.updateShop(id, value);

        return res.status(200).json({
            success: true,
            message: 'Boutique mise à jour avec succès',
            data: updatedShop
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la boutique:', error);

        if (error.message.includes('existe déjà')) {
            return res.status(409).json({
                success: false,
                message: error.message,
                error: 'DUPLICATE_ENTRY'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de la boutique',
            error: 'SERVER_ERROR'
        });
    }
};
