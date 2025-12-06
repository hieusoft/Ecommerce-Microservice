class Occasion {
  constructor({ id, name, description ,subOccasions }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.subOccasions = subOccasions || []; 
  }
}

module.exports = Occasion;
