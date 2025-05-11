const API_URL = 'http://localhost:4000/api/shops';

/**
 * Service pour gérer les opérations liées aux boutiques
 */
export const shopService = {
  /**
   * Crée une nouvelle boutique
   * @param {Object} shopData - Données de la boutique à créer
   * @returns {Promise<Object>} - Réponse de l'API
   */
  createShop: async (shopData) => {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        throw new Error('Vous devez être connecté pour créer une boutique');
      }

      // Formater les données selon le schéma attendu par le backend
      // S'assurer que tous les champs sont correctement formatés pour éviter l'erreur Prisma
      const formattedData = {
        name: String(shopData.name).trim(),
        shopType: shopData.shopType || 'PHYSICAL', // Doit être PHYSICAL, ONLINE ou HYBRID selon le schéma
        category: shopData.category || 'OTHER',
      };

      // Ajouter les champs optionnels seulement s'ils ont une valeur
      // S'assurer que tous les champs sont des chaînes de caractères valides
      if (shopData.description) formattedData.description = String(shopData.description).trim();
      // Ne pas envoyer le slug, laisser le backend le générer pour éviter l'erreur Prisma
      if (shopData.subCategory) formattedData.subCategory = String(shopData.subCategory).trim();
      if (shopData.logo) formattedData.logo = String(shopData.logo).trim();
      if (shopData.coverImage) formattedData.coverImage = String(shopData.coverImage).trim();
      if (shopData.contactEmail) formattedData.contactEmail = String(shopData.contactEmail).trim();
      if (shopData.contactPhone) formattedData.contactPhone = String(shopData.contactPhone).trim();
      if (shopData.website) formattedData.website = String(shopData.website).trim();

      // Gestion des champs structurés
      if (shopData.socialLinks && typeof shopData.socialLinks === 'object') {
        // S'assurer que chaque lien social est une chaîne valide
        const validatedSocialLinks = {};
        Object.entries(shopData.socialLinks).forEach(([key, value]) => {
          if (value) validatedSocialLinks[key] = String(value).trim();
        });
        formattedData.socialLinks = validatedSocialLinks;
      }

      // S'assurer que les tags sont un tableau de chaînes
      if (shopData.tags && Array.isArray(shopData.tags)) {
        formattedData.tags = shopData.tags.filter(tag => tag).map(tag => String(tag).trim());
      }

      // Gestion de l'adresse selon le schéma
      if (shopData.address || shopData.city || shopData.country) {
        formattedData.address = {
          street: shopData.address ? String(shopData.address).trim() : '',
          city: shopData.city ? String(shopData.city).trim() : '',
          state: shopData.state ? String(shopData.state).trim() : '',
          postalCode: shopData.postalCode ? String(shopData.postalCode).trim() : '',
          country: shopData.country ? String(shopData.country).trim() : ''
        };

        // Ne pas vérifier les champs requis ici, laissons le backend le faire
        // Cela évite d'ajouter des contraintes qui pourraient ne pas correspondre au backend
      }

      // Gestion des paramètres
      if (shopData.settings && typeof shopData.settings === 'object') {
        formattedData.settings = shopData.settings;
      }

      // Ajouter les champs spécifiques au schéma du backend
      if (shopData.shortDescription) {
        formattedData.shortDescription = String(shopData.shortDescription).trim();
      }

      if (shopData.languages && Array.isArray(shopData.languages)) {
        formattedData.languages = shopData.languages.filter(lang => lang).map(lang => String(lang).trim());
      } else {
        formattedData.languages = ['fr']; // Valeur par défaut
      }

      if (shopData.currency) {
        formattedData.currency = String(shopData.currency).trim();
      }

      if (shopData.timeZone) {
        formattedData.timeZone = String(shopData.timeZone).trim();
      }

      // Logs pour le débogage
      console.log('Création de boutique - données envoyées:', formattedData);
      console.log('URL de l\'API:', API_URL);

      const response = await fetch(`${API_URL}/create-shops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formattedData),
        credentials: 'include'
      });

      console.log('Statut de la réponse:', response.status);

      // Vérifier si la réponse est au format JSON
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('Données reçues:', data);
      } else {
        // Si la réponse n'est pas au format JSON, créer un objet d'erreur
        const text = await response.text();
        console.error('Réponse non-JSON reçue:', text);
        throw new Error('Format de réponse invalide du serveur');
      }

      if (!response.ok) {
        // Log complet de la réponse d'erreur
        console.error('Erreur détaillée:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });

        // Gérer spécifiquement l'erreur Prisma liée au slug
        if (data.message && data.message.includes('slug')) {
          throw new Error('Erreur de format dans le nom de la boutique. Utilisez uniquement des lettres, chiffres et tirets.');
        }

        // Afficher plus de détails sur l'erreur
        if (data.details && Array.isArray(data.details)) {
          const errorMessages = data.details.map(detail =>
              `${detail.field || 'Champ'}: ${detail.message || detail.error || 'invalide'}`
          ).join(', ');
          throw new Error(`Données invalides: ${errorMessages}`);
        }

        throw new Error(data.message || `Erreur ${response.status}: Échec de la création de la boutique`);
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la boutique:', error);
      throw error;
    }
  }
};