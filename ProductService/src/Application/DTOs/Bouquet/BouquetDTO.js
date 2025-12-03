class BouquetDTO {
  constructor({ name, description, price, occasionId, images = [] }) {
    this.name = name;
    this.description = description;
    this.price = price;
    this.occasionId = occasionId;
    this.images = images || [];
  }
}

module.exports = BouquetDTO;
