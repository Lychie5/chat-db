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

  async post(endpoint: string, data?: any) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API POST Error ${response.status} on ${endpoint}:`, errorText);
        throw new Error(`${response.status}: ${errorText}`);
      }
      
      // Vérifier si la réponse a du contenu avant de parser JSON
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      if (contentLength === '0' || !contentType?.includes('application/json')) {
        // Pas de corps JSON, retourner success
        return { ok: true };
      }
      
      const responseData = await response.json();
      return responseData;
    } catch (error: any) {
      console.error(`API POST failed for ${endpoint}:`, error.message);
      throw error;
    }
  },
};
