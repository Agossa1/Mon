/**
 * Envoie une invitation à rejoindre l'équipe d'une boutique
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON confirmant l'envoi de l'invitation
 */
const shopService = require("../services/shop.service.js");

exports.inviteShopMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, role, permissions, message } = req.body;
        const inviterId = req.user.id;

        // Vérifier si l'utilisateur a le droit d'inviter des membres
        const canManageMembers = await shopService.canManageShopMembers(id, inviterId);

        if (!canManageMembers) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas autorisé à inviter des membres pour cette boutique',
                error: 'FORBIDDEN'
            });
        }

        // Valider les données
        if (!email || !role) {
            return res.status(400).json({
                success: false,
                message: 'L\'email et le rôle sont requis',
                error: 'MISSING_PARAMETERS'
            });
        }

        // Envoyer l'invitation
        const invitation = await shopService.inviteShopMember(id, {
            email,
            role,
            permissions,
            message,
            inviterId
        });

        return res.status(200).json({
            success: true,
            message: 'Invitation envoyée avec succès',
            data: invitation
        });
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'invitation:', error);

        // Gérer les erreurs spécifiques
        if (error.message.includes('existe déjà')) {
            return res.status(409).json({
                success: false,
                message: error.message,
                error: 'INVITATION_ALREADY_SENT'
            });
        }

        if (error.message.includes('déjà membre')) {
            return res.status(409).json({
                success: false,
                message: error.message,
                error: 'ALREADY_MEMBER'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'envoi de l\'invitation',
            error: 'SERVER_ERROR'
        });
    }
};

