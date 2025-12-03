const BouquetRepositoryMongo = require('../Mongo/Repositories/BouquetRepositoryMongo');
const OccasionRepositoryMongo = require('../Mongo/Repositories/OccasionRepositoryMongo');
const GreetingRepositoryMongo = require('../Mongo/Repositories/GreetingRepositoryMongo');
class RepositoryFactory {

    static bouquet() {
        return new BouquetRepositoryMongo();
    }

    static occasion() {
        return new OccasionRepositoryMongo();
    }

    static greeting() {
        return new GreetingRepositoryMongo();
    }
}

module.exports = RepositoryFactory;
