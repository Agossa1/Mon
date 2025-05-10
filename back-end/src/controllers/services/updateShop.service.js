
exports.updateShop = async (id, data, userId) => {
    try {
        // Vérifier si la boutique existe
        const shop = await prisma.shop.findUnique({
            where: { id },
            include: {
                members: true,
                owner: {
                    select: { id: true, role: true, email: true }
                }
            }
        });

        if (!shop) throw new Error("Boutique non trouvée");

        // Vérifier les droits d'accès
        const isOwner = shop.ownerId === userId;
        const isAdmin = await isUserAdmin(userId);
        const memberRecord = shop.members.find(m => m.userId === userId);
        const memberRole = memberRecord?.role;

        // Déterminer le niveau d'accès
        const canUpdateBasicInfo = isOwner || isAdmin || ['OWNER', 'MANAGER', 'MARKETING', 'CONTENT'].includes(memberRole);
        const canUpdateFinancialInfo = isOwner || isAdmin || ['OWNER', 'MANAGER'].includes(memberRole);
        const canUpdateStatus = isAdmin; // Seul l'admin peut changer le statut

        if (!canUpdateBasicInfo) {
            throw new Error("Vous n'avez pas les droits pour modifier cette boutique");
        }

        // Filtrer les données en fonction des permissions
        const filteredData = { ...data };

        // Supprimer les champs sensibles si l'utilisateur n'a pas les droits
        if (!canUpdateFinancialInfo) {
            delete filteredData.bankAccount;
            delete filteredData.paymentMethods;
            delete filteredData.taxId;
            delete filteredData.businessDocument;
        }

        // Seul l'admin peut modifier ces champs
        if (!canUpdateStatus) {
            delete filteredData.status;
            delete filteredData.featured;
            delete filteredData.verified;
            delete filteredData.identityVerified;
            delete filteredData.businessVerified;
        }

        // Vérifier si le nom est modifié et générer un nouveau slug si nécessaire
        if (filteredData.name && filteredData.name !== shop.name && !filteredData.slug) {
            filteredData.slug = slugify(filteredData.name);
        }

        // Si le slug est modifié, vérifier qu'il n'existe pas déjà
        if (filteredData.slug && filteredData.slug !== shop.slug) {
            const existingSlug = await prisma.shop.findFirst({
                where: {
                    slug: filteredData.slug,
                    NOT: { id }
                }
            });

            if (existingSlug) throw new Error("Ce slug existe déjà");
        }

        // Traiter les dates si elles sont fournies sous forme de chaînes
        if (filteredData.dateOfBirth && typeof filteredData.dateOfBirth === 'string') {
            filteredData.dateOfBirth = new Date(filteredData.dateOfBirth);
        }

        // Enregistrer les modifications pour l'audit
        const changedFields = Object.keys(filteredData).filter(key =>
            JSON.stringify(filteredData[key]) !== JSON.stringify(shop[key])
        );

        // Mettre à jour la boutique
        const updatedShop = await prisma.shop.update({
            where: { id },
            data: {
                ...filteredData,
                updatedAt: new Date()
            }
        });

        // Journaliser la modification
        console.log(`Boutique mise à jour: ${shop.name} (ID: ${id}) par l'utilisateur ${userId}`, {
            changedFields,
            userRole: memberRole || (isAdmin ? 'ADMIN' : 'USER')
        });

        // Si le statut a changé, envoyer une notification au propriétaire
        if (filteredData.status && filteredData.status !== shop.status) {
            // Logique de notification (à implémenter)
            console.log(`Notification: Le statut de la boutique ${shop.name} est passé de ${shop.status} à ${filteredData.status}`);

            // Créer une entrée dans l'historique des statuts
            await prisma.shopStatusHistory.create({
                data: {
                    shopId: id,
                    oldStatus: shop.status,
                    newStatus: filteredData.status,
                    changedById: userId,
                    reason: filteredData.statusChangeReason || 'Mise à jour administrative'
                }
            });
        }

        return updatedShop;
    } catch (error) {
        console.error(`Erreur lors de la mise à jour de la boutique (ID: ${id}):`, error);

        // Gérer les erreurs spécifiques de Prisma
        if (error.code === 'P2002') {
            throw new Error("Une contrainte unique n'est pas respectée");
        } else if (error.code === 'P2025') {
            throw new Error("Boutique non trouvée");
        }

        // Relancer l'erreur pour qu'elle soit gérée par le contrôleur
        throw error;
    }
};