class BouquetDTO {
  constructor({ name, description, price, subOccasionId, images = [] }) {
    this.name = name;
    this.description = description;
    this.price = price;
    this.subOccasionId = subOccasionId;
    this.images = images || [];
  }
}

module.exports = BouquetDTO;
