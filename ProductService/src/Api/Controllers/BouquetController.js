const BouquetUseCase = require('../../Application/UseCases/BouquetUseCase');
const BouquetDTO = require('../../Application/DTOs/Bouquet/BouquetDTO');
const RepositoryFactory = require('../../Infrastructure/Persistence/Factory/RepositoryFactory');

const bouquetRepo = RepositoryFactory.bouquet();

class BouquetController {
    constructor(rabbitService, redisService) {
        this.rabbitService = rabbitService;
        this.redisService = redisService;
        this.bouquetUseCase = new BouquetUseCase(bouquetRepo,rabbitService, redisService);
    }

    createBouquet = async (req, res) => {
        try {
            const dto = new BouquetDTO(req.body);
            const bouquet = await this.bouquetUseCase.createBouquet(dto);
            res.status(201).json(bouquet);
        } catch (err) {
            console.error('Error createBouquet:', err);
            res.status(400).json({ error: err.message });
        }
    }

    getBouquetById = async (req, res) => {
        try {
            const bouquet = await this.bouquetUseCase.getBouquetById(req.params.id);
            if (!bouquet) return res.status(404).json({ error: 'Bouquet not found' });
            res.json(bouquet);
        } catch (err) {
            console.error('Error getBouquetById:', err);
            res.status(400).json({ error: err.message });
        }
    }

    getAllBouquets = async (req, res) => {
        try {
            
            const bouquets = await this.bouquetUseCase.getAllBouquets(req.query);
            console.log('Returned bouquets count:', bouquets.length);
            res.json(bouquets);
        } catch (err) {
            console.error('Error getAllBouquets:', err);
            res.status(400).json({ error: err.message });
        }
    }

    updateBouquet = async (req, res) => {
        try {
            const updated = await this.bouquetUseCase.updateBouquet(req.params.id, req.body);
            if (!updated) return res.status(404).json({ error: 'Bouquet not found' });
            res.json(updated);
        } catch (err) {
            console.error('Error updateBouquet:', err);
            res.status(400).json({ error: err.message });
        }
    }

    deleteBouquet = async (req, res) => {
        try {
            const deleted = await this.bouquetUseCase.deleteBouquet(req.params.id);
            if (!deleted) return res.status(404).json({ error: 'Bouquet not found' });
            res.status(204).send();
        } catch (err) {
            console.error('Error deleteBouquet:', err);
            res.status(400).json({ error: err.message });
        }
    }
}

module.exports = BouquetController;
