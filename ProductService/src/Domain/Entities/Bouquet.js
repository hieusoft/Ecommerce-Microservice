class Bouquet {
  constructor({ id, name, description, price, subOccasionId, images  = [], createdAt, updatedAt }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.subOccasionId = subOccasionId;
    this.images = images || [];
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = Bouquet;
