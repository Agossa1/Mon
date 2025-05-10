exports.getShopById = async (id, options = {}) => {
    try {
        // Vérifier si l'ID est valide
        if (!id) throw new Error("ID de boutique non fourni");

        // Options par défaut pour les inclusions
        const {
            includeProducts = false,
            includeStats = false,
            includeReviews = false,
            includeMembers = true,
            includeOwner = true,
            productLimit = 10,
            reviewLimit = 5
        } = options;

        // Construire dynamiquement les inclusions
        const include = {};

        // Toujours inclure le propriétaire avec des informations limitées
        if (includeOwner) {
            include.owner = {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profileImage: true,
                    role: true
                }
            };
        }

        // Inclure les membres de l'équipe
        if (includeMembers) {
            include.members = {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profileImage: true
                        }
                    }
                }
            };
        }

        // Inclure les produits si demandé
        if (includeProducts) {
            include.products = {
                take: productLimit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    price: true,
                    discountPrice: true,
                    mainImage: true,
                    status: true,
                    stock: true,
                    createdAt: true
                }
            };
        }

        // Inclure les avis si demandé
        if (includeReviews) {
            include.reviews = {
                take: reviewLimit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            profileImage: true
                        }
                    }
                }
            };
        }

        // Récupérer la boutique avec les inclusions demandées
        const shop = await prisma.shop.findUnique({
            where: { id },
            include
        });

        // Vérifier si la boutique existe
        if (!shop) throw new Error("Boutique non trouvée");

        // Ajouter des statistiques si demandé
        if (includeStats) {
            // Compter le nombre total de produits
            const productCount = await prisma.product.count({
                where: { shopId: id }
            });

            // Compter le nombre total de commandes
            const orderCount = await prisma.order.count({
                where: {
                    orderItems: {
                        some: {
                            product: {
                                shopId: id
                            }
                        }
                    }
                }
            });

            // Calculer le chiffre d'affaires total
            const revenue = await prisma.orderItem.aggregate({
                where: {
                    product: {
                        shopId: id
                    },
                    order: {
                        status: {
                            in: ['COMPLETED', 'DELIVERED']
                        }
                    }
                },
                _sum: {
                    totalPrice: true
                }
            });

            // Ajouter les statistiques à l'objet boutique
            shop.statistics = {
                productCount,
                orderCount,
                revenue: revenue._sum.totalPrice || 0,
                // Autres statistiques utiles...
            };
        }

        return shop;
    } catch (error) {
        console.error(`Erreur lors de la récupération de la boutique (ID: ${id}):`, error);

        // Gérer les erreurs spécifiques
        if (error.message === "Boutique non trouvée") {
            throw error; // Relancer l'erreur telle quelle
        }

        // Pour les autres types d'erreurs
        throw new Error(`Erreur lors de la récupération de la boutique: ${error.message}`);
    }
};