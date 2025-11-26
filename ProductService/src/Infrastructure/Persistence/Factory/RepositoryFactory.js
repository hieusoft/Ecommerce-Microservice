// Mongo Repositories
const BouquetRepositoryMongo = require('../Mongo/Repositories/BouquetRepositoryMongo');
const FlowerRepositoryMongo = require('../Mongo/Repositories/FlowerRepositoryMongo');
const OccasionRepositoryMongo = require('../Mongo/Repositories/OccasionRepositoryMongo');
const GreetingRepositoryMongo = require('../Mongo/Repositories/GreetingRepositoryMongo');
class RepositoryFactory {

    static bouquet() {
        return new BouquetRepositoryMongo();
    }

    static flower() {
        return new FlowerRepositoryMongo();
    }

    static occasion() {
        return new OccasionRepositoryMongo();
    }

    static greeting() {
        return new GreetingRepositoryMongo();
    }
}

module.exports = RepositoryFactory;
