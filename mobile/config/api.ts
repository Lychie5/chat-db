// Configuration de l'API pour l'application mobile
export const API_CONFIG = {
  // URL de votre serveur Render
  BASE_URL: 'https://meo-mv5n.onrender.com',
  SOCKET_URL: 'https://meo-mv5n.onrender.com',
};

// Helper pour les requêtes API
export const api = {
  async get(endpoint: string) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API GET Error ${response.status} on ${endpoint}:`, errorText);
        throw new Error(`${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error(`API GET failed for ${endpoint}:`, error.message);
      throw error;
    }
  },

  async post(endpoint: string, data: any) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API POST Error ${response.status} on ${endpoint}:`, errorText);
        throw new Error(`${response.status}: ${errorText}`);
      }
      
      const responseData = await response.json();
      return responseData;
    } catch (error: any) {
      console.error(`API POST failed for ${endpoint}:`, error.message);
      throw error;
    }
  },
};
