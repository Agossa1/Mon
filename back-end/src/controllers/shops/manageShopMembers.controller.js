/**
 * Gère les membres d'une équipe de boutique (ajout, modification, suppression)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON confirmant l'opération
 */
exports.manageShopMembers = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, userId, role, permissions } = req.body;

        // Vérifier si l'utilisateur a le droit de gérer les membres
        const canManageMembers = await shopService.canManageShopMembers(id, req.user.id);

        if (!canManageMembers) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas autorisé à gérer les membres de cette boutique',
                error: 'FORBIDDEN'
            });
        }

        // Valider l'action
        const validActions = ['add', 'update', 'remove'];
        if (!validActions.includes(action)) {
            return res.status(400).json({
                success: false,
                message: `Action invalide. Les valeurs acceptées sont: ${validActions.join(', ')}`,
                error: 'INVALID_ACTION'
            });
        }

        // Exécuter l'action appropriée
        let result;

        switch (action) {
            case 'add':
                // Valider les données
                if (!userId || !role) {
                    return res.status(400).json({
                        success: false,
                        message: 'L\'identifiant de l\'utilisateur et le rôle sont requis',
                        error: 'MISSING_PARAMETERS'
                    });
                }

                result = await shopService.addShopMember(id, userId, role, permissions);
                break;

            case 'update':
                // Valider les données
                if (!userId) {
                    return res.status(400).json({
                        success: false,
                        message: 'L\'identifiant de l\'utilisateur est requis',
                        error: 'MISSING_PARAMETERS'
                    });
                }

                result = await shopService.updateShopMember(id, userId, role, permissions);
                break;

            case 'remove':
                // Valider les données
                if (!userId) {
                    return res.status(400).json({
                        success: false,
                        message: 'L\'identifiant de l\'utilisateur est requis',
                        error: 'MISSING_PARAMETERS'
                    });
                }

                // Vérifier qu'on n'essaie pas de supprimer le propriétaire
                const shop = await shopService.getShopById(id, { basic: true });
                if (shop.ownerId === userId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Impossible de supprimer le propriétaire de la boutique',
                        error: 'CANNOT_REMOVE_OWNER'
                    });
                }

                result = await shopService.removeShopMember(id, userId);
                break;
        }

        // Répondre avec le résultat approprié selon l'action
        const messages = {
            add: 'Membre ajouté à l\'équipe avec succès',
            update: 'Rôle du membre mis à jour avec succès',
            remove: 'Membre retiré de l\'équipe avec succès'
        };

        return res.status(200).json({
            success: true,
            message: messages[action],
            data: result
        });
    } catch (error) {
        console.error('Erreur lors de la gestion des membres de la boutique:', error);

        // Gérer les erreurs spécifiques
        if (error.message.includes('existe déjà')) {
            return res.status(409).json({
                success: false,
                message: error.message,
                error: 'MEMBER_ALREADY_EXISTS'
            });
        }

        if (error.message.includes('non trouvé')) {
            return res.status(404).json({
                success: false,
                message: error.message,
                error: 'NOT_FOUND'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la gestion des membres de la boutique',
            error: 'SERVER_ERROR'
        });
    }
};

