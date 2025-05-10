// Api Authentification
const API_URL = 'http://localhost:4000/api/users';

export const registerUser = async (userData) => {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
            // Gérer les erreurs spécifiques
            if (response.status === 409) {
                throw new Error('Un compte avec ces informations existe déjà.');
            } else {
                throw new Error(data.message || 'Une erreur est survenue lors de l\'inscription');
            }
        }

        return { success: true, data };
    } catch (error) {
        // Gérer l'erreur de connexion refusée
        if (error.message === 'Failed to fetch') {
            return {
                success: false,
                data: { message: 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion ou réessayer plus tard.' }
            };
        }
        
        return {
            success: false,
            data: { message: error.message || 'Erreur lors de l\'inscription' }
        };
    }
};