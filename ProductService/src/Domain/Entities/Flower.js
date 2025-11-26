class Flower {
  constructor({ id, name, color, price, images = [] }) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.price = price;
    this.images = images || [];
  }
}

module.exports = Flower;
