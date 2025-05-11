const API_URL = 'http://localhost:4000/api';

/**
 * Récupère les boutiques de l'utilisateur connecté
 * @returns {Promise<Object>} - Réponse de l'API avec un tableau de boutiques
 */
export async function getMyShops() {
    try {
        const token = localStorage.getItem('accessToken');

        if (!token) {
            console.warn('Aucun token d\'authentification trouvé');
            return {
                success: false,
                message: 'Vous devez être connecté pour accéder à vos boutiques',
                data: { shops: [] }
            };
        }

        console.log('Récupération des boutiques de l\'utilisateur...');

        // Créer un contrôleur d'abandon pour pouvoir annuler la requête après un délai
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout

        try {
            const response = await fetch(`${API_URL}/shops/my-shops`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                signal: controller.signal
            });

            // Nettoyer le timeout
            clearTimeout(timeoutId);

            console.log('Statut de la réponse:', response.status);

            if (!response.ok) {
                if (response.status === 401) {
                    console.warn('Session expirée ou non autorisée');
                    return {
                        success: false,
                        message: 'Votre session a expiré. Veuillez vous reconnecter.',
                        error: 'UNAUTHORIZED',
                        data: { shops: [] }
                    };
                }

                const errorText = await response.text();
                console.error('Erreur API:', response.status, errorText);

                return {
                    success: false,
                    message: `Erreur lors de la récupération des boutiques (${response.status})`,
                    error: 'API_ERROR',
                    data: { shops: [] }
                };
            }

            const data = await response.json();
            console.log('Données reçues:', data);

            // Retourner directement la réponse de l'API qui contient déjà la structure correcte
            return data;
        } catch (fetchError) {
            // Nettoyer le timeout en cas d'erreur
            clearTimeout(timeoutId);

            if (fetchError.name === 'AbortError') {
                console.error('La requête a été abandonnée après le délai d\'attente');
                return {
                    success: false,
                    message: 'Le serveur met trop de temps à répondre. Veuillez réessayer plus tard.',
                    error: 'TIMEOUT',
                    data: { shops: [] }
                };
            }

            // Essayer avec une URL alternative si la première échoue
            return await fallbackGetMyShops(token);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des boutiques:', error);
        return {
            success: false,
            message: 'Une erreur inattendue est survenue',
            error: error.message,
            data: { shops: [] }
        };
    }
}

/**
 * Méthode de secours pour récupérer les boutiques en cas d'échec de la première URL
 * @param {string} token - Token d'authentification
 * @returns {Promise<Object>} - Réponse de l'API avec un tableau de boutiques
 */
export async function fallbackGetMyShops(token) {
    try {
        console.log('Tentative avec URL alternative...');
        
        // Essayer avec une URL alternative
        const response = await fetch(`${API_URL}/shops/my-shops`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            console.error('Échec de la tentative alternative:', response.status);
            return {
                success: false,
                message: 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.',
                error: 'CONNECTION_ERROR',
                data: { shops: [] }
            };
        }
        
        const data = await response.json();
        
        // Retourner directement la réponse de l'API
        return data;
    } catch (error) {
        console.error('Erreur lors de la tentative alternative:', error);
        return {
            success: false,
            message: 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.',
            error: 'CONNECTION_ERROR',
            data: { shops: [] }
        };
    }
}

/**
 * Récupère les détails d'une boutique par son ID
 * @param {string} shopId - ID de la boutique à récupérer
 * @returns {Promise<Object>} - Réponse de l'API avec les détails de la boutique
 */
export async function getShopById(shopId) {
    try {
        const token = localStorage.getItem('accessToken');

        if (!token) {
            console.warn('Aucun token d\'authentification trouvé');
            return {
                success: false,
                message: 'Vous devez être connecté pour accéder aux détails de la boutique',
                error: 'UNAUTHORIZED'
            };
        }

        if (!shopId) {
            return {
                success: false,
                message: 'ID de boutique manquant',
                error: 'MISSING_ID'
            };
        }

        console.log(`Récupération des détails de la boutique ${shopId}...`);

        // Créer un contrôleur d'abandon pour pouvoir annuler la requête après un délai
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout

        try {
            // Utiliser le même endpoint que pour getMyShops mais avec un paramètre de requête
            const response = await fetch(`${API_URL}/shops/my-shops?shopId=${shopId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                signal: controller.signal
            });

            // Nettoyer le timeout
            clearTimeout(timeoutId);

            console.log('Statut de la réponse:', response.status);

            if (!response.ok) {
                if (response.status === 401) {
                    console.warn('Session expirée ou non autorisée');
                    return {
                        success: false,
                        message: 'Votre session a expiré. Veuillez vous reconnecter.',
                        error: 'UNAUTHORIZED'
                    };
                }

                const errorText = await response.text();
                console.error('Erreur API:', response.status, errorText);

                return {
                    success: false,
                    message: `Erreur lors de la récupération des détails de la boutique (${response.status})`,
                    error: 'API_ERROR'
                };
            }

            // Vérifier si la réponse est au format JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                console.log('Données reçues:', data);

                // Vérifier si les données contiennent la boutique
                if (data && data.data && data.data.shops) {
                    // Trouver la boutique spécifique dans la liste
                    const shop = data.data.shops.find(s => s.id === shopId);
                    
                    if (shop) {
                        return {
                            success: true,
                            message: 'Boutique récupérée avec succès',
                            shop: shop
                        };
                    } else {
                        return {
                            success: false,
                            message: 'Boutique non trouvée dans la liste',
                            error: 'SHOP_NOT_FOUND'
                        };
                    }
                } else {
                    return {
                        success: false,
                        message: 'Format de réponse invalide: données de boutique manquantes',
                        error: 'INVALID_DATA'
                    };
                }
            } else {
                console.error('Réponse non-JSON reçue');
                return {
                    success: false,
                    message: 'Format de réponse invalide',
                    error: 'INVALID_RESPONSE'
                };
            }
        } catch (error) {
            // Nettoyer le timeout en cas d'erreur
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                console.error('La requête a été abandonnée (timeout)');
                return {
                    success: false,
                    message: 'La requête a pris trop de temps à s\'exécuter',
                    error: 'TIMEOUT'
                };
            }

            throw error;
        }
    } catch (error) {
        console.error(`Erreur lors de la récupération des détails de la boutique ${shopId}:`, error);
        return {
            success: false,
            message: 'Une erreur est survenue lors de la récupération des détails de la boutique',
            error: error.message
        };
    }
}

/**
 * Méthode de secours pour récupérer une boutique par ID en cas d'échec de la première URL
 * @param {string} shopId - ID de la boutique
 * @param {string} token - Token d'authentification
 * @returns {Promise<Object>} - Réponse de l'API avec les détails de la boutique
 */
async function fallbackGetShopById(shopId, token) {
    try {
        console.log(`Tentative alternative pour récupérer la boutique ${shopId}...`);
        
        // Essayer avec des chemins alternatifs
        const urls = [
            `${API_URL}/shops/shop/id/${shopId}`,
            `${API_URL}/shops/shop/${shopId}`,
            `${API_URL}/shop/shop/${shopId}`
        ];
        
        for (const url of urls) {
            try {
                console.log(`Essai avec l'URL: ${url}`);
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    credentials: 'include'
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Données reçues (alternative):', data);
                    
                    if (data && data.data) {
                        return {
                            success: true,
                            message: 'Boutique récupérée avec succès',
                            shop: data.data
                        };
                    }
                }
            } catch (urlError) {
                console.warn(`Échec avec l'URL ${url}:`, urlError);
            }
        }
        
        // Si toutes les tentatives échouent
        return {
            success: false,
            message: 'Boutique introuvable après plusieurs tentatives',
            error: 'SHOP_NOT_FOUND'
        };
    } catch (error) {
        console.error(`Erreur lors de la tentative alternative pour la boutique ${shopId}:`, error);
        return {
            success: false,
            message: 'Une erreur est survenue lors de la récupération des détails de la boutique',
            error: error.message
        };
    }
}
/**
 * Récupère une boutique par son slug
 * @param {string} slug - Slug de la boutique
 * @returns {Promise<Object>} - Réponse de l'API avec les détails de la boutique
 */
export async function getShopBySlug(slug) {
    try {
        const token = localStorage.getItem('accessToken');
        
        const response = await fetch(`${API_URL}/shops/get-shops-slug/${slug}`, {
            method: 'GET',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Erreur lors de la récupération de la boutique avec le slug ${slug}:`, error);
        throw error;
    }
}