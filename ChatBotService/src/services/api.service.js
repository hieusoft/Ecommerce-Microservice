import { config } from "../core/config.js";

export class ApiService {
  static baseUrl = config.FlowerApiBaseUrl;

  static async fetchJson(url) {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    const text = await res.text();
    if (!text || text.trim() === "") {
      throw new Error("API returned empty response");
    }

    return JSON.parse(text);
  }

  static async getOccasions() {
    try {
      return await this.fetchJson(`${this.baseUrl}/occasions`);
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
      return await this.fetchJson(
        `${this.baseUrl}/suboccasion/${occasionId}`
      );
    } catch (error) {
      console.error("Error fetching subOccasions:", error);
      throw error;
    }
  }

  static async getBouquets(subOccasionName) {
    try {
      return await this.fetchJson(
        `${this.baseUrl}/bouquets?subOccasionName=${encodeURIComponent(
          subOccasionName
        )}&page=1&limit=10`
      );
    } catch (error) {
      console.error("Error fetching bouquets:", error);
      throw error;
    }
  }
}
