class FlowerDTO {
  constructor({  name, color, price, images = []}) {
    this.name = name;
    this.color = color;
    this.price = price;
    this.images = images || [];
  }
}
module.exports = FlowerDTO;