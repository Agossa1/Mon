/**
 * Recherche des boutiques selon différents critères
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON avec les résultats de recherche
 */
exports.searchShops = async (req, res) => {
    try {
        // Extraire les paramètres de recherche et de pagination
        const {
            query,
            category,
            subCategory,
            shopType,
            country,
            city,
            verified,
            featured,
            status = 'ACTIVE',
            page = 1,
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Construire les filtres
        const filters = {
            query,
            category,
            subCategory,
            shopType,
            country,
            city,
            verified: verified === 'true',
            featured: featured === 'true',
            status: req.user?.role === 'ADMIN' ? status : 'ACTIVE' // Seuls les admins peuvent voir les boutiques non actives
        };

        // Options de recherche
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy,
            sortOrder,
            includeOwner: true
        };

        // Appeler le service
        const result = await shopService.searchShops(filters, options);

        return res.status(200).json({
            success: true,
            data: result.shops,
            pagination: result.pagination,
            filters: result.filters
        });
    } catch (error) {
        console.error('Erreur lors de la recherche de boutiques:', error);

        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la recherche de boutiques',
            error: 'SERVER_ERROR'
        });
    }
};

