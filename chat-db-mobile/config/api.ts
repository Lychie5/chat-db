// Configuration de l'API pour l'application mobile
export const API_CONFIG = {
  // URL de votre serveur Render
  BASE_URL: 'https://meo-mv5n.onrender.com',
  SOCKET_URL: 'https://meo-mv5n.onrender.com',
};

// Helper pour les requêtes API
export const api = {
  async get(endpoint: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  },

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  },
};
