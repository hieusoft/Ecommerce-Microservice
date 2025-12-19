
export class ApiService {
  static async getOccasions() {
    try {
      const res = await fetch("http://54.254.156.167:8080/occasions");
      if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }
      const text = await res.text();
      if (!text || text.trim() === '') {
        throw new Error("API returned empty response");
      }
      return JSON.parse(text);
    } catch (error) {
      console.error("Error fetching occasions:", error);
      throw error;
    }
  }

  static async getOccasionByName(occasionName) {
    try {
      const occasions = await this.getOccasions();

      
      const occasion = occasions.find(
        (occ) => occ.name?.toLowerCase() === occasionName?.toLowerCase()
      );
      if (!occasion) {
        throw new Error(`Occasion "${occasionName}" not found`);
      }
      return occasion;
    } catch (error) {
      console.error("Error getting occasion by name:", error);
      throw error;
    }
  }

  static async getSubOccasions(occasionId) {
    try {
      const res = await fetch(`http://54.254.156.167:8080/suboccasion/${occasionId}`);
      if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }
      const text = await res.text();
      if (!text || text.trim() === '') {
        throw new Error("API returned empty response");
      }
      return JSON.parse(text);
    } catch (error) {
      console.error("Error fetching subOccasions:", error);
      throw error;
    }
  }

  static async getBouquets(subOccasionName) {
    try {
      const res = await fetch(`http://54.254.156.167:8080/bouquets?subOccasionName=${encodeURIComponent(subOccasionName)}&page=1&limit=10`);
      if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }
      const text = await res.text();
      if (!text || text.trim() === '') {
        throw new Error("API returned empty response");
      }
      return JSON.parse(text);
    } catch (error) {
      console.error("Error fetching bouquets:", error);
      throw error;
    }
  }
}
