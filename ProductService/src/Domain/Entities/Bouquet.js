class Bouquet {
  constructor({ id, name, description, price, occasionId, flowers = [], images  = [], createdAt, updatedAt }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.occasionId = occasionId;
    this.flowers = flowers; 
    this.images = images || [];
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = Bouquet;
