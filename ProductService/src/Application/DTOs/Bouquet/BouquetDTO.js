class BouquetDTO {
  constructor({ name, description, price, subOccasionId, images = [],
    quantity = 0, }) {
    this.name = name;
    this.description = description;
    this.price = price;
    this.subOccasionId = subOccasionId;
    this.images = images || [];
    this.quantity = quantity;
  }
}

module.exports = BouquetDTO;
