/**
 * Marque une boutique comme mise en avant (featured)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON confirmant la mise en avant
 */
exports.toggleShopFeatured = async (req, res) => {
    try {
        // Vérifier que l'utilisateur est un administrateur
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas autorisé à mettre en avant des boutiques',
                error: 'FORBIDDEN'
            });
        }

        const { id } = req.params;
        const { featured } = req.body;

        // Valider le paramètre featured
        if (typeof featured !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'Le paramètre "featured" doit être un booléen',
                error: 'INVALID_PARAMETER'
            });
        }

        // Mettre à jour le statut featured
        const updatedShop = await shopService.updateShopFeatured(id, featured);

        if (!updatedShop) {
            return res.status(404).json({
                success: false,
                message: 'Boutique non trouvée',
                error: 'SHOP_NOT_FOUND'
            });
        }

        return res.status(200).json({
            success: true,
            message: featured
                ? 'Boutique mise en avant avec succès'
                : 'Boutique retirée des mises en avant avec succès',
            data: {
                id: updatedShop.id,
                name: updatedShop.name,
                featured: updatedShop.featured
            }
        });
    } catch (error) {
        console.error('Erreur lors de la mise en avant de la boutique:', error);

        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise en avant de la boutique',
            error: 'SERVER_ERROR'
        });
    }
};

