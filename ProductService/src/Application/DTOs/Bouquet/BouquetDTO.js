class BouquetDTO {
  constructor({ name, description, price, occasionId, flowers = [], images = [] }) {
    this.name = name;
    this.description = description;
    this.price = price;
    this.occasionId = occasionId;
    this.flowers = flowers; 
    this.images = images || [];
  }
}

module.exports = BouquetDTO;
