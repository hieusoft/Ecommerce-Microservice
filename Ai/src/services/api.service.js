
export class ApiService {
  static async getOccasions() {
    const res = await fetch("http://54.254.156.167:8080/occasions");
    return res.json();
  }

  static async getSubOccasions(occasionId) {
    const res = await fetch(`http://54.254.156.167:8080/suboccasion/${occasionId}`);
    return res.json();
  }

static async getBouquets(subOccasionName) {
  const res = await fetch(`http://54.254.156.167:8080/bouquets?subOccasionName=${encodeURIComponent(subOccasionName)}&page=1&limit=10`);
  return res.json();
}
}
